import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, UploadCloud, ShieldAlert, CheckCircle2, X,
  Loader2, ChevronDown, LogIn, UserPlus, Shield, Link2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/context/LangContext";
import { useLocation } from "wouter";
import { api } from "@/lib/api";

interface UploadedFile {
  name: string;
  size: number;
  previewUrl: string;
}

const FRAUD_TYPES_AR = [
  { value: "phishing", label: "موقع تصيد (فيشينج)" },
  { value: "identity", label: "انتحال شخصية" },
  { value: "financial", label: "احتيال مالي / استثماري" },
  { value: "fake_link", label: "رابط مزيف / ضار" },
  { value: "fake_message", label: "رسالة / إيميل مزيف" },
  { value: "other", label: "أخرى" },
];

const FRAUD_TYPES_EN = [
  { value: "phishing", label: "Phishing / Fake Website" },
  { value: "identity", label: "Identity Theft" },
  { value: "financial", label: "Financial / Investment Fraud" },
  { value: "fake_link", label: "Fake / Malicious Link" },
  { value: "fake_message", label: "Fake Message / Email" },
  { value: "other", label: "Other" },
];

function CustomSelect({
  value, onChange, options, placeholder, isRTL, error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  isRTL: boolean;
  error: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full h-12 rounded-xl border px-4 flex items-center justify-between gap-3 text-sm transition-all duration-200 bg-[#0d0d0f] ${
          open
            ? "border-primary ring-2 ring-primary/30 shadow-[0_0_12px_rgba(255,184,0,0.15)]"
            : error
            ? "border-destructive"
            : "border-white/10 hover:border-primary/40"
        }`}
      >
        <span className={selected ? "text-white font-medium" : "text-muted-foreground"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-primary" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute z-50 w-full mt-2 bg-[#0d0d0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden ${isRTL ? "right-0" : "left-0"}`}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="py-1.5">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full px-4 py-2.5 text-sm text-start flex items-center gap-2.5 transition-all ${
                    value === opt.value
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {value === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="h-px bg-white/5" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Report() {
  const { toast } = useToast();
  const { t, isRTL } = useLang();
  const { user } = useApp();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fraudType, setFraudType] = useState("");
  const [fraudTypeError, setFraudTypeError] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.match(/image\/(png|jpeg|jpg)/)) return;
    if (file.size > 5 * 1024 * 1024) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadDone(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 18 + 8;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadProgress(100);
          setTimeout(() => {
            setIsUploading(false);
            setUploadDone(true);
            setUploadedFile({ name: file.name, size: file.size, previewUrl });
            toast({ title: t("report.fileUploaded") });
          }, 300);
        }
        setUploadProgress(Math.min(Math.round(progress), 100));
      }, 120);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setUploadDone(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fraudType) { setFraudTypeError(true); return; }
    setIsSubmitting(true);
    try {
      await api.reports.submit({
        fraudType,
        url: urlValue,
        description,
        isAnonymous,
      });
      setSubmitted(true);
      toast({ title: t("report.received"), description: t("report.receivedDesc") });
    } catch {
      toast({
        title: isRTL ? "فشل إرسال البلاغ" : "Report submission failed",
        description: isRTL ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFraudType("");
    setUrlValue("");
    setDescription("");
    setIsAnonymous(false);
    setUploadedFile(null);
    setUploadDone(false);
    setFraudTypeError(false);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 w-full text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-12 rounded-[2rem] border-emerald-500/30">
          <div className="inline-flex bg-emerald-500/10 p-5 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black mb-4">{t("report.successTitle")}</h2>
          <p className="text-muted-foreground text-lg mb-8">{t("report.successDesc")}</p>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-4 mb-8 text-sm text-emerald-300">
            {isRTL
              ? "✓ تم حفظ بلاغك في قاعدة البيانات وسيُراجعه الفريق قريباً."
              : "✓ Your report has been saved to the database and will be reviewed by our team shortly."}
          </div>
          <Button size="lg" className="rounded-xl font-bold" onClick={resetForm}>
            {t("report.another")}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 shrink-0">
          <AlertTriangle className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black">{t("report.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("report.subtitle")}</p>
        </div>
      </div>

      {/* --- Login Gate Card (shown when not logged in) --- */}
      {!user ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2rem] overflow-hidden border-white/5 relative"
        >
          <div className="p-8 blur-sm pointer-events-none select-none opacity-40 space-y-5">
            <div className="h-10 bg-white/5 rounded-xl" />
            <div className="h-10 bg-white/5 rounded-xl" />
            <div className="h-24 bg-white/5 rounded-xl" />
            <div className="h-28 bg-white/5 rounded-xl border-2 border-dashed border-white/10" />
            <div className="h-12 bg-white/5 rounded-xl" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm bg-[#0A0A0A]/90 backdrop-blur-2xl border border-primary/25 rounded-3xl p-8 text-center shadow-2xl shadow-black/60"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-t-3xl" />

              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 mb-6 mx-auto">
                <Shield className="w-8 h-8 text-primary" />
              </div>

              <h2 className="text-xl font-black mb-2">
                {isRTL ? "تسجيل الدخول مطلوب" : "Login Required"}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {isRTL
                  ? "يجب تسجيل الدخول أولاً للتمكن من الإبلاغ عن المحتوى الاحتيالي ومتابعة بلاغاتك."
                  : "You need to sign in first to report scam content and track your submitted reports."}
              </p>

              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full rounded-xl font-bold gap-2" onClick={() => setLocation("/login")}>
                  <LogIn className="w-4 h-4" />
                  {isRTL ? "تسجيل الدخول" : "Sign In"}
                </Button>
                <Button size="lg" variant="outline" className="w-full rounded-xl font-bold gap-2 border-white/10 hover:bg-white/5" onClick={() => setLocation("/signup")}>
                  <UserPlus className="w-4 h-4" />
                  {isRTL ? "إنشاء حساب جديد" : "Create Account"}
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card rounded-3xl p-6 md:p-8 border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Fraud Type */}
            <div className="space-y-2">
              <Label className="text-base font-bold">
                {t("report.fraudType")} <span className="text-destructive">*</span>
              </Label>
              <CustomSelect
                value={fraudType}
                onChange={(v) => { setFraudType(v); setFraudTypeError(false); }}
                options={isRTL ? FRAUD_TYPES_AR : FRAUD_TYPES_EN}
                placeholder={isRTL ? "اختر نوع الاحتيال..." : "Select fraud type..."}
                isRTL={isRTL}
                error={fraudTypeError}
              />
              <AnimatePresence>
                {fraudTypeError && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-destructive text-xs">
                    {t("report.fraudTypeRequired")}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* URL — with icon and px-12 padding to prevent overlap */}
            <div className="space-y-2">
              <Label htmlFor="url" className="text-base font-bold">{t("report.suspiciousUrl")}</Label>
              <div className="relative" dir="ltr">
                <Link2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  id="url"
                  type="text"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder="https://..."
                  className="h-12 px-12 rounded-xl bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-primary/60 focus-visible:ring-1 focus-visible:ring-primary/40"
                  style={{ direction: "ltr", textAlign: "left" }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="desc" className="text-base font-bold">{t("report.description")}</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("report.descPlaceholder")}
                className="min-h-[120px] rounded-xl bg-black/40 border-white/10 text-white placeholder:text-white/30 resize-none p-4 focus:border-primary/60 focus-visible:ring-1 focus-visible:ring-primary/40"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <Label className="text-base font-bold">{t("report.screenshot")}</Label>

              {!uploadedFile && !isUploading && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragOver ? "border-primary bg-primary/10" : "border-white/20 hover:bg-white/5 hover:border-white/30"}`}
                >
                  <UploadCloud className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-sm text-muted-foreground">{t("report.dragDrop")}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{t("report.fileTypes")}</p>
                </div>
              )}

              {isUploading && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="border border-white/10 rounded-xl p-5 bg-black/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                    <span className="text-sm font-medium">{t("report.submitting")} {uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2 [&>div]:bg-primary [&>div]:transition-all" />
                </motion.div>
              )}

              {uploadDone && uploadedFile && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="border border-emerald-500/30 rounded-xl p-4 bg-emerald-500/5 flex items-center gap-4">
                  <img src={uploadedFile.previewUrl} alt="preview" className="w-14 h-14 object-cover rounded-lg border border-white/10 shrink-0" />
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                    <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t("report.fileUploaded")}
                    </p>
                  </div>
                  <button type="button" onClick={removeFile} className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Anonymous */}
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(v) => setIsAnonymous(!!v)}
              />
              <Label htmlFor="anonymous" className="text-sm font-medium leading-none cursor-pointer">
                {t("report.anonymous")}
              </Label>
            </div>

            {/* Disclaimer */}
            <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-primary/90 leading-relaxed">{t("report.disclaimer")}</p>
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full h-14 text-lg font-bold rounded-xl">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("report.submitting")}
                </span>
              ) : t("report.submit")}
            </Button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
