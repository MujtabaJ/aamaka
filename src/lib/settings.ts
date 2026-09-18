import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";

export type SocialLinks = {
  youtube?: string;
  facebook?: string;
  tiktok?: string;
  instagram?: string;
  whatsapp?: string;
};

export type SiteSettings = {
  siteName: string;
  siteNameSd: string;
  tagline: string;
  mission: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  socials: SocialLinks;
  shippingFeePaisa: number;
  freeShippingOverPaisa: number;
  taxPercent: number;
  analytics: {
    gaMeasurementId?: string;
    metaPixelId?: string;
  };
  bankInstructions: string;
  enableCod: boolean;
  enableBankTransfer: boolean;
};

const defaults: SiteSettings = {
  siteName: "AA Maka Production",
  siteNameSd: "اي اي مڪا پروڊڪشن",
  tagline: "Sindh's music, culture and heritage — presented globally.",
  mission: "Preserving Sindhi music, poetry and culture for the next generation.",
  email: "hello@aamaka.local",
  phone: "+92 300 0000000",
  whatsapp: "",
  address: "Sindh, Pakistan",
  socials: {
    youtube: "https://www.youtube.com/@aamaka",
    facebook: "https://www.facebook.com/",
    tiktok: "https://www.tiktok.com/",
    instagram: "https://www.instagram.com/",
  },
  shippingFeePaisa: 25000,
  freeShippingOverPaisa: 500000,
  taxPercent: 0,
  analytics: {
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  },
  bankInstructions:
    process.env.BANK_TRANSFER_INSTRUCTIONS ??
    "Transfer to AA Maka Production and share the receipt with your order number.",
  enableCod: true,
  enableBankTransfer: true,
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      ...defaults,
      ...parseJson<Partial<SiteSettings>>(map.site ?? "{}", {}),
      analytics: {
        ...defaults.analytics,
        gaMeasurementId:
          process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || defaults.analytics.gaMeasurementId,
        metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || defaults.analytics.metaPixelId,
      },
    };
  } catch {
    return defaults;
  }
}

export async function saveSettings(next: SiteSettings) {
  await prisma.siteSetting.upsert({
    where: { key: "site" },
    update: { value: JSON.stringify(next) },
    create: { key: "site", value: JSON.stringify(next) },
  });
}
