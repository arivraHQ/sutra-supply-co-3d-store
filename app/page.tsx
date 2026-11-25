import Link from "next/link";
import { HeroRail } from "@/components/HeroRail";
import {
  BulkOrdersSection,
  CraftAndFitSection,
  FaqSection,
  LookbookStrip,
  PrintStepsStrip,
} from "@/components/HomeSections";
import { BRAND, formatINR, getColorHex, getColorName, PRODUCTS } from "@/content/site";

export default function HomePage() {
  return (
    <>
      <HeroRail />

      <PrintStepsStrip />
      <CraftAndFitSection />
      <LookbookStrip />

      {/* Server-rendered Garment Ledger (real DOM HTML for SEO + progressive enhancement) */}
      <section
        aria-label="Current rail index"
        className="mx-auto max-w-[1440px] border-b-[1.5px] border-[var(--ink)] px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex flex-col justify-between gap-3 border-b-[1.5px] border-[var(--ink)] pb-5 md:flex-row md:items-end">
          <div>
            <p className="font-mono-label text-[var(--ink)]/75">
              08 GARMENTS // {BRAND.city.toUpperCase()}
            </p>
            <h2 className="mt-2 font-display text-[34px] sm:text-[56px]">
              On the Rail
            </h2>
          </div>
          <p className="max-w-md text-base text-[var(--ink)]/85">
            {BRAND.tagline} Every silhouette below hangs on the interactive
            rail above—select any row to inspect in 3D or customise your print.
          </p>
        </div>

        <ul className="divide-y-[1.5px] divide-[var(--ink)] border-b-[1.5px] border-[var(--ink)]">
          {PRODUCTS.map((product) => (
            <li
              key={product.id}
              className="grid grid-cols-1 items-center gap-3 py-4 transition-colors hover:bg-[#DFDBD0] sm:grid-cols-12 sm:gap-4 sm:px-2"
            >
              <div className="flex items-center gap-3 sm:col-span-2">
                <span className="font-mono-label text-[var(--ink)]/75">
                  {product.code}
                </span>
                <span
                  aria-label={`Default color ${getColorName(product.defaultColor)}`}
                  style={{ backgroundColor: getColorHex(product.defaultColor) }}
                  className="inline-block h-4 w-4 border-[1.5px] border-[var(--ink)]"
                />
              </div>

              <div className="sm:col-span-3">
                <h3 className="font-display text-lg sm:text-xl text-[var(--ink)]">
                  <Link
                    href={`/product/${product.slug}`}
                    className="hover:text-[var(--accent)] transition-colors"
                  >
                    {product.name}
                  </Link>
                </h3>
                <p className="mt-0.5 font-mono-label text-[11px] text-[var(--ink)]/75">
                  {product.shortSpec}
                </p>
              </div>

              <p className="text-sm text-[var(--ink)]/85 sm:col-span-4">
                {product.description}
              </p>

              <div className="flex items-center justify-between gap-4 sm:col-span-3 sm:justify-end">
                <span className="font-mono-label text-sm font-medium text-[var(--ink)]">
                  {formatINR(product.price)}
                </span>
                <Link href={`/product/${product.slug}`} className="btn-outline">
                  Open 3D →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <BulkOrdersSection />
      <FaqSection />
    </>
  );
}
