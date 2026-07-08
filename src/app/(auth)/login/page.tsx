import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Anmelden — Stempelkarte",
};

export default function LoginPage() {
  return (
    <>
      <h2 className="mb-6 text-center font-display text-2xl font-semibold tracking-tight text-ink">
        Willkommen zurück!
      </h2>
      <LoginForm />
    </>
  );
}
