import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display-Schrift „Ticket & Tinte“: charaktervolle Headlines, Ziel-Titel,
// große Zahlen (variable Gewichte; CSS-Var --font-bricolage → --font-display).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stempelkarte — Deine Ziele",
  description:
    "Persönliches Ziel-Dashboard im Stempelkarten-Stil: Ziele anlegen, Stempel sammeln, Belohnungen freischalten.",
  // PWA/iOS: Titel und Verhalten, wenn die App vom Home-Bildschirm startet.
  appleWebApp: {
    capable: true,
    title: "Stempelkarte",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  // Browser-Chrome-/Statusleisten-Farbe folgt dem System-Theme:
  // Light „Creme & Tinte“ / Dark „Glow“ — Werte = --paper aus globals.css.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf3e7" },
    { media: "(prefers-color-scheme: dark)", color: "#141210" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
