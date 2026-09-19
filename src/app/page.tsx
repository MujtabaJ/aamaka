import Link from "next/link";
import { getHomeData } from "@/lib/data";
import { getHomepageSections, type HomepageSection } from "@/lib/homepage";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMeta, jsonLd, siteUrl } from "@/lib/seo";
import { Button, Section } from "@/components/ui/primitives";
import { SongCard } from "@/components/music/SongCard";
import { AlbumCard } from "@/components/music/AlbumCard";
import { ArtistCard } from "@/components/music/ArtistCard";
import { ProductCard } from "@/components/shop/ProductCard";
import { BookCard } from "@/components/books/BookCard";
import { formatMoney } from "@/lib/money";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta({
    title: "AA Maka Production",
    description:
      "Sindhi Sufi and folk music, cultural stories, albums and Sindhi heritage products from AA Maka Production.",
    path: "/",
  });
}

export default async function HomePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const [data, sections] = await Promise.all([getHomeData(), getHomepageSections()]);
  const hero = data.heroes[0];
  const queue = data.songs.map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.artist.name,
    coverUrl: s.coverUrl,
    accessType: s.accessType,
    exclusive: s.exclusive,
    albumId: s.albumId,
    slug: s.slug,
    genre: s.genre?.name,
    shortDescription: s.shortDescription,
  }));

  function renderSection(section: HomepageSection) {
    if (!section.visible) return null;
    const action = section.ctaLabel ? (
      <Button href={section.ctaHref || "/"} variant={section.key === "exclusive" ? "gold" : "secondary"}>
        {section.ctaLabel}
      </Button>
    ) : null;

    if (section.key === "music") {
      return (
        <Section key={section.id} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} imageUrl={section.imageUrl} action={action}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.songs.slice(0, 8).map((song) => (
              <SongCard
                key={song.id}
                queue={queue}
                song={{
                  id: song.id,
                  slug: song.slug,
                  title: song.title,
                  artist: song.artist.name,
                  coverUrl: song.coverUrl,
                  accessType: song.accessType,
                  exclusive: song.exclusive,
                  albumId: song.albumId,
                  genre: song.genre?.name,
                  shortDescription: song.shortDescription,
                }}
              />
            ))}
          </div>
        </Section>
      );
    }

    if (section.key === "exclusive") {
      return (
        <Section key={section.id} dark eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} imageUrl={section.imageUrl} action={action}>
          <div className="grid gap-6 md:grid-cols-3">
            {data.exclusive.map((song) => (
              <Link key={song.id} href={`/music/song/${song.slug}`} className="overflow-hidden rounded-3xl border border-cream/10">
                <div
                  className="h-40 bg-cover bg-center"
                  style={{ backgroundImage: song.coverUrl ? `url(${song.coverUrl})` : undefined }}
                />
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">Member only</p>
                  <p className="mt-3 font-display text-3xl">{song.title}</p>
                  <p className="mt-2 text-sm text-cream/60">{song.artist.name}</p>
                  <p className="mt-4 text-sm text-cream/70">{dict.player.locked}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      );
    }

    if (section.key === "albums") {
      return (
        <Section key={section.id} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} imageUrl={section.imageUrl} action={action}>
          <div className="grid gap-6 md:grid-cols-3">
            {data.albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </Section>
      );
    }

    if (section.key === "books") {
      return (
        <Section key={section.id} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} imageUrl={section.imageUrl} action={action}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </Section>
      );
    }

    if (section.key === "shop") {
      return (
        <Section key={section.id} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} imageUrl={section.imageUrl} action={action}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Section>
      );
    }

    if (section.key === "artists") {
      return (
        <Section key={section.id} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} imageUrl={section.imageUrl} action={action}>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {data.artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </Section>
      );
    }

    if (section.key === "membership") {
      return (
        <Section key={section.id} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} imageUrl={section.imageUrl}>
          <div className="grid gap-6 md:grid-cols-3">
            {data.plans.map((plan) => (
              <div key={plan.id} className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft">
                <p className="text-xs uppercase tracking-[0.2em] text-ajrak">{plan.interval}</p>
                <h3 className="mt-2 font-display text-3xl">{plan.name}</h3>
                <p className="mt-2 text-2xl">{formatMoney(plan.pricePaisa)}</p>
                <p className="mt-3 text-sm text-ink/70">{plan.description}</p>
                <Button href={section.ctaHref || "/membership"} variant="primary" className="mt-6 w-full">
                  {section.ctaLabel || dict.cta.becomeMember}
                </Button>
              </div>
            ))}
          </div>
        </Section>
      );
    }

    if (section.key === "stories") {
      return (
        <Section key={section.id} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} imageUrl={section.imageUrl} action={action}>
          <div className="grid gap-6 md:grid-cols-3">
            {data.articles.map((article) => (
              <Link key={article.id} href={`/stories/${article.slug}`} className="overflow-hidden rounded-3xl bg-white shadow-soft">
                {article.coverUrl ? (
                  <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${article.coverUrl})` }} />
                ) : null}
                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.16em] text-gold">Cultural story</p>
                  <h3 className="mt-3 font-display text-2xl">{article.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-ink/70">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      );
    }

    return (
      <section key={section.id} className="relative overflow-hidden bg-ajrak-900 py-20 text-cream">
        {section.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: `url(${section.imageUrl})` }}
          />
        ) : null}
        <div className="ajrak-motif absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-page px-4 md:px-6">
          {section.eyebrow ? <p className="text-xs uppercase tracking-[0.28em] text-gold">{section.eyebrow}</p> : null}
          <h2 className="mt-4 max-w-3xl font-display text-4xl md:text-6xl">{section.title}</h2>
          {section.subtitle ? <p className="mt-5 max-w-2xl text-cream/75">{section.subtitle}</p> : null}
          {section.ctaLabel ? (
            <Button href={section.ctaHref || "/about"} variant="gold" className="mt-8">
              {section.ctaLabel}
            </Button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AA Maka Production",
          url: siteUrl(),
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteUrl("/search")}?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        })}
      />
      <section className="relative min-h-[88vh] overflow-hidden bg-ink text-cream">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url(${hero?.imageUrl || "/media/covers/hero.svg"})` }}
        />
        <div className="cinema-scrim absolute inset-0" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-page flex-col justify-end px-4 pb-16 pt-28 md:px-6 md:pb-24">
          <p className="text-xs uppercase tracking-[0.32em] text-gold">
            {hero?.kicker || "AA Maka Production"}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] text-balance md:text-7xl">
            {hero?.title || "Sindh’s music, kept alive."}
          </h1>
          <p className="mt-5 max-w-xl text-base text-cream/80 md:text-lg">
            {hero?.subtitle || dict.tagline}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={hero?.ctaPrimaryHref || "/music"} variant="gold">
              {hero?.ctaPrimaryLabel || dict.cta.listenNow}
            </Button>
            <Button href={hero?.ctaSecondaryHref || "/music"} variant="secondary" className="!border-cream/20 !bg-transparent !text-cream">
              {hero?.ctaSecondaryLabel || dict.cta.exploreMusic}
            </Button>
            <Button href={hero?.ctaTertiaryHref || "/membership"} variant="primary">
              {hero?.ctaTertiaryLabel || dict.cta.becomeMember}
            </Button>
            <Button href={hero?.ctaQuaternaryHref || "/shop"} variant="ghost">
              {hero?.ctaQuaternaryLabel || dict.cta.shopCulture}
            </Button>
          </div>
        </div>
      </section>
      {sections.map(renderSection)}
    </div>
  );
}
