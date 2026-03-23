import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, PlayCircle, Youtube, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LangContext";
import { useApp } from "@/context/AppContext";
import LoginModal from "@/components/LoginModal";

interface AdminVideo {
  id: string;
  title: string;
  url: string;
  category: string;
  duration: string;
}

interface Lesson {
  id: string | number;
  title: string;
  titleEn?: string;
  desc: string;
  descEn?: string;
  duration: string;
  category: string;
  categoryEn?: string;
  url?: string;
}

const STATIC_LESSONS: Lesson[] = [
  { id: 1, title: "كيف تكتشف الرابط الاحتيالي؟", titleEn: "How to Spot a Phishing Link?", desc: "تعلم قراءة الروابط واكتشاف التلاعب في 60 ثانية.", descEn: "Learn to read links and spot manipulation in 60 seconds.", duration: "60s", category: "الروابط", categoryEn: "Links" },
  { id: 2, title: "أهمية التحقق الثنائي (2FA)", titleEn: "Importance of Two-Factor Auth", desc: "لماذا لا تكفي كلمة المرور وحدها لحمايتك؟", descEn: "Why isn't a password alone enough to protect you?", duration: "60s", category: "كلمات المرور", categoryEn: "Passwords" },
  { id: 3, title: "ماذا تفعل إذا تعرضت للابتزاز؟", titleEn: "What to Do If Blackmailed?", desc: "خطوات عملية للتعامل مع الابتزاز الإلكتروني.", descEn: "Practical steps for dealing with online blackmail.", duration: "90s", category: "الاحتيال", categoryEn: "Scams" },
  { id: 4, title: "كلمة مرور قوية في 30 ثانية", titleEn: "Strong Password in 30 Seconds", desc: "طريقة سهلة لإنشاء كلمات مرور معقدة وسهلة الحفظ.", descEn: "Easy way to create complex yet memorable passwords.", duration: "45s", category: "كلمات المرور", categoryEn: "Passwords" },
  { id: 5, title: "علامات رسالة التصيد", titleEn: "Signs of a Phishing Email", desc: "كيف تتعرف على إيميل الاحتيال المالي.", descEn: "How to identify a financial fraud email.", duration: "60s", category: "الاحتيال", categoryEn: "Scams" },
  { id: 6, title: "لا تشارك رمز OTP أبداً", titleEn: "Never Share Your OTP Code", desc: "خدع المهندسين الاجتماعيين لسرقة رمزك السري.", descEn: "Social engineering tricks to steal your secret code.", duration: "60s", category: "الاحتيال", categoryEn: "Scams" },
  { id: 7, title: "تأمين حساب واتساب", titleEn: "Secure Your WhatsApp", desc: "إعدادات بسيطة تحميك من سرقة الواتساب.", descEn: "Simple settings to protect you from WhatsApp theft.", duration: "60s", category: "الخصوصية", categoryEn: "Privacy" },
  { id: 8, title: "حماية خصوصيتك على الإنستغرام", titleEn: "Instagram Privacy Protection", desc: "من يرى بياناتك؟ وكيف تتحكم بها.", descEn: "Who sees your data? And how to control it.", duration: "75s", category: "الخصوصية", categoryEn: "Privacy" },
];

const AR_CATS = ["الكل", "الروابط", "كلمات المرور", "الاحتيال", "الخصوصية"];
const EN_CATS = ["All", "Links", "Passwords", "Scams", "Privacy"];

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
    /youtube\.com\/v\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function VideoThumbnail({ url, title }: { url?: string; title: string }) {
  const [quality, setQuality] = useState<"maxresdefault" | "hqdefault" | "error">("maxresdefault");
  const videoId = url ? extractYouTubeId(url) : null;
  const thumbUrl = videoId && quality !== "error"
    ? `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
    : null;

  const handleImgError = () => {
    if (quality === "maxresdefault") setQuality("hqdefault");
    else setQuality("error");
  };
  const imgError = quality === "error";

  return (
    <div className="relative aspect-video bg-gradient-to-br from-white/5 to-black/40 border border-white/10 rounded-2xl overflow-hidden mb-4 group-hover:border-primary/40 transition-colors">
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={handleImgError}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Youtube className="w-10 h-10 text-white/10" />
        </div>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/40 transform group-hover:scale-110 transition-transform">
          <Play className="w-5 h-5 ms-0.5" fill="currentColor" />
        </div>
      </div>
    </div>
  );
}

export default function Learn() {
  const { isRTL } = useLang();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [adminVideos, setAdminVideos] = useState<AdminVideo[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("horras_videos");
      if (saved) setAdminVideos(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Merge admin videos into lesson list
  const adminLessons: Lesson[] = adminVideos
    .filter((v) => v.url && extractYouTubeId(v.url))
    .map((v) => ({
      id: `admin-${v.id}`,
      title: v.title,
      desc: v.url,
      duration: v.duration || "60s",
      category: v.category || "الاحتيال",
      url: v.url,
    }));

  const allLessons = [...adminLessons, ...STATIC_LESSONS];

  const categories = isRTL ? AR_CATS : EN_CATS;
  const catMap: Record<string, string> = {
    "الروابط": "Links", "Links": "الروابط",
    "كلمات المرور": "Passwords", "Passwords": "كلمات المرور",
    "الاحتيال": "Scams", "Scams": "الاحتيال",
    "الخصوصية": "Privacy", "Privacy": "الخصوصية",
  };

  const filtered = activeTab === 0
    ? allLessons
    : allLessons.filter((l) => {
        const activeCat = categories[activeTab];
        return l.category === activeCat || l.category === catMap[activeCat] || l.categoryEn === activeCat;
      });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 w-full">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="bg-primary/10 p-4 rounded-2xl mb-5 border border-primary/20">
          <PlayCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          {isRTL ? "تعلّم في 60 ثانية" : "Learn in 60 Seconds"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          {isRTL
            ? "فيديوهات قصيرة ومكثفة لتسليحك بأهم مهارات الأمان الرقمي في أقل وقت ممكن."
            : "Short, intense videos to arm you with the most important digital security skills in the least amount of time."}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat, i) => (
          <button
            key={cat}
            onClick={() => setActiveTab(i)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === i
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Admin videos notice */}
      {adminLessons.length > 0 && activeTab === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 mb-6 px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 text-sm text-primary"
        >
          <Youtube className="w-4 h-4 shrink-0" />
          <span>
            {isRTL
              ? `${adminLessons.length} فيديو مضاف من المدير يظهر في الأعلى`
              : `${adminLessons.length} admin-added video${adminLessons.length > 1 ? "s" : ""} shown above`}
          </span>
        </motion.div>
      )}

      {/* Video Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filtered.map((lesson, i) => {
            const isAdmin = String(lesson.id).startsWith("admin-");
            const videoId = lesson.url ? extractYouTubeId(lesson.url) : null;
            const href = videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="group cursor-pointer"
                onClick={() => {
                  if (!user) { setShowLoginModal(true); return; }
                  href && window.open(href, "_blank");
                }}
              >
                <div className="relative">
                  <VideoThumbnail url={lesson.url} title={isRTL ? lesson.title : (lesson.titleEn || lesson.title)} />

                  {/* Duration badge */}
                  <div className="absolute bottom-7 end-3 z-30 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-lg text-xs font-medium text-white/90">
                    <Clock className="w-3 h-3" />
                    {lesson.duration}
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-3 start-3 z-30">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium backdrop-blur-sm ${isAdmin ? "bg-primary/30 text-primary border-primary/40" : "bg-white/10 text-white/80 border-white/10"}`}>
                      {isRTL ? lesson.category : (lesson.categoryEn || lesson.category)}
                    </span>
                  </div>

                  {/* Admin indicator */}
                  {isAdmin && (
                    <div className="absolute top-3 end-3 z-30">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold flex items-center gap-1">
                        <Youtube className="w-3 h-3" />
                        YT
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {isRTL ? lesson.title : (lesson.titleEn || lesson.title)}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {isRTL ? lesson.desc : (lesson.descEn || lesson.desc)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">{isRTL ? "لا توجد فيديوهات في هذا التصنيف" : "No videos in this category"}</p>
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
