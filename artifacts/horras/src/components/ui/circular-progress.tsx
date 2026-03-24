import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  className?: string;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
  colorClass = "text-primary",
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle className="text-white/5" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <circle className={cn("transition-all duration-1000 ease-out", colorClass)} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-3xl font-bold tracking-tighter">{Math.round(value)}%</span>
      </div>
    </div>
  );
}

/* ─── Half-Circle Security Gauge ─── */
interface HalfCircleGaugeProps {
  value: number;
  labelAr?: string;
  labelEn?: string;
  isRTL?: boolean;
}

export function HalfCircleGauge({ value, labelAr, labelEn, isRTL = true }: HalfCircleGaugeProps) {
  const r = 80;
  const cx = 100;
  const cy = 106;
  const totalLen = Math.PI * r;
  const target = Math.min(100, Math.max(0, value));

  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setAnimated(Math.round(ease * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  const safeValue = animated;
  const progressLen = (target / 100) * totalLen;

  const color =
    safeValue >= 80 ? "#34d399"
    : safeValue >= 50 ? "#FFB800"
    : "#f87171";

  const levelLabel =
    safeValue >= 80
      ? isRTL ? "خبير" : "Expert"
      : safeValue >= 50
      ? isRTL ? "متوسط" : "Intermediate"
      : isRTL ? "في خطر" : "At Risk";

  const levelColor =
    safeValue >= 80 ? "text-emerald-400"
    : safeValue >= 50 ? "text-amber-400"
    : "text-red-400";

  // Tick marks at 0%, 25%, 50%, 75%, 100% of the arc
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((pct) => {
    const angle = Math.PI * pct; // 0 = left, π = right
    const outerR = r + 14;
    const innerR = r + 6;
    const startX = cx - Math.cos(angle) * innerR;
    const startY = cy - Math.sin(angle) * innerR;
    const endX = cx - Math.cos(angle) * outerR;
    const endY = cy - Math.sin(angle) * outerR;
    return { startX, startY, endX, endY };
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-52">
        <svg viewBox="0 0 200 120" className="w-full overflow-visible">
          {/* Glow effect */}
          <defs>
            <filter id="gauge-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track background */}
          <path
            d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <path
            d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${progressLen} ${totalLen}`}
            filter="url(#gauge-glow)"
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />

          {/* Tick marks */}
          {ticks.map((tick, i) => (
            <line
              key={i}
              x1={tick.startX}
              y1={tick.startY}
              x2={tick.endX}
              y2={tick.endY}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}

          {/* Score number */}
          <text
            x="100"
            y={cy - 10}
            textAnchor="middle"
            fontSize="38"
            fontWeight="900"
            fill="white"
            fontFamily="inherit"
          >
            {safeValue}
          </text>
          <text
            x="100"
            y={cy + 8}
            textAnchor="middle"
            fontSize="11"
            fill="rgba(255,255,255,0.35)"
            fontFamily="inherit"
          >
            / 100
          </text>

          {/* Scale labels */}
          <text x={cx - r - 4} y={cy + 18} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="inherit">0</text>
          <text x={cx + r + 4} y={cy + 18} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="inherit">100</text>
        </svg>
      </div>

      {/* Level badge */}
      <div className="flex flex-col items-center gap-1 -mt-2">
        <span className={`text-base font-black ${levelColor}`}>{levelLabel}</span>
        {(labelAr || labelEn) && (
          <span className="text-xs text-muted-foreground">{isRTL ? labelAr : labelEn}</span>
        )}
      </div>
    </div>
  );
}
