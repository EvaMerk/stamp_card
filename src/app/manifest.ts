import type { MetadataRoute } from "next";

/**
 * PWA-Manifest (Metadata-Route): macht die App am Handy installierbar
 * („Zum Home-Bildschirm hinzufügen"). Wird beim Build statisch zu
 * /manifest.webmanifest gerendert — funktioniert auch im Export-Build.
 * Die Icon-PNGs liegen in public/icons/ (generiert aus einem SVG-Entwurf,
 * Stempelabdruck in Amber/Creme); die maskable-Variante hält die
 * Android-Safe-Zone ein.
 */

// Pflicht für `output: "export"`: Route beim Build statisch rendern.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stempelkarte",
    short_name: "Stempelkarte",
    description:
      "Persönliches Ziel-Tracking im Stempelkarten-Stil: Stempel sammeln, Karten füllen, Belohnungen freischalten.",
    lang: "de",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fdf8f0", // Creme, wie --background in globals.css
    theme_color: "#d97706", // Amber-600, Akzentfarbe der App
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
