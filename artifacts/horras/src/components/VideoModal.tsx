import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { useLang } from "@/context/LangContext";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  category?: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
}

export default function VideoModal({ isOpen, onClose, title, url, category }: VideoModalProps) {
  const { isRTL } = useLang();
  const videoId = getYouTubeId(url);

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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-white/10">
              <div className={`flex flex-col ${isRTL ? "items-end" : "items-start"}`}>
                <h3 className="text-sm font-bold text-white leading-snug">{title}</h3>
                {category && (
                  <span className="text-xs text-primary/80 font-medium mt-0.5">{category}</span>
                )}
              </div>
              <button
                onClick={onClose}
                className="shrink-0 p-1.5 rounded-xl text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative bg-black" style={{ paddingBottom: "56.25%" }}>
              {videoId ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  {isRTL ? "الفيديو غير متاح" : "Video not available"}
                </div>
              )}
            </div>

            <div className="px-5 py-3 flex items-center justify-between border-t border-white/5">
              <span className="text-xs text-muted-foreground">
                {isRTL ? "مشغّل الفيديو الداخلي" : "Internal Video Player"}
              </span>
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary/60 hover:text-primary transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {isRTL ? "فتح في يوتيوب" : "Open in YouTube"}
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
