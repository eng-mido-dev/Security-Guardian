import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Play } from "lucide-react";
import { useLang } from "@/context/LangContext";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleAr?: string;
  url: string;
  category?: string;
  description?: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
}

export default function VideoModal({ isOpen, onClose, title, titleAr, url, category, description }: VideoModalProps) {
  const { isRTL } = useLang();
  const videoId = getYouTubeId(url);
  const displayTitle = isRTL && titleAr ? titleAr : title;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 320, mass: 0.8 }}
            className="relative w-full max-w-3xl z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0F0F11] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/70 ring-1 ring-white/[0.04]">

              <div className={`flex items-start justify-between gap-3 px-5 py-4 bg-gradient-to-b from-white/[0.04] to-transparent ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className={`flex flex-col flex-1 min-w-0 ${isRTL ? "items-end text-right" : "items-start text-left"}`}>
                  {category && (
                    <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mb-1.5 px-2 py-0.5 bg-primary/10 rounded-md border border-primary/20">
                      {category}
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{displayTitle}</h3>
                  {description && (
                    <p className="text-xs text-white/40 leading-relaxed mt-2 line-clamp-2">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all mt-0.5 border border-transparent hover:border-white/10"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative bg-black" style={{ paddingBottom: "56.25%" }}>
                {videoId ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white`}
                    title={displayTitle}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/20">
                    <Play className="w-12 h-12" />
                    <p className="text-sm">{isRTL ? "الفيديو غير متاح" : "Video not available"}</p>
                  </div>
                )}
              </div>

              <div className={`px-5 py-3 flex items-center justify-between border-t border-white/[0.06] bg-black/30 ${isRTL ? "flex-row-reverse" : ""}`}>
                <span className="text-[10px] text-white/25 font-medium tracking-wide uppercase">
                  {isRTL ? "حُراس · مشغّل الفيديو" : "Horras · Video Player"}
                </span>
                {videoId && (
                  <a
                    href={`https://www.youtube.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-primary transition-colors font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {isRTL ? "فتح في يوتيوب" : "Open in YouTube"}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
