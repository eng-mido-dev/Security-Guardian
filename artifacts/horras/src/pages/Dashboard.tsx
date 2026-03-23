import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";
import { HalfCircleGauge } from "@/components/ui/circular-progress";
import {
  ShieldCheck, Target, Link2, CheckSquare, Bell,
  ArrowLeft, ArrowRight, User, ClipboardCheck, Search, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const { user, isAdmin, quizScore, linksChecked, toolsChecked, getSecurityScore, getSecurityLevel } = useApp();
  const { t, isRTL } = useLang();
  const [, setLocation] = useLocation();
  const ArrowDir = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    if (!user) setLocation("/login");
  }, [user, setLocation]);

  if (!user) return null;

  // Admin sees the Admin Dashboard
  if (isAdmin) return <AdminDashboard />;

  // --- USER DASHBOARD ---
  const score = getSecurityScore();
  const level = getSecurityLevel();

  const levelLabel = () => {
    if (score >= 80) return t("level.expert");
    if (score >= 50) return t("level.intermediate");
    return t("level.atRisk");
  };

  const getRecommendations = () => {
    if (score < 50) {
      return [
        { icon: <ShieldCheck className="w-5 h-5" />, text: isRTL ? "فعّل المصادقة الثنائية (2FA) على جميع حساباتك فوراً." : "Enable Two-Factor Authentication (2FA) on all your accounts immediately.", path: "/tools", action: isRTL ? "أدوات الأمان" : "Security Tools" },
        { icon: <Target className="w-5 h-5" />, text: isRTL ? "لم تكمل الاختبار الأمني. اكتشف مستوى وعيك الآن." : "You haven't completed the security quiz. Discover your awareness level now.", path: "/security-test", action: isRTL ? "ابدأ الاختبار" : "Start Quiz" },
        { icon: <Link2 className="w-5 h-5" />, text: isRTL ? "افحص الروابط الواردة قبل الضغط عليها دائماً." : "Always scan incoming links before clicking them.", path: "/check-link", action: isRTL ? "افحص رابط" : "Scan Link" },
      ];
    } else if (score < 80) {
      return [
        { icon: <ShieldCheck className="w-5 h-5" />, text: isRTL ? "أداؤك جيد! عزز أمانك بتفعيل المزيد من الإعدادات." : "Good performance! Boost your security by enabling more settings.", path: "/tools", action: isRTL ? "قائمة التحقق" : "Checklist" },
        { icon: <Bell className="w-5 h-5" />, text: isRTL ? "شاهد فيديوهاتنا التعليمية لتصبح خبيراً." : "Watch our educational videos to become an expert.", path: "/learn", action: isRTL ? "تعلّم أكثر" : "Learn More" },
        { icon: <Target className="w-5 h-5" />, text: isRTL ? "راجع كلمات المرور وتجنب إعادة الاستخدام." : "Review your passwords and avoid reusing them.", path: "/tools", action: isRTL ? "حماية الحسابات" : "Account Safety" },
      ];
    } else {
      return [
        { icon: <ShieldCheck className="w-5 h-5" />, text: isRTL ? "أنت خبير! حافظ على تحديث أجهزتك بانتظام." : "You're an expert! Keep your devices updated regularly.", path: "/tools", action: isRTL ? "مراجعة القائمة" : "Review List" },
        { icon: <Bell className="w-5 h-5" />, text: isRTL ? "ساعد أصدقاءك على فهم أساسيات الأمان الرقمي." : "Help your friends understand digital security basics.", path: "/about", action: isRTL ? "شارك المنصة" : "Share Platform" },
        { icon: <CheckSquare className="w-5 h-5" />, text: isRTL ? "ملفك مثالي. استمر في فحص الروابط المشبوهة." : "Your profile is excellent. Keep checking suspicious links.", path: "/check-link", action: isRTL ? "أداة الفحص" : "Scan Tool" },
      ];
    }
  };

  const recentActivity = [
    ...(quizScore !== null ? [{ icon: <ClipboardCheck className="w-4 h-4 text-emerald-400" />, text: `${t("dashboard.completedQuiz")} ${quizScore}%`, time: t("dashboard.today") }] : []),
    ...(linksChecked > 0 ? [{ icon: <Search className="w-4 h-4 text-blue-400" />, text: `${t("dashboard.checkedLinks")} ${linksChecked} ${linksChecked > 1 ? t("dashboard.links_plural") : t("dashboard.links")}`, time: t("dashboard.today") }] : []),
    ...(toolsChecked.length > 0 ? [{ icon: <CheckSquare className="w-4 h-4 text-primary" />, text: `${t("dashboard.toolsActivated")} ${toolsChecked.length} ${t("dashboard.securityTools")}`, time: t("dashboard.today") }] : []),
    { icon: <Calendar className="w-4 h-4 text-muted-foreground" />, text: t("dashboard.joinedPlatform"), time: t("dashboard.onRegistration") },
  ];

  const recommendations = getRecommendations();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 w-full">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-black">{t("dashboard.greeting")} {user.name} 👋</h1>
        <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
      </div>

      {/* Score + Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border-white/5 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
            <span className="text-xl font-black text-primary">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">{user.name}</h2>
            <p className="text-muted-foreground text-xs mt-0.5">{user.email}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full border font-bold ${level.badgeColor}`}>{levelLabel()}</span>
          <div className="w-full pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-sm">
            <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
              <p className="text-muted-foreground text-xs mb-0.5">{t("dashboard.securityLevel")}</p>
              <p className="font-black text-primary">{score}%</p>
            </div>
            <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
              <p className="text-muted-foreground text-xs mb-0.5">{t("dashboard.toolsEnabled")}</p>
              <p className="font-black">{toolsChecked.length}/8</p>
            </div>
          </div>
          {user.joinDate && (
            <div className="w-full bg-black/20 rounded-xl px-3 py-2.5 border border-white/5">
              <p className="text-muted-foreground text-xs mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t("dashboard.joinDate")}
              </p>
              <p className="font-bold text-xs">
                {new Date(user.joinDate).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          )}
        </motion.div>

        {/* Score card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-2 glass-card rounded-2xl p-6 border-white/5 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 end-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="shrink-0">
            <HalfCircleGauge value={score} isRTL={isRTL} labelAr="مؤشر الأمان" labelEn="Security Score" />
          </div>
          <div className="text-center md:text-start flex-grow">
            <h2 className="text-xl font-bold mb-1.5">{t("dashboard.securityScore")}</h2>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{t("dashboard.scoreDesc")}</p>
            <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
              <div className="bg-black/40 px-3 py-2 rounded-xl border border-white/5 text-xs">
                <span className="block text-muted-foreground mb-0.5">{t("dashboard.linksChecked")}</span>
                <span className="font-bold">{linksChecked}</span>
              </div>
              <div className="bg-black/40 px-3 py-2 rounded-xl border border-white/5 text-xs">
                <span className="block text-muted-foreground mb-0.5">{t("dashboard.quizResult")}</span>
                <span className="font-bold">{quizScore !== null ? `${quizScore}%` : t("dashboard.notCompleted")}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Button size="sm" className="rounded-xl h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setLocation("/check-link")}>
                <Link2 className="w-3.5 h-3.5 mx-1" /> {t("dashboard.checkLink")}
              </Button>
              <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs border-white/10 hover:bg-white/5" onClick={() => setLocation("/security-test")}>
                <Target className="w-3.5 h-3.5 mx-1" /> {t("dashboard.retakeTest")}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <h3 className="text-lg font-bold mb-3">{t("dashboard.activity")}</h3>
        <div className="glass-card rounded-2xl border-white/5 divide-y divide-white/5">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="bg-black/30 p-2 rounded-xl border border-white/5 shrink-0">{item.icon}</div>
              <p className="flex-grow text-sm">{item.text}</p>
              <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h3 className="text-lg font-bold mb-3">{t("dashboard.recommendations")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="bg-primary/5 border border-primary/15 rounded-2xl p-5 flex flex-col group hover:bg-primary/10 transition-colors">
              <div className="text-primary mb-3 bg-primary/10 w-fit p-2.5 rounded-xl">{rec.icon}</div>
              <p className="text-sm font-medium leading-relaxed mb-4 flex-grow">{rec.text}</p>
              <button onClick={() => setLocation(rec.path)} className="flex items-center gap-1 text-primary text-xs font-bold hover:gap-2 transition-all">
                {rec.action} <ArrowDir className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
