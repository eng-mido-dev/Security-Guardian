import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, PlayCircle, Youtube } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { useApp } from "@/context/AppContext";
import LoginModal from "@/components/LoginModal";
import VideoModal from "@/components/VideoModal";
import { api, type ApiVideo } from "@/lib/api";

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

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

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
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ApiVideo | null>(null);

  useEffect(() => {
    api.videos.list().then(setAdminVideos).catch(() => {});
  }, []);

  const uniqueCats = Array.from(new Set(adminVideos.map((v) => v.category).filter(Boolean)));
  const allLabel = isRTL ? "الكل" : "All";
  const categories = [allLabel, ...uniqueCats];

  const filtered = activeTab === 0
    ? adminVideos
    : adminVideos.filter((v) => v.category === categories[activeTab]);

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
      {categories.length > 1 && (
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filtered.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="group cursor-pointer"
              onClick={() => openVideo(video)}
            >
              <div className="relative">
                <VideoThumbnail url={video.url} title={video.title} />

                <div className="absolute bottom-7 end-3 z-30 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-lg text-xs font-medium text-white/90">
                  <Clock className="w-3 h-3" />
                  {video.duration}
                </div>

                {video.category && (
                  <div className="absolute top-3 start-3 z-30">
                    <span className="text-xs px-2 py-0.5 rounded-full border font-medium backdrop-blur-sm bg-primary/20 text-primary border-primary/30">
                      {video.category}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {isRTL && video.titleAr ? video.titleAr : video.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {video.category ? (isRTL ? `تصنيف: ${video.category}` : `Category: ${video.category}`) : (isRTL ? "فيديو تعليمي" : "Educational video")}
              </p>
            </motion.div>
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
          description={activeVideo.description}
          descriptionAr={activeVideo.descriptionAr}
        />
      )}
    </div>
  );
}
