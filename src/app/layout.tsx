import type { Metadata } from "next";
import { pageMeta, jsonLd, siteUrl } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/lib/locale";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Providers } from "@/components/providers";
import "./globals.css";
import { Cormorant_Garamond, Outfit, Noto_Nastaliq_Urdu } from "next/font/google";
import type { Viewport } from "next";

export const dynamic = "force-dynamic";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const sans = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const sindhi = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sindhi",
});

export const viewport: Viewport = {
  themeColor: "#1A1210",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    ...pageMeta({
      title: settings.siteName,
      description: settings.tagline,
      path: "/",
    }),
    robots: { index: true, follow: true },
    icons: { icon: "/media/logo.svg" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const settings = await getSettings();
  const dict = getDictionary(locale);
  const dir = locale === "sd" ? "rtl" : "ltr";

  return (
    <html
      lang={locale === "sd" ? "sd" : "en"}
      dir={dir}
      className={`${display.variable} ${sans.variable} ${sindhi.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd({
            "@context": "https://schema.org",
            "@type": "MusicGroup",
            name: settings.siteName,
            url: siteUrl(),
            description: settings.mission,
            email: settings.email,
            telephone: settings.phone,
            address: settings.address,
            sameAs: Object.values(settings.socials).filter(Boolean),
          })}
        />
        {settings.analytics.gaMeasurementId ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.analytics.gaMeasurementId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.analytics.gaMeasurementId}');`,
              }}
            />
          </>
        ) : null}
      </head>
      <body className="min-h-dvh bg-cream font-sans text-ink antialiased">
        <Providers locale={locale} dict={dict}>
          <SiteChrome settings={settings} locale={locale} dict={dict}>
            {children}
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
