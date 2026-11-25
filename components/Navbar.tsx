"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BRAND, NAV_LINKS } from "@/content/site";
import { useCartStore } from "@/store/cart";

export function Navbar() {
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCount = mounted
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (mobileOpen && !dialog.open) {
      dialog.showModal();
    } else if (!mobileOpen && dialog.open) {
      dialog.close();
    }
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-[1.5px] border-[var(--ink)] bg-[var(--bg)]">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-display text-xl tracking-tight text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
            >
              {BRAND.wordmark}
            </Link>
            <span className="hidden font-mono-label text-[var(--ink)]/70 lg:inline-block">
              KANPUR // EST. 208012
            </span>
          </div>

          <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono-label text-[var(--ink)] transition-colors hover:text-[var(--accent)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart, ${totalCount} ${totalCount === 1 ? "item" : "items"}`}
              className="inline-flex min-h-[44px] items-center gap-2 border-[1.5px] border-[var(--ink)] bg-[var(--bg)] px-3.5 font-mono-label text-[var(--ink)] cursor-pointer transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)]"
            >
              <span>Cart</span>
              <span
                className="inline-flex min-w-[1.35rem] items-center justify-center bg-[var(--accent)] px-1 py-0.5 text-[11px] font-medium text-[var(--ink)]"
                aria-hidden="true"
              >
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-dialog"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center border-[1.5px] border-[var(--ink)] bg-[var(--bg)] px-3 font-mono-label text-[var(--ink)] cursor-pointer transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)] md:hidden"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <dialog
        id="mobile-nav-dialog"
        ref={dialogRef}
        aria-labelledby="mobile-nav-title"
        onCancel={(e) => {
          e.preventDefault();
          setMobileOpen(false);
        }}
        className="sutra-dialog md:hidden"
      >
        <div className="flex h-full w-full flex-col justify-between bg-[var(--bg)] p-5 text-[var(--ink)]">
          <div className="flex items-center justify-between border-b-[1.5px] border-[var(--ink)] pb-4">
            <h1 id="mobile-nav-title" className="font-display text-2xl">
              {BRAND.wordmark}
            </h1>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              autoFocus
              className="inline-flex min-h-[44px] items-center border-[1.5px] border-[var(--ink)] bg-[var(--ink)] px-4 font-mono-label text-[var(--bg)] cursor-pointer"
            >
              Close
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="my-auto py-8">
            <ul className="flex flex-col border-t-[1.5px] border-[var(--ink)]">
              {NAV_LINKS.map((link, idx) => (
                <li
                  key={link.href}
                  className="border-b-[1.5px] border-[var(--ink)]"
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-[64px] items-center justify-between py-3 font-display text-3xl text-[var(--ink)] transition-colors hover:text-[var(--accent)]"
                  >
                    <span>{link.label}</span>
                    <span className="font-mono-label text-[var(--ink)]/70">
                      0{idx + 1}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t-[1.5px] border-[var(--ink)] pt-4 font-mono-label text-[var(--ink)]/80">
            <p>{BRAND.name}</p>
            <p className="mt-1">{BRAND.addressLine}</p>
          </div>
        </div>
      </dialog>
    </>
  );
}
