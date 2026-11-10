import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "PropValue AI — AI Real Estate Valuation & Market Intelligence (Pune)",
  description: "Know the real value of every property. AI-powered property valuation, fair price analysis, and market intelligence for Indian real estate starting with Pune, Maharashtra.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col font-sans bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

