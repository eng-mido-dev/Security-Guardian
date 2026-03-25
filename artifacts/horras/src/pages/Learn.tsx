import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Youtube } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { useApp } from "@/context/AppContext";
import LoginModal from "@/components/LoginModal";
import VideoModal from "@/components/VideoModal";
import VideoCard from "@/components/VideoCard";
import { api, type ApiVideo } from "@/lib/api";

function getLocalizedCategory(category: string, isRTL: boolean): string {
  if (!category) return "";
  const parts = category.split(/\s[-–]\s/);
  if (parts.length < 2) return category;
  const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s);
  const arPart = parts.find(hasArabic) ?? parts[0];
  const enPart = parts.find((p) => !hasArabic(p)) ?? parts[1];
  return isRTL ? arPart : enPart;
}

export default function Learn() {
  const { isRTL } = useLang();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [adminVideos, setAdminVideos] = useState<ApiVideo[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ApiVideo | null>(null);

  useEffect(() => {
    api.videos.list().then(setAdminVideos).catch(() => {});
  }, []);

  const rawCats = Array.from(new Set(adminVideos.map((v) => v.category).filter(Boolean)));
  const allLabel = isRTL ? "الكل" : "All";
  const allCats = [allLabel, ...rawCats];

  const filtered = activeTab === 0
    ? adminVideos
    : adminVideos.filter((v) => v.category === rawCats[activeTab - 1]);

  const openVideo = (video: ApiVideo) => {
    if (!user) { setShowLoginModal(true); return; }
    setActiveVideo(video);
    setVideoModalOpen(true);
  };

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
      {allCats.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {allCats.map((cat, i) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeTab === i}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === i
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
              }`}
            >
              {i === 0 ? cat : getLocalizedCategory(cat, isRTL)}
            </button>
          ))}
        </div>
      )}

      {/* No videos at all */}
      {adminVideos.length === 0 && (
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filtered.map((video, i) => (
            <VideoCard
              key={video.id}
              video={video}
              isRTL={isRTL}
              index={i}
              onClick={() => openVideo(video)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && adminVideos.length > 0 && (
        <div className="text-center py-20">
          <Youtube className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">{isRTL ? "لا توجد فيديوهات في هذا التصنيف" : "No videos in this category"}</p>
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {activeVideo && (
        <VideoModal
          isOpen={videoModalOpen}
          onClose={() => { setVideoModalOpen(false); setActiveVideo(null); }}
          title={activeVideo.title}
          titleAr={activeVideo.titleAr}
          url={activeVideo.url}
          category={activeVideo.category}
          duration={activeVideo.duration}
          description={activeVideo.description}
          descriptionAr={activeVideo.descriptionAr}
        />
      )}
    </div>
  );
}
