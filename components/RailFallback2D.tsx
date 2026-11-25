"use client";

import { getColorHex, type Product } from "@/content/site";
import type { TeeColorId } from "@/tokens/theme";

interface RailFallback2DProps {
  products: Product[];
  activeIndex: number;
  activeColorOverrides: Record<string, TeeColorId>;
  pullingSlug: string | null;
  onSelectTee: (index: number) => void;
}

export function RailFallback2D({
  products,
  activeIndex,
  activeColorOverrides,
  pullingSlug,
  onSelectTee,
}: RailFallback2DProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Steel rod line across the wall */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-[20%] h-[5px] bg-[var(--rod)] border-y border-[var(--ink)]/30"
      />
      <div
        aria-hidden="true"
        className="absolute left-[14%] top-0 h-[20%] w-[3px] bg-[var(--rod)]"
      />
      <div
        aria-hidden="true"
        className="absolute right-[14%] top-0 h-[20%] w-[3px] bg-[var(--rod)]"
      />

      <div className="relative h-[360px] w-full max-w-[1200px]">
        {products.map((product, i) => {
          const d = i - activeIndex;
          const absD = Math.abs(d);
          const sign = d === 0 ? 0 : Math.sign(d);

          let xRem = 0;
          if (absD <= 1) {
            xRem = sign * 12;
          } else if (d > 1) {
            xRem = 12 + (d - 1) * 3.4;
          } else {
            xRem = -12 - (absD - 1) * 3.4;
          }

          const rotY = absD === 0 ? 0 : -sign * 72;
          const scale = absD === 0 ? 1 : 0.92;
          const leftFade =
            d < -1 ? Math.max(0.08, 1 - (-d - 1) * 0.45) : 1;
          const isPulling = pullingSlug === product.slug;
          const colorId =
            activeColorOverrides[product.id] ?? product.defaultColor;
          const hex = getColorHex(colorId);

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelectTee(i)}
              aria-label={`${product.name}, ${d === 0 ? "open 3D view" : "bring to front"}`}
              style={{
                transform: `translate(-50%, -50%) translateX(${xRem}rem) perspective(900px) rotateY(${rotY}deg) scale(${isPulling ? 1.15 : scale})`,
                opacity: leftFade,
                zIndex: 30 - absD,
              }}
              className="absolute left-1/2 top-[54%] cursor-pointer bg-transparent p-0 border-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
            >
              {/* Wooden hanger SVG + physical tee silhouette */}
              <div className="flex flex-col items-center">
                <svg
                  width="96"
                  height="38"
                  viewBox="0 0 96 38"
                  aria-hidden="true"
                  className="-mb-3"
                >
                  <path
                    d="M48 16 L48 8 C48 4 53 2 55 6"
                    fill="none"
                    stroke="var(--rod)"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M48 16 L10 34 L14 37 L48 22 L82 37 L86 34 Z"
                    fill="var(--hanger)"
                    stroke="var(--ink)"
                    strokeWidth="1.2"
                  />
                </svg>
                <svg
                  width={product.fit === "Oversized" ? 216 : 196}
                  height="236"
                  viewBox="0 0 220 240"
                  aria-hidden="true"
                >
                  <path
                    d={
                      product.fit === "Oversized"
                        ? "M78 16 Q110 38 142 16 L176 28 L214 78 L184 96 L168 72 L168 226 L52 226 L52 72 L36 96 L6 78 L44 28 Z"
                        : "M82 16 Q110 36 138 16 L168 26 L202 70 L176 86 L162 66 L162 224 L58 224 L58 66 L44 86 L18 70 L52 26 Z"
                    }
                    fill={hex}
                    stroke="#151515"
                    strokeWidth="2"
                  />
                  {product.hasPocket && (
                    <rect
                      x="128"
                      y="72"
                      width="24"
                      height="28"
                      fill={hex}
                      stroke="#151515"
                      strokeOpacity="0.45"
                      strokeWidth="1.5"
                    />
                  )}
                  {product.isGraphic && (
                    <rect
                      x="78"
                      y="74"
                      width="64"
                      height="44"
                      fill="none"
                      stroke="#FF4B1F"
                      strokeWidth="2.5"
                    />
                  )}
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
