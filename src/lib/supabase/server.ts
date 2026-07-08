import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import { isSupabaseConfigured, SUPABASE_CONFIG_ERROR } from "./client";

/**
 * Supabase-Client für Server-Kontexte (Server Components).
 *
 * Hinweis: Die Kernfunktionen der App laufen bewusst komplett client-seitig
 * (Capacitor-Kompatibilität). Dieser Client existiert für optionale
 * Server-Lesezugriffe im Web-Modus.
 */
export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(SUPABASE_CONFIG_ERROR);
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll wurde aus einer Server Component aufgerufen — kann
            // ignoriert werden, wenn die Middleware die Session refresht.
          }
        },
      },
    },
  );
}
