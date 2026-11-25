import { TEE_PALETTE, type TeeColorId } from "@/tokens/theme";

export type TeeFit = "Regular" | "Oversized";
export type RailFilter = "All" | "Regular" | "Oversized" | "Graphic";
export type TeeSize = "S" | "M" | "L" | "XL" | "XXL";

export interface Product {
  id: string;
  slug: string;
  name: string;
  code: string;
  price: number;
  fit: TeeFit;
  isGraphic: boolean;
  hasPocket?: boolean;
  gsm: number;
  fabric: string;
  description: string;
  shortSpec: string;
  defaultColor: TeeColorId;
  colors: TeeColorId[];
  graphicLabel?: string;
  graphicText?: string;
}

export const BRAND = {
  name: "Sutra Supply Co.",
  wordmark: "SUTRA",
  city: "Kanpur",
  addressLine: "Plot 14, Fazalganj Mill Compound, Kanpur 208012",
  whatsappNumber: "919000000000",
  whatsappDisplay: "+91 90000 00000",
  tagline: "Heavyweight combed cotton tees, printed in Kanpur.",
  heroWord: "SUTRA",
  footerWord: "Wear it in.",
} as const;

export const NAV_LINKS = [
  { label: "Shop", href: "/#rail" },
  { label: "Custom Studio", href: "/studio" },
  { label: "Lookbook", href: "/#lookbook" },
  { label: "About", href: "/#craft" },
] as const;

export const RAIL_FILTERS: RailFilter[] = [
  "All",
  "Regular",
  "Oversized",
  "Graphic",
];

export const PRINT_PRICING = {
  chest: 200,
  back: 300,
} as const;

export const SIZES: TeeSize[] = ["S", "M", "L", "XL", "XXL"];

export const SIZE_GUIDE: {
  size: TeeSize;
  chestIn: number;
  lengthIn: number;
  shoulderIn: number;
}[] = [
  { size: "S", chestIn: 40, lengthIn: 27, shoulderIn: 18.5 },
  { size: "M", chestIn: 42, lengthIn: 28, shoulderIn: 19.5 },
  { size: "L", chestIn: 44, lengthIn: 29, shoulderIn: 20.5 },
  { size: "XL", chestIn: 47, lengthIn: 30, shoulderIn: 21.5 },
  { size: "XXL", chestIn: 50, lengthIn: 31, shoulderIn: 22.5 },
];

export const PRODUCTS: Product[] = [
  {
    id: "sutra-01",
    slug: "kanpur-heavy-black-tee",
    name: "Kanpur Heavy Black Tee",
    code: "SC-01",
    price: 799,
    fit: "Regular",
    isGraphic: false,
    gsm: 240,
    fabric: "100% Combed Ring-Spun Cotton, Bio-Washed",
    shortSpec: "240 GSM • Regular Block",
    description:
      "Knitted in Tirupur, finished in our Kanpur workshop. Dense 240 GSM jersey with a 1-inch ribbed collar that holds its shape wash after wash.",
    defaultColor: "black",
    colors: ["black", "off-white", "ash-grey", "olive"],
  },
  {
    id: "sutra-02",
    slug: "rust-pocket-tee",
    name: "Rust Pocket Tee",
    code: "SC-02",
    price: 899,
    fit: "Regular",
    isGraphic: false,
    hasPocket: true,
    gsm: 240,
    fabric: "100% Combed Cotton, Enzyme Washed",
    shortSpec: "240 GSM • Chest Pocket",
    description:
      "Garment-dyed brick rust with a bar-tacked left chest pocket and double-needle hem. Built for humid summers and heavy daily rotation.",
    defaultColor: "rust",
    colors: ["rust", "sand", "black", "olive"],
  },
  {
    id: "sutra-03",
    slug: "olive-oversized-tee",
    name: "Olive Oversized Tee",
    code: "SC-03",
    price: 1199,
    fit: "Oversized",
    isGraphic: false,
    gsm: 260,
    fabric: "100% Heavyweight Single Jersey, Pre-Shrunk",
    shortSpec: "260 GSM • Drop Shoulder",
    description:
      "Boxy drop-shoulder drape cut with wider half-sleeves and zero side-seam twist. Sits off the body without feeling flimsy.",
    defaultColor: "olive",
    colors: ["olive", "black", "sand", "off-white"],
  },
  {
    id: "sutra-04",
    slug: "sand-graphic-tee",
    name: "Sand Graphic Tee",
    code: "SC-04",
    price: 1099,
    fit: "Regular",
    isGraphic: true,
    gsm: 240,
    fabric: "100% Combed Cotton, Water-Based Screenprint",
    shortSpec: "240 GSM • Mill Print",
    description:
      "Unbleached raw sand jersey printed with soft-hand water-based ink that breathes with the fabric instead of cracking like thick plastisol.",
    defaultColor: "sand",
    colors: ["sand", "off-white", "ash-grey", "black"],
    graphicLabel: "MILL NO. 04",
    graphicText: "SUTRA // MILL 04\nKANPUR 208012",
  },
  {
    id: "sutra-05",
    slug: "bone-raw-seam-tee",
    name: "Bone Raw Seam Tee",
    code: "SC-05",
    price: 849,
    fit: "Regular",
    isGraphic: false,
    gsm: 240,
    fabric: "100% Unbleached Combed Cotton",
    shortSpec: "240 GSM • Natural Ecru",
    description:
      "Warm off-white knit with subtle cotton seed flecks and contrast lockstitch shoulder tape. Clean canvas for custom chest or back prints.",
    defaultColor: "off-white",
    colors: ["off-white", "sand", "ash-grey", "rust"],
  },
  {
    id: "sutra-06",
    slug: "ash-boxy-tee",
    name: "Ash Boxy Drop Tee",
    code: "SC-06",
    price: 1249,
    fit: "Oversized",
    isGraphic: false,
    gsm: 260,
    fabric: "100% Heavyweight Melange Cotton",
    shortSpec: "260 GSM • Boxy Cut",
    description:
      "Concrete-toned ash grey with slightly cropped length and wide ribbed crew neck. Cut for layered fits or wide trousers.",
    defaultColor: "ash-grey",
    colors: ["ash-grey", "black", "olive", "off-white"],
  },
  {
    id: "sutra-07",
    slug: "coal-press-graphic-tee",
    name: "Coal Press Graphic Tee",
    code: "SC-07",
    price: 1349,
    fit: "Oversized",
    isGraphic: true,
    gsm: 260,
    fabric: "100% Heavyweight Cotton, Discharge Print",
    shortSpec: "260 GSM • Discharge Ink",
    description:
      "High-contrast typographic chest mark printed using discharge ink that bleaches and dyes the yarn itself. Zero plastic hand-feel.",
    defaultColor: "black",
    colors: ["black", "olive", "rust", "ash-grey"],
    graphicLabel: "PRESS TYPE",
    graphicText: "260 GSM\nKANPUR PRESS",
  },
  {
    id: "sutra-08",
    slug: "karkhana-heavy-graphic-tee",
    name: "Karkhana Heavy Tee",
    code: "SC-08",
    price: 1499,
    fit: "Oversized",
    isGraphic: true,
    gsm: 280,
    fabric: "100% French Terry Jersey, Pre-Shrunk",
    shortSpec: "280 GSM • Flagship Weight",
    description:
      "Our heaviest silhouette at 280 GSM. Structured drape, high collar sit, and crisp archival stencil print from the Fazalganj floor.",
    defaultColor: "rust",
    colors: ["rust", "black", "sand", "olive"],
    graphicLabel: "KARKHANA",
    graphicText: "KARKHANA\nEST. KANPUR",
  },
];

export function formatINR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

export function getColorHex(colorId: TeeColorId): string {
  return TEE_PALETTE[colorId].hex;
}

export function getColorName(colorId: TeeColorId): string {
  return TEE_PALETTE[colorId].name;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export const PRINT_STEPS = [
  {
    step: "01",
    title: "Upload or type",
    detail:
      "Drop a transparent PNG, SVG or crisp JPG logo (under 3 MB), or set bold stencil type right inside our 3D viewer.",
  },
  {
    step: "02",
    title: "Place it live",
    detail:
      "Snap to left chest, center chest, or full back. Nudge position, scale, and tilt directly on the garment.",
  },
  {
    step: "03",
    title: "Printed in 3 days",
    detail:
      "We cure every custom tee in-house at Kanpur within 72 hours and dispatch via tracked courier across India.",
  },
] as const;

export const CRAFT_SPECS = [
  { label: "Fabric weight", value: "240 – 280 GSM combed cotton" },
  { label: "Shrinkage", value: "< 2% pre-shrunk & enzyme washed" },
  { label: "Collar", value: "1×1 Lycra-reinforced 25mm rib" },
  { label: "Print method", value: "Water-based & high-density DTF" },
] as const;

export const LOOKBOOK_SHOTS = [
  {
    id: "lb-01",
    caption: "01 — Gwaltoli Mill Yard, 11:30 AM",
    productSlug: "olive-oversized-tee",
    w: 765,
    h: 1024,
    frameClass: "h-[360px] sm:h-[420px]",
    swatch: "#5E6340",
    brief:
      "Model in olive oversized tee standing against weathered concrete mill wall, hard afternoon daylight, candid film grain, Kanpur street backdrop, no studio white background.",
  },
  {
    id: "lb-02",
    caption: "02 — Fazalganj Freight Lane",
    productSlug: "rust-pocket-tee",
    w: 338,
    h: 283,
    frameClass: "h-[280px] sm:h-[320px]",
    swatch: "#A2482A",
    brief:
      "Close-up mid-shot of rust pocket tee worn over raw denim near steel shutter, harsh side sunlight showing cotton weave texture, candid Indian street editorial.",
  },
  {
    id: "lb-03",
    caption: "03 — IIT Gate Tea Stall",
    productSlug: "sand-graphic-tee",
    w: 338,
    h: 283,
    frameClass: "h-[260px] sm:h-[290px]",
    swatch: "#CDB892",
    brief:
      "Back view of model in sand graphic tee seated on metal bench at roadside chai tapri, warm golden light, subtle screenprint texture visible.",
  },
  {
    id: "lb-04",
    caption: "04 — Press Floor Proofing",
    productSlug: "coal-press-graphic-tee",
    w: 337,
    h: 226,
    frameClass: "h-[240px] sm:h-[270px]",
    swatch: "#1B1B1B",
    brief:
      "Two friends in pitch black graphic tees inspecting freshly pulled silkscreens inside small Kanpur print workshop, tungsten and daylight mix.",
  },
  {
    id: "lb-05",
    caption: "05 — Ganga Barrage Steps",
    productSlug: "ash-boxy-tee",
    w: 276,
    h: 283,
    frameClass: "h-[310px] sm:h-[360px]",
    swatch: "#A7A8A4",
    brief:
      "Model in ash boxy drop tee sitting on concrete steps at dusk, wide trousers, wind catching heavyweight 260 GSM hem.",
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "How long does shipping take across India?",
    a: "Plain tees dispatch within 24 hours from Kanpur. Custom printed tees take 3 working days to cure and pack. Metro deliveries arrive in 2–4 days; tier-2/3 cities in 4–6 days.",
  },
  {
    q: "What is your return and exchange policy?",
    a: "Plain, unworn tees with tags can be exchanged for size or refunded within 7 days of delivery. Custom-printed pieces are made to your file and cannot be returned unless there is a print or fabric defect.",
  },
  {
    q: "How durable are the custom prints?",
    a: "We cure prints at 165°C using soft-hand water-based screen ink for bulk runs and high-elasticity DTF transfers for single custom pieces. Wash inside-out in cold water; they will not crack or peel.",
  },
  {
    q: "What are the MOQ and rates for bulk / college fest orders?",
    a: "Bulk pricing starts at just 15 tees (mix sizes freely). College fests, tech clubs, startups, and local cafes get tiered rates starting around Rs. 549 per printed 240 GSM tee.",
  },
  {
    q: "How do Regular and Oversized fits compare?",
    a: "Regular tees follow a classic clean block with a structured shoulder. Oversized tees drop the shoulder seam by 2 inches, widen the chest by ~2 inches, and add 1.5 inches to sleeve length.",
  },
  {
    q: "How does sending my artwork on WhatsApp work?",
    a: "You preview your exact placement right here in 3D. When you tap Order on WhatsApp, your specs and order summary pre-fill into the chat—simply attach your high-res PNG/SVG/AI file directly in that thread.",
  },
] as const;
