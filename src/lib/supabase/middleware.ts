import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";
import { isSupabaseConfigured } from "./client";

/**
 * Standard-@supabase/ssr-Muster: refresht die Auth-Session (Cookies) bei
 * jedem Request. Läuft nur im Web-Modus — im statischen Export (Capacitor)
 * gibt es keine Middleware, dort verwaltet der Browser-Client die Session
 * allein über localStorage.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Ohne echte Supabase-Konfiguration (Platzhalter-Werte) nichts tun,
  // damit die App auch ohne Projekt-Keys startbar bleibt.
  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Wichtig: getUser() nicht entfernen — der Aufruf refresht abgelaufene
  // Sessions und synchronisiert die Auth-Cookies.
  await supabase.auth.getUser();

  return supabaseResponse;
}
