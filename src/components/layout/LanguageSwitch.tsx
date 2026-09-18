"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/dictionaries";

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const router = useRouter();
  async function setLocale(next: Locale) {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    router.refresh();
  }
  return (
    <button
      onClick={() => setLocale(locale === "en" ? "sd" : "en")}
      className="rounded-full border border-ink/15 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em]"
      aria-label="Switch language"
      type="button"
    >
      {locale === "en" ? "سنڌي" : "EN"}
    </button>
  );
}
