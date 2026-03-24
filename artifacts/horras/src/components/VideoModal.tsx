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
  const dir = isRTL ? "rtl" : "ltr";

  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

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
          {/*
           * BACKDROP — z-index 99998
           * Covers the ENTIRE screen including sticky navbar (z-50) and all dropdowns (z-100).
           * backdrop-blur creates the frosted glass effect over everything.
           */}
          <motion.div
            key="vm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99998,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          />

          {/*
           * SCROLL CONTAINER — z-index 99999
           * overflow-y: auto lets the card scroll vertically when the viewport is short.
           * min-h-full + flex + items-center keeps it vertically centered when there's room.
           * The click-outside handler is on the backdrop above, so this is pointer-events-none
           * except for the card itself.
           */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              overflowY: "auto",
              overflowX: "hidden",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              padding: "clamp(1rem, 4vw, 3rem)",
              boxSizing: "border-box",
            }}
          >
            <motion.div
              key="vm-card"
              initial={{ opacity: 0, y: 32, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.94 }}
              transition={{ type: "spring", damping: 30, stiffness: 340, mass: 0.75 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "min(90vw, 680px)",
                margin: "auto",
              }}
            >
              {/*
               * CLOSE BUTTON — floats OUTSIDE the overflow-hidden card
               * Positioned relative to the motion.div wrapper, so it's never clipped.
               * On mobile this lands at the very top-right corner of the card.
               */}
              <button
                onClick={onClose}
                aria-label="Close video"
                style={{
                  position: "absolute",
                  top: "-12px",
                  right: "-12px",
                  zIndex: 10,
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(20,20,24,0.96)",
                  border: "1.5px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                  transition: "background 0.15s, color 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget;
                  b.style.background = "rgba(255,184,0,0.15)";
                  b.style.color = "#FFB800";
                  b.style.transform = "scale(1.08)";
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget;
                  b.style.background = "rgba(20,20,24,0.96)";
                  b.style.color = "rgba(255,255,255,0.7)";
                  b.style.transform = "scale(1)";
                }}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>

              {/*
               * CARD — flex column, max-h = 90% of viewport.
               * Video (flex-shrink: 0) keeps its 16:9 ratio.
               * Info panel (flex: 1, min-h: 0, overflow-y: auto) scrolls when content is tall.
               */}
              <div
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "calc(90vh - 2rem)",
                  boxShadow: "0 48px 120px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.07)",
                  background: "rgba(10,10,13,0.99)",
                }}
              >
                {/* Gold shimmer line at very top */}
                <div
                  aria-hidden="true"
                  style={{
                    height: "1px",
                    flexShrink: 0,
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,184,0,0.55) 50%, transparent 100%)",
                  }}
                />

                {/* ── VIDEO PLAYER — fixed 16:9, never shrinks ── */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    flexShrink: 0,
                    aspectRatio: "16 / 9",
                    background: "#000",
                    overflow: "hidden",
                  }}
                >
                  {videoId ? (
                    <iframe
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white&iv_load_policy=3`}
                      title={displayTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        background: "#080808",
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <span style={{ fontSize: "22px", color: "rgba(255,255,255,0.2)" }}>▶</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>
                        {isRTL ? "الفيديو غير متاح" : "Video unavailable"}
                      </p>
                    </div>
                  )}
                </div>

                {/* ── INFO PANEL — scrolls when description is long ── */}
                <div
                  dir={dir}
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    padding: "16px 20px 20px",
                    background: "rgba(255,255,255,0.014)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255,184,0,0.25) transparent",
                  }}
                >
                  {/* Badges row */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    {category && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          color: "#FFB800",
                          background: "rgba(255,184,0,0.1)",
                          border: "1px solid rgba(255,184,0,0.22)",
                        }}
                      >
                        <Shield style={{ width: "10px", height: "10px", flexShrink: 0 }} />
                        {category}
                      </span>
                    )}
                    {duration && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "10px",
                          fontWeight: 500,
                          padding: "4px 10px",
                          borderRadius: "8px",
                          color: "rgba(255,255,255,0.45)",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <Clock style={{ width: "10px", height: "10px", flexShrink: 0 }} />
                        {duration}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1.35,
                      textAlign,
                    }}
                  >
                    {displayTitle}
                  </h3>

                  {/* Description — visible even when long, panel scrolls */}
                  {displayDescription && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        lineHeight: 1.75,
                        color: "rgba(255,255,255,0.52)",
                        textAlign,
                      }}
                    >
                      {displayDescription}
                    </p>
                  )}

                  {/* Footer */}
                  <div
                    style={{
                      paddingTop: "10px",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      display: "flex",
                      justifyContent: isRTL ? "flex-end" : "flex-start",
                      marginTop: "auto",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 500,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.14)",
                        userSelect: "none",
                      }}
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
