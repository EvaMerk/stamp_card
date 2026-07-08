import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Anmelden — Stempelkarte",
};

export default function LoginPage() {
  return (
    <>
      <h2 className="mb-6 text-center text-xl font-semibold text-stone-800">
        Willkommen zurück!
      </h2>
      <LoginForm />
    </>
  );
}
