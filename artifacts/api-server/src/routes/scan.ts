import { Router } from "express";
import { db, scanHistoryTable } from "@workspace/db";
import { eq, desc, inArray } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";

const router = Router();

const URL_SHORTENERS = [
  "bit.ly", "tinyurl.com", "t.co", "ow.ly", "goo.gl", "short.link",
  "is.gd", "buff.ly", "cutt.ly", "rb.gy", "shorturl.at", "tiny.cc",
];

const SUSPICIOUS_TLDS = [
  ".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".pw",
  ".work", ".click", ".download", ".review", ".country",
];

const PHISHING_KEYWORDS = [
  "login-update", "verify-account", "update-billing", "secure-login",
  "account-verify", "confirm-info", "bank-update", "signin-secure",
  "paypal-secure", "appleid-verify", "microsoft-security", "google-verify",
  "free-prize", "claim-reward", "password-reset", "urgent-alert",
];

const BRAND_DOMAINS: [string, string][] = [
  ["google", "google.com"], ["facebook", "facebook.com"], ["youtube", "youtube.com"],
  ["amazon", "amazon.com"], ["twitter", "twitter.com"], ["instagram", "instagram.com"],
  ["linkedin", "linkedin.com"], ["microsoft", "microsoft.com"], ["apple", "apple.com"],
  ["netflix", "netflix.com"], ["paypal", "paypal.com"], ["ebay", "ebay.com"],
  ["whatsapp", "whatsapp.com"], ["snapchat", "snapchat.com"], ["tiktok", "tiktok.com"],
  ["reddit", "reddit.com"], ["github", "github.com"], ["yahoo", "yahoo.com"],
  ["outlook", "outlook.com"], ["dropbox", "dropbox.com"], ["x", "x.com"],
];

function normalizeLeet(str: string): string {
  return str
    .replace(/0/g, "o").replace(/1/g, "l").replace(/3/g, "e")
    .replace(/4/g, "a").replace(/5/g, "s").replace(/\$/g, "s")
    .replace(/@/g, "a").replace(/!/g, "i");
}

function detectTyposquatting(hostname: string): { flagged: boolean; similar?: string } {
  const domain = hostname.replace(/^www\./, "").toLowerCase();
  const normalized = normalizeLeet(domain);

  for (const [brand, official] of BRAND_DOMAINS) {
    if (domain === official || domain.endsWith(`.${official}`)) continue;

    if (normalized === official) return { flagged: true, similar: official };

    if (domain.startsWith(`${brand}.`) && domain !== official)
      return { flagged: true, similar: official };

    if (domain.startsWith(`${brand}-`) || domain.includes(`-${brand}.`))
      return { flagged: true, similar: official };

    const parts = domain.split(".");
    if (parts.length > 2 && parts[0] === brand && !domain.endsWith(official))
      return { flagged: true, similar: official };
  }
  return { flagged: false };
}

async function checkReachability(url: string): Promise<{
  reachable: boolean;
  finalUrl: string;
  isRedirected: boolean;
  httpStatus?: number;
}> {
  const tryFetch = async (method: "HEAD" | "GET") => {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 7000);
    try {
      const r = await fetch(url, { method, signal: ctrl.signal, redirect: "follow" });
      clearTimeout(tid);
      return r;
    } finally {
      clearTimeout(tid);
    }
  };

  try {
    let resp = await tryFetch("HEAD").catch(() => tryFetch("GET"));
    const finalUrl = resp.url || url;
    return { reachable: true, finalUrl, isRedirected: finalUrl !== url, httpStatus: resp.status };
  } catch {
    return { reachable: false, finalUrl: url, isRedirected: false };
  }
}

async function checkUrlhaus(url: string): Promise<{ isKnownMalicious: boolean; threat?: string }> {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 5000);
    const resp = await fetch("https://urlhaus-api.abuse.ch/v1/url/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `url=${encodeURIComponent(url)}`,
      signal: ctrl.signal,
    });
    if (!resp.ok) return { isKnownMalicious: false };
    const data = await resp.json() as {
      query_status: string;
      threat?: string;
      urls?: { url_status: string }[];
    };
    if (data.query_status === "is_db") {
      const hasActive = data.urls?.some((u) => u.url_status === "online") ?? false;
      return { isKnownMalicious: hasActive, threat: data.threat };
    }
    return { isKnownMalicious: false };
  } catch {
    return { isKnownMalicious: false };
  }
}

interface CheckResult {
  label: string;
  labelEn: string;
  passed: boolean;
  detail: string;
  detailEn: string;
}

router.post("/scan", authMiddleware, async (req: AuthRequest, res) => {
  const { id: userId } = req.user!;
  const { url: rawUrl } = req.body as { url?: string };

  if (!rawUrl || typeof rawUrl !== "string") {
    return res.status(400).json({ error: "url_required" });
  }

  const url = rawUrl.trim();
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: "invalid_url" });
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const lower = url.toLowerCase();
  const checks: CheckResult[] = [];
  let totalRisk = 0;

  const hasHttps = parsedUrl.protocol === "https:";
  checks.push({
    label: "بروتوكول HTTPS", labelEn: "HTTPS Protocol", passed: hasHttps,
    detail: hasHttps ? "الرابط يستخدم اتصالاً مشفراً وآمناً" : "الرابط يستخدم HTTP غير المشفر — خطر تجسس على البيانات",
    detailEn: hasHttps ? "Link uses a secure encrypted connection" : "Link uses unencrypted HTTP — data interception risk",
  });
  if (!hasHttps) totalRisk += 25;

  const hasIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
  checks.push({
    label: "عنوان IP مباشر", labelEn: "Direct IP Address", passed: !hasIp,
    detail: hasIp ? "الرابط يستخدم عنوان IP بدلاً من اسم النطاق — نمط شائع في الاحتيال" : "لا يستخدم عنوان IP مباشر",
    detailEn: hasIp ? "Link uses an IP address instead of a domain name — common phishing pattern" : "No direct IP address used",
  });
  if (hasIp) totalRisk += 40;

  const hasSuspTLD = SUSPICIOUS_TLDS.some((t) => hostname.endsWith(t));
  checks.push({
    label: "امتداد النطاق", labelEn: "Domain Extension", passed: !hasSuspTLD,
    detail: hasSuspTLD ? `امتداد مشبوه كثيراً ما يُستخدم في الاحتيال (.${hostname.split(".").pop()})` : "امتداد النطاق شائع وغير مشبوه",
    detailEn: hasSuspTLD ? `Suspicious extension frequently used in fraud (.${hostname.split(".").pop()})` : "Normal and common domain extension",
  });
  if (hasSuspTLD) totalRisk += 35;

  const isShortened = URL_SHORTENERS.some((s) => hostname === s || hostname.endsWith(`.${s}`));
  checks.push({
    label: "رابط مختصر", labelEn: "Shortened URL", passed: !isShortened,
    detail: isShortened ? "الرابط مختصر ويخفي الوجهة الحقيقية — قد يوجهك لموقع ضار" : "الرابط كامل وواضح الوجهة",
    detailEn: isShortened ? "Shortened URL hides the real destination — may redirect to a malicious site" : "Full URL with a clear destination",
  });
  if (isShortened) totalRisk += 20;

  const hasDangerKW = PHISHING_KEYWORDS.some((k) => lower.includes(k));
  checks.push({
    label: "كلمات تصيد احتيالي", labelEn: "Phishing Keywords", passed: !hasDangerKW,
    detail: hasDangerKW ? "يحتوي على كلمات شائعة في مواقع التصيد الاحتيالي" : "لا توجد كلمات مشبوهة مرتبطة بالتصيد",
    detailEn: hasDangerKW ? "Contains keywords commonly used in phishing sites" : "No phishing-related keywords detected",
  });
  if (hasDangerKW) totalRisk += 45;

  const hasAtSymbol = url.indexOf("@") !== -1;
  checks.push({
    label: "رمز @ في الرابط", labelEn: "@ Symbol in URL", passed: !hasAtSymbol,
    detail: hasAtSymbol ? "رمز @ في الرابط يُستخدم لإخفاء عنوان الموقع الحقيقي" : "لا يوجد رمز @ مشبوه في الرابط",
    detailEn: hasAtSymbol ? "@ symbol in URL hides the real website address" : "No suspicious @ symbol found in URL",
  });
  if (hasAtSymbol) totalRisk += 40;

  const subdomainLevels = hostname.split(".").length - 2;
  const hasExcessiveSubs = subdomainLevels > 3;
  checks.push({
    label: "مستويات النطاق الفرعي", labelEn: "Subdomain Levels", passed: !hasExcessiveSubs,
    detail: hasExcessiveSubs ? `يحتوي على ${subdomainLevels} مستويات فرعية — أسلوب تمويه مشبوه` : "عدد النطاقات الفرعية طبيعي",
    detailEn: hasExcessiveSubs ? `Has ${subdomainLevels} subdomain levels — suspicious obfuscation` : "Normal number of subdomain levels",
  });
  if (hasExcessiveSubs) totalRisk += 20;

  const typo = detectTyposquatting(hostname);
  checks.push({
    label: "انتحال نطاق رسمي", labelEn: "Domain Impersonation",
    passed: !typo.flagged,
    detail: typo.flagged ? `هذا الرابط يحاكي "${typo.similar}" — احتمال تصيد عالٍ جداً` : "النطاق لا يحاكي أي موقع رسمي معروف",
    detailEn: typo.flagged ? `This link impersonates "${typo.similar}" — very high phishing risk` : "Domain does not impersonate any known official site",
  });
  if (typo.flagged) totalRisk += 60;

  const [reach, urlhaus] = await Promise.all([
    checkReachability(url),
    checkUrlhaus(url),
  ]);

  checks.push({
    label: "إمكانية الوصول", labelEn: "URL Reachability", passed: reach.reachable,
    detail: reach.reachable ? `الموقع نشط ويمكن الوصول إليه (HTTP ${reach.httpStatus ?? "—"})` : "الموقع غير متاح أو محظور",
    detailEn: reach.reachable ? `Site is active and reachable (HTTP ${reach.httpStatus ?? "—"})` : "Site is unreachable or blocked",
  });
  if (!reach.reachable) totalRisk += 10;

  let redirectedToDifferentDomain = false;
  if (reach.isRedirected && reach.finalUrl && reach.finalUrl !== url) {
    try {
      const finalHost = new URL(reach.finalUrl).hostname;
      redirectedToDifferentDomain = finalHost !== hostname;
    } catch {}
  }
  checks.push({
    label: "اكتشاف إعادة التوجيه", labelEn: "Redirect Detection",
    passed: !redirectedToDifferentDomain,
    detail: redirectedToDifferentDomain
      ? `الرابط يعيد التوجيه لنطاق مختلف: ${reach.finalUrl?.substring(0, 55)}...`
      : reach.isRedirected ? "إعادة توجيه داخلية ضمن نفس النطاق" : "لا توجد إعادة توجيه",
    detailEn: redirectedToDifferentDomain
      ? `Redirects to a different domain: ${reach.finalUrl?.substring(0, 55)}...`
      : reach.isRedirected ? "Internal redirect within the same domain" : "No redirect detected",
  });
  if (redirectedToDifferentDomain) totalRisk += 15;

  checks.push({
    label: "قاعدة بيانات التهديدات", labelEn: "Threat Intelligence",
    passed: !urlhaus.isKnownMalicious,
    detail: urlhaus.isKnownMalicious
      ? `تحذير قصوى: هذا الرابط مدرج في قواعد بيانات التهديدات${urlhaus.threat ? ` (${urlhaus.threat})` : ""}`
      : "الرابط غير موجود في قواعد بيانات التهديدات المعروفة",
    detailEn: urlhaus.isKnownMalicious
      ? `CRITICAL: This URL is listed in known threat databases${urlhaus.threat ? ` (${urlhaus.threat})` : ""}`
      : "URL not found in known threat intelligence databases",
  });
  if (urlhaus.isKnownMalicious) totalRisk += 90;

  const safeScore = Math.max(0, 100 - Math.min(totalRisk, 100));
  const status: "safe" | "suspicious" | "danger" =
    safeScore < 30 ? "danger" : safeScore < 60 ? "suspicious" : "safe";

  const report = {
    checks,
    status,
    score: safeScore,
    reachable: reach.reachable,
    isRedirected: reach.isRedirected,
    finalUrl: redirectedToDifferentDomain ? reach.finalUrl : undefined,
  };

  try {
    await db.insert(scanHistoryTable).values({
      userId,
      url,
      score: safeScore,
      status,
      report: JSON.stringify(report),
    });

    const history = await db
      .select({ id: scanHistoryTable.id })
      .from(scanHistoryTable)
      .where(eq(scanHistoryTable.userId, userId))
      .orderBy(desc(scanHistoryTable.scannedAt));

    if (history.length > 5) {
      const toDelete = history.slice(5).map((h) => h.id);
      if (toDelete.length > 0) {
        await db.delete(scanHistoryTable).where(inArray(scanHistoryTable.id, toDelete));
      }
    }
  } catch (err) {
    console.error("scan history save error:", err);
  }

  res.json(report);
});

router.get("/scan/history", authMiddleware, async (req: AuthRequest, res) => {
  const { id: userId } = req.user!;
  const history = await db
    .select()
    .from(scanHistoryTable)
    .where(eq(scanHistoryTable.userId, userId))
    .orderBy(desc(scanHistoryTable.scannedAt))
    .limit(5);

  res.json(
    history.map((h) => ({
      id: h.id,
      url: h.url,
      score: h.score,
      status: h.status,
      scannedAt: h.scannedAt,
    }))
  );
});

export default router;
