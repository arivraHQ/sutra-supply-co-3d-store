import type { Metadata } from "next";
import { BRAND, PRODUCTS } from "@/content/site";
import { ProductConfigurator } from "@/components/ProductConfigurator";

export const metadata: Metadata = {
  title: `Custom Print Studio | ${BRAND.name}`,
  description:
    "Design your own 240–280 GSM tee in 3D. Add stencil typography or preview a PNG/SVG logo on left chest, center chest, or back, then order on WhatsApp.",
};

export default function StudioPage() {
  return <ProductConfigurator initialProduct={PRODUCTS[0]} studioMode />;
}
