import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";
import { Button, Field, inputClass } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function ReviewForm({ productId, slug }: { productId: string; slug: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <p className="mt-4 text-sm text-ink/60">
        <Link href={`/login?callbackUrl=/shop/${slug}`} className="text-ajrak">Sign in</Link> to leave a review.
      </p>
    );
  }

  async function submit(form: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) redirect(`/login?callbackUrl=/shop/${slug}`);
    const parsed = reviewSchema.safeParse({
      productId: form.get("productId"),
      rating: form.get("rating"),
      body: form.get("body"),
    });
    if (!parsed.success) return;
    await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: parsed.data.productId,
        rating: parsed.data.rating,
        body: parsed.data.body,
        status: "pending",
      },
    });
    revalidatePath(`/shop/${slug}`);
    revalidatePath("/admin/reviews");
  }

  return (
    <form action={submit} className="mt-6 max-w-xl space-y-3 rounded-3xl bg-white p-5 shadow-soft">
      <input type="hidden" name="productId" value={productId} />
      <p className="text-sm text-ink/60">Reviews appear after a moderator approves them.</p>
      <Field label="Rating">
        <select name="rating" defaultValue="5" className={inputClass}>
          <option value="5">5 — excellent</option>
          <option value="4">4 — good</option>
          <option value="3">3 — fine</option>
          <option value="2">2 — poor</option>
          <option value="1">1 — bad</option>
        </select>
      </Field>
      <Field label="Your review">
        <textarea name="body" required minLength={8} rows={4} className={inputClass} />
      </Field>
      <Button type="submit">Submit review</Button>
    </form>
  );
}
