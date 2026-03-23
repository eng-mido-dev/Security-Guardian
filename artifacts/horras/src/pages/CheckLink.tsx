import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShieldAlert, ShieldCheck, Link2,
  AlertTriangle, CheckCircle, Loader2, ArrowLeft, ArrowRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";

type ScanStatus = "idle" | "scanning" | "safe" | "suspicious" | "danger";

interface ScanReport {
  status: "safe" | "suspicious" | "danger";
  score: number;
  checks: { label: string; labelEn: string; passed: boolean; detail: string; detailEn: string }[];
}

function analyzeUrl(raw: string): ScanReport {
  const lower = raw.toLowerCase().trim();
  const checks = [];
  let dangerScore = 0;

  // HTTPS check
  const hasHttps = lower.startsWith("https://");
  checks.push({
    label: "بروتوكول HTTPS",
    labelEn: "HTTPS Protocol",
    passed: hasHttps,
    detail: hasHttps ? "الرابط يستخدم اتصالاً مشفراً آمناً" : "الرابط يستخدم HTTP غير المشفر",
    detailEn: hasHttps ? "Link uses a secure encrypted connection" : "Link uses unencrypted HTTP",
  });
  if (!hasHttps) dangerScore += 25;

  // IP address instead of domain
  const hasIp = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(lower);
  checks.push({
    label: "عنوان IP مباشر",
    labelEn: "Direct IP Address",
    passed: !hasIp,
    detail: hasIp ? "تحذير: الرابط يستخدم عنوان IP بدلاً من اسم نطاق" : "لا يستخدم عنوان IP مباشر",
    detailEn: hasIp ? "Warning: Link uses an IP address instead of a domain name" : "No direct IP address used",
  });
  if (hasIp) dangerScore += 40;

  // Suspicious TLD
  const suspTLDs = [".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".top"];
  const hasSuspTLD = suspTLDs.some((t) => lower.includes(t));
  checks.push({
    label: "امتداد النطاق",
    labelEn: "Domain Extension",
    passed: !hasSuspTLD,
    detail: hasSuspTLD ? "الامتداد مشبوه وكثيراً ما يُستخدم في الاحتيال" : "امتداد النطاق طبيعي",
    detailEn: hasSuspTLD ? "Suspicious extension commonly used in fraud" : "Normal domain extension",
  });
  if (hasSuspTLD) dangerScore += 35;

  // URL shortener
  const shorteners = ["bit.ly", "tinyurl", "t.co", "ow.ly", "goo.gl", "short.link"];
  const isShortened = shorteners.some((s) => lower.includes(s));
  checks.push({
    label: "رابط مختصر",
    labelEn: "Shortened URL",
    passed: !isShortened,
    detail: isShortened ? "الرابط مختصر ويخفي الوجهة الحقيقية" : "الرابط كامل وواضح الوجهة",
    detailEn: isShortened ? "Link is shortened and hides the real destination" : "Link is full and clear",
  });
  if (isShortened) dangerScore += 20;

  // Suspicious keywords
  const dangerKW = ["login-update", "verify-account", "update-billing", "free-money", "payp4l", "g00gle", "amaz0n", "secure-login"];
  const hasDangerKW = dangerKW.some((k) => lower.includes(k));
  checks.push({
    label: "كلمات مشبوهة",
    labelEn: "Suspicious Keywords",
    passed: !hasDangerKW,
    detail: hasDangerKW ? "يحتوي على كلمات شائعة في مواقع التصيد" : "لا توجد كلمات مشبوهة",
    detailEn: hasDangerKW ? "Contains keywords common in phishing sites" : "No suspicious keywords found",
  });
  if (hasDangerKW) dangerScore += 45;

  // URL length
  const isTooLong = lower.length > 100;
  checks.push({
    label: "طول الرابط",
    labelEn: "URL Length",
    passed: !isTooLong,
    detail: isTooLong ? `الرابط طويل جداً (${lower.length} حرف) وقد يكون مضللاً` : `الطول طبيعي (${lower.length} حرف)`,
    detailEn: isTooLong ? `URL is very long (${lower.length} chars) and may be misleading` : `Normal length (${lower.length} chars)`,
  });
  if (isTooLong) dangerScore += 15;

  const safeScore = Math.max(0, 100 - dangerScore);
  const status: "safe" | "suspicious" | "danger" =
    dangerScore >= 50 ? "danger" : dangerScore >= 20 ? "suspicious" : "safe";

  return { status, score: safeScore, checks };
}

export default function CheckLink() {
  const [url, setUrl] = useState("");
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [report, setReport] = useState<ScanReport | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const { incrementLinksChecked } = useApp();
  const { t, isRTL } = useLang();
  const ArrowDir = isRTL ? ArrowLeft : ArrowRight;

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setScanStatus("scanning");
    setScanProgress(0);
    setReport(null);

    // Simulate progressive scan
    const duration = 2200;
    const steps = 20;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setScanProgress(Math.min(Math.round((step / steps) * 100), 95));
      if (step >= steps) {
        clearInterval(interval);
        setScanProgress(100);
        const result = analyzeUrl(url);
        setReport(result);
        setScanStatus(result.status);
        incrementLinksChecked();
      }
    }, duration / steps);
  };

  const reset = () => {
    setScanStatus("idle");
    setReport(null);
    setScanProgress(0);
    setUrl("");
  };

  const statusConfig = {
    safe: {
      icon: <ShieldCheck className="w-8 h-8" />,
      titleAr: "الرابط آمن",
      titleEn: "Link Is Safe",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/30",
      bar: "bg-emerald-400",
    },
    suspicious: {
      icon: <AlertTriangle className="w-8 h-8" />,
      titleAr: "رابط مشبوه",
      titleEn: "Suspicious Link",
      color: "text-amber-400",
      bg: "bg-amber-400/10 border-amber-400/30",
      bar: "bg-amber-400",
    },
    danger: {
      icon: <ShieldAlert className="w-8 h-8" />,
      titleAr: "رابط خطير!",
      titleEn: "Dangerous Link!",
      color: "text-red-400",
      bg: "bg-red-400/10 border-red-400/30",
      bar: "bg-red-400",
    },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 w-full">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex bg-primary/10 p-4 rounded-2xl mb-5 border border-primary/20">
          <Search className="w-9 h-9 text-primary" />
        </div>
        <h1 className="text-4xl font-black mb-3">{t("checkLink.title")}</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{t("checkLink.subtitle")}</p>
      </div>

      {/* Input Card */}
      <div className="glass-card rounded-3xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Link2 className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              type="url"
              placeholder={t("checkLink.placeholder")}
              required
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (scanStatus !== "idle" && scanStatus !== "scanning") reset();
              }}
              disabled={scanStatus === "scanning"}
              className="h-14 pe-10 text-sm rounded-2xl bg-black/40 border-white/10 focus-visible:ring-primary/50"
              style={{ direction: "ltr", textAlign: "left" }}
            />
          </div>
          <Button
            type="submit"
            disabled={scanStatus === "scanning" || !url.trim()}
            className="h-14 px-7 rounded-2xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 shrink-0"
          >
            {scanStatus === "scanning" ? (
              <><Loader2 className="w-4 h-4 mx-1.5 animate-spin" /> {t("checkLink.checking")}</>
            ) : (
              <>{t("checkLink.checkNow")} <ArrowDir className="w-4 h-4 mx-1.5" /></>
            )}
          </Button>
        </form>

        {/* Scanning progress */}
        <AnimatePresence>
          {scanStatus === "scanning" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-5 overflow-hidden">
              <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  {isRTL ? "جاري تحليل الرابط..." : "Analyzing link..."}
                </span>
                <span className="font-bold text-primary">{scanProgress}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.15 }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  isRTL ? "فحص البروتوكول" : "Protocol Check",
                  isRTL ? "تحليل النطاق" : "Domain Analysis",
                  isRTL ? "فحص الكلمات" : "Keyword Scan",
                ].map((step, i) => (
                  <div key={i} className={`text-center text-xs py-1.5 px-2 rounded-lg border transition-all ${scanProgress > i * 33 ? "border-primary/30 bg-primary/10 text-primary" : "border-white/5 text-muted-foreground/40"}`}>
                    {scanProgress > i * 33 && <CheckCircle className="w-3 h-3 mx-auto mb-0.5" />}
                    {step}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result Report */}
      <AnimatePresence>
        {report && (scanStatus === "safe" || scanStatus === "suspicious" || scanStatus === "danger") && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Result header */}
            <div className={`rounded-2xl border p-5 mb-4 flex items-center justify-between gap-4 ${statusConfig[scanStatus].bg}`}>
              <div className="flex items-center gap-4">
                <div className={statusConfig[scanStatus].color}>{statusConfig[scanStatus].icon}</div>
                <div>
                  <h3 className={`text-xl font-black ${statusConfig[scanStatus].color}`}>
                    {isRTL ? statusConfig[scanStatus].titleAr : statusConfig[scanStatus].titleEn}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {isRTL ? `نقاط الأمان: ${report.score}/100` : `Safety Score: ${report.score}/100`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-16 h-16 relative">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/5" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none" strokeWidth="3"
                      stroke={scanStatus === "safe" ? "#34d399" : scanStatus === "suspicious" ? "#fbbf24" : "#f87171"}
                      strokeDasharray={`${report.score} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-xs font-black ${statusConfig[scanStatus].color}`}>{report.score}</span>
                </div>
                <button onClick={reset} className="text-muted-foreground hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Checks list */}
            <div className="glass-card rounded-2xl border-white/5 divide-y divide-white/5 overflow-hidden">
              {report.checks.map((check, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${check.passed ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"}`}>
                    {check.passed ? <CheckCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium">{isRTL ? check.label : check.labelEn}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{isRTL ? check.detail : check.detailEn}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm" className="rounded-xl text-sm text-muted-foreground hover:text-white" onClick={reset}>
                {isRTL ? "فحص رابط آخر" : "Check Another Link"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips (shown when idle) */}
      {scanStatus === "idle" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {[
            { icon: <CheckCircle className="w-5 h-5" />, titleAr: "تأكد من HTTPS", titleEn: "Look for HTTPS", descAr: "المواقع الآمنة تبدأ دائماً بـ https://", descEn: "Safe sites always start with https://" },
            { icon: <AlertTriangle className="w-5 h-5" />, titleAr: "الروابط المختصرة", titleEn: "Shortened URLs", descAr: "تخفي الوجهة الحقيقية — كن حذراً", descEn: "Hide the real destination — be cautious" },
            { icon: <ShieldAlert className="w-5 h-5" />, titleAr: "المرسل المجهول", titleEn: "Unknown Sender", descAr: "لا تضغط روابط من مجهولين", descEn: "Never click links from unknowns" },
          ].map((tip, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <div className="text-primary mb-3">{tip.icon}</div>
              <h4 className="font-bold text-sm mb-1.5">{isRTL ? tip.titleAr : tip.titleEn}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{isRTL ? tip.descAr : tip.descEn}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
