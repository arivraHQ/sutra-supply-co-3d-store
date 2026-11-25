"use client";

import * as THREE from "three";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BRAND,
  formatINR,
  getColorHex,
  getColorName,
  PRINT_PRICING,
  PRODUCTS,
  SIZE_GUIDE,
  SIZES,
  type Product,
  type TeeSize,
} from "@/content/site";
import { TEE_PALETTE, type TeeColorId } from "@/tokens/theme";
import {
  useCartStore,
  type CustomPrintSpec,
  type PrintPlacement,
} from "@/store/cart";
import { CanvasErrorBoundary } from "./three/CanvasErrorBoundary";
import type {
  CameraPreset,
  ProductSceneHandle,
} from "./three/ProductScene";
import { ProductFallback2D } from "./ProductFallback2D";

const ProductScene = dynamic(
  () => import("./three/ProductScene").then((m) => m.ProductScene),
  { ssr: false },
);

const PRINT_FONTS = [
  { id: "archivo", label: "Archivo Bold", css: "Archivo, sans-serif" },
  { id: "mono", label: "DM Mono", css: "'DM Mono', monospace" },
  { id: "onest", label: "Onest Sans", css: "Onest, sans-serif" },
  { id: "serif", label: "Editorial Serif", css: "Georgia, serif" },
] as const;

function detectLowEnd(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  const mem =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (cores <= 4 || mem <= 4) return true;
  try {
    const c = document.createElement("canvas");
    return !(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return true;
  }
}

function resolveCanvasFont(fontId: (typeof PRINT_FONTS)[number]["id"]): string {
  if (typeof window === "undefined") return "sans-serif";
  const styles = getComputedStyle(document.documentElement);
  if (fontId === "archivo") {
    return styles.getPropertyValue("--font-archivo").trim() || "Archivo, sans-serif";
  }
  if (fontId === "mono") {
    return styles.getPropertyValue("--font-dm-mono").trim() || "monospace";
  }
  if (fontId === "onest") {
    return styles.getPropertyValue("--font-onest").trim() || "Onest, sans-serif";
  }
  return "Georgia, serif";
}

function buildTextDecalTexture(
  text: string,
  fontCss: string,
  color: string,
  size: number,
): THREE.CanvasTexture | null {
  if (typeof document === "undefined" || !text.trim()) return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, 512, 512);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${Math.round(size * 2.2)}px ${fontCss}`;

  const lines = text.split("\n").slice(0, 4);
  const lineH = Math.round(size * 2.5);
  const startY = 256 - ((lines.length - 1) * lineH) / 2;
  lines.forEach((line, idx) => {
    ctx.fillText(line.slice(0, 22), 256, startY + idx * lineH);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

interface ProductConfiguratorProps {
  initialProduct: Product;
  studioMode?: boolean;
}

export function ProductConfigurator({
  initialProduct,
  studioMode = false,
}: ProductConfiguratorProps) {
  const addItem = useCartStore((s) => s.addItem);
  const sceneRef = useRef<ProductSceneHandle>(null);
  const sizeDialogRef = useRef<HTMLDialogElement>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product>(initialProduct);
  const [color, setColor] = useState<TeeColorId>(initialProduct.defaultColor);
  const [size, setSize] = useState<TeeSize>("L");
  const [quantity, setQuantity] = useState(1);

  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("front");
  const [presetVersion, setPresetVersion] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [useFallback2D, setUseFallback2D] = useState(false);
  const [hasCheckedDevice, setHasCheckedDevice] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [openDetailIdx, setOpenDetailIdx] = useState<number | null>(0);

  // Print customiser state
  const [customMode, setCustomMode] = useState<"none" | "text" | "image">(
    studioMode ? "text" : "none",
  );
  const [placement, setPlacement] = useState<PrintPlacement>("center-chest");
  const [customText, setCustomText] = useState(studioMode ? "SUTRA KANPUR" : "");
  const [fontId, setFontId] = useState<(typeof PRINT_FONTS)[number]["id"]>("archivo");
  const [textColor, setTextColor] = useState("#F1EDE4");
  const [textSize, setTextSize] = useState(28);
  const [imageName, setImageName] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");
  const [uploadedTexture, setUploadedTexture] = useState<THREE.Texture | null>(
    null,
  );
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [decalScale, setDecalScale] = useState(1);
  const [decalRotation, setDecalRotation] = useState(0);

  useEffect(() => {
    setUseFallback2D(detectLowEnd());
    setHasCheckedDevice(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const dialog = sizeDialogRef.current;
    if (!dialog) return;
    if (sizeGuideOpen && !dialog.open) dialog.showModal();
    else if (!sizeGuideOpen && dialog.open) dialog.close();
  }, [sizeGuideOpen]);

  // Adjust default ink contrast when color changes if user hasn't picked custom
  const activeColorHex = getColorHex(color);

  const activeFontCss = resolveCanvasFont(fontId);

  const textTexture = useMemo(() => {
    if (customMode !== "text") return null;
    return buildTextDecalTexture(customText, activeFontCss, textColor, textSize);
  }, [customMode, customText, activeFontCss, textColor, textSize]);

  useEffect(() => {
    return () => {
      textTexture?.dispose();
    };
  }, [textTexture]);

  useEffect(() => {
    return () => {
      uploadedTexture?.dispose();
    };
  }, [uploadedTexture]);

  const activeDecalTexture =
    customMode === "text"
      ? textTexture
      : customMode === "image"
        ? uploadedTexture
        : null;

  const isPrintActive =
    (customMode === "text" && customText.trim().length > 0) ||
    (customMode === "image" && uploadedTexture !== null);

  const printCharge = isPrintActive
    ? placement === "back"
      ? PRINT_PRICING.back
      : PRINT_PRICING.chest
    : 0;

  const unitPrice = selectedProduct.price + printCharge;
  const totalPrice = unitPrice * quantity;

  const triggerPreset = useCallback((next: CameraPreset) => {
    setHasInteracted(true);
    setCameraPreset(next);
    setPresetVersion((v) => v + 1);
  }, []);

  const handlePlacementChange = (next: PrintPlacement) => {
    setPlacement(next);
    setOffsetX(0);
    setOffsetY(0);
    triggerPreset(next === "back" ? "back" : "front");
  };

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setImageError("");
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setImageError("Use a PNG, JPG, or SVG file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setImageError("File exceeds 3 MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        // Clamp uploaded texture strictly <= 1024px per performance budget
        const maxDim = 1024;
        const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(64, Math.round(img.width * ratio));
        const h = Math.max(64, Math.round(img.height * ratio));
        const off = document.createElement("canvas");
        off.width = 1024;
        off.height = 1024;
        const ctx = off.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, 1024, 1024);
        ctx.drawImage(img, (1024 - w) / 2, (1024 - h) / 2, w, h);

        const tex = new THREE.CanvasTexture(off);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        setUploadedTexture((prev) => {
          prev?.dispose();
          return tex;
        });
        setImageName(file.name);
        setCustomMode("image");
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function buildPrintSpec(): CustomPrintSpec | undefined {
    if (!isPrintActive) return undefined;
    return {
      mode: customMode,
      placement,
      text: customMode === "text" ? customText.trim() : undefined,
      fontFamily: customMode === "text" ? fontId : undefined,
      textColor: customMode === "text" ? textColor : undefined,
      textSize: customMode === "text" ? textSize : undefined,
      imageName: customMode === "image" ? imageName : undefined,
      offsetX,
      offsetY,
      scale: decalScale,
      rotation: decalRotation,
      printCharge,
    };
  }

  function handleAddToCart() {
    const thumb = sceneRef.current?.captureThumbnail();
    addItem({
      productId: selectedProduct.id,
      slug: selectedProduct.slug,
      name: selectedProduct.name,
      color,
      size,
      quantity,
      unitPrice,
      printSpec: buildPrintSpec(),
      thumbnailDataUrl: thumb,
    });
  }

  function handleOrderWhatsApp() {
    const spec = buildPrintSpec();
    const lines = [
      `Hi ${BRAND.name}, I'd like to order:`,
      `Product: ${selectedProduct.name} (${selectedProduct.code})`,
      `Color: ${getColorName(color)}`,
      `Size: ${size}`,
      `Quantity: ${quantity}`,
      spec
        ? `Custom Print (${spec.placement.replace("-", " ")}): ${
            spec.mode === "text"
              ? `Text "${spec.text}" (${spec.fontFamily}, ${spec.textColor})`
              : `Uploaded file "${spec.imageName}"`
          }`
        : "Print: None (Blank)",
      `Unit Price: ${formatINR(unitPrice)} | Total: ${formatINR(totalPrice)}`,
      spec?.mode === "image"
        ? "(Attaching my design file here in WhatsApp.)"
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(lines)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  const availableColors: TeeColorId[] = studioMode
    ? (Object.keys(TEE_PALETTE) as TeeColorId[])
    : selectedProduct.colors;

  const studioBlanks = PRODUCTS.filter((p) => !p.isGraphic).slice(0, 4);

  const detailItems = [
    {
      title: "Fabric & Construction",
      body: `${selectedProduct.gsm} GSM ${selectedProduct.fabric}. Reinforced 25mm 1×1 ribbed neck, twin-needle hem and sleeve cuffs, enzyme-washed in Kanpur.`,
    },
    {
      title: "Print Method & Wash Care",
      body: "Chest and back custom prints are heat-cured at 165°C for wash-fast stretch. Turn inside-out, wash cold, do not iron directly over the print.",
    },
    {
      title: "Dispatch & Returns",
      body: "Plain blanks ship within 24 hours. Custom printed tees cure and ship in 3 working days. 7-day size exchange on plain unworn tees.",
    },
  ];

  const moreFromRail = PRODUCTS.filter((p) => p.slug !== selectedProduct.slug).slice(
    0,
    5,
  );

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="grid grid-cols-1 border-b-[1.5px] border-[var(--ink)] lg:grid-cols-12">
        {/* LEFT COLUMN: 3D VIEWER / FALLBACK */}
        <div className="relative flex min-h-[460px] flex-col justify-between border-b-[1.5px] border-[var(--ink)] bg-[#E2DDD1] lg:col-span-7 lg:min-h-[760px] lg:border-r-[1.5px] lg:border-b-0">
          <div className="flex items-center justify-between border-b-[1.5px] border-[var(--ink)] bg-[var(--bg)] px-4 py-2.5 sm:px-6">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="font-mono-label text-[var(--ink)] hover:text-[var(--accent)]"
              >
                ← Back to Rail
              </Link>
              <span className="font-mono-label text-[var(--ink)]/50">/</span>
              <span className="font-mono-label text-[var(--ink)]/75">
                {studioMode ? "STUDIO BLANK" : selectedProduct.code}
              </span>
            </div>

            {/* Camera presets */}
            {!useFallback2D && (
              <div
                role="group"
                aria-label="Camera angle presets"
                className="flex items-center gap-1"
              >
                {(["front", "back", "detail"] as CameraPreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={cameraPreset === preset}
                    onClick={() => triggerPreset(preset)}
                    className={`min-h-[34px] border-[1.5px] border-[var(--ink)] px-2.5 font-mono-label text-[11px] cursor-pointer transition-colors ${
                      cameraPreset === preset
                        ? "bg-[var(--ink)] text-[var(--bg)]"
                        : "bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--accent)]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex-1 min-h-[380px] sm:min-h-[540px]">
            {!hasCheckedDevice ? (
              <div className="flex h-full items-center justify-center font-mono-label">
                LOADING 3D VIEWPORT...
              </div>
            ) : useFallback2D ? (
              <ProductFallback2D
                colorHex={activeColorHex}
                fit={selectedProduct.fit}
                hasPocket={selectedProduct.hasPocket}
                customMode={customMode}
                customText={customText}
                textColor={textColor}
                textSize={textSize}
                placement={placement}
                offsetX={offsetX}
                offsetY={offsetY}
                scale={decalScale}
                rotationDeg={decalRotation}
              />
            ) : (
              <CanvasErrorBoundary
                onError={() => setUseFallback2D(true)}
                fallback={
                  <ProductFallback2D
                    colorHex={activeColorHex}
                    fit={selectedProduct.fit}
                    hasPocket={selectedProduct.hasPocket}
                    customMode={customMode}
                    customText={customText}
                    textColor={textColor}
                    textSize={textSize}
                    placement={placement}
                    offsetX={offsetX}
                    offsetY={offsetY}
                    scale={decalScale}
                    rotationDeg={decalRotation}
                  />
                }
              >
                <Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center font-mono-label">
                      PREPARING GARMENT MESH...
                    </div>
                  }
                >
                  <ProductScene
                    ref={sceneRef}
                    colorHex={activeColorHex}
                    fit={selectedProduct.fit}
                    hasPocket={selectedProduct.hasPocket}
                    graphicText={
                      studioMode ? undefined : selectedProduct.graphicText
                    }
                    cameraPreset={cameraPreset}
                    presetVersion={presetVersion}
                    hasInteracted={hasInteracted}
                    reducedMotion={reducedMotion}
                    onUserInteract={() => setHasInteracted(true)}
                    decalTexture={activeDecalTexture}
                    placement={placement}
                    offsetX={offsetX}
                    offsetY={offsetY}
                    decalScale={decalScale}
                    decalRotationDeg={decalRotation}
                  />
                </Suspense>
              </CanvasErrorBoundary>
            )}
          </div>

          <div className="flex items-center justify-between border-t-[1.5px] border-[var(--ink)] bg-[var(--bg)] px-4 py-2.5 font-mono-label text-[11px] text-[var(--ink)]/75 sm:px-6">
            <span>
              {useFallback2D
                ? "Low-power 2D studio mode"
                : "Drag to rotate 360° • Scroll to zoom"}
            </span>
            <span>{selectedProduct.shortSpec}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: CONFIGURATOR */}
        <div className="flex flex-col justify-between bg-[var(--bg)] p-5 sm:p-8 lg:col-span-5">
          <div>
            {studioMode && (
              <div className="mb-6 border-b-[1.5px] border-[var(--ink)] pb-5">
                <p className="mb-2 font-mono-label text-[var(--ink)]/75">
                  01 // Select Blank Silhouette
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {studioBlanks.map((blank) => {
                    const active = selectedProduct.id === blank.id;
                    return (
                      <button
                        key={blank.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setSelectedProduct(blank);
                          setColor(blank.defaultColor);
                        }}
                        className={`min-h-[48px] border-[1.5px] border-[var(--ink)] p-2 text-left cursor-pointer transition-colors ${
                          active
                            ? "bg-[var(--ink)] text-[var(--bg)]"
                            : "bg-[var(--bg)] text-[var(--ink)] hover:bg-[#DFDBD0]"
                        }`}
                      >
                        <span className="block font-mono-label text-[11px]">
                          {blank.fit} • {blank.gsm} GSM
                        </span>
                        <span className="block text-sm font-semibold">
                          {blank.name} ({formatINR(blank.price)})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="font-mono-label text-[var(--ink)]/75">
              {studioMode ? "Custom Print Studio" : selectedProduct.shortSpec}
            </p>
            <h1 className="mt-1.5 font-display text-[32px] sm:text-[42px] text-[var(--ink)]">
              {studioMode ? "Build Your Custom Tee" : selectedProduct.name}
            </h1>
            <p className="mt-2 font-mono-label text-lg font-medium text-[var(--ink)]">
              {formatINR(unitPrice)}
              {printCharge > 0 && (
                <span className="ml-2 text-xs text-[var(--ink)]/70">
                  (Base {formatINR(selectedProduct.price)} +{" "}
                  {formatINR(printCharge)} print)
                </span>
              )}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]/85">
              {selectedProduct.description}
            </p>

            {/* Color Swatches */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono-label">
                  Color: {getColorName(color)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {availableColors.map((cid) => {
                  const active = color === cid;
                  return (
                    <button
                      key={cid}
                      type="button"
                      aria-label={getColorName(cid)}
                      aria-pressed={active}
                      onClick={() => setColor(cid)}
                      style={{ backgroundColor: getColorHex(cid) }}
                      className={`h-9 w-9 cursor-pointer border-[1.5px] border-[var(--ink)] transition-transform ${
                        active
                          ? "scale-105 ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]"
                          : "hover:scale-105"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Size Selector + Size Guide Modal Trigger */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono-label">Size: {size}</span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="font-mono-label text-[11px] underline cursor-pointer hover:text-[var(--accent)]"
                >
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={size === s}
                    onClick={() => setSize(s)}
                    className={`min-h-[44px] border-[1.5px] border-[var(--ink)] font-mono-label cursor-pointer transition-colors ${
                      size === s
                        ? "bg-[var(--ink)] text-[var(--bg)]"
                        : "bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--accent)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-5 flex items-center justify-between border-y-[1.5px] border-[var(--ink)] py-3">
              <span className="font-mono-label">Quantity</span>
              <div className="inline-flex items-center border-[1.5px] border-[var(--ink)]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="min-h-[38px] min-w-[38px] font-mono-label cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--bg)]"
                >
                  -
                </button>
                <span className="min-w-[2.5rem] text-center font-mono-label">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="min-h-[38px] min-w-[38px] font-mono-label cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--bg)]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Customise Print Section */}
            <div className="mt-6 border-[1.5px] border-[var(--ink)] bg-[#F1EDE4] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-mono-label font-medium text-[var(--ink)]">
                  Customise Print
                </h2>
                <span className="font-mono-label text-[11px] text-[var(--ink)]/75">
                  Chest +Rs. 200 / Back +Rs. 300
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: "none", label: "Plain" },
                    { id: "text", label: "Add Text" },
                    { id: "image", label: "Upload Logo" },
                  ] as const
                ).map((tab) => {
                  const disabled = useFallback2D && tab.id === "image";
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      disabled={disabled}
                      aria-pressed={customMode === tab.id}
                      onClick={() => setCustomMode(tab.id)}
                      className={`min-h-[38px] border-[1.5px] border-[var(--ink)] px-2 font-mono-label text-[11px] cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                        customMode === tab.id
                          ? "bg-[var(--ink)] text-[var(--bg)]"
                          : "bg-[var(--bg)] text-[var(--ink)]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {customMode === "text" && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label
                      htmlFor="custom-print-text"
                      className="mb-1 block font-mono-label text-[11px]"
                    >
                      Print Text
                    </label>
                    <input
                      id="custom-print-text"
                      type="text"
                      maxLength={36}
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="SUTRA KANPUR"
                      className="min-h-[40px] w-full border-[1.5px] border-[var(--ink)] bg-[var(--bg)] px-2.5 text-sm text-[var(--ink)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="custom-print-font"
                        className="mb-1 block font-mono-label text-[11px]"
                      >
                        Font
                      </label>
                      <select
                        id="custom-print-font"
                        value={fontId}
                        onChange={(e) =>
                          setFontId(
                            e.target.value as (typeof PRINT_FONTS)[number]["id"],
                          )
                        }
                        className="min-h-[40px] w-full border-[1.5px] border-[var(--ink)] bg-[var(--bg)] px-2 text-xs text-[var(--ink)]"
                      >
                        {PRINT_FONTS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="custom-print-color"
                        className="mb-1 block font-mono-label text-[11px]"
                      >
                        Ink Color
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          id="custom-print-color"
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="h-[40px] w-12 cursor-pointer border-[1.5px] border-[var(--ink)] bg-[var(--bg)] p-0.5"
                        />
                        {["#F1EDE4", "#151515", "#FF4B1F"].map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            aria-label={`Ink ${hex}`}
                            onClick={() => setTextColor(hex)}
                            style={{ backgroundColor: hex }}
                            className="h-7 w-7 cursor-pointer border-[1.5px] border-[var(--ink)]"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="custom-print-size"
                      className="mb-1 flex justify-between font-mono-label text-[11px]"
                    >
                      <span>Text Size</span>
                      <span>{textSize}px</span>
                    </label>
                    <input
                      id="custom-print-size"
                      type="range"
                      min={16}
                      max={46}
                      value={textSize}
                      onChange={(e) => setTextSize(Number(e.target.value))}
                      className="w-full accent-[var(--accent)]"
                    />
                  </div>
                </div>
              )}

              {customMode === "image" && (
                <div className="mt-4 space-y-2.5">
                  <label
                    htmlFor="logo-upload"
                    className="block font-mono-label text-[11px]"
                  >
                    Upload PNG / JPG / SVG (max 3 MB, stays on device)
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleFileUpload}
                    className="block w-full border-[1.5px] border-[var(--ink)] bg-[var(--bg)] p-2 text-xs"
                  />
                  {imageName && (
                    <p className="font-mono-label text-[11px] text-[var(--ink)]">
                      Loaded: {imageName}
                    </p>
                  )}
                  {imageError && (
                    <p role="alert" className="font-mono-label text-[11px] text-[#A2240A]">
                      {imageError}
                    </p>
                  )}
                </div>
              )}

              {customMode !== "none" && (
                <>
                  {/* Placement Presets */}
                  <div className="mt-4">
                    <span className="mb-1.5 block font-mono-label text-[11px]">
                      Placement
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: "left-chest", label: "Left Chest" },
                          { id: "center-chest", label: "Center Chest" },
                          { id: "back", label: "Back" },
                        ] as const
                      ).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          aria-pressed={placement === p.id}
                          onClick={() => handlePlacementChange(p.id)}
                          className={`min-h-[36px] border-[1.5px] border-[var(--ink)] px-1.5 font-mono-label text-[10px] cursor-pointer ${
                            placement === p.id
                              ? "bg-[var(--accent)] text-[var(--ink)]"
                              : "bg-[var(--bg)] text-[var(--ink)]"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fine Position, Scale, Rotation Sliders */}
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t-[1.5px] border-[var(--ink)]/25 pt-3">
                    <div>
                      <label
                        htmlFor="decal-x"
                        className="mb-1 flex justify-between font-mono-label text-[10px]"
                      >
                        <span>Pos X</span>
                        <span>{offsetX.toFixed(2)}</span>
                      </label>
                      <input
                        id="decal-x"
                        type="range"
                        min={-0.08}
                        max={0.08}
                        step={0.005}
                        value={offsetX}
                        onChange={(e) => setOffsetX(Number(e.target.value))}
                        className="w-full accent-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="decal-y"
                        className="mb-1 flex justify-between font-mono-label text-[10px]"
                      >
                        <span>Pos Y</span>
                        <span>{offsetY.toFixed(2)}</span>
                      </label>
                      <input
                        id="decal-y"
                        type="range"
                        min={-0.12}
                        max={0.10}
                        step={0.005}
                        value={offsetY}
                        onChange={(e) => setOffsetY(Number(e.target.value))}
                        className="w-full accent-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="decal-scale"
                        className="mb-1 flex justify-between font-mono-label text-[10px]"
                      >
                        <span>Scale</span>
                        <span>{decalScale.toFixed(2)}×</span>
                      </label>
                      <input
                        id="decal-scale"
                        type="range"
                        min={0.5}
                        max={1.5}
                        step={0.05}
                        value={decalScale}
                        onChange={(e) => setDecalScale(Number(e.target.value))}
                        className="w-full accent-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="decal-rot"
                        className="mb-1 flex justify-between font-mono-label text-[10px]"
                      >
                        <span>Rotation</span>
                        <span>{decalRotation}°</span>
                      </label>
                      <input
                        id="decal-rot"
                        type="range"
                        min={-45}
                        max={45}
                        step={1}
                        value={decalRotation}
                        onChange={(e) =>
                          setDecalRotation(Number(e.target.value))
                        }
                        className="w-full accent-[var(--accent)]"
                      />
                    </div>
                  </div>
                </>
              )}

              <p className="mt-3 font-mono-label text-[11px] text-[var(--ink)]/80">
                Your design file is sent in the WhatsApp chat after you tap
                Order.
              </p>
            </div>
          </div>

          {/* Price Breakdown & CTAs */}
          <div className="mt-6 border-t-[1.5px] border-[var(--ink)] pt-4">
            <div className="flex items-center justify-between font-mono-label text-xs">
              <span>
                {quantity} × {formatINR(unitPrice)}
              </span>
              <span className="font-display text-2xl">
                {formatINR(totalPrice)}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-outline w-full"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleOrderWhatsApp}
                className="btn-ink w-full"
              >
                Order on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Accordion */}
      <section
        aria-label="Product details"
        className="border-b-[1.5px] border-[var(--ink)] px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-display text-[34px]">Garment Specs</h2>
          </div>
          <div className="divide-y-[1.5px] divide-[var(--ink)] border-y-[1.5px] border-[var(--ink)] lg:col-span-8">
            {detailItems.map((item, idx) => {
              const open = openDetailIdx === idx;
              return (
                <div key={item.title}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenDetailIdx(open ? null : idx)}
                      className="flex min-h-[56px] w-full items-center justify-between py-3 text-left font-semibold cursor-pointer hover:text-[var(--accent)]"
                    >
                      <span>{item.title}</span>
                      <span className="font-mono-label" aria-hidden="true">
                        {open ? "[-]" : "[+]"}
                      </span>
                    </button>
                  </h3>
                  <div hidden={!open} className="pb-4 text-sm text-[var(--ink)]/85">
                    {item.body}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* More from the rail */}
      <section
        aria-label="More from the rail"
        className="border-b-[1.5px] border-[var(--ink)] px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-display text-[28px] sm:text-[36px]">
            More From The Rail
          </h2>
          <Link
            href="/"
            className="font-mono-label underline hover:text-[var(--accent)]"
          >
            All 08 Tees →
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {moreFromRail.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="flex min-w-[230px] shrink-0 flex-col justify-between border-[1.5px] border-[var(--ink)] bg-[var(--bg)] p-4 transition-colors hover:bg-[#DFDBD0]"
            >
              <div>
                <div className="flex items-center justify-between font-mono-label text-[11px] text-[var(--ink)]/75">
                  <span>{p.code}</span>
                  <span
                    style={{ backgroundColor: getColorHex(p.defaultColor) }}
                    className="h-3.5 w-3.5 border border-[var(--ink)]"
                  />
                </div>
                <p className="mt-2 font-display text-lg">{p.name}</p>
                <p className="mt-1 font-mono-label text-[11px] text-[var(--ink)]/75">
                  {p.shortSpec}
                </p>
              </div>
              <p className="mt-4 font-mono-label text-sm font-medium">
                {formatINR(p.price)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Size Guide Native Modal */}
      <dialog
        ref={sizeDialogRef}
        aria-labelledby="size-guide-title"
        onCancel={(e) => {
          e.preventDefault();
          setSizeGuideOpen(false);
        }}
        onClick={(e) => {
          if (e.target === sizeDialogRef.current) setSizeGuideOpen(false);
        }}
        className="sutra-dialog"
      >
        <div className="mx-auto mt-16 w-[calc(100%-2rem)] max-w-lg border-[1.5px] border-[var(--ink)] bg-[var(--bg)] p-6 text-[var(--ink)]">
          <div className="flex items-center justify-between border-b-[1.5px] border-[var(--ink)] pb-3">
            <h1 id="size-guide-title" className="font-display text-2xl">
              Size Guide (Inches)
            </h1>
            <button
              type="button"
              autoFocus
              onClick={() => setSizeGuideOpen(false)}
              className="min-h-[38px] border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-3 font-mono-label text-[var(--bg)] cursor-pointer"
            >
              Close
            </button>
          </div>
          <p className="mt-3 text-sm text-[var(--ink)]/85">
            Measured flat on Regular block. For Oversized tees, add +2&quot; to
            chest and +1.5&quot; to shoulder drop.
          </p>
          <table className="mt-4 w-full border-collapse border-[1.5px] border-[var(--ink)] text-left font-mono-label text-xs">
            <thead>
              <tr className="border-b-[1.5px] border-[var(--ink)] bg-[#DFDBD0]">
                <th scope="col" className="p-2.5">
                  Size
                </th>
                <th scope="col" className="p-2.5">
                  Chest
                </th>
                <th scope="col" className="p-2.5">
                  Length
                </th>
                <th scope="col" className="p-2.5">
                  Shoulder
                </th>
              </tr>
            </thead>
            <tbody>
              {SIZE_GUIDE.map((row) => (
                <tr key={row.size} className="border-b border-[var(--ink)]/30">
                  <th scope="row" className="p-2.5 font-semibold">
                    {row.size}
                  </th>
                  <td className="p-2.5">{row.chestIn}&quot;</td>
                  <td className="p-2.5">{row.lengthIn}&quot;</td>
                  <td className="p-2.5">{row.shoulderIn}&quot;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </dialog>
    </div>
  );
}
