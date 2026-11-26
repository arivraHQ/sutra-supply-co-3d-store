"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDrag } from "@use-gesture/react";
import {
  BRAND,
  formatINR,
  getColorHex,
  getColorName,
  PRODUCTS,
  RAIL_FILTERS,
  type Product,
  type RailFilter,
} from "@/content/site";
import { MOTION, type TeeColorId } from "@/tokens/theme";
import { CanvasErrorBoundary } from "./three/CanvasErrorBoundary";
import { RailFallback2D } from "./RailFallback2D";
import { shouldUse2DFallback } from "@/utils/device";

const RailScene = dynamic(
  () => import("./three/RailScene").then((m) => m.RailScene),
  { ssr: false },
);

function RailLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="border-[1.5px] border-[var(--ink)] bg-[var(--bg)] px-5 py-3">
        <p className="font-mono-label text-[var(--ink)]">
          HANGING 8 TEES ON THE RAIL...
        </p>
      </div>
    </div>
  );
}

export function HeroRail() {
  const router = useRouter();
  const [filter, setFilter] = useState<RailFilter>("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [colorOverrides, setColorOverrides] = useState<
    Record<string, TeeColorId>
  >({});
  const [useFallback2D, setUseFallback2D] = useState(false);
  const [hasCheckedDevice, setHasCheckedDevice] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pullingSlug, setPullingSlug] = useState<string | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const targetProgressRef = useRef(0);
  const isDraggingRef = useRef(false);
  const wheelLockRef = useRef(0);
  const dragStartProgressRef = useRef(0);

  const filteredProducts: Product[] = useMemo(() => {
    if (filter === "All") return PRODUCTS;
    if (filter === "Graphic") return PRODUCTS.filter((p) => p.isGraphic);
    return PRODUCTS.filter((p) => p.fit === filter);
  }, [filter]);

  const activeProduct =
    filteredProducts[activeIndex] ?? filteredProducts[0] ?? PRODUCTS[0];
  const activeColor =
    colorOverrides[activeProduct.id] ?? activeProduct.defaultColor;

  useEffect(() => {
    setUseFallback2D(shouldUse2DFallback());
    setHasCheckedDevice(true);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const stepTo = useCallback(
    (nextIdx: number) => {
      const clamped = Math.max(
        0,
        Math.min(filteredProducts.length - 1, nextIdx),
      );
      targetProgressRef.current = clamped;
      setActiveIndex(clamped);
    },
    [filteredProducts.length],
  );

  const openProduct = useCallback(
    (product: Product) => {
      if (pullingSlug) return;
      setPullingSlug(product.slug);
      setIsFadingOut(true);
      const delay = reducedMotion ? 160 : MOTION.pullForwardMs;
      window.setTimeout(() => {
        router.push(`/product/${product.slug}`);
      }, delay);
    },
    [pullingSlug, reducedMotion, router],
  );

  const handleSelectTee = useCallback(
    (index: number) => {
      if (index !== activeIndex) {
        stepTo(index);
      } else {
        openProduct(filteredProducts[index]);
      }
    },
    [activeIndex, filteredProducts, openProduct, stepTo],
  );

  const handleFilterChange = (next: RailFilter) => {
    setFilter(next);
    setActiveIndex(0);
    targetProgressRef.current = 0;
  };

  // Drag / swipe gesture on the rail surface
  const bindDrag = useDrag(
    ({ first, active, movement: [mx], velocity: [vx], direction: [dx], tap }) => {
      if (tap) return;
      if (first) {
        dragStartProgressRef.current = targetProgressRef.current;
      }
      isDraggingRef.current = active;
      const maxIdx = Math.max(0, filteredProducts.length - 1);
      const deltaItems = -mx / 160;
      if (active) {
        const nextP = Math.max(
          -0.25,
          Math.min(maxIdx + 0.25, dragStartProgressRef.current + deltaItems),
        );
        targetProgressRef.current = nextP;
        setActiveIndex(Math.max(0, Math.min(maxIdx, Math.round(nextP))));
      } else {
        // Inertia flick on fast swipe
        const flick = vx > 0.35 ? -dx * 0.65 : 0;
        const snapped = Math.max(
          0,
          Math.min(
            maxIdx,
            Math.round(dragStartProgressRef.current + deltaItems + flick),
          ),
        );
        targetProgressRef.current = snapped;
        setActiveIndex(snapped);
      }
    },
    {
      axis: "x",
      filterTaps: true,
      pointer: { touch: true },
    },
  );

  // Wheel horizontal or vertical-on-rail pull
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const dominant =
      Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(dominant) < 12) return;
    const now = performance.now();
    if (now - wheelLockRef.current < 240) return;
    wheelLockRef.current = now;
    if (dominant > 0 && activeIndex < filteredProducts.length - 1) {
      stepTo(activeIndex + 1);
    } else if (dominant < 0 && activeIndex > 0) {
      stepTo(activeIndex - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      stepTo(activeIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      stepTo(activeIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      openProduct(activeProduct);
    }
  };

  const counterStr = `${String(activeIndex + 1).padStart(2, "0")} / ${String(
    filteredProducts.length,
  ).padStart(2, "0")}`;

  return (
    <section
      id="rail"
      aria-label="Sutra clothing rail showcase"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative flex min-h-[calc(100svh-3.5rem)] w-full flex-col justify-between overflow-hidden border-b-[1.5px] border-[var(--ink)] bg-[var(--bg)] transition-opacity duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] focus-visible:outline-offset-[-4px] ${
        isFadingOut ? "opacity-25" : "opacity-100"
      }`}
    >
      {/* Top strip: brand eyebrow + filter chips above the rail */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2.5 w-2.5 bg-[var(--accent)]" aria-hidden="true" />
          <span className="font-mono-label text-[var(--ink)]">
            Kanpur Storefront Rail — 240–280 GSM
          </span>
        </div>

        <div
          role="group"
          aria-label="Filter tees on the rail"
          className="flex flex-wrap items-center gap-1.5"
        >
          {RAIL_FILTERS.map((chip) => {
            const active = filter === chip;
            return (
              <button
                key={chip}
                type="button"
                aria-pressed={active}
                onClick={() => handleFilterChange(chip)}
                className={`min-h-[36px] border-[1.5px] border-[var(--ink)] px-3 font-mono-label cursor-pointer transition-colors ${
                  active
                    ? "bg-[var(--ink)] text-[var(--bg)]"
                    : "bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--accent)]"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center stage: huge outlined hero word behind the 3D/2D clothes rail */}
      <div
        {...bindDrag()}
        onWheel={handleWheel}
        style={{ touchAction: "pan-y" }}
        className="relative flex-1 min-h-[420px] sm:min-h-[500px] w-full select-none"
      >
        {/* Outlined display word behind the rail (140-200px desktop / 72px mobile) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <span className="hero-word-outline text-[72px] sm:text-[132px] lg:text-[184px] tracking-tighter">
            {BRAND.heroWord}
          </span>
        </div>

        {/* 3D Canvas (progressive enhancement) or 2D low-end fallback */}
        <div className="absolute inset-0 z-10">
          {!hasCheckedDevice ? (
            <RailLoader />
          ) : useFallback2D ? (
            <RailFallback2D
              products={filteredProducts}
              activeIndex={activeIndex}
              activeColorOverrides={colorOverrides}
              pullingSlug={pullingSlug}
              onSelectTee={handleSelectTee}
            />
          ) : (
            <CanvasErrorBoundary
              onError={() => setUseFallback2D(true)}
              fallback={
                <RailFallback2D
                  products={filteredProducts}
                  activeIndex={activeIndex}
                  activeColorOverrides={colorOverrides}
                  pullingSlug={pullingSlug}
                  onSelectTee={handleSelectTee}
                />
              }
            >
              <Suspense fallback={<RailLoader />}>
                <RailScene
                  products={filteredProducts}
                  targetProgressRef={targetProgressRef}
                  isDraggingRef={isDraggingRef}
                  activeColorOverrides={colorOverrides}
                  activeIndex={activeIndex}
                  pullingSlug={pullingSlug}
                  reducedMotion={reducedMotion}
                  onActiveIndexChange={setActiveIndex}
                  onSelectTee={handleSelectTee}
                />
              </Suspense>
            </CanvasErrorBoundary>
          )}
        </div>
      </div>

      {/* Live region announcing active product on the rail */}
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {`${activeProduct.name}, ${formatINR(activeProduct.price)}, ${activeProduct.fit} fit, color ${getColorName(activeColor)}, item ${activeIndex + 1} of ${filteredProducts.length}`}
      </div>

      {/* Bottom overlays: left active product specs, right prev/next controls */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1440px] flex-col gap-4 border-t-[1.5px] border-[var(--ink)] bg-[var(--bg)]/90 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
        {/* Left bottom: Active product details + 4 color dots + counter + View in 3D */}
        <div className="flex flex-col gap-2.5 sm:max-w-lg">
          <div className="flex items-center gap-3">
            <span className="border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-2 py-0.5 font-mono-label text-[var(--bg)]">
              {counterStr}
            </span>
            <span className="font-mono-label text-[var(--ink)]/80">
              {activeProduct.shortSpec}
            </span>
          </div>

          <div className="overflow-hidden">
            <h1 key={activeProduct.id} className="reveal-line font-display text-[32px] sm:text-[42px] text-[var(--ink)]">
              {activeProduct.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono-label text-base font-medium text-[var(--ink)]">
              {formatINR(activeProduct.price)}
            </span>

            {/* 4 color dots */}
            <div
              role="group"
              aria-label={`Preview color for ${activeProduct.name}`}
              className="flex items-center gap-2"
            >
              {activeProduct.colors.slice(0, 4).map((colorId) => {
                const selected = activeColor === colorId;
                return (
                  <button
                    key={colorId}
                    type="button"
                    aria-label={getColorName(colorId)}
                    aria-pressed={selected}
                    onClick={() =>
                      setColorOverrides((prev) => ({
                        ...prev,
                        [activeProduct.id]: colorId,
                      }))
                    }
                    style={{ backgroundColor: getColorHex(colorId) }}
                    className={`h-6 w-6 cursor-pointer border-[1.5px] border-[var(--ink)] transition-transform ${
                      selected
                        ? "scale-110 ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]"
                        : "hover:scale-105"
                    }`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => openProduct(activeProduct)}
              className="btn-ink"
            >
              View in 3D
            </button>
          </div>
        </div>

        {/* Right bottom: Prev/next arrows + drag/scroll hint */}
        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <p className="font-mono-label text-[11px] text-[var(--ink)]/75">
            Scroll or drag to pull the next one
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => stepTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous tee on rail"
              className="btn-outline min-w-[48px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => stepTo(activeIndex + 1)}
              disabled={activeIndex === filteredProducts.length - 1}
              aria-label="Next tee on rail"
              className="btn-outline min-w-[48px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Server-rendered real HTML directory for SEO & keyboard/SR progressive enhancement */}
      <noscript>
        <ul className="grid gap-4 p-6">
          {PRODUCTS.map((p) => (
            <li key={p.id}>
              <Link href={`/product/${p.slug}`}>
                {p.name} — {formatINR(p.price)} — {p.description}
              </Link>
            </li>
          ))}
        </ul>
      </noscript>
    </section>
  );
}
