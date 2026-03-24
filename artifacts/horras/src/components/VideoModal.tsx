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

  const displayTitle       = isRTL && titleAr       ? titleAr       : title;
  const displayDescription = isRTL && descriptionAr ? descriptionAr : description;
  const textAlign = isRTL ? "right" : "left";
  const dir       = isRTL ? "rtl"   : "ltr";

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
          {/* ═══════════════════════════════════════════════════════════
              BACKDROP — z-index 10000
              ▸ position:fixed + inset:0 → covers EVERY pixel including
                the sticky Header (z-50 / z-100) and any dropdown.
              ▸ pointerEvents:all makes sure the header is completely
                non-interactive while the modal is open.
              ▸ backdrop-blur(20px) + rgba(0,0,0,0.88) → strong dim.
          ═══════════════════════════════════════════════════════════ */}
          <motion.div
            key="vm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              background: "rgba(0,0,0,0.88)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              pointerEvents: "all",
            }}
          />

          {/* ═══════════════════════════════════════════════════════════
              SCROLL SHELL — z-index 10001
              outer div  → scrollable when card is taller than viewport
              inner div  → flex-center when card fits the viewport
              Generous top padding keeps close button well clear of
              the mobile status bar / notch.
          ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10001,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100%",
                /* clamp ensures ≥ 40px top space so the close button
                   never dips into the browser status bar on mobile */
                padding: "clamp(2.5rem, 6vw, 4rem) clamp(1rem, 4vw, 2rem)",
                boxSizing: "border-box",
              }}
            >
              {/* ─── MODAL CARD WRAPPER ─────────────────────────────── */}
              <motion.div
                key="vm-card"
                initial={{ opacity: 0, y: 32, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 32, scale: 0.94 }}
                transition={{ type: "spring", damping: 26, stiffness: 300, mass: 0.85 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "relative",
                  /* 95 vw on mobile, 900px max on desktop */
                  width: "min(95vw, 900px)",
                  flex: "0 0 auto",
                }}
              >
                {/* ─── CARD ─────────────────────────────────────────────
                    rounded-3xl (24px), max 90 vh.
                    • Video wrapper: flex-shrink 0, strict 16:9
                    • Info panel:   flex 1, min-h 0, scrolls internally
                ─────────────────────────────────────────────────────── */}
                <div
                  style={{
                    borderRadius: "24px",           /* rounded-3xl */
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "calc(90vh - 3rem)",
                    boxShadow:
                      "0 40px 100px rgba(0,0,0,0.96), 0 0 0 1px rgba(255,255,255,0.07)",
                    background: "#0b0b0e",
                  }}
                >
                  {/* Gold shimmer line */}
                  <div
                    aria-hidden="true"
                    style={{
                      height: "2px",
                      flexShrink: 0,
                      background:
                        "linear-gradient(90deg,transparent 0%,#FFB800 50%,transparent 100%)",
                      opacity: 0.55,
                    }}
                  />

                  {/* ── VIDEO PLAYER — strict 16:9, never shrinks ── */}
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
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.09)",
                          }}
                        >
                          <span style={{ fontSize: "26px", color: "rgba(255,255,255,0.18)" }}>▶</span>
                        </div>
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.22)", fontWeight: 500 }}>
                          {isRTL ? "الفيديو غير متاح" : "Video unavailable"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── INFO PANEL ────────────────────────────────────────
                      flex 1 + min-h 0 + overflow-y auto → scrollable
                      when description is very long.
                  ──────────────────────────────────────────────────────── */}
                  <div
                    dir={dir}
                    style={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: "auto",
                      padding: "20px 24px 24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0",
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(255,184,0,0.3) transparent",
                      position: "relative",
                    }}
                  >
                    {/* ── ROW 1: Badges + Close button ── */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: "16px",
                      }}
                    >
                      {/* Badges pushed to start, close to end */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", flex: 1, alignItems: "center" }}>
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

                      {/* ─── CLOSE BUTTON ────────────────────────────────
                          44×44px — meets touch target minimum.
                          Placed inside the info panel so it is NEVER
                          clipped by the card's overflow:hidden and NEVER
                          lands in the browser's status-bar safe zone.
                      ──────────────────────────────────────────────────── */}
                      <button
                        onClick={onClose}
                        aria-label={isRTL ? "إغلاق الفيديو" : "Close video"}
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          background: "rgba(255,255,255,0.06)",
                          border: "1.5px solid rgba(255,255,255,0.12)",
                          color: "rgba(255,255,255,0.7)",
                          cursor: "pointer",
                          transition:
                            "background 0.15s, color 0.15s, border-color 0.15s, transform 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          const b = e.currentTarget;
                          b.style.background = "#FFB800";
                          b.style.color = "#000";
                          b.style.borderColor = "#FFB800";
                          b.style.transform = "scale(1.08)";
                        }}
                        onMouseLeave={(e) => {
                          const b = e.currentTarget;
                          b.style.background = "rgba(255,255,255,0.06)";
                          b.style.color = "rgba(255,255,255,0.7)";
                          b.style.borderColor = "rgba(255,255,255,0.12)";
                          b.style.transform = "scale(1)";
                        }}
                      >
                        <X style={{ width: "18px", height: "18px", strokeWidth: 2.5 }} />
                      </button>
                    </div>

                    {/* ── Title — text-2xl (24px), primary gold ── */}
                    <h3
                      style={{
                        margin: "0 0 12px",
                        fontSize: "clamp(18px, 2.4vw, 24px)",
                        fontWeight: 800,
                        color: "#FFB800",
                        lineHeight: 1.28,
                        textAlign,
                        letterSpacing: isRTL ? "0" : "-0.015em",
                      }}
                    >
                      {displayTitle}
                    </h3>

                    {/* ── Separator — subtle gold tint ── */}
                    {displayDescription && (
                      <div
                        aria-hidden="true"
                        style={{
                          height: "1px",
                          marginBottom: "14px",
                          background:
                            "linear-gradient(90deg,rgba(255,184,0,0.18) 0%,rgba(255,184,0,0.06) 60%,transparent 100%)",
                          flexShrink: 0,
                        }}
                      />
                    )}

                    {/* ── Description — leading-relaxed, readable ── */}
                    {displayDescription && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          lineHeight: 1.85,   /* leading-relaxed */
                          color: "rgba(255,255,255,0.6)",
                          textAlign,
                        }}
                      >
                        {displayDescription}
                      </p>
                    )}

                    {/* Footer brand */}
                    <div
                      style={{
                        paddingTop: "14px",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        display: "flex",
                        justifyContent: isRTL ? "flex-end" : "flex-start",
                        marginTop: "auto",
                        paddingBottom: "2px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 600,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.12)",
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
