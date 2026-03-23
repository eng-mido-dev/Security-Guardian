import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ShieldAlert, ShieldCheck, Link2, ArrowLeft, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";

export default function CheckLink() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "safe" | "suspicious" | "danger">("idle");
  const { incrementLinksChecked } = useApp();

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setStatus("loading");
    
    // Simulate API delay
    setTimeout(() => {
      incrementLinksChecked();
      
      const lowerUrl = url.toLowerCase();
      // Simple regex/logic simulation
      if (
        lowerUrl.includes("bit.ly") || 
        lowerUrl.includes("tinyurl") || 
        lowerUrl.startsWith("http://")
      ) {
        setStatus("suspicious");
      } else if (
        /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(lowerUrl) || // IP address
        lowerUrl.includes("free-money") || 
        lowerUrl.includes("login-update") ||
        lowerUrl.includes(".xyz")
      ) {
        setStatus("danger");
      } else if (lowerUrl.startsWith("https://")) {
        setStatus("safe");
      } else {
        setStatus("suspicious"); // Unknown format
      }
    }, 2000);
  };

  const getResultUI = () => {
    switch(status) {
      case "safe":
        return (
          <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="mt-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-400 mb-2">الرابط يبدو آمناً</h3>
            <p className="text-muted-foreground max-w-md">لم نكتشف أي علامات احتيال في هذا الرابط، وهو يستخدم اتصالاً مشفراً (HTTPS).</p>
          </motion.div>
        );
      case "suspicious":
        return (
          <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold text-amber-400 mb-2">رابط مشبوه!</h3>
            <p className="text-muted-foreground max-w-md">هذا الرابط يستخدم تقنية اختصار الروابط أو لا يستخدم اتصالاً مشفراً. توخّ الحذر ولا تدخل معلومات حساسة.</p>
          </motion.div>
        );
      case "danger":
        return (
          <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="mt-8 bg-destructive/10 border border-destructive/30 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-2xl font-bold text-destructive mb-2">تحذير! رابط خطير</h3>
            <p className="text-muted-foreground max-w-md">يحتوي هذا الرابط على علامات قوية لعمليات الاحتيال أو التصيد. نوصي بشدة بعدم زيارته.</p>
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
        <h1 className="text-4xl font-black mb-4">افحص الرابط قبل الضغط</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          أداة حراس لفحص الروابط المشبوهة. الصق الرابط هنا وسنقوم بتحليله لاكتشاف أي برمجيات خبيثة أو محاولات تصيد.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 md:p-10 mb-12 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
        
        <form onSubmit={handleCheck} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <Link2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <Input 
              type="url" 
              placeholder="https://example.com/..." 
              required
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              className="h-16 pl-4 pr-12 text-lg rounded-2xl bg-black/40 border-white/10 focus-visible:ring-primary/50"
              style={{ direction: 'ltr', textAlign: 'left' }}
            />
          </div>
          <Button 
            type="submit" 
            disabled={status === "loading"}
            className="h-16 px-8 rounded-2xl text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 w-full md:w-auto"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                جاري الفحص...
              </>
            ) : (
              <>
                افحص الآن <ArrowLeft className="w-5 h-5 mr-2" />
              </>
            )}
          </Button>
        </form>

        {getResultUI()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card/50 border border-white/5 rounded-2xl p-6">
          <CheckCircle className="w-6 h-6 text-primary mb-4" />
          <h4 className="font-bold mb-2">تأكد من https</h4>
          <p className="text-sm text-muted-foreground">المواقع الآمنة تبدأ دائماً بـ https بدلاً من http، مما يعني أن الاتصال مشفر.</p>
        </div>
        <div className="bg-card/50 border border-white/5 rounded-2xl p-6">
          <AlertTriangle className="w-6 h-6 text-primary mb-4" />
          <h4 className="font-bold mb-2">الروابط المختصرة</h4>
          <p className="text-sm text-muted-foreground">كن حذراً من الروابط المختصرة مثل bit.ly لأنها تخفي الوجهة الحقيقية للرابط.</p>
        </div>
        <div className="bg-card/50 border border-white/5 rounded-2xl p-6">
          <ShieldAlert className="w-6 h-6 text-primary mb-4" />
          <h4 className="font-bold mb-2">المرسل المجهول</h4>
          <p className="text-sm text-muted-foreground">لا تضغط أبداً على الروابط الواردة من أشخاص لا تعرفهم عبر الإيميل أو الرسائل.</p>
        </div>
      </div>
    </div>
  );
}
