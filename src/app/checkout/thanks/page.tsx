import { pageMeta } from "@/lib/seo";
import { Button } from "@/components/ui/primitives";

export const metadata = pageMeta({
  title: "Order received",
  description: "Thank you for your AA Maka Production order.",
  path: "/checkout/thanks",
});

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">AA Maka Production</p>
      <h1 className="mt-4 font-display text-5xl">Order received</h1>
      <p className="mt-4 text-ink/70">
        {order
          ? `Your order ${order} has been created. Digital access starts after payment confirmation. Cash-on-delivery orders are processed for shipping.`
          : "Your order has been created."}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button href="/account/orders" variant="primary">
          View orders
        </Button>
        <Button href="/music" variant="secondary">
          Continue listening
        </Button>
      </div>
    </div>
  );
}
