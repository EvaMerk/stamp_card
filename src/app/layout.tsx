import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
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

/**
 * Blockierender Inline-Script: setzt data-theme (aufgelöst light|dark) und
 * data-accent am <html> VOR dem ersten Paint — verhindert jeden Flash der
 * falschen Farbe/des falschen Themes beim Laden/Reload.
 *
 * Muss self-contained (kein Import/Modul) sein, damit er vor dem Bundle läuft;
 * statisch-export-kompatibel (reines DOM). Die String-Literale spiegeln
 * src/lib/theme/constants.ts + accents.ts — bei Änderung dort HIER anpassen.
 */
const themeInitScript = `(function(){try{
var m=localStorage.getItem("stempelkarte-theme");
if(m!=="light"&&m!=="dark"&&m!=="system")m="system";
var a=localStorage.getItem("stempelkarte-accent");
var keys=["amber","coral","pink","violet","blau","tuerkis","gruen"];
if(keys.indexOf(a)===-1)a="amber";
var dark=m==="dark"||(m==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);
var el=document.documentElement;
el.dataset.theme=dark?"dark":"light";
el.dataset.accent=a;
}catch(e){
document.documentElement.dataset.theme="light";
document.documentElement.dataset.accent="amber";
}})();`;

export const viewport: Viewport = {
  // Browser-Chrome-/Statusleisten-Farbe: bleibt am OS-Theme (prefers-color-scheme),
  // da statisch gerendert und nicht pro Gerät/Nutzer anpassbar. Dies ist der
  // Default; die In-App-Farben folgen dagegen data-theme (manuelle Auswahl).
  // Werte = --paper (Amber-Default) aus globals.css.
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
      // Der Inline-Script unten setzt data-theme/data-accent vor der Hydration
      // → erwartete Attribut-Abweichung am <html>; hier bewusst unterdrückt.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <head>
        {/* Vor dem ersten Paint: Theme/Akzent aus localStorage anwenden. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
