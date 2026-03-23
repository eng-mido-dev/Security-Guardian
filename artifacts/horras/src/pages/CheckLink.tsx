import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ShieldAlert, ShieldCheck, Link2, ArrowLeft, ArrowRight, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";

export default function CheckLink() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "safe" | "suspicious" | "danger">("idle");
  const { incrementLinksChecked } = useApp();
  const { t, isRTL } = useLang();
  const ArrowDir = isRTL ? ArrowLeft : ArrowRight;

  const analyzeUrl = (raw: string): "safe" | "suspicious" | "danger" => {
    const lower = raw.toLowerCase().trim();

    const dangerPatterns = [
      /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(lower),
      lower.includes("free-money"),
      lower.includes("login-update"),
      lower.includes("verify-account"),
      lower.includes("update-billing"),
      lower.endsWith(".xyz"),
      lower.endsWith(".tk"),
      lower.endsWith(".ml"),
      lower.includes("payp4l"),
      lower.includes("g00gle"),
      lower.length > 120,
    ];

    const suspiciousPatterns = [
      lower.includes("bit.ly"),
      lower.includes("tinyurl"),
      lower.includes("t.co"),
      lower.includes("ow.ly"),
      lower.startsWith("http://"),
      lower.includes("free-"),
      lower.includes("-login"),
      lower.includes("secure-"),
    ];

    if (dangerPatterns.some(Boolean)) return "danger";
    if (suspiciousPatterns.some(Boolean)) return "suspicious";
    if (lower.startsWith("https://")) return "safe";
    return "suspicious";
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setStatus("loading");
    setTimeout(() => {
      incrementLinksChecked();
      setStatus(analyzeUrl(url));
    }, 2000);
  };

  const getResultUI = () => {
    switch (status) {
      case "safe":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-400 mb-2">{t("checkLink.safe")}</h3>
            <p className="text-muted-foreground max-w-md">{t("checkLink.safeDesc")}</p>
          </motion.div>
        );
      case "suspicious":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold text-amber-400 mb-2">{t("checkLink.suspicious")}</h3>
            <p className="text-muted-foreground max-w-md">{t("checkLink.suspiciousDesc")}</p>
          </motion.div>
        );
      case "danger":
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-destructive/10 border border-destructive/30 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-2xl font-bold text-destructive mb-2">{t("checkLink.danger")}</h3>
            <p className="text-muted-foreground max-w-md">{t("checkLink.dangerDesc")}</p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 w-full">
      <div className="text-center mb-12">
        <div className="inline-flex bg-primary/10 p-4 rounded-full mb-6 border border-primary/20">
          <Search className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-black mb-4">{t("checkLink.title")}</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("checkLink.subtitle")}</p>
      </div>

      <div className="glass-card rounded-3xl p-6 md:p-10 mb-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>

        <form onSubmit={handleCheck} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 end-4 flex items-center pointer-events-none">
              <Link2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <Input
              type="url"
              placeholder={t("checkLink.placeholder")}
              required
              value={url}
              onChange={(e) => { setUrl(e.target.value); if (status !== "idle") setStatus("idle"); }}
              className="h-16 pe-12 text-lg rounded-2xl bg-black/40 border-white/10 focus-visible:ring-primary/50"
              style={{ direction: "ltr", textAlign: "left" }}
            />
          </div>
          <Button
            type="submit"
            disabled={status === "loading"}
            className="h-16 px-8 rounded-2xl text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 w-full md:w-auto"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-5 h-5 mx-2 animate-spin" />
                {t("checkLink.checking")}
              </>
            ) : (
              <>
                {t("checkLink.checkNow")} <ArrowDir className="w-5 h-5 mx-2" />
              </>
            )}
          </Button>
        </form>

        {getResultUI()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card/50 border border-white/5 rounded-2xl p-6">
          <CheckCircle className="w-6 h-6 text-primary mb-4" />
          <h4 className="font-bold mb-2">{isRTL ? "تأكد من https" : "Check for HTTPS"}</h4>
          <p className="text-sm text-muted-foreground">{isRTL ? "المواقع الآمنة تبدأ دائماً بـ https بدلاً من http، مما يعني أن الاتصال مشفر." : "Safe websites always start with https instead of http, meaning the connection is encrypted."}</p>
        </div>
        <div className="bg-card/50 border border-white/5 rounded-2xl p-6">
          <AlertTriangle className="w-6 h-6 text-primary mb-4" />
          <h4 className="font-bold mb-2">{isRTL ? "الروابط المختصرة" : "Shortened Links"}</h4>
          <p className="text-sm text-muted-foreground">{isRTL ? "كن حذراً من الروابط المختصرة مثل bit.ly لأنها تخفي الوجهة الحقيقية للرابط." : "Be cautious of shortened links like bit.ly as they hide the real destination."}</p>
        </div>
        <div className="bg-card/50 border border-white/5 rounded-2xl p-6">
          <ShieldAlert className="w-6 h-6 text-primary mb-4" />
          <h4 className="font-bold mb-2">{isRTL ? "المرسل المجهول" : "Unknown Sender"}</h4>
          <p className="text-sm text-muted-foreground">{isRTL ? "لا تضغط أبداً على الروابط الواردة من أشخاص لا تعرفهم عبر الإيميل أو الرسائل." : "Never click links from unknown senders via email or messages."}</p>
        </div>
      </div>
    </div>
  );
}
