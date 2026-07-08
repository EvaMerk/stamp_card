import type { NextConfig } from "next";

/**
 * Bedingter statischer Export für Capacitor:
 * `NEXT_OUTPUT_MODE=export npm run build` erzeugt einen statischen Export
 * (out/), der später unverändert in die Capacitor-Shell wandert.
 * Ohne die Env-Variable läuft der normale Web-Build (mit Middleware).
 */
const isStaticExport = process.env.NEXT_OUTPUT_MODE === "export";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export" as const,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
