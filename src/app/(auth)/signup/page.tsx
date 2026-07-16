import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

// Statischer Default-Titel (siehe Kommentar in login/page.tsx).
export const metadata: Metadata = {
  title: "Registrieren — Stempelkarte",
};

export default function SignupPage() {
  return <SignupForm />;
}
