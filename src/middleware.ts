import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Supabase Session-Refresh (nur Web). Beim statischen Export für Capacitor
 * (NEXT_OUTPUT_MODE=export) wird diese Datei nicht Teil des Builds —
 * dort übernimmt der Browser-Client die Session-Verwaltung.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Alle Pfade außer:
     * - _next/static (statische Dateien)
     * - _next/image (Bild-Optimierung)
     * - favicon.ico und statische Assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
