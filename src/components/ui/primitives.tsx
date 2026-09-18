import Link from "next/link";
import { cn } from "@/lib/utils";

export function Button({
  href,
  children,
  variant = "primary",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "gold" | "dark";
}) {
  const styles = {
    primary:
      "bg-ajrak text-cream hover:bg-ajrak-600 shadow-soft",
    secondary:
      "border border-ink/15 bg-white/70 text-ink hover:border-gold/60 hover:bg-white",
    ghost: "text-cream/90 hover:text-gold",
    gold: "bg-gold text-ink hover:bg-gold-300",
    dark: "bg-ink text-cream hover:bg-ink-700",
  }[variant];
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition",
    styles,
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} {...props}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "ink",
}: {
  children: React.ReactNode;
  tone?: "ink" | "ajrak" | "gold" | "sage";
}) {
  const map = {
    ink: "bg-ink/80 text-cream",
    ajrak: "bg-ajrak text-cream",
    gold: "bg-gold text-ink",
    sage: "bg-sage text-white",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em]", map[tone])}>
      {children}
    </span>
  );
}

export function Section({
  eyebrow,
  title,
  subtitle,
  action,
  children,
  dark = false,
  id,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  dark?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-16 md:py-24", dark && "bg-ink text-cream")}>
      <div className="mx-auto max-w-page px-4 md:px-6">
        {(title || eyebrow) && (
          <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              {eyebrow ? (
                <p className={cn("mb-2 text-xs uppercase tracking-[0.28em]", dark ? "text-gold" : "text-ajrak")}>
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h2 className="font-display text-3xl leading-tight md:text-5xl">{title}</h2>
              ) : null}
              {subtitle ? (
                <p className={cn("mt-3 max-w-xl text-sm md:text-base", dark ? "text-cream/70" : "text-ink/70")}>
                  {subtitle}
                </p>
              ) : null}
            </div>
            {action}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-ink/15 bg-white/50 px-6 py-16 text-center">
      <p className="font-display text-2xl">{title}</p>
      <p className="mt-2 text-sm text-ink/60">{body}</p>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-ink/70">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none ring-gold/40 focus:ring-2";
