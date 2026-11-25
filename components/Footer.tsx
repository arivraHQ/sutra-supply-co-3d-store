import Link from "next/link";
import { BRAND, NAV_LINKS } from "@/content/site";

export function Footer() {
  return (
    <footer className="mx-auto max-w-[1440px] px-4 pt-12 pb-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 border-b-[1.5px] border-[var(--ink)] pb-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-mono-label text-[var(--ink)]/75">
            Workshop & Dispatch
          </p>
          <p className="mt-2 text-base font-medium text-[var(--ink)]">
            {BRAND.name}
          </p>
          <p className="mt-1 text-sm text-[var(--ink)]/80">
            {BRAND.addressLine}
          </p>
          <p className="mt-2 font-mono-label text-[12px]">
            WhatsApp Orders: {BRAND.whatsappDisplay}
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-8 gap-y-3 md:col-span-4"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono-label text-[var(--ink)] hover:text-[var(--accent)]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#bulk"
            className="font-mono-label text-[var(--ink)] hover:text-[var(--accent)]"
          >
            Bulk Orders
          </Link>
          <Link
            href="/#faq"
            className="font-mono-label text-[var(--ink)] hover:text-[var(--accent)]"
          >
            FAQ
          </Link>
        </nav>

        <div className="md:col-span-3 md:text-right">
          <p className="font-mono-label text-[var(--ink)]/75">
            Hours (Mon–Sat)
          </p>
          <p className="mt-1 font-mono-label text-[12px]">
            10:30 – 19:30 IST
          </p>
        </div>
      </div>

      <div className="py-6">
        <p className="font-display text-[56px] sm:text-[96px] lg:text-[136px] tracking-tighter leading-[0.88] text-[var(--ink)]">
          {BRAND.footerWord}
        </p>
      </div>

      {/* Arivra Design Studio Demo Credit & Disclaimer */}
      <div className="flex flex-col justify-between gap-4 border-t-[1.5px] border-[var(--ink)] pt-5 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 bg-[var(--accent)]"
          />
          <span className="font-mono-label font-medium text-[var(--ink)]">
            Arivra Design Studio — Demo Build
          </span>
        </div>

        <p className="max-w-2xl font-mono-label text-[11px] leading-relaxed text-[var(--ink)]/80 md:text-right">
          Disclaimer: This website is built strictly for demo and portfolio
          showcase purposes only. Brand catalog, Kanpur mill specs, pricing,
          and WhatsApp order links ({BRAND.whatsappDisplay}) are illustrative.
        </p>
      </div>
    </footer>
  );
}
