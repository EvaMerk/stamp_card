import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Registrieren — Stempelkarte",
};

export default function SignupPage() {
  return (
    <>
      <h2 className="mb-6 text-center text-xl font-semibold text-stone-800">
        Konto erstellen
      </h2>
      <SignupForm />
    </>
  );
}
