import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, UploadCloud, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Report() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast({
        title: "تم استلام البلاغ",
        description: "شكراً لك. مساهمتك تساعد في حماية المجتمع الرقمي.",
      });
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 w-full text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-12 rounded-[2rem] border-emerald-500/30">
          <div className="inline-flex bg-emerald-500/10 p-5 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black mb-4">تم إرسال البلاغ بنجاح</h2>
          <p className="text-muted-foreground text-lg mb-8">
            سيتم مراجعة البلاغ وتحويله للجهات المختصة. شكراً لكونك جزءاً من حراس الأمن الرقمي.
          </p>
          <Button size="lg" className="rounded-xl font-bold" onClick={() => setSubmitted(false)}>
            تقديم بلاغ آخر
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
          <h1 className="text-3xl font-black">بلّغ عن احتيال</h1>
          <p className="text-muted-foreground mt-1">ساعدنا في رصد وإيقاف المواقع والحسابات الاحتيالية</p>
        </div>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card rounded-3xl p-8 border-white/5">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="type" className="text-base font-bold">نوع الاحتيال <span className="text-destructive">*</span></Label>
            <select 
              id="type"
              className="w-full flex h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="" disabled selected>اختر نوع الاحتيال...</option>
              <option value="phishing">موقع تصيد (فيشينج)</option>
              <option value="financial">احتيال مالي / استثماري</option>
              <option value="identity">انتحال شخصية</option>
              <option value="fake_message">رسالة / إيميل مزيف</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-base font-bold">الرابط المشبوه (إن وجد)</Label>
            <Input 
              id="url" 
              type="url" 
              placeholder="https://..." 
              className="h-12 rounded-xl bg-black/40 border-white/10" 
              style={{ direction: 'ltr', textAlign: 'left' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc" className="text-base font-bold">وصف الحادثة (اختياري)</Label>
            <Textarea 
              id="desc" 
              placeholder="يرجى كتابة تفاصيل ما حدث وكيف تواصلوا معك..." 
              className="min-h-[120px] rounded-xl bg-black/40 border-white/10 resize-none p-4"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">لقطة شاشة (اختياري)</Label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group">
              <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
              <p className="text-sm text-muted-foreground">اسحب الصورة هنا أو اضغط للاختيار</p>
              <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG حتى 5MB</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-4 rounded-xl border border-white/5">
            <Checkbox id="anonymous" />
            <Label htmlFor="anonymous" className="text-sm font-medium leading-none cursor-pointer">
              بلاغ مجهول الهوية - لن يتم ربط هذا البلاغ بحسابك
            </Label>
          </div>

          <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-primary/90 leading-relaxed">
              تنويه: سيتم تحليل البلاغات تقنياً وإحالتها للجهات المختصة إن لزم الأمر. هذه المنصة للتوعية والرصد ولا تحل محل التبليغ الرسمي للسلطات الأمنية في بلدك.
            </p>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            disabled={isSubmitting}
            className="w-full h-14 text-lg font-bold rounded-xl"
          >
            {isSubmitting ? "جاري الإرسال..." : "إرسال البلاغ"}
          </Button>

        </form>
      </motion.div>
    </div>
  );
}
