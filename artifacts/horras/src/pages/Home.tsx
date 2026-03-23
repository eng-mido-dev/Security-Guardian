import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { 
  ShieldCheck, 
  Search, 
  ClipboardCheck, 
  AlertTriangle, 
  PlayCircle, 
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Users,
  Target,
  FileWarning,
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LangContext";

export default function Home() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLang();
  const ChevronDir = isRTL ? ChevronLeft : ChevronRight;

  const stats = [
    { icon: <Users className="w-5 h-5" />, value: "+5,200", labelKey: "stats.activeUsers" },
    { icon: <Target className="w-5 h-5" />, value: "89%", labelKey: "stats.accuracy" },
    { icon: <FileWarning className="w-5 h-5" />, value: "847", labelKey: "stats.reports" },
    { icon: <Link2 className="w-5 h-5" />, value: "+13,453", labelKey: "stats.links" },
  ];

  const features = [
    { icon: <Search className="w-6 h-6" />, titleKey: "features.linkCheck", descKey: "features.linkCheckDesc", path: "/check-link" },
    { icon: <ClipboardCheck className="w-6 h-6" />, titleKey: "features.quiz", descKey: "features.quizDesc", path: "/security-test" },
    { icon: <AlertTriangle className="w-6 h-6" />, titleKey: "features.report", descKey: "features.reportDesc", path: "/report" },
    { icon: <ShieldCheck className="w-6 h-6" />, titleKey: "features.tools", descKey: "features.toolsDesc", path: "/tools" },
    { icon: <Smartphone className="w-6 h-6" />, titleKey: "features.simulator", descKey: "features.simulatorDesc", path: "/learn" },
    { icon: <PlayCircle className="w-6 h-6" />, titleKey: "features.videos", descKey: "features.videosDesc", path: "/learn" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Cybersecurity grid background"
            className="w-full h-full object-cover opacity-40 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight"
            >
              {t("hero.title1")} <span className="gold-gradient-text">{t("hero.title2")}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button size="lg" className="rounded-xl font-bold px-8 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/20" onClick={() => setLocation("/check-link")}>
                {t("hero.checkLink")}
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl font-bold px-8 border-white/20 bg-white/5 hover:bg-white/10 hover:scale-105 transition-all backdrop-blur-md" onClick={() => setLocation("/security-test")}>
                {t("hero.testSecurity")}
              </Button>
              <Button size="lg" variant="ghost" className="rounded-xl font-bold px-8 hover:bg-white/5 transition-all" onClick={() => setLocation("/report")}>
                {t("hero.report")}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-x divide-x-reverse divide-white/5">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center text-center px-4"
              >
                <div className="bg-primary/10 p-3 rounded-2xl text-primary mb-4 border border-primary/20">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-black mb-1">{stat.value}</h3>
                <p className="text-muted-foreground text-sm font-medium">{t(stat.labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t("features.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("features.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                onClick={() => setLocation(feature.path)}
                className="glass-card p-8 rounded-3xl cursor-pointer group hover:bg-white/[0.04] transition-all"
              >
                <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center text-primary mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{t(feature.descKey)}</p>
                <div className="flex items-center text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {t("features.startNow")} <ChevronDir className="w-4 h-4 mx-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Hub Preview */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-2">{t("learn.title")}</h2>
              <p className="text-muted-foreground">{t("learn.subtitle")}</p>
            </div>
            <Button variant="outline" className="rounded-xl border-white/10 bg-black/20 hover:bg-white/5 hidden md:flex" onClick={() => setLocation("/learn")}>
              {t("learn.viewMore")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { titleAr: "ماذا تفعل إذا تعرضت للابتزاز؟", titleEn: "What to Do If You're Blackmailed?", descAr: "خطوات عملية للتعامل مع محاولات الابتزاز الإلكتروني.", descEn: "Practical steps to handle online blackmail attempts.", duration: "90s", categoryAr: "الاحتيال", categoryEn: "Scams" },
              { titleAr: "أهمية التحقق الثنائي", titleEn: "Importance of Two-Factor Auth", descAr: "لماذا يعتبر التحقق الثنائي خط الدفاع الأهم لحساباتك.", descEn: "Why 2FA is the most important defense for your accounts.", duration: "60s", categoryAr: "كلمات المرور", categoryEn: "Passwords" },
              { titleAr: "كيف تكتشف الرابط الاحتيالي؟", titleEn: "How to Spot a Phishing Link?", descAr: "تعلم العلامات الخمس التي تكشف الروابط المريبة.", descEn: "Learn the five signs that reveal suspicious links.", duration: "60s", categoryAr: "الروابط", categoryEn: "Links" },
            ].map((video, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass-card rounded-2xl overflow-hidden cursor-pointer group hover:bg-white/[0.04] transition-all"
                onClick={() => setLocation("/learn")}
              >
                <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] h-44 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl shadow-primary/30">
                    <PlayCircle className="w-8 h-8 text-primary-foreground fill-primary-foreground" />
                  </div>
                  <div className="absolute bottom-3 end-3 bg-black/70 text-xs px-2 py-1 rounded-lg text-muted-foreground flex items-center gap-1">
                    ⏱ {video.duration}
                  </div>
                  <div className="absolute top-3 end-3 bg-primary/20 text-primary text-xs px-2 py-1 rounded-lg border border-primary/20 font-medium">
                    {isRTL ? video.categoryAr : video.categoryEn}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base mb-2 leading-snug">{isRTL ? video.titleAr : video.titleEn}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{isRTL ? video.descAr : video.descEn}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="rounded-xl border-white/10 bg-black/20 hover:bg-white/5" onClick={() => setLocation("/learn")}>
              {t("learn.viewMore")}
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-[2.5rem] p-10 md:p-16 text-center bg-gradient-to-b from-primary/10 to-transparent border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
            <h2 className="text-3xl md:text-5xl font-black mb-6">{t("cta.title")}</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t("cta.subtitle")}
            </p>
            <Button
              size="lg"
              className="rounded-xl font-bold px-10 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/20"
              onClick={() => setLocation("/security-test")}
            >
              {t("cta.button")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
