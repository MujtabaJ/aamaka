import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { Button } from "@/components/ui/primitives";
import { photos } from "@/lib/photos";

export const metadata = pageMeta({
  title: "About AA Maka Production",
  description: "Preserving Sindhi music, poetry and culture for the next generation.",
  path: "/about",
});

export default async function AboutPage() {
  const settings = await getSettings();
  const page = await prisma.sitePage.findUnique({ where: { slug: "about" } });
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <div
        className="relative mb-10 h-56 overflow-hidden rounded-3xl bg-ink bg-cover bg-center md:h-72"
        style={{ backgroundImage: `url(${photos.studio})` }}
      >
        <div className="cinema-scrim absolute inset-0" />
      </div>
      <p className="text-xs uppercase tracking-[0.28em] text-ajrak">About</p>
      <h1 className="mt-3 font-display text-5xl">{page?.title || settings.siteName}</h1>
      <div className="prose prose-aamaka mt-8 max-w-none whitespace-pre-wrap">
        {page?.body || settings.mission}
      </div>
      <div className="mt-10 flex gap-4 text-sm">
        {settings.socials.youtube ? <a href={settings.socials.youtube}>YouTube</a> : null}
        {settings.socials.facebook ? <a href={settings.socials.facebook}>Facebook</a> : null}
        {settings.socials.tiktok ? <a href={settings.socials.tiktok}>TikTok</a> : null}
        {settings.socials.instagram ? <a href={settings.socials.instagram}>Instagram</a> : null}
      </div>
      <Button href="/contact" variant="primary" className="mt-8">
        Contact the studio
      </Button>
    </div>
  );
}
