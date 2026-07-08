"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  getSupabaseClient,
  isSupabaseConfigured,
  SUPABASE_CONFIG_ERROR,
} from "@/lib/supabase/client";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

/**
 * Kapselt supabase.auth.getSession + onAuthStateChange.
 * Läuft komplett client-seitig (Capacitor-kompatibel).
 */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn(SUPABASE_CONFIG_ERROR);
      setSession(null);
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user: session?.user ?? null,
    session,
    loading,
  };
}
