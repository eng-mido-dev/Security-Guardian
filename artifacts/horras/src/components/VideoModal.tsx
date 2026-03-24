import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Shield } from "lucide-react";
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
  const textAlign = isRTL ? "right" : "left";

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKey]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="vm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/82 backdrop-blur-2xl"
            style={{ zIndex: 9998 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal container — centers content, pointer-events passthrough */}
          <div
            className="fixed inset-0 flex items-center justify-center p-4 sm:p-8"
            style={{ zIndex: 9999 }}
          >
            <motion.div
              key="vm-card"
              initial={{ opacity: 0, y: 28, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.95 }}
              transition={{ type: "spring", damping: 32, stiffness: 360, mass: 0.7 }}
              className="relative w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Card */}
              <div className="rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.9)]"
                style={{
                  background: "rgba(11,11,14,0.98)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* Gold shimmer at top */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,184,0,0.5) 50%, transparent 100%)" }}
                />

                {/* Close button — always top-right visually */}
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-3 right-3 z-20 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
                  }}
                >
                  <X className="w-4 h-4" />
                </button>

                {/* ── Video Player ── */}
                <div
                  className="relative w-full bg-black"
                  style={{ aspectRatio: "16 / 9" }}
                >
                  {videoId ? (
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white&iv_load_policy=3`}
                      title={displayTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080808]">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <span className="text-2xl text-white/20">▶</span>
                      </div>
                      <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.2)" }}>
                        {isRTL ? "الفيديو غير متاح" : "Video unavailable"}
                      </p>
                    </div>
                  )}
                </div>

                {/* ── Info Panel ── */}
                <div
                  className="px-5 py-4 space-y-3"
                  dir={isRTL ? "rtl" : "ltr"}
                  style={{ background: "rgba(255,255,255,0.015)" }}
                >
                  {/* Badges row */}
                  <div className="flex items-center flex-wrap gap-2">
                    {category && (
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
                        style={{
                          color: "#FFB800",
                          background: "rgba(255,184,0,0.1)",
                          border: "1px solid rgba(255,184,0,0.2)",
                        }}
                      >
                        <Shield className="w-2.5 h-2.5 shrink-0" />
                        {category}
                      </span>
                    )}
                    {duration && (
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-lg"
                        style={{
                          color: "rgba(255,255,255,0.45)",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <Clock className="w-2.5 h-2.5 shrink-0" />
                        {duration}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className="text-[15px] font-bold text-white leading-snug"
                    style={{ textAlign }}
                  >
                    {displayTitle}
                  </h3>

                  {/* Description */}
                  {displayDescription && (
                    <p
                      className="text-[13px] leading-relaxed"
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        textAlign,
                        lineHeight: "1.75",
                      }}
                    >
                      {displayDescription}
                    </p>
                  )}

                  {/* Footer rule */}
                  <div
                    className="pt-2 border-t flex items-center"
                    style={{
                      borderColor: "rgba(255,255,255,0.05)",
                      justifyContent: isRTL ? "flex-end" : "flex-start",
                    }}
                  >
                    <span
                      className="text-[10px] font-medium tracking-widest uppercase select-none"
                      style={{ color: "rgba(255,255,255,0.15)" }}
                    >
                      {isRTL ? "حُراس · منصة الأمن السيبراني" : "Horras · Cybersecurity Platform"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
