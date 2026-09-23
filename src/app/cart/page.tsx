import { auth } from "@/lib/auth";
import { getCart, summarizeCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/primitives";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Cart",
  description: "Your AA Maka Production cart.",
  path: "/cart",
});

export default async function CartPage() {
  const session = await auth();
  const cart = await getCart(session?.user?.id);
  const summary = await summarizeCart(cart);

  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl">Cart</h1>
      {summary.lines.length === 0 ? (
        <p className="mt-8 text-ink/70">Your cart is empty.</p>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {summary.lines.map((line) => (
              <div key={line.id} className="flex items-center gap-4 rounded-3xl bg-white p-4">
                <div className="h-20 w-20 rounded-2xl bg-sand bg-cover bg-center" style={{ backgroundImage: line.image ? `url(${line.image})` : undefined }} />
                <div className="flex-1">
                  <p className="font-display text-xl">{line.title}</p>
                  <p className="text-sm text-ink/60">{formatMoney(line.unitPaisa)}</p>
                </div>
                <form action="/api/cart/update" method="post" className="flex items-center gap-2">
                  <input type="hidden" name="itemId" value={line.id} />
                  <input name="quantity" type="number" min={1} defaultValue={line.quantity} className="w-16 rounded-lg border border-ink/10 px-2 py-1 text-sm" />
                  <button className="text-sm">Update</button>
                </form>
                <form action="/api/cart/update" method="post">
                  <input type="hidden" name="itemId" value={line.id} />
                  <input type="hidden" name="action" value="remove" />
                  <button className="text-sm text-ajrak">Remove</button>
                </form>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-3xl bg-ink p-6 text-cream">
            <p className="text-sm text-cream/60">Subtotal</p>
            <p>{formatMoney(summary.subtotalPaisa)}</p>
            <p className="mt-3 text-sm text-cream/60">Discount</p>
            <p>{formatMoney(summary.discountPaisa)}</p>
            <p className="mt-3 text-sm text-cream/60">Shipping</p>
            <p>{formatMoney(summary.shippingPaisa)}</p>
            <p className="mt-4 font-display text-3xl">{formatMoney(summary.totalPaisa)}</p>
            <form action="/api/cart/coupon" method="post" className="mt-4 flex gap-2">
              <input name="code" placeholder="Coupon" className="w-full rounded-full border border-cream/20 bg-transparent px-3 py-2 text-sm" />
              <button className="rounded-full bg-gold px-3 text-sm text-ink">Apply</button>
            </form>
            <Button href="/checkout" variant="gold" className="mt-6 w-full">
              Checkout
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
