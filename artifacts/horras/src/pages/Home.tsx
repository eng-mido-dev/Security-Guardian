import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  ShieldCheck, Search, ClipboardCheck, AlertTriangle, PlayCircle,
  Smartphone, ChevronLeft, ChevronRight, Users, Target, FileWarning, Link2
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
      {/* Hero Section — pure dark, no background image */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/8 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8"
            >
              <ShieldCheck className="w-4 h-4" />
              {isRTL ? "منصة الأمن الرقمي العربية رقم 1" : "The #1 Arabic Cybersecurity Awareness Platform"}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight"
            >
              {t("hero.title1")}{" "}
              <span className="gold-gradient-text">{t("hero.title2")}</span>
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
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <Button
                size="lg"
                className="rounded-xl font-bold px-8 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/20"
                onClick={() => setLocation("/check-link")}
              >
                {t("hero.checkLink")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl font-bold px-8 border-white/15 bg-white/5 hover:bg-white/8 hover:scale-105 transition-all"
                onClick={() => setLocation("/security-test")}
              >
                {t("hero.testSecurity")}
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-xl font-bold px-8 hover:bg-white/5 transition-all text-muted-foreground hover:text-white"
                onClick={() => setLocation("/report")}
              >
                {t("hero.report")}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-y border-white/5 bg-white/[0.015] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center text-center"
              >
                <div className="bg-primary/10 p-3 rounded-2xl text-primary mb-3 border border-primary/20">
                  {stat.icon}
                </div>
                <h3 className="text-2xl font-black mb-1">{stat.value}</h3>
                <p className="text-muted-foreground text-sm">{t(stat.labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-3">{t("features.title")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("features.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                onClick={() => setLocation(feature.path)}
                className="glass-card p-7 rounded-3xl cursor-pointer group hover:bg-white/[0.04] transition-all"
              >
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-5 border border-primary/20 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">{t(feature.descKey)}</p>
                <div className="flex items-center text-primary text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {t("features.startNow")} <ChevronDir className="w-3.5 h-3.5 mx-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learn preview */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black mb-1">{t("learn.title")}</h2>
              <p className="text-muted-foreground text-sm">{t("learn.subtitle")}</p>
            </div>
            <Button variant="outline" className="rounded-xl border-white/10 bg-transparent hover:bg-white/5 hidden md:flex text-sm" onClick={() => setLocation("/learn")}>
              {t("learn.viewMore")}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { titleAr: "ماذا تفعل إذا تعرضت للابتزاز؟", titleEn: "What to Do If You're Blackmailed?", catAr: "الاحتيال", catEn: "Scams", duration: "90s" },
              { titleAr: "أهمية التحقق الثنائي", titleEn: "Importance of Two-Factor Auth", catAr: "كلمات المرور", catEn: "Passwords", duration: "60s" },
              { titleAr: "كيف تكتشف الرابط الاحتيالي؟", titleEn: "How to Spot a Phishing Link?", catAr: "الروابط", catEn: "Links", duration: "60s" },
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-2xl overflow-hidden cursor-pointer group hover:bg-white/[0.04] transition-all"
                onClick={() => setLocation("/learn")}
              >
                <div className="relative bg-gradient-to-br from-white/5 to-white/[0.01] h-40 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
                    <PlayCircle className="w-7 h-7 text-primary-foreground fill-primary-foreground" />
                  </div>
                  <div className="absolute bottom-3 end-3 bg-black/60 text-xs px-2 py-0.5 rounded-lg text-muted-foreground">⏱ {v.duration}</div>
                  <div className="absolute top-3 start-3 bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-lg border border-primary/20 font-medium">
                    {isRTL ? v.catAr : v.catEn}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm leading-snug">{isRTL ? v.titleAr : v.titleEn}</h3>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Button variant="outline" className="rounded-xl border-white/10 text-sm" onClick={() => setLocation("/learn")}>{t("learn.viewMore")}</Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-[2.5rem] p-10 md:p-14 text-center border-primary/15 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none"></div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 relative z-10">{t("cta.title")}</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto relative z-10">{t("cta.subtitle")}</p>
            <Button
              size="lg"
              className="rounded-xl font-bold px-10 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/20 relative z-10"
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
