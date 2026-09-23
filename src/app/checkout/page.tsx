import { auth } from "@/lib/auth";
import { getCart, summarizeCart } from "@/lib/cart";
import { availableMethods } from "@/lib/payments";
import { getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/money";
import { Button, Field, inputClass } from "@/components/ui/primitives";
import { pageMeta } from "@/lib/seo";
import { redirect } from "next/navigation";

export const metadata = pageMeta({
  title: "Checkout",
  description: "Complete your AA Maka Production order.",
  path: "/checkout",
});

export default async function CheckoutPage() {
  const session = await auth();
  const cart = await getCart(session?.user?.id);
  const summary = await summarizeCart(cart);
  if (summary.lines.length === 0) redirect("/cart");
  const settings = await getSettings();
  const methods = availableMethods({ hasPhysical: summary.hasPhysical, hasDigital: summary.hasDigital });

  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl">Checkout</h1>
      <form action="/api/checkout" method="post" className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4 rounded-3xl bg-white p-6">
          <Field label="Email">
            <input name="email" type="email" required defaultValue={session?.user?.email ?? ""} className={inputClass} />
          </Field>
          <Field label="Phone">
            <input name="phone" required className={inputClass} />
          </Field>
          {summary.hasPhysical ? (
            <>
              <Field label="Full name">
                <input name="fullName" required defaultValue={session?.user?.name ?? ""} className={inputClass} />
              </Field>
              <Field label="Address">
                <input name="line1" required className={inputClass} />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="City">
                  <input name="city" required className={inputClass} />
                </Field>
                <Field label="Province">
                  <input name="province" required defaultValue="Sindh" className={inputClass} />
                </Field>
              </div>
            </>
          ) : null}
          <fieldset className="space-y-2">
            <legend className="text-sm text-ink/70">Payment</legend>
            {methods.map((method) => (
              <label key={method.id} className="flex items-start gap-3 rounded-2xl border border-ink/10 p-3">
                <input type="radio" name="paymentMethod" value={method.id} disabled={!method.enabled} defaultChecked={method.enabled && method.id === "bank_transfer"} />
                <span>
                  <span className="block font-medium">{method.label}</span>
                  <span className="text-sm text-ink/60">{method.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
          {settings.bankInstructions ? (
            <pre className="whitespace-pre-wrap rounded-2xl bg-cream p-4 text-xs text-ink/70">{settings.bankInstructions}</pre>
          ) : null}
          <Field label="Order notes">
            <textarea name="notes" className={inputClass} rows={3} />
          </Field>
          <Button type="submit" variant="primary">
            Place order · {formatMoney(summary.totalPaisa)}
          </Button>
        </div>
        <aside className="h-fit rounded-3xl bg-ink p-6 text-cream">
          {summary.lines.map((line) => (
            <p key={line.id} className="mb-2 flex justify-between text-sm">
              <span>{line.title}</span>
              <span>{formatMoney(line.totalPaisa)}</span>
            </p>
          ))}
          <div className="gold-rule my-4" />
          <p className="font-display text-3xl">{formatMoney(summary.totalPaisa)}</p>
        </aside>
      </form>
    </div>
  );
}
