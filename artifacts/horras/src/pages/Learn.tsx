import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, PlayCircle, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LangContext";
import { useApp } from "@/context/AppContext";
import LoginModal from "@/components/LoginModal";
import { api, type ApiVideo } from "@/lib/api";

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
  const [quality, setQuality] = useState<"hqdefault" | "mqdefault" | "error">("hqdefault");
  const videoId = url ? extractYouTubeId(url) : null;
  const thumbUrl = videoId && quality !== "error"
    ? `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`
    : null;

  const handleImgError = () => {
    if (quality === "hqdefault") setQuality("mqdefault");
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
  const [adminVideos, setAdminVideos] = useState<ApiVideo[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    api.videos.list().then(setAdminVideos).catch(() => {});
  }, []);

  const allLessons: Lesson[] = adminVideos.map((v) => ({
    id: `admin-${v.id}`,
    title: v.title,
    titleEn: v.title,
    desc: v.category ? (isRTL ? `فيديو في تصنيف: ${v.category}` : `Category: ${v.category}`) : (isRTL ? "فيديو تعليمي في الأمن الرقمي" : "Digital security awareness video"),
    descEn: v.category ? `Category: ${v.category}` : "Digital security awareness video",
    duration: v.duration || "60s",
    category: v.category || "",
    categoryEn: v.category || "",
    url: v.url,
  }));

  const uniqueCats = Array.from(new Set(allLessons.map((l) => l.category).filter(Boolean)));
  const allLabel = isRTL ? "الكل" : "All";
  const categories = [allLabel, ...uniqueCats];

  const filtered = activeTab === 0
    ? allLessons
    : allLessons.filter((l) => l.category === categories[activeTab]);

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

      {/* No videos at all */}
      {allLessons.length === 0 && (
        <div className="text-center py-24">
          <div className="inline-flex bg-white/5 p-5 rounded-3xl border border-white/10 mb-5">
            <Youtube className="w-10 h-10 text-white/20" />
          </div>
          <p className="text-lg font-bold text-white/40 mb-2">
            {isRTL ? "لا توجد فيديوهات حتى الآن" : "No videos yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isRTL ? "سيضيف المدير فيديوهات تعليمية قريباً" : "Admin will add educational videos soon"}
          </p>
        </div>
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
                    <span className="text-xs px-2 py-0.5 rounded-full border font-medium backdrop-blur-sm bg-primary/20 text-primary border-primary/30">
                      {lesson.category || (isRTL ? "توعية" : "Awareness")}
                    </span>
                  </div>

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
          <Youtube className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">{isRTL ? "لا توجد فيديوهات في هذا التصنيف" : "No videos in this category"}</p>
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
