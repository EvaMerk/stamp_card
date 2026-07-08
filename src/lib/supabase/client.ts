import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const PLACEHOLDER_MARKERS = ["DEIN-PROJEKT", "DEIN_SUPABASE_ANON_KEY"];

/**
 * true, sobald echte Supabase-Zugangsdaten in .env.local eingetragen sind
 * (statt der Platzhalter aus .env.local.example).
 */
export function isSupabaseConfigured(): boolean {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  return !PLACEHOLDER_MARKERS.some(
    (marker) =>
      SUPABASE_URL.includes(marker) || SUPABASE_ANON_KEY.includes(marker),
  );
}

export const SUPABASE_CONFIG_ERROR =
  "Supabase ist noch nicht konfiguriert. Bitte lege ein Supabase-Projekt an und trage NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local ein (Vorlage: .env.local.example).";

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Browser-Client als Lazy-Singleton. Alle Auth- und Datenzugriffe laufen
 * client-seitig über diesen Client (Capacitor-kompatibel: keine Server
 * Actions, keine Route Handlers).
 *
 * Wirft eine verständliche deutsche Fehlermeldung, wenn noch die
 * Platzhalter-Werte aus .env.local.example eingetragen sind — aber erst bei
 * tatsächlicher Verwendung, damit Build und Dev-Server ohne echtes
 * Supabase-Projekt funktionieren.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!isSupabaseConfigured()) {
    throw new Error(SUPABASE_CONFIG_ERROR);
  }
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      SUPABASE_URL!,
      SUPABASE_ANON_KEY!,
    );
  }
  return browserClient;
}
