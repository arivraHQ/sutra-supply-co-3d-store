# Sutra Supply Co. — 3D Streetwear Concept Store & Print Studio

> **Interactive 3D clothing rail, live `<Decal>` custom print studio, and WhatsApp-first ordering concept store built by Arivra Design Studio (Demo / Portfolio Build).**

**Tags:** `nextjs` `react-three-fiber` `threejs` `tailwindcss` `typescript` `3d-ecommerce` `zustand` `framer-motion` `streetwear` `print-customizer` `arivra-design-studio`

---

## Overview

A tactile 3D concept store for **Sutra Supply Co.** (fictional Kanpur streetwear label), engineered to browse like a physical garment rack rather than a generic card grid:

- **3D Clothes Rail (`/`)**: Continuous float progress `p` damped with `maath`, `smoothstep` `85°` side-view compression, velocity-driven hanger pendulum swing, wheel / drag / keyboard navigation, category filters (`All`, `Regular`, `Oversized`, `Graphic`), and a `600ms` pull-forward transition into the product viewer.
- **3D Product Viewer (`/product/[slug]`) & Studio (`/studio`)**: `frameloop="demand"` idle optimization, bounded `OrbitControls`, `Front / Back / Detail` camera presets, live colorway lerping, and real-time `<Decal>` text/logo placement (`Left Chest`, `Center Chest`, `Back`) with client-side image scaling (`<= 1024px`).
- **Progressive Enhancement & Fallback**: Automatic 2D horizontal rail and static gallery fallback for low-power hardware (`hardwareConcurrency <= 4`, `deviceMemory <= 4`, or missing WebGL), plus full server-rendered DOM HTML for SEO and accessibility.
- **WhatsApp Checkout & Bulk Enquiries**: Zustand-persisted cart capturing `160×160` canvas thumbnails and generating prefilled `wa.me` order summaries.

## Setup

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run build
npm run start
```

Open `http://localhost:3000`.

## 3D Model (`/public/models/tshirt.glb`)

All 3D views (the home rail, `/product/[slug]`, and `/studio`) render through a single component:

- [components/three/Tee.tsx](components/three/Tee.tsx)

The project uses a sculpted GLB mesh at `public/models/tshirt.glb` (`T_Shirt_male`, `1.00 MB` with `1024×1024` baked occlusion and cotton weave normal maps), loaded via `useGLTF` and preloaded via `useGLTF.preload`.

To swap in your own custom GLB later:
1. Export your mesh as a Draco- or meshopt-compressed GLB under **2 MB** (textures ≤ **1024px**):
   ```bash
   npx @gltf-transform/cli optimize raw-tshirt.glb public/models/tshirt.glb --compress draco --texture-size 1024
   ```
2. Update the node/material names inside [components/three/Tee.tsx](components/three/Tee.tsx) while keeping `children` inside the shirt `<mesh>` so `<Decal>` custom prints project cleanly onto your mesh.

## Project Structure

```text
app/
  globals.css                # CSS variables, paper-grain overlay (5%), sharp 1.5px ink borders
  layout.tsx                 # Archivo (wdth 125), Onest, DM Mono fonts + Navbar, Footer, CartDrawer
  icon.svg                   # Custom Sutra SVG favicon
  page.tsx                   # Home: HeroRail, Print Steps, 240 GSM Craft & SVG Fit Diagram, Lookbook, Garment Ledger, Bulk Form, FAQ
  product/[slug]/page.tsx    # Static-generated 3D product page + custom print studio
  studio/page.tsx            # Standalone blank-tee custom print configurator
components/
  three/
    CanvasErrorBoundary.tsx  # WebGL error boundary triggering 2D fallback
    Tee.tsx                  # Single Tee abstraction (GLB + Decal anchor + colorway lerping)
    WoodenHanger.tsx         # Procedural steel hook (TubeGeometry) + angled wooden arms
    RailScene.tsx            # R3F 3D rail: maath damping, velocity pendulum swing, Lightformer Environment, fake wall shadows
    ProductScene.tsx         # R3F demand-loop product viewer: limited OrbitControls, camera presets, live <Decal>
  HeroRail.tsx               # Drag, wheel, keyboard, filter chips, 600ms pull-forward navigation
  RailFallback2D.tsx         # 2D CSS-transform rail fallback for low-end / WebGL-unavailable devices
  ProductConfigurator.tsx    # Color swatches, S–XXL + Size Guide modal, text/logo Decal studio, WhatsApp order
  ProductFallback2D.tsx      # 2D front/back gallery fallback (text & color customiser)
  HomeSections.tsx           # Print it your way, 240 GSM + SVG Fit Diagram, Lookbook, Bulk WhatsApp form, FAQ
  Navbar.tsx                 # Sticky navbar + native modal mobile menu
  CartDrawer.tsx             # Zustand-persisted slide-in bag + WhatsApp checkout
  Footer.tsx                 # Kanpur workshop details, oversized "Wear it in.", and Arivra Design Studio demo disclaimer
content/
  site.ts                    # All 8 products (Rs. 799–1,499), copy, specs, FAQ, illustrative WhatsApp (+91 90000 00000)
store/
  cart.ts                    # Zustand cart state with localStorage persistence
tokens/
  theme.ts                   # Single source of truth for palette, tee colors, and motion timing
```

## Design & Performance Decisions

- **Tactile store-wall palette**: Warm limestone wall (`#E8E4DA`), ink (`#151515`), signal orange (`#FF4B1F`), steel rod (`#9C9C98`), wood hanger (`#B58B5A`), zero `border-radius`, `1.5px` ink rules, and a `5%` SVG noise grain overlay.
- **Physical rail kinematics**: Continuous float progress `p` damped via `maath` `easing.damp`, smoothstep side-view rotation (`85°`) and x-stack compression, velocity-driven hanger pendulum swing (`rotationZ`), and a `600ms` pull-forward transition on clicking the active tee.
- **Zero-HDR / Zero-shadow-map lighting**: Custom `<Environment>` built exclusively from `<Lightformer>` rects and blurred radial-gradient canvas planes for wall shadows.
- **Demand rendering & fallback**: Product pages run `frameloop="demand"` and stop idle rotation permanently upon user interaction; devices with `hardwareConcurrency <= 4`, `deviceMemory <= 4`, or failed WebGL seamlessly fall back to 2D rails and static galleries.
- **Client-side artwork privacy**: Custom PNG/JPG/SVG uploads (`<= 3 MB`) are resized to `<= 1024px` in an offscreen canvas and never leave the browser; checkout pre-fills a structured `wa.me` WhatsApp order.

---

### Demo Disclaimer
Built by **Arivra Design Studio** strictly as a demo and portfolio showcase. All brand names, Kanpur storefront addresses, pricing, and WhatsApp order numbers (`+91 90000 00000`) are illustrative.
