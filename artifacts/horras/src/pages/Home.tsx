import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ShieldCheck, Search, ClipboardCheck, AlertTriangle, PlayCircle,
  Smartphone, ChevronLeft, ChevronRight, Users, Target, FileWarning, Link2, Play, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LangContext";
import { api } from "@/lib/api";

function getLocalizedCategory(category: string, isRTL: boolean): string {
  if (!category) return "";
  const parts = category.split(/\s[-–]\s/);
  if (parts.length < 2) return category;
  const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s);
  const arPart = parts.find(hasArabic) ?? parts[0];
  const enPart = parts.find((p) => !hasArabic(p)) ?? parts[1];
  return isRTL ? arPart : enPart;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

interface VideoCardData {
  titleAr: string;
  titleEn: string;
  catAr: string;
  catEn: string;
  duration: string;
  url?: string;
}

function HomeVideoCard({ card, isRTL, onClick }: { card: VideoCardData; isRTL: boolean; onClick: () => void }) {
  const [quality, setQuality] = useState<"hqdefault" | "mqdefault" | "error">("hqdefault");
  const videoId = card.url ? extractYouTubeId(card.url) : null;
  const thumbUrl = videoId && quality !== "error"
    ? `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-white/5 to-black/40 border border-white/10 rounded-2xl overflow-hidden mb-3 group-hover:border-primary/40 transition-colors">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={isRTL ? card.titleAr : card.titleEn}
            className="w-full h-full object-cover"
            onError={() => {
              if (quality === "hqdefault") setQuality("mqdefault");
              else setQuality("error");
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-black/50" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/40 transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 ms-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-3 end-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-lg text-xs font-medium text-white/90">
          <Clock className="w-3 h-3" />
          {card.duration}
        </div>

        {/* Category badge */}
        <div className="absolute top-3 start-3">
          <span className="text-xs px-2 py-0.5 rounded-full border font-medium backdrop-blur-sm bg-white/10 text-white/80 border-white/10">
            {isRTL ? card.catAr : card.catEn}
          </span>
        </div>
      </div>

      <h3 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
        {isRTL ? card.titleAr : card.titleEn}
      </h3>
    </motion.div>
  );
}


const TYPING_WORDS_AR = ["من الاحتيال الإلكتروني", "من التصيد الاحتيالي", "من سرقة البيانات", "من الهجمات السيبرانية"];
const TYPING_WORDS_EN = ["from Online Fraud", "from Phishing Attacks", "from Data Theft", "from Cyber Attacks"];

function useTypingEffect(words: string[], speed = 70, pause = 1800) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let delay = deleting ? speed / 2 : speed;
    if (!deleting && charIdx === current.length) delay = pause;
    if (deleting && charIdx === 0) delay = 300;

    const t = setTimeout(() => {
      if (!deleting && charIdx < current.length) {
        setDisplay(current.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      } else if (!deleting && charIdx === current.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setDisplay(current.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      } else {
        setDeleting(false);
        setWordIdx((i) => (i + 1) % words.length);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLang();
  const ChevronDir = isRTL ? ChevronLeft : ChevronRight;
  const typingWords = isRTL ? TYPING_WORDS_AR : TYPING_WORDS_EN;
  const typedText = useTypingEffect(typingWords);

  const [videoCards, setVideoCards] = useState<VideoCardData[]>([]);

  useEffect(() => {
    api.videos.list().then((videos) => {
      const cards: VideoCardData[] = videos.slice(0, 4).map((v) => ({
        titleAr: v.titleAr || v.title || "فيديو",
        titleEn: v.title || v.titleAr || "Video",
        catAr: getLocalizedCategory(v.category || "", true) || "توعية",
        catEn: getLocalizedCategory(v.category || "", false) || "Awareness",
        duration: v.duration || "60s",
        url: v.url,
      }));
      setVideoCards(cards);
    }).catch(() => {});
  }, []);

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
      {/* ── Hero Section — Cyber Premium ── */}
      <section className="relative pt-28 pb-24 overflow-hidden min-h-[88vh] flex items-center">

        {/* ── Layered mesh-gradient background ── */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
          {/* Primary gold glow — top center */}
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[900px] h-[560px] rounded-full bg-primary/10 blur-[160px]" />
          {/* Secondary accent — bottom-left depth */}
          <div className="absolute bottom-0 left-0 w-[500px] h-[350px] bg-blue-600/[0.04] blur-[120px] rounded-full" />
          {/* Tertiary accent — top-right */}
          <div className="absolute top-1/4 right-0 w-[350px] h-[250px] bg-primary/[0.06] blur-[90px] rounded-full" />

          {/* Cyber grid overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,184,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,184,0,0.045) 1px, transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />
          {/* Radial fade — vignette so grid doesn't overpower edges */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_40%,#0A0A0A_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A]/90" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto">

            {/* Glowing pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/35 bg-primary/10 backdrop-blur-sm text-primary text-sm font-semibold mb-10 shadow-[0_0_20px_rgba(255,184,0,0.15)]"
            >
              <ShieldCheck className="w-4 h-4" />
              {isRTL ? "منصة الأمن الرقمي العربية رقم 1" : "The #1 Arabic Cybersecurity Awareness Platform"}
            </motion.div>

            {/* Massive heading — gradient text */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.06 }}
              className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight mb-7 leading-[1.06]"
            >
              <span className="bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">
                {t("hero.title1")}
              </span>{" "}
              <span className="gold-gradient-text block sm:inline">
                {typedText || "\u00A0"}
                <span className="inline-block w-[3px] h-[0.82em] bg-primary ms-1 align-middle animate-pulse rounded-sm" />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="text-lg sm:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              {t("hero.subtitle")}
            </motion.p>

            {/* CTA Buttons — glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {/* Primary — gold glow CTA */}
              <button
                onClick={() => setLocation("/check-link")}
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[15px] font-bold bg-primary text-[#0A0A0A] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_32px_rgba(255,184,0,0.45)] shadow-[0_4px_24px_rgba(255,184,0,0.2)]"
              >
                <span className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Search className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{t("hero.checkLink")}</span>
              </button>

              {/* Secondary — glass */}
              <button
                onClick={() => setLocation("/security-test")}
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[15px] font-bold bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.10] hover:border-white/[0.22] hover:shadow-[0_8px_30px_rgba(255,255,255,0.06)]"
              >
                <ClipboardCheck className="w-4 h-4" />
                {t("hero.testSecurity")}
              </button>

              {/* Tertiary — ghost */}
              <button
                onClick={() => setLocation("/report")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[15px] font-semibold text-white/40 hover:text-white/70 transition-colors duration-200"
              >
                <AlertTriangle className="w-4 h-4" />
                {t("hero.report")}
              </button>
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
          {videoCards.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {videoCards.map((card, i) => (
                <HomeVideoCard
                  key={i}
                  card={card}
                  isRTL={isRTL}
                  onClick={() => {
                    if (card.url) window.open(card.url, "_blank", "noopener,noreferrer");
                    else setLocation("/learn");
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 rounded-3xl border border-white/5 bg-white/[0.02]">
              <PlayCircle className="w-10 h-10 text-white/15 mb-3" />
              <p className="text-white/30 text-sm font-medium">
                {isRTL ? "فيديوهات تعليمية قريباً" : "Educational videos coming soon"}
              </p>
            </div>
          )}
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
