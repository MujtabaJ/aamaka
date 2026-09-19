import { pageMeta } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { Button, Field, inputClass } from "@/components/ui/primitives";
import { getHomepageSection } from "@/lib/homepage";

export const metadata = pageMeta({
  title: "Contact",
  description: "Contact AA Maka Production for music, licensing, orders and studio enquiries.",
  path: "/contact",
});

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const [settings, section] = await Promise.all([getSettings(), getHomepageSection("contact")]);
  const { sent } = await searchParams;
  return (
    <div className="mx-auto grid max-w-page gap-10 px-4 py-16 md:grid-cols-2 md:px-6">
      <div>
        {section?.imageUrl ? (
          <div
            className="mb-8 h-40 overflow-hidden rounded-3xl bg-cover bg-center"
            style={{ backgroundImage: `url(${section.imageUrl})` }}
          />
        ) : null}
        <p className="text-xs uppercase tracking-[0.28em] text-ajrak">{section?.eyebrow || "Contact"}</p>
        <h1 className="mt-3 font-display text-5xl">{section?.title || "Write to the studio"}</h1>
        {section?.subtitle ? <p className="mt-3 text-ink/70">{section.subtitle}</p> : null}
        <p className="mt-4 text-ink/70">{settings.address}</p>
        <p className="mt-2">{settings.email}</p>
        <p>{settings.phone}</p>
        {settings.whatsapp ? <p className="mt-2">WhatsApp: {settings.whatsapp}</p> : null}
      </div>
      <form action="/api/contact" method="post" className="space-y-4 rounded-3xl bg-white p-6 shadow-soft">
        {sent ? <p className="text-sm text-sage">Message received. We will reply from the studio.</p> : null}
        <Field label="Name">
          <input name="name" required className={inputClass} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field label="Phone">
          <input name="phone" className={inputClass} />
        </Field>
        <Field label="Subject">
          <input name="subject" required className={inputClass} />
        </Field>
        <Field label="Message">
          <textarea name="message" required rows={5} className={inputClass} />
        </Field>
        <Button type="submit" variant="primary">
          Send message
        </Button>
      </form>
    </div>
  );
}
