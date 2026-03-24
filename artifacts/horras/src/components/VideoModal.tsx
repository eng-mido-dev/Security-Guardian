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
          {/* ─────────────────────────────────────────────────────────
              BACKDROP — z-index 99998
              Covers ALL layers including sticky navbar (z-50) and
              any dropdowns (z-100).  backdrop-blur gives the frosted
              glass effect over the entire page.
          ───────────────────────────────────────────────────────── */}
          <motion.div
            key="vm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99998,
              background: "rgba(0,0,0,0.88)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          />

          {/* ─────────────────────────────────────────────────────────
              SCROLL SHELL — z-index 99999
              outer div: scrolls when card is taller than viewport
              inner div: flex centering (works when card fits viewport)
          ───────────────────────────────────────────────────────── */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {/* centering wrapper — min-height: 100% lets flex-center work */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100%",
                padding: "clamp(1.25rem, 5vw, 3rem)",
                boxSizing: "border-box",
              }}
            >
              <motion.div
                key="vm-card"
                initial={{ opacity: 0, y: 28, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 28, scale: 0.95 }}
                transition={{ type: "spring", damping: 28, stiffness: 320, mass: 0.8 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "relative",
                  /* 95vw on mobile → up to 800px on desktop */
                  width: "min(95vw, 800px)",
                  flex: "0 0 auto",
                }}
              >
                {/* ─── CLOSE BUTTON ───────────────────────────────────
                    Sits OUTSIDE the overflow-hidden card so it is never
                    clipped.  Large enough (44×44) to tap on mobile.
                ─────────────────────────────────────────────────────── */}
                <button
                  onClick={onClose}
                  aria-label={isRTL ? "إغلاق الفيديو" : "Close video"}
                  style={{
                    position: "absolute",
                    top: "-14px",
                    right: "-14px",
                    zIndex: 10,
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0d0d10",
                    border: "2px solid rgba(255,255,255,0.14)",
                    color: "rgba(255,255,255,0.75)",
                    cursor: "pointer",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.7)",
                    transition: "background 0.15s, color 0.15s, border-color 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    const b = e.currentTarget;
                    b.style.background = "#FFB800";
                    b.style.color = "#000";
                    b.style.borderColor = "#FFB800";
                    b.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    const b = e.currentTarget;
                    b.style.background = "#0d0d10";
                    b.style.color = "rgba(255,255,255,0.75)";
                    b.style.borderColor = "rgba(255,255,255,0.14)";
                    b.style.transform = "scale(1)";
                  }}
                >
                  <X style={{ width: "18px", height: "18px", strokeWidth: 2.5 }} />
                </button>

                {/* ─── CARD ───────────────────────────────────────────
                    flex-column, max 90vh.
                    • Video section: flex-shrink 0, strict 16:9
                    • Info section:  flex 1, min-h 0, scrollable
                ─────────────────────────────────────────────────────── */}
                <div
                  style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "calc(90vh - 2.5rem)",
                    boxShadow:
                      "0 32px 80px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.06)",
                    background: "#0b0b0e",
                  }}
                >
                  {/* Gold accent line */}
                  <div
                    aria-hidden="true"
                    style={{
                      height: "2px",
                      flexShrink: 0,
                      background:
                        "linear-gradient(90deg, transparent 0%, #FFB800 50%, transparent 100%)",
                      opacity: 0.5,
                    }}
                  />

                  {/* ── VIDEO — strict 16:9, never shrinks ── */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      flexShrink: 0,
                      aspectRatio: "16 / 9",
                      background: "#000",
                    }}
                  >
                    {videoId ? (
                      <iframe
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          border: "none",
                          display: "block",
                        }}
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
                          gap: "14px",
                          background: "#080808",
                        }}
                      >
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.09)",
                          }}
                        >
                          <span style={{ fontSize: "24px", color: "rgba(255,255,255,0.18)" }}>▶</span>
                        </div>
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.22)", fontWeight: 500 }}>
                          {isRTL ? "الفيديو غير متاح" : "Video unavailable"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── INFO PANEL — p-6, scrollable when content is long ── */}
                  <div
                    dir={dir}
                    style={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: "auto",
                      padding: "24px",          /* p-6 */
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(255,184,0,0.3) transparent",
                    }}
                  >
                    {/* Badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                      {category && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            padding: "4px 11px",
                            borderRadius: "8px",
                            color: "#FFB800",
                            background: "rgba(255,184,0,0.1)",
                            border: "1px solid rgba(255,184,0,0.25)",
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
                            padding: "4px 11px",
                            borderRadius: "8px",
                            color: "rgba(255,255,255,0.5)",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.09)",
                          }}
                        >
                          <Clock style={{ width: "10px", height: "10px", flexShrink: 0 }} />
                          {duration}
                        </span>
                      )}
                    </div>

                    {/* Title — bold, primary white, larger */}
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: 800,
                        color: "#ffffff",
                        lineHeight: 1.3,
                        textAlign,
                        letterSpacing: isRTL ? "0" : "-0.01em",
                      }}
                    >
                      {displayTitle}
                    </h3>

                    {/* Description — muted, scrolls inside the panel */}
                    {displayDescription && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          lineHeight: 1.8,
                          color: "rgba(255,255,255,0.5)",
                          textAlign,
                        }}
                      >
                        {displayDescription}
                      </p>
                    )}

                    {/* Footer brand line */}
                    <div
                      style={{
                        paddingTop: "12px",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        display: "flex",
                        justifyContent: isRTL ? "flex-end" : "flex-start",
                        marginTop: "auto",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 600,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.13)",
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
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
