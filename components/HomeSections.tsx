"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  BRAND,
  CRAFT_SPECS,
  FAQ_ITEMS,
  LOOKBOOK_SHOTS,
  PRINT_STEPS,
} from "@/content/site";

export function PrintStepsStrip() {
  return (
    <section
      aria-labelledby="print-strip-title"
      className="mx-auto max-w-[1440px] border-b-[1.5px] border-[var(--ink)] px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="font-mono-label text-[var(--ink)]/75">
            Custom Print Studio
          </p>
          <h2
            id="print-strip-title"
            className="mt-2 font-display text-[34px] sm:text-[56px]"
          >
            Print it your way
          </h2>
          <p className="mt-4 max-w-sm text-base text-[var(--ink)]/85">
            From one-off festival tees to 20-piece studio batches—place your
            artwork directly on the 3D tee before you message us.
          </p>
          <Link href="/studio" className="btn-ink mt-6">
            Open Custom Studio →
          </Link>
        </div>

        <ol className="divide-y-[1.5px] divide-[var(--ink)] border-t-[1.5px] border-b-[1.5px] border-[var(--ink)] lg:col-span-8">
          {PRINT_STEPS.map((item) => (
            <li
              key={item.step}
              className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-12 sm:items-baseline"
            >
              <span className="font-mono-label text-[var(--ink)] sm:col-span-2">
                STEP // {item.step}
              </span>
              <h3 className="font-display text-2xl text-[var(--ink)] sm:col-span-4">
                {item.title}
              </h3>
              <p className="text-base text-[var(--ink)]/85 sm:col-span-6">
                {item.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function CraftAndFitSection() {
  return (
    <section
      id="craft"
      aria-labelledby="craft-title"
      className="mx-auto max-w-[1440px] border-b-[1.5px] border-[var(--ink)] px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <p className="font-mono-label text-[var(--ink)]/75">
            Mill & Block Specs // Tirupur → Kanpur
          </p>
          <h2
            id="craft-title"
            className="mt-2 font-display text-[34px] sm:text-[56px]"
          >
            240 GSM Combed Cotton
          </h2>
          <p className="mt-4 max-w-xl text-base text-[var(--ink)]/85">
            Every blank starts as single-origin ring-spun combed yarn, knitted
            tight at 240–280 GSM and enzyme-washed so it breaks in soft without
            twisting at the side seams or sagging at the collar.
          </p>

          <dl className="mt-8 divide-y-[1.5px] divide-[var(--ink)] border-y-[1.5px] border-[var(--ink)]">
            {CRAFT_SPECS.map((spec) => (
              <div
                key={spec.label}
                className="flex flex-col justify-between gap-1 py-3.5 sm:flex-row sm:items-center"
              >
                <dt className="font-mono-label text-[var(--ink)]/75">
                  {spec.label}
                </dt>
                <dd className="text-base font-medium text-[var(--ink)]">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Architectural SVG Fit Diagram comparing Regular vs Oversized */}
        <div className="border-[1.5px] border-[var(--ink)] bg-[#F1EDE4] p-5 sm:p-6 lg:col-span-6">
          <div className="mb-3 flex items-center justify-between border-b-[1.5px] border-[var(--ink)] pb-2">
            <span className="font-mono-label">
              FIG 01 // REGULAR VS OVERSIZED BLOCK
            </span>
            <span className="font-mono-label text-[var(--ink)]/75">
              SIZE M REFERENCE
            </span>
          </div>

          <svg
            role="img"
            aria-label="Technical garment schematic comparing Regular fit and Oversized drop-shoulder fit with chest, shoulder, and sleeve allowances"
            viewBox="0 0 520 340"
            className="h-auto w-full"
          >
            {/* Grid baseline marks */}
            <line
              x1="20"
              y1="300"
              x2="500"
              y2="300"
              stroke="#151515"
              strokeOpacity="0.2"
              strokeDasharray="4 4"
            />
            <line
              x1="260"
              y1="24"
              x2="260"
              y2="316"
              stroke="#151515"
              strokeOpacity="0.2"
              strokeDasharray="4 4"
            />

            {/* LEFT: Regular Fit */}
            <g transform="translate(26, 36)">
              <path
                d="M72 16 Q100 34 128 16 L154 24 L184 62 L160 76 L146 58 L146 218 L54 218 L54 58 L40 76 L16 62 L46 24 Z"
                fill="#E8E4DA"
                stroke="#151515"
                strokeWidth="2"
              />
              {/* Chest width line */}
              <line
                x1="54"
                y1="112"
                x2="146"
                y2="112"
                stroke="#151515"
                strokeWidth="1.5"
              />
              <text
                x="100"
                y="104"
                textAnchor="middle"
                fontSize="11"
                fontFamily="monospace"
                fill="#151515"
              >
                CHEST 42&quot;
              </text>
              {/* Shoulder line */}
              <line
                x1="46"
                y1="14"
                x2="154"
                y2="14"
                stroke="#7A776F"
                strokeWidth="1.5"
              />
              <text
                x="100"
                y="8"
                textAnchor="middle"
                fontSize="10"
                fontFamily="monospace"
                fill="#151515"
              >
                19.5&quot; SHOULDER
              </text>
              <text
                x="100"
                y="244"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fontFamily="sans-serif"
                fill="#151515"
              >
                REGULAR BLOCK
              </text>
            </g>

            {/* RIGHT: Oversized Fit */}
            <g transform="translate(274, 32)">
              {/* Ghost regular reference */}
              <path
                d="M72 20 Q100 38 128 20 L154 28 L184 66 L160 80 L146 62 L146 222 L54 222 L54 62 L40 80 L16 66 L46 28 Z"
                fill="none"
                stroke="#7A776F"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
              {/* Oversized block */}
              <path
                d="M68 20 Q100 42 132 20 L168 32 L212 86 L180 104 L158 76 L158 232 L42 232 L42 76 L20 104 L-12 86 L32 32 Z"
                fill="#CDB892"
                fillOpacity="0.45"
                stroke="#151515"
                strokeWidth="2"
              />
              {/* Orange accent drop-shoulder marker */}
              <line
                x1="154"
                y1="26"
                x2="168"
                y2="32"
                stroke="#FF4B1F"
                strokeWidth="3"
              />
              <circle cx="168" cy="32" r="4" fill="#FF4B1F" />
              <text
                x="182"
                y="22"
                fontSize="10"
                fontFamily="monospace"
                fill="#151515"
              >
                +2&quot; DROP
              </text>
              {/* Chest ease line */}
              <line
                x1="42"
                y1="118"
                x2="158"
                y2="118"
                stroke="#FF4B1F"
                strokeWidth="1.8"
              />
              <text
                x="100"
                y="110"
                textAnchor="middle"
                fontSize="11"
                fontFamily="monospace"
                fill="#151515"
              >
                CHEST 45&quot; (+3&quot;)
              </text>
              <text
                x="100"
                y="252"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fontFamily="sans-serif"
                fill="#151515"
              >
                OVERSIZED BLOCK
              </text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}

export function LookbookStrip() {
  return (
    <section
      id="lookbook"
      aria-labelledby="lookbook-title"
      className="mx-auto max-w-[1440px] border-b-[1.5px] border-[var(--ink)] py-14"
    >
      <div className="mb-8 flex flex-col justify-between gap-3 px-4 sm:flex-row sm:items-end sm:px-6 lg:px-8">
        <div>
          <p className="font-mono-label text-[var(--ink)]/75">
            Field Notes // Kanpur Streets
          </p>
          <h2
            id="lookbook-title"
            className="mt-2 font-display text-[34px] sm:text-[56px]"
          >
            Lookbook
          </h2>
        </div>
        <p className="font-mono-label text-[var(--ink)]/75">
          Scroll sideways → 05 Frames
        </p>
      </div>

      <div
        role="region"
        aria-label="Lookbook horizontal gallery"
        tabIndex={0}
        className="flex items-end gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8"
      >
        {LOOKBOOK_SHOTS.map((shot, idx) => {
          return (
            <figure key={shot.id} className="shrink-0">
              <Link
                href={`/product/${shot.productSlug}`}
                className="group block border-[1.5px] border-[var(--ink)] bg-[#DED9CE]"
              >
                <div
                  style={{ aspectRatio: `${shot.w} / ${shot.h}` }}
                  className={`relative overflow-hidden ${shot.frameClass}`}
                >
                  {/* Lookbook image brief: {shot.brief} */}
                  <Image
                    src={`/lookbook/shot-0${idx + 1}.jpg`}
                    alt={shot.brief}
                    width={shot.w}
                    height={shot.h}
                    className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-[1.03]"
                  />
                  <div className="absolute left-3 top-3 border-[1.5px] border-[var(--ink)] bg-[var(--bg)] px-2 py-1 font-mono-label text-[11px]">
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: shot.swatch }}
                      className="mr-1.5 inline-block h-2.5 w-2.5 border border-[var(--ink)] align-middle"
                    />
                    {`FRAME 0${idx + 1}`}
                  </div>
                </div>
              </Link>
              <figcaption className="mt-2.5 flex items-center justify-between gap-2 font-mono-label text-[11px] text-[var(--ink)]/85">
                <span>{shot.caption}</span>
                <Link
                  href={`/product/${shot.productSlug}`}
                  className="underline hover:text-[var(--accent)]"
                >
                  Inspect Tee →
                </Link>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

export function BulkOrdersSection() {
  const [orgName, setOrgName] = useState("");
  const [orderType, setOrderType] = useState("College Fest");
  const [qtyRange, setQtyRange] = useState("30–75 tees");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgName.trim()) {
      setError("Enter your name, college, startup, or shop name.");
      return;
    }
    setError("");
    const msg = [
      `Hi ${BRAND.name}, bulk order enquiry:`,
      `Name / Group: ${orgName.trim()}`,
      `Category: ${orderType}`,
      `Quantity: ${qtyRange}`,
      notes.trim() ? `Notes: ${notes.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <section
      id="bulk"
      aria-labelledby="bulk-title"
      className="mx-auto max-w-[1440px] border-b-[1.5px] border-[var(--ink)] px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="font-mono-label text-[var(--ink)]/75">
            MOQ 15 PIECES // KANPUR PRINT FLOOR
          </p>
          <h2
            id="bulk-title"
            className="mt-2 font-display text-[34px] sm:text-[56px]"
          >
            Bulk & Team Orders
          </h2>
          <p className="mt-4 text-base text-[var(--ink)]/85">
            Outfit a college fest crew, startup offsite, or neighbourhood café
            without settling for paper-thin promo tees. Mix Regular and
            Oversized silhouettes across sizes S–XXL with tiered mill pricing.
          </p>
          <ul className="mt-6 space-y-2 border-t-[1.5px] border-[var(--ink)] pt-4 font-mono-label text-[12px]">
            <li>• 15–29 Tees: Rs. 649 / blank + print</li>
            <li>• 30–99 Tees: Rs. 579 / blank + print</li>
            <li>• 100+ Tees: Custom screen separation & dispatch in 5 days</li>
          </ul>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="border-[1.5px] border-[var(--ink)] bg-[#F1EDE4] p-5 sm:p-7 lg:col-span-7"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="bulk-org"
                className="mb-1.5 block font-mono-label"
              >
                Your Name / College / Company
              </label>
              <input
                id="bulk-org"
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Rohan — IIT Kanpur Antaragni"
                className="min-h-[44px] w-full border-[1.5px] border-[var(--ink)] bg-[var(--bg)] px-3 text-base text-[var(--ink)]"
              />
            </div>

            <div>
              <label
                htmlFor="bulk-type"
                className="mb-1.5 block font-mono-label"
              >
                Order Type
              </label>
              <select
                id="bulk-type"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="min-h-[44px] w-full border-[1.5px] border-[var(--ink)] bg-[var(--bg)] px-3 text-base text-[var(--ink)]"
              >
                <option value="College Fest">College Fest</option>
                <option value="Startup Merch">Startup Merch</option>
                <option value="Shop / Cafe Uniform">Shop / Cafe Uniform</option>
                <option value="Music / Community Run">
                  Music / Community Run
                </option>
              </select>
            </div>

            <div>
              <label htmlFor="bulk-qty" className="mb-1.5 block font-mono-label">
                Estimated Quantity
              </label>
              <select
                id="bulk-qty"
                value={qtyRange}
                onChange={(e) => setQtyRange(e.target.value)}
                className="min-h-[44px] w-full border-[1.5px] border-[var(--ink)] bg-[var(--bg)] px-3 text-base text-[var(--ink)]"
              >
                <option value="15–30 tees">15–30 tees</option>
                <option value="30–75 tees">30–75 tees</option>
                <option value="75–150 tees">75–150 tees</option>
                <option value="150+ tees">150+ tees</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="bulk-notes"
                className="mb-1.5 block font-mono-label"
              >
                Colors, Print Placement & Target Date
              </label>
              <textarea
                id="bulk-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Olive oversized + black regular, chest + back screenprint, needed by 18th."
                className="w-full border-[1.5px] border-[var(--ink)] bg-[var(--bg)] p-3 text-base text-[var(--ink)]"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-3 font-mono-label text-xs text-[#A2240A]"
            >
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono-label text-[11px] text-[var(--ink)]/75">
              Opens WhatsApp ({BRAND.whatsappDisplay}) with specs prefilled
            </span>
            <button type="submit" className="btn-ink">
              Send Bulk Enquiry on WhatsApp
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="mx-auto max-w-[1440px] border-b-[1.5px] border-[var(--ink)] px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="font-mono-label text-[var(--ink)]/75">
            06 Common Questions
          </p>
          <h2
            id="faq-title"
            className="mt-2 font-display text-[34px] sm:text-[56px]"
          >
            FAQ
          </h2>
        </div>

        <div className="divide-y-[1.5px] divide-[var(--ink)] border-y-[1.5px] border-[var(--ink)] lg:col-span-8">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            const panelId = `faq-panel-${idx}`;
            return (
              <div key={item.q}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="flex min-h-[60px] w-full items-center justify-between gap-4 py-4 text-left cursor-pointer hover:text-[var(--accent)] transition-colors"
                  >
                    <span className="text-lg font-semibold text-[var(--ink)]">
                      {item.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-mono-label text-base"
                    >
                      {isOpen ? "[-]" : "[+]"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  hidden={!isOpen}
                  className="pb-5 pr-8 text-base text-[var(--ink)]/85"
                >
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
