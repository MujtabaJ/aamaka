import Link from "next/link";
import { getHomeData } from "@/lib/data";
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
import { photos } from "@/lib/photos";
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
  const data = await getHomeData();
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
            <Button href="/books" variant="secondary" className="!border-cream/20 !bg-transparent !text-cream">
              Sindhi books
            </Button>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Featured music"
        title="Latest Sindhi songs"
        subtitle="Listen to a preview. Become a member for complete songs, exclusive releases and early access."
        action={<Button href="/music" variant="secondary">All music</Button>}
      >
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

      <Section
        dark
        eyebrow="Members"
        title={dict.membership.exclusive}
        subtitle={dict.membership.previewHint}
        action={<Button href="/membership" variant="gold">Become a Member</Button>}
      >
        <div className="grid gap-6 md:grid-cols-3">
          {data.exclusive.map((song) => (
            <Link
              key={song.id}
              href={`/music/song/${song.slug}`}
              className="overflow-hidden rounded-3xl border border-cream/10"
            >
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

      <Section eyebrow="Albums" title="Featured albums" action={<Button href="/albums" variant="secondary">All albums</Button>}>
        <div className="grid gap-6 md:grid-cols-3">
          {data.albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Sindhi books"
        title="Poetry, Sufi reading and cultural titles"
        subtitle="Companions to the music — printed and digital books from the AA Maka archive."
        action={<Button href="/books" variant="secondary">All books</Button>}
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Sindhi culture shop"
        title="Ajrak, topi, rilli and heritage crafts"
        subtitle="Traditional clothing, handicrafts and cultural gifts — curated with the same care as the music."
        action={<Button href="/shop" variant="secondary">Open shop</Button>}
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Artists" title="Voices of the archive" action={<Button href="/artists" variant="secondary">All artists</Button>}>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {data.artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </Section>

      <section className="relative overflow-hidden bg-ajrak-900 py-20 text-cream">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: `url(${photos.culture})` }}
        />
        <div className="ajrak-motif absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-page px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gold">Cultural story</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl md:text-6xl">{dict.mission}</h2>
          <p className="mt-5 max-w-2xl text-cream/75">
            AA Maka Production records, preserves and shares Sindhi Sufi music, folk songs, poetry and
            cultural craft for listeners at home and across the world.
          </p>
          <Button href="/about" variant="gold" className="mt-8">
            Read our story
          </Button>
        </div>
      </section>

      <Section eyebrow="Membership" title="Unlock the full archive">
        <div className="grid gap-6 md:grid-cols-3">
          {data.plans.map((plan) => (
            <div key={plan.id} className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft">
              <p className="text-xs uppercase tracking-[0.2em] text-ajrak">{plan.interval}</p>
              <h3 className="mt-2 font-display text-3xl">{plan.name}</h3>
              <p className="mt-2 text-2xl">{formatMoney(plan.pricePaisa)}</p>
              <p className="mt-3 text-sm text-ink/70">{plan.description}</p>
              <Button href="/membership" variant="primary" className="mt-6 w-full">
                {dict.cta.becomeMember}
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Stories" title="Poetry, instruments and behind the studio">
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
    </div>
  );
}
