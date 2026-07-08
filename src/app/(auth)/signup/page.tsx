import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Registrieren — Stempelkarte",
};

export default function SignupPage() {
  return (
    <>
      <h2 className="mb-6 text-center font-display text-2xl font-semibold tracking-tight text-ink">
        Konto erstellen
      </h2>
      <SignupForm />
    </>
  );
}
