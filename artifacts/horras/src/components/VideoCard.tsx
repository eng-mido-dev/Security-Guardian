import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Youtube } from "lucide-react";
import { type ApiVideo } from "@/lib/api";

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}

function Thumbnail({ url, title }: { url: string; title: string }) {
  const [quality, setQuality] = useState<"hqdefault" | "mqdefault" | "error">("hqdefault");
  const id = extractYouTubeId(url);
  const src = id && quality !== "error" ? `https://i.ytimg.com/vi/${id}/${quality}.jpg` : null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "16/9" }}>
      {src ? (
        <img
          src={src}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => {
            if (quality === "hqdefault") setQuality("mqdefault");
            else setQuality("error");
          }}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-black/60">
          <Youtube className="w-10 h-10 text-white/10" />
        </div>
      )}

      {/* gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

      {/* Gold play button */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
          style={{
            background: "#FFB800",
            boxShadow: "0 0 32px rgba(255,184,0,0.45)",
          }}
        >
          <Play className="w-5 h-5 text-black ms-0.5" fill="currentColor" />
        </div>
      </div>
    </div>
  );
}

interface VideoCardProps {
  video: ApiVideo;
  isRTL: boolean;
  onClick: () => void;
  index?: number;
}

export default function VideoCard({ video, isRTL, onClick, index = 0 }: VideoCardProps) {
  const displayTitle = isRTL && video.titleAr ? video.titleAr : video.title;
  const displayDesc = isRTL && video.descriptionAr ? video.descriptionAr : video.description;

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      onClick={onClick}
      dir={isRTL ? "rtl" : "ltr"}
      className="group w-full text-start flex flex-col rounded-2xl overflow-hidden transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      whileHover={{ y: -4, transition: { duration: 0.22 } }}
    >
      {/* Thumbnail area with overlaid badges */}
      <div className="relative">
        <Thumbnail url={video.url} title={displayTitle} />

        {/* Category badge — top start */}
        {video.category && (
          <span
            className="absolute top-2.5 start-2.5 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm"
            style={{
              background: "rgba(255,184,0,0.18)",
              border: "1px solid rgba(255,184,0,0.35)",
              color: "#FFB800",
            }}
          >
            {video.category}
          </span>
        )}

        {/* Duration badge — bottom end */}
        {video.duration && (
          <span
            className="absolute bottom-2.5 end-2.5 z-10 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm"
            style={{
              background: "rgba(0,0,0,0.72)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            <Clock className="w-2.5 h-2.5 shrink-0" />
            {video.duration}
          </span>
        )}
      </div>

      {/* Info section */}
      <div className="flex flex-col flex-1 px-4 py-3 gap-1.5">
        <h3
          className="text-sm font-bold leading-snug line-clamp-2 text-white/90 group-hover:text-primary transition-colors duration-200"
          style={{ textAlign: isRTL ? "right" : "left" }}
        >
          {displayTitle}
        </h3>

        {displayDesc && (
          <p
            className="text-[11px] leading-relaxed line-clamp-2"
            style={{
              color: "rgba(255,255,255,0.38)",
              textAlign: isRTL ? "right" : "left",
            }}
          >
            {displayDesc}
          </p>
        )}
      </div>
    </motion.button>
  );
}
