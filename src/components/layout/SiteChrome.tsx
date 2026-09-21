import { headers } from "next/headers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import type { SiteSettings } from "@/lib/settings";

export async function SiteChrome({
  children,
  settings,
  locale,
  dict,
}: {
  children: React.ReactNode;
  settings: SiteSettings;
  locale: Locale;
  dict: Dictionary;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || headerList.get("next-url") || "";
  if (pathname.startsWith("/admin") || pathname.includes("/admin/")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AnnouncementBar />
      <Header settings={settings} dict={dict} locale={locale} />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer settings={settings} dict={dict} />
      <MusicPlayer />
      <MobileNav dict={dict} />
    </div>
  );
}
