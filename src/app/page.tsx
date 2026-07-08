"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Einstiegsseite: leitet client-seitig weiter — eingeloggt → /dashboard,
 * sonst → /login. Client-seitig statt Server-Redirect, damit dieselbe Logik
 * im statischen Export (Capacitor) funktioniert.
 */
export default function Home() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(session ? "/dashboard" : "/login");
  }, [loading, session, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Spinner label="Einen Moment …" />
    </div>
  );
}
