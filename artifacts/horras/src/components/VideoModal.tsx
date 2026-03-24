import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Clock, Shield } from "lucide-react";
import { useLang } from "@/context/LangContext";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleAr?: string;
  url: string;
  category?: string;
  duration?: string;
  description?: string;
  descriptionAr?: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
}

export default function VideoModal({
  isOpen,
  onClose,
  title,
  titleAr,
  url,
  category,
  duration,
  description,
  descriptionAr,
}: VideoModalProps) {
  const { isRTL } = useLang();
  const videoId = getYouTubeId(url);
  const displayTitle = isRTL && titleAr ? titleAr : title;
  const displayDescription = isRTL && descriptionAr ? descriptionAr : description;
  const dir = isRTL ? "rtl" : "ltr";

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKey]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xl"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 32 }}
            transition={{ type: "spring", damping: 30, stiffness: 340, mass: 0.75 }}
            className="fixed inset-0 z-[121] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
          >
            <div
              className="relative w-full max-w-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
              dir={dir}
            >
              <div
                className="relative overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.85)]"
                style={{
                  background: "linear-gradient(160deg, rgba(18,18,22,0.97) 0%, rgba(10,10,12,0.99) 100%)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none rounded-2xl"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,184,0,0.06) 0%, transparent 70%)",
                  }}
                />

                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-3.5 right-3.5 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.14] hover:border-white/20 transition-all duration-150"
                  style={isRTL ? { right: "auto", left: "0.875rem" } : {}}
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative w-full bg-black rounded-t-2xl overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
                  {videoId ? (
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white&iv_load_policy=3&disablekb=0`}
                      title={displayTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      loading="eager"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0A0A0C]">
                      <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                        <Play className="w-7 h-7 text-white/20 translate-x-0.5" />
                      </div>
                      <p className="text-sm text-white/25 font-medium">
                        {isRTL ? "الفيديو غير متاح" : "Video unavailable"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-5 pt-4 pb-5 space-y-3">
                  <div className={`flex items-start gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <div className={`flex flex-wrap items-center gap-2 mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        {category && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                            <Shield className="w-2.5 h-2.5" />
                            {category}
                          </span>
                        )}
                        {duration && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white/40 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.07]">
                            <Clock className="w-2.5 h-2.5" />
                            {duration}
                          </span>
                        )}
                      </div>

                      <h3
                        className="text-base font-bold text-white leading-snug"
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      >
                        {displayTitle}
                      </h3>
                    </div>
                  </div>

                  {displayDescription && (
                    <p
                      className="text-sm text-white/45 leading-relaxed"
                      style={{ textAlign: isRTL ? "right" : "left" }}
                    >
                      {displayDescription}
                    </p>
                  )}

                  <div
                    className={`flex items-center pt-1 border-t border-white/[0.05] ${isRTL ? "justify-end" : "justify-start"}`}
                  >
                    <span className="text-[10px] text-white/20 font-medium tracking-widest uppercase select-none">
                      {isRTL ? "حُراس · منصة الأمن السيبراني" : "Horras · Cybersecurity Platform"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
