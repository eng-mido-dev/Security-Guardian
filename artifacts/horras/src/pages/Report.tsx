import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, UploadCloud, ShieldAlert, CheckCircle2, X, FileImage, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/context/LangContext";

interface UploadedFile {
  name: string;
  size: number;
  previewUrl: string;
}

export default function Report() {
  const { toast } = useToast();
  const { t } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fraudType, setFraudType] = useState("");
  const [fraudTypeError, setFraudTypeError] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fraudType) {
      setFraudTypeError(true);
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast({ title: t("report.received"), description: t("report.receivedDesc") });
    }, 1500);
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
          <Button size="lg" className="rounded-xl font-bold" onClick={() => { setSubmitted(false); setFraudType(""); setUploadedFile(null); setUploadDone(false); }}>
            {t("report.another")}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 w-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
          <AlertTriangle className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black">{t("report.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("report.subtitle")}</p>
        </div>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card rounded-3xl p-8 border-white/5">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Fraud Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-base font-bold">
              {t("report.fraudType")} <span className="text-destructive">*</span>
            </Label>
            <select
              id="type"
              value={fraudType}
              onChange={(e) => { setFraudType(e.target.value); setFraudTypeError(false); }}
              className={`w-full flex h-12 items-center justify-between rounded-xl border bg-black/40 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${fraudTypeError ? "border-destructive" : "border-white/10"}`}
            >
              <option value="" disabled>اختر نوع الاحتيال...</option>
              <option value="phishing">موقع تصيد (فيشينج)</option>
              <option value="financial">احتيال مالي / استثماري</option>
              <option value="identity">انتحال شخصية</option>
              <option value="fake_message">رسالة / إيميل مزيف</option>
              <option value="other">أخرى</option>
            </select>
            <AnimatePresence>
              {fraudTypeError && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-destructive text-xs">
                  {t("report.fraudTypeRequired")}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-base font-bold">{t("report.suspiciousUrl")}</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://..."
              className="h-12 rounded-xl bg-black/40 border-white/10"
              style={{ direction: "ltr", textAlign: "left" }}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="desc" className="text-base font-bold">{t("report.description")}</Label>
            <Textarea
              id="desc"
              placeholder={t("report.descPlaceholder")}
              className="min-h-[120px] rounded-xl bg-black/40 border-white/10 resize-none p-4"
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Anonymous */}
          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
            <Checkbox id="anonymous" />
            <Label htmlFor="anonymous" className="text-sm font-medium leading-none cursor-pointer">
              {t("report.anonymous")}
            </Label>
          </div>

          {/* Disclaimer */}
          <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-primary/90 leading-relaxed">{t("report.disclaimer")}</p>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full h-14 text-lg font-bold rounded-xl"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("report.submitting")}
              </span>
            ) : t("report.submit")}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
