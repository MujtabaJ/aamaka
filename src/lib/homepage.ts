import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";
import { photos } from "@/lib/photos";
import { loadCmsOverlay, rememberSections } from "@/lib/cms-overlay";

export type HomepageSectionKey =
  | "music"
  | "exclusive"
  | "albums"
  | "books"
  | "shop"
  | "artists"
  | "story"
  | "membership"
  | "stories"
  | "about"
  | "faq"
  | "contact"
  | "custom";

export type HomepageSection = {
  id: string;
  key: HomepageSectionKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  visible: boolean;
  sortOrder: number;
};

export const DEFAULT_SECTIONS: HomepageSection[] = [
  {
    id: "music",
    key: "music",
    eyebrow: "Featured music",
    title: "Latest Sindhi songs",
    subtitle: "Listen to a preview. Become a member for complete songs, exclusive releases and early access.",
    imageUrl: photos.concert,
    ctaLabel: "All music",
    ctaHref: "/music",
    visible: true,
    sortOrder: 10,
  },
  {
    id: "exclusive",
    key: "exclusive",
    eyebrow: "Members",
    title: "Exclusive studio sessions",
    subtitle: "Member-only recordings stay locked for visitors. The preview is still yours to hear.",
    imageUrl: photos.listening,
    ctaLabel: "Become a Member",
    ctaHref: "/membership",
    visible: true,
    sortOrder: 20,
  },
  {
    id: "albums",
    key: "albums",
    eyebrow: "Albums",
    title: "Featured albums",
    subtitle: "Buy complete albums and keep them in your library.",
    imageUrl: photos.studio,
    ctaLabel: "All albums",
    ctaHref: "/albums",
    visible: true,
    sortOrder: 30,
  },
  {
    id: "books",
    key: "books",
    eyebrow: "Sindhi books",
    title: "Poetry, Sufi reading and cultural titles",
    subtitle: "Companions to the music — printed and digital books from the AA Maka archive.",
    imageUrl: photos.libraryHall,
    ctaLabel: "All books",
    ctaHref: "/books",
    visible: true,
    sortOrder: 40,
  },
  {
    id: "shop",
    key: "shop",
    eyebrow: "Sindhi culture shop",
    title: "Ajrak, topi, rilli and heritage crafts",
    subtitle: "Traditional clothing, handicrafts and cultural gifts — curated with the same care as the music.",
    imageUrl: photos.textilePattern,
    ctaLabel: "Open shop",
    ctaHref: "/shop",
    visible: true,
    sortOrder: 50,
  },
  {
    id: "artists",
    key: "artists",
    eyebrow: "Artists",
    title: "Voices of the archive",
    subtitle: "Singers and musicians recorded and presented by AA Maka Production.",
    imageUrl: photos.mic,
    ctaLabel: "All artists",
    ctaHref: "/artists",
    visible: true,
    sortOrder: 60,
  },
  {
    id: "story",
    key: "story",
    eyebrow: "Cultural story",
    title: "Preserving Sindhi music, poetry and culture for the next generation.",
    subtitle:
      "AA Maka Production records, preserves and shares Sindhi Sufi music, folk songs, poetry and cultural craft for listeners at home and across the world.",
    imageUrl: photos.culture,
    ctaLabel: "Read our story",
    ctaHref: "/about",
    visible: true,
    sortOrder: 70,
  },
  {
    id: "membership",
    key: "membership",
    eyebrow: "Membership",
    title: "Unlock the full archive",
    subtitle: "Members hear complete recordings, exclusive studio work and early-access releases.",
    imageUrl: photos.concert,
    ctaLabel: "Become a member",
    ctaHref: "/membership",
    visible: true,
    sortOrder: 80,
  },
  {
    id: "stories",
    key: "stories",
    eyebrow: "Stories",
    title: "Poetry, instruments and behind the studio",
    subtitle: "History of Sindhi music, Sufi poetry and studio notes from the archive.",
    imageUrl: photos.writing,
    ctaLabel: "All stories",
    ctaHref: "/stories",
    visible: true,
    sortOrder: 90,
  },
  {
    id: "about",
    key: "about",
    eyebrow: "About",
    title: "About AA Maka Production",
    subtitle: "Preserving Sindhi music, poetry and culture for the next generation.",
    imageUrl: photos.studio,
    ctaLabel: "Contact the studio",
    ctaHref: "/contact",
    visible: false,
    sortOrder: 100,
  },
  {
    id: "faq",
    key: "faq",
    eyebrow: "Help",
    title: "Frequently asked questions",
    subtitle: "Answers about membership, listening, shipping and orders.",
    imageUrl: photos.listening,
    ctaLabel: "Contact us",
    ctaHref: "/contact",
    visible: false,
    sortOrder: 110,
  },
  {
    id: "contact",
    key: "contact",
    eyebrow: "Contact",
    title: "Write to the studio",
    subtitle: "Music licensing, orders and studio enquiries.",
    imageUrl: photos.listening,
    ctaLabel: "Send a message",
    ctaHref: "/contact",
    visible: false,
    sortOrder: 120,
  },
];

function mergeSections(saved: HomepageSection[] | undefined): HomepageSection[] {
  const incoming = Array.isArray(saved) ? saved : [];
  const byId = new Map(incoming.map((section) => [section.id || section.key, section]));
  const merged = DEFAULT_SECTIONS.map((fallback) => {
    const override = byId.get(fallback.id);
    return override ? { ...fallback, ...override, id: fallback.id, key: fallback.key } : fallback;
  });
  const extras = incoming.filter(
    (section) => section.key === "custom" && !DEFAULT_SECTIONS.some((fallback) => fallback.id === section.id),
  );
  return [...merged, ...extras].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  try {
    const overlay = await loadCmsOverlay();
    if (overlay.sections?.length) return mergeSections(overlay.sections);
    const row = await prisma.siteSetting.findUnique({ where: { key: "homepage" } });
    const parsed = parseJson<{ sections?: HomepageSection[] }>(row?.value, {});
    return mergeSections(parsed.sections);
  } catch {
    return DEFAULT_SECTIONS;
  }
}

export async function getHomepageSection(id: string) {
  const sections = await getHomepageSections();
  return sections.find((section) => section.id === id) ?? DEFAULT_SECTIONS.find((section) => section.id === id);
}

export async function saveHomepageSections(sections: HomepageSection[]) {
  await rememberSections(sections);
  try {
    await prisma.siteSetting.upsert({
      where: { key: "homepage" },
      update: { value: JSON.stringify({ sections }) },
      create: { key: "homepage", value: JSON.stringify({ sections }) },
    });
  } catch {
    /* durable overlay already has the latest homepage pictures */
  }
}
