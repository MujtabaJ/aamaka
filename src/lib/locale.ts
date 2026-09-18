import { cookies } from "next/headers";
import type { Locale } from "@/i18n/dictionaries";

export const LOCALE_COOKIE = "aamaka_lang";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  return jar.get(LOCALE_COOKIE)?.value === "sd" ? "sd" : "en";
}

export function pickLocale<T extends { title: string; titleSd?: string | null }>(
  item: T,
  locale: Locale,
) {
  if (locale === "sd" && item.titleSd) return item.titleSd;
  return item.title;
}
