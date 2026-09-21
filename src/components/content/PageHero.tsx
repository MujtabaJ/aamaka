import type { HomepageSection } from "@/lib/homepage";

export function PageHero({
  section,
  fallbackTitle,
}: {
  section?: HomepageSection | null;
  fallbackTitle?: string;
}) {
  const image = section?.imageUrl;
  return (
    <>
      {image ? (
        <div
          className="mb-10 h-48 overflow-hidden rounded-3xl bg-cover bg-center md:h-64"
          style={{ backgroundImage: `url(${image})` }}
        />
      ) : null}
      {section?.eyebrow ? (
        <p className="text-xs uppercase tracking-[0.28em] text-ajrak">{section.eyebrow}</p>
      ) : null}
      <h1 className="mt-3 font-display text-4xl md:text-6xl">{section?.title || fallbackTitle}</h1>
      {section?.subtitle ? <p className="mt-4 max-w-2xl text-ink/70">{section.subtitle}</p> : null}
    </>
  );
}
