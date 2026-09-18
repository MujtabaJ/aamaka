"use client";

import { SessionProvider } from "next-auth/react";
import { PlayerProvider } from "@/components/music/PlayerProvider";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import { createContext, useContext } from "react";

const I18nContext = createContext<{ locale: Locale; dict: Dictionary }>({
  locale: "en",
  dict: {} as Dictionary,
});

export function useI18n() {
  return useContext(I18nContext);
}

export function Providers({
  children,
  locale,
  dict,
}: {
  children: React.ReactNode;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <SessionProvider>
      <I18nContext.Provider value={{ locale, dict }}>
        <PlayerProvider>{children}</PlayerProvider>
      </I18nContext.Provider>
    </SessionProvider>
  );
}
