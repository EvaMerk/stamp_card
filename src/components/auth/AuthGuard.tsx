"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Client-seitiger Schutz für eingeloggte Bereiche: leitet nicht angemeldete
 * Nutzer zu /login um und zeigt während der Session-Prüfung einen Spinner.
 * Bewusst client-seitig (kein Server-Redirect) für Capacitor-Kompatibilität.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner label="Anmeldung wird geprüft …" />
      </div>
    );
  }

  return <>{children}</>;
}
