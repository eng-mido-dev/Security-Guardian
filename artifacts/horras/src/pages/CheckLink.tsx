import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShieldAlert, ShieldCheck, Link2, AlertTriangle,
  CheckCircle, Loader2, ArrowLeft, ArrowRight, X, ExternalLink,
  Globe, Lock, Zap, Database, GitBranch, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import LoginModal from "@/components/LoginModal";
import { useLang } from "@/context/LangContext";
import { api, type ScanReport } from "@/lib/api";

const SCAN_PHASES = [
  { labelAr: "فحص البروتوكول", labelEn: "Protocol Check", icon: Lock, at: 10 },
  { labelAr: "تحليل النطاق", labelEn: "Domain Analysis", icon: Globe, at: 28 },
  { labelAr: "كشف الانتحال", labelEn: "Impersonation Detection", icon: Eye, at: 46 },
  { labelAr: "اختبار الاتصال", labelEn: "Connectivity Test", icon: Zap, at: 65 },
  { labelAr: "قاعدة التهديدات", labelEn: "Threat Intelligence", icon: Database, at: 83 },
  { labelAr: "إعداد التقرير", labelEn: "Building Report", icon: GitBranch, at: 96 },
];

const STATUS_CONFIG = {
  safe: {
    icon: ShieldCheck,
    titleAr: "الرابط آمن",
    titleEn: "Link Is Safe",
    color: "text-emerald-400",
    bg: "bg-emerald-400/8 border-emerald-400/25",
    bar: "bg-emerald-400",
    glow: "shadow-emerald-500/10",
  },
  suspicious: {
    icon: AlertTriangle,
    titleAr: "رابط مشبوه",
    titleEn: "Suspicious Link",
    color: "text-amber-400",
    bg: "bg-amber-400/8 border-amber-400/25",
    bar: "bg-amber-400",
    glow: "shadow-amber-500/10",
  },
  danger: {
    icon: ShieldAlert,
    titleAr: "رابط خطير!",
    titleEn: "Dangerous Link!",
    color: "text-red-400",
    bg: "bg-red-400/8 border-red-400/25",
    bar: "bg-red-400",
    glow: "shadow-red-500/10",
  },
};

export default function CheckLink() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activePhase, setActivePhase] = useState(0);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { incrementLinksChecked, user } = useApp();
  const { isRTL } = useLang();
  const ArrowDir = isRTL ? ArrowLeft : ArrowRight;

  const clearResult = () => {
    setReport(null);
    setError(null);
    setScanProgress(0);
    setActivePhase(0);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    if (!user) { setShowLoginModal(true); return; }

    setIsScanning(true);
    setReport(null);
    setError(null);
    setScanProgress(0);
    setActivePhase(0);

    const startedAt = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const target = Math.min(96, Math.floor(elapsed / 80));
      setScanProgress(target);
      const phase = SCAN_PHASES.findIndex((p) => p.at > target);
      setActivePhase(phase === -1 ? SCAN_PHASES.length - 1 : Math.max(0, phase - 1));
    }, 80);

    try {
      const result = await api.scan.check(url);
      clearInterval(progressInterval);
      setScanProgress(100);
      setActivePhase(SCAN_PHASES.length - 1);
      await new Promise((r) => setTimeout(r, 400));
      setReport(result);
      incrementLinksChecked();
    } catch (err: unknown) {
      clearInterval(progressInterval);
      const msg = (err as { code?: string })?.code;
      setError(msg === "invalid_url"
        ? (isRTL ? "الرابط غير صالح. تأكد من تضمين https://" : "Invalid URL. Make sure to include https://")
        : (isRTL ? "حدث خطأ أثناء الفحص. حاول مرة أخرى." : "Scan failed. Please try again.")
      );
    } finally {
      setIsScanning(false);
    }
  };

  const reset = () => {
    clearResult();
    setUrl("");
  };

  const cfg = report ? STATUS_CONFIG[report.status] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-16 w-full">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex bg-primary/10 p-4 rounded-2xl mb-5 border border-primary/20">
          <Search className="w-9 h-9 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black mb-3">
          {isRTL ? "فاحص الروابط الاحترافي" : "Professional Link Scanner"}
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          {isRTL
            ? "محرك فحص أمني حقيقي يحلل الروابط عبر 11 فحصاً متعدد الطبقات ويتحقق من قواعد بيانات التهديدات العالمية"
            : "Real security scanner analyzing links across 11 multi-layer checks and verifying against global threat intelligence databases"}
        </p>
      </div>

      {/* Input Card */}
      <div className="glass-card rounded-3xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow" dir="ltr">
            <Link2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="https://example.com/..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (report || error) clearResult();
              }}
              disabled={isScanning}
              className="h-14 px-12 text-sm rounded-2xl bg-black/40 border-white/10 focus-visible:ring-1 focus-visible:ring-primary/60 focus-visible:border-primary/50"
              style={{ direction: "ltr", textAlign: "left" }}
            />
          </div>
          <Button
            type="submit"
            disabled={isScanning || !url.trim()}
            className="h-14 px-7 rounded-2xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 shrink-0"
          >
            {isScanning ? (
              <><Loader2 className="w-4 h-4 mx-1.5 animate-spin" />{isRTL ? "جارٍ الفحص..." : "Scanning..."}</>
            ) : (
              <>{isRTL ? "افحص الآن" : "Scan Now"} <ArrowDir className="w-4 h-4 mx-1.5" /></>
            )}
          </Button>
        </form>

        {/* Scanning progress */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  {isRTL
                    ? SCAN_PHASES[activePhase]?.labelAr
                    : SCAN_PHASES[activePhase]?.labelEn}
                </span>
                <span className="font-bold text-primary">{scanProgress}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.12 }}
                />
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
                {SCAN_PHASES.map((phase, i) => {
                  const Icon = phase.icon;
                  const done = scanProgress >= phase.at;
                  const active = i === activePhase;
                  return (
                    <div
                      key={i}
                      className={`text-center text-[10px] py-2 px-1.5 rounded-xl border transition-all ${
                        done
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : active
                          ? "border-primary/20 bg-primary/5 text-primary/60"
                          : "border-white/5 text-muted-foreground/30"
                      }`}
                    >
                      <Icon className="w-3 h-3 mx-auto mb-1" />
                      {isRTL ? phase.labelAr : phase.labelEn}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </div>

      {/* Result Report */}
      <AnimatePresence>
        {report && cfg && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Status header */}
            <div className={`rounded-2xl border p-5 mb-4 ${cfg.bg} shadow-xl ${cfg.glow}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-grow">
                  <div className={`shrink-0 ${cfg.color}`}>
                    <cfg.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className={`text-xl font-black ${cfg.color}`}>
                      {isRTL ? cfg.titleAr : cfg.titleEn}
                    </h3>
                    <p className="text-muted-foreground text-xs mt-0.5 truncate" dir="ltr">
                      {url.length > 60 ? url.substring(0, 60) + "…" : url}
                    </p>
                    {report.finalUrl && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <ArrowDir className="w-3 h-3 text-amber-400 shrink-0" />
                        <p className="text-[11px] text-amber-400 truncate" dir="ltr">
                          {isRTL ? "يعيد التوجيه إلى: " : "Redirects to: "}
                          {report.finalUrl.length > 55 ? report.finalUrl.substring(0, 55) + "…" : report.finalUrl}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="relative w-16 h-16">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3" className="text-white/5" stroke="currentColor" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none" strokeWidth="3"
                        stroke={report.status === "safe" ? "#34d399" : report.status === "suspicious" ? "#fbbf24" : "#f87171"}
                        strokeDasharray={`${report.score} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-xs font-black ${cfg.color}`}>
                      {report.score}
                    </span>
                  </div>
                  <button onClick={reset} className="text-muted-foreground hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Score bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[11px] mb-1.5 text-muted-foreground">
                  <span>{isRTL ? "نقاط الأمان" : "Safety Score"}</span>
                  <span className={`font-bold ${cfg.color}`}>{report.score}/100</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${cfg.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${report.score}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${report.reachable ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
                  {report.reachable ? (isRTL ? "موقع نشط" : "Active Site") : (isRTL ? "غير متاح" : "Unreachable")}
                </span>
                {report.isRedirected && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium">
                    {isRTL ? "يحتوي تحويل" : "Has Redirect"}
                  </span>
                )}
                {report.finalUrl && (
                  <a
                    href={report.finalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 font-medium flex items-center gap-1 hover:bg-blue-500/20 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    {isRTL ? "الوجهة النهائية" : "Final Destination"}
                  </a>
                )}
              </div>
            </div>

            {/* Checks breakdown */}
            <div className="glass-card rounded-2xl border-white/5 overflow-hidden mb-4">
              <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                <h4 className="text-sm font-bold">
                  {isRTL ? "تفاصيل الفحص الأمني" : "Security Check Breakdown"}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {report.checks.filter((c) => c.passed).length}/{report.checks.length}{" "}
                  {isRTL ? "اجتاز" : "passed"}
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {report.checks.map((check, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-4 px-5 py-3.5"
                  >
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      check.passed ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"
                    }`}>
                      {check.passed
                        ? <CheckCircle className="w-3.5 h-3.5" />
                        : <X className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-semibold">{isRTL ? check.label : check.labelEn}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {isRTL ? check.detail : check.detailEn}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 mt-0.5 ${
                      check.passed
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {check.passed ? (isRTL ? "آمن" : "OK") : (isRTL ? "خطر" : "RISK")}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Button variant="ghost" size="sm" className="rounded-xl text-sm text-muted-foreground hover:text-white" onClick={reset}>
                {isRTL ? "فحص رابط آخر" : "Scan Another Link"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle tips */}
      {!report && !isScanning && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {[
            { icon: <Lock className="w-5 h-5" />, titleAr: "HTTPS وبروتوكول TLS", titleEn: "HTTPS & TLS Protocol", descAr: "المواقع الآمنة تستخدم HTTPS مع شهادة SSL صالحة", descEn: "Safe sites use HTTPS with a valid SSL certificate" },
            { icon: <Eye className="w-5 h-5" />, titleAr: "كشف انتحال النطاق", titleEn: "Domain Impersonation", descAr: "نكشف الروابط التي تقلد مواقع مشهورة كـ PayPal وGoogle", descEn: "We detect links impersonating popular sites like PayPal and Google" },
            { icon: <Database className="w-5 h-5" />, titleAr: "قاعدة بيانات تهديدات", titleEn: "Threat Intelligence DB", descAr: "نتحقق من قواعد بيانات التهديدات العالمية لاكتشاف الروابط الضارة المعروفة", descEn: "We check global threat databases for known malicious URLs" },
          ].map((tip, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <div className="text-primary mb-3">{tip.icon}</div>
              <h4 className="font-bold text-sm mb-1.5">{isRTL ? tip.titleAr : tip.titleEn}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{isRTL ? tip.descAr : tip.descEn}</p>
            </div>
          ))}
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
