import type { Metadata } from "next";
import { Archivo, Onest, DM_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/content/site";

const archivo = Archivo({
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const onest = Onest({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-onest",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND.name} — Heavyweight Tees & Custom Print Studio, Kanpur`,
  description:
    "240–280 GSM combed cotton regular and oversized tees printed in Kanpur. Browse the live 3D clothes rail, customise chest or back prints, and order on WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${onest.variable} ${dmMono.variable}`}
    >
      <body className="min-h-screen bg-[var(--bg)] text-[var(--ink)] selection:bg-[var(--accent)] selection:text-[var(--ink)]">
        <a
          href="#main-content"
          className="visually-hidden fixed left-3 top-3 z-[70] border-[1.5px] border-[var(--ink)] bg-[var(--accent)] px-4 py-2 font-mono-label text-[var(--ink)]"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <div className="paper-grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
