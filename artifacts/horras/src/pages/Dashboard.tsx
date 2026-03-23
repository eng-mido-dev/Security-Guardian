import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ShieldCheck, Target, Link2, CheckSquare, Bell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user, quizScore, linksChecked, toolsChecked, getSecurityScore, getSecurityLevel } = useApp();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  if (!user) return null;

  const score = getSecurityScore();
  const level = getSecurityLevel();

  const getRecommendations = () => {
    if (score < 50) {
      return [
        { icon: <ShieldCheck />, text: "حسابك في خطر! فعّل المصادقة الثنائية (2FA) فوراً.", path: "/tools", action: "اذهب للأدوات" },
        { icon: <Target />, text: "لم تكمل الاختبار الأمني أو درجاتك متدنية. راجع معلوماتك.", path: "/security-test", action: "أعد الاختبار" },
        { icon: <Link2 />, text: "احذر من الروابط العشوائية. افحص دائماً قبل الضغط.", path: "/check-link", action: "افحص رابط" }
      ];
    } else if (score < 80) {
      return [
        { icon: <ShieldCheck />, text: "أداؤك جيد! يمكنك تعزيز أمانك بتفعيل المزيد من إعدادات الخصوصية.", path: "/tools", action: "إكمال القائمة" },
        { icon: <Bell />, text: "شاهد المزيد من الفيديوهات لتصبح خبيراً في اكتشاف الاحتيال.", path: "/learn", action: "تعلّم أكثر" },
        { icon: <Target />, text: "راجع كلمات مرورك وتأكد من عدم استخدام كلمة واحدة لحسابين.", path: "/tools", action: "حماية المرور" }
      ];
    } else {
      return [
        { icon: <ShieldCheck />, text: "أنت خبير! حافظ على تحديث أجهزتك بانتظام.", path: "/tools", action: "مراجعة القائمة" },
        { icon: <Bell />, text: "ساعد أصدقاءك وعائلتك على فهم أساسيات الأمان الرقمي.", path: "/about", action: "شارك المنصة" },
        { icon: <CheckSquare />, text: "ملفك مثالي. استمر في فحص الروابط المشبوهة عند استلامها.", path: "/check-link", action: "أداة الفحص" }
      ];
    }
  };

  const recommendations = getRecommendations();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black">مرحباً، {user.name} 👋</h1>
        <p className="text-muted-foreground mt-2">إليك ملخص لحالتك الأمنية ونشاطاتك الأخيرة</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Profile / Main Score Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass-card rounded-[2rem] p-8 border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="shrink-0 relative">
            <CircularProgress 
              value={score} 
              size={180} 
              strokeWidth={14} 
              colorClass={level.color} 
            />
          </div>

          <div className="text-center md:text-right flex-grow">
            <div className={`inline-flex items-center px-4 py-1.5 rounded-full border mb-4 font-bold text-sm ${level.badgeColor}`}>
              المستوى: {level.label}
            </div>
            <h2 className="text-2xl font-bold mb-2">مؤشر الأمان الرقمي</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed max-w-md">
              هذا المؤشر يعكس مدى تفاعلك مع المنصة وتطبيقك لممارسات الأمان. يمكنك زيادة درجتك عبر استكمال قائمة التحقق واجتياز الاختبار.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 text-sm">
                <span className="block text-muted-foreground mb-1">الروابط المفحوصة</span>
                <span className="font-bold text-lg">{linksChecked}</span>
              </div>
              <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 text-sm">
                <span className="block text-muted-foreground mb-1">نتيجة الاختبار</span>
                <span className="font-bold text-lg">{quizScore !== null ? `${quizScore}%` : 'لم يكتمل'}</span>
              </div>
              <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 text-sm">
                <span className="block text-muted-foreground mb-1">أدوات مفعّلة</span>
                <span className="font-bold text-lg">{toolsChecked.length} / 8</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Action Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-[2rem] p-8 border-white/5 flex flex-col">
          <h3 className="text-xl font-bold mb-6">إجراءات سريعة</h3>
          <div className="flex flex-col gap-3 flex-grow">
            <Button variant="outline" className="justify-between h-14 rounded-xl border-white/10 hover:bg-white/5 bg-black/20" onClick={() => setLocation("/check-link")}>
              <span className="flex items-center gap-2"><Link2 className="w-4 h-4 text-primary" /> افحص رابطاً مشبوهاً</span>
              <ArrowLeft className="w-4 h-4 opacity-50" />
            </Button>
            <Button variant="outline" className="justify-between h-14 rounded-xl border-white/10 hover:bg-white/5 bg-black/20" onClick={() => setLocation("/security-test")}>
              <span className="flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> أعد الاختبار الأمني</span>
              <ArrowLeft className="w-4 h-4 opacity-50" />
            </Button>
            <Button variant="outline" className="justify-between h-14 rounded-xl border-white/10 hover:bg-white/5 bg-black/20" onClick={() => setLocation("/tools")}>
              <span className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-primary" /> أكمل قائمة التحقق</span>
              <ArrowLeft className="w-4 h-4 opacity-50" />
            </Button>
          </div>
        </motion.div>

      </div>

      <h3 className="text-2xl font-bold mb-6">نصائح مخصصة لك</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col relative group overflow-hidden hover:bg-primary/10 transition-colors"
          >
            <div className="text-primary mb-4 bg-primary/10 w-fit p-3 rounded-xl">
              {rec.icon}
            </div>
            <p className="font-medium leading-relaxed mb-6 flex-grow">{rec.text}</p>
            <Button variant="link" className="p-0 text-primary self-start hover:no-underline font-bold" onClick={() => setLocation(rec.path)}>
              {rec.action} <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
