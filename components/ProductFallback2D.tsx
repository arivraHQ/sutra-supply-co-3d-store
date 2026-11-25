"use client";

import { useState } from "react";
import type { TeeFit } from "@/content/site";
import type { PrintPlacement } from "@/store/cart";

interface ProductFallback2DProps {
  colorHex: string;
  fit: TeeFit;
  hasPocket?: boolean;
  customMode: "none" | "text" | "image";
  customText: string;
  textColor: string;
  textSize: number;
  placement: PrintPlacement;
  offsetX: number;
  offsetY: number;
  scale: number;
  rotationDeg: number;
}

export function ProductFallback2D({
  colorHex,
  fit,
  hasPocket,
  customMode,
  customText,
  textColor,
  textSize,
  placement,
  offsetX,
  offsetY,
  scale,
  rotationDeg,
}: ProductFallback2DProps) {
  const [view, setView] = useState<"front" | "back">(
    placement === "back" ? "back" : "front",
  );
  const isBackView = view === "back";
  const isBackPrint = placement === "back";

  const showText =
    customMode === "text" &&
    customText.trim().length > 0 &&
    isBackPrint === isBackView;

  const anchorX = placement === "left-chest" ? 136 : 110;
  const anchorY = placement === "left-chest" ? 84 : 96;

  return (
    <div className="flex h-full w-full flex-col justify-between p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono-label text-[11px] text-[var(--ink)]/75">
          2D STUDIO PREVIEW (TEXT + COLOR)
        </span>
        <div className="flex border-[1.5px] border-[var(--ink)]">
          {(["front", "back"] as const).map((side) => (
            <button
              key={side}
              type="button"
              onClick={() => setView(side)}
              aria-pressed={view === side}
              className={`min-h-[34px] px-3 font-mono-label text-[11px] cursor-pointer ${
                view === side
                  ? "bg-[var(--ink)] text-[var(--bg)]"
                  : "bg-[var(--bg)] text-[var(--ink)]"
              }`}
            >
              {side}
            </button>
          ))}
        </div>
      </div>

      <div className="my-auto flex items-center justify-center py-6">
        <svg
          width="320"
          height="340"
          viewBox="0 0 220 240"
          role="img"
          aria-label={`Static ${view} tee preview`}
        >
          <path
            d={
              fit === "Oversized"
                ? `M78 ${isBackView ? 14 : 16} Q110 ${isBackView ? 22 : 38} 142 ${isBackView ? 14 : 16} L176 28 L214 78 L184 96 L168 72 L168 226 L52 226 L52 72 L36 96 L6 78 L44 28 Z`
                : `M82 ${isBackView ? 14 : 16} Q110 ${isBackView ? 22 : 36} 138 ${isBackView ? 14 : 16} L168 26 L202 70 L176 86 L162 66 L162 224 L58 224 L58 66 L44 86 L18 70 L52 26 Z`
            }
            fill={colorHex}
            stroke="#151515"
            strokeWidth="2"
          />
          {!isBackView && hasPocket && (
            <rect
              x="128"
              y="72"
              width="24"
              height="28"
              fill={colorHex}
              stroke="#151515"
              strokeOpacity="0.45"
              strokeWidth="1.5"
            />
          )}
          {showText && (
            <text
              x={anchorX + offsetX * 90}
              y={anchorY - offsetY * 90}
              textAnchor="middle"
              fill={textColor}
              fontSize={Math.max(8, Math.round(textSize * 0.25 * scale))}
              fontWeight="800"
              transform={`rotate(${rotationDeg} ${anchorX + offsetX * 90} ${anchorY - offsetY * 90})`}
            >
              {customText}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}
