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
    background_color: "#faf3e7", // Papier-Creme, wie --paper (Light) in globals.css
    // Standard-Akzent (Amber, wie --accent Light). Ein statisches Manifest kann
    // nicht pro Nutzer/Gerät umgefärbt werden — die In-App-Akzentwahl
    // (data-accent, siehe globals.css) betrifft dies bewusst nicht.
    theme_color: "#e07316",
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
