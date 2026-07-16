import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

// Statische Metadaten: Der Titel wird beim Build gerendert und kann pro Route
// nicht dynamisch pro Gerät/Sprache variieren (statischer Export). Deutscher
// Default; die sichtbaren Seiteninhalte folgen der gewählten Sprache.
export const metadata: Metadata = {
  title: "Anmelden — Stempelkarte",
};

export default function LoginPage() {
  return <LoginForm />;
}
