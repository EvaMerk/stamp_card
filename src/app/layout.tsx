import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
  // Browser-Chrome-/Statusleisten-Farbe (Amber-Akzent, wie theme_color im Manifest)
  themeColor: "#d97706",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
