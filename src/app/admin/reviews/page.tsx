import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { revalidatePath } from "next/cache";

export default async function AdminReviewsPage() {
  await requirePermission("reviews.manage");
  const reviews = await prisma.review.findMany({ include: { user: true, product: true }, orderBy: { createdAt: "desc" } });
  async function moderate(form: FormData) {
    "use server";
    await requirePermission("reviews.manage");
    await prisma.review.update({
      where: { id: String(form.get("id")) },
      data: { status: String(form.get("status")), featured: form.get("featured") === "on" },
    });
    revalidatePath("/admin/reviews");
  }
  return (
    <div>
      <h1 className="font-display text-4xl">Reviews</h1>
      <ul className="mt-6 space-y-3">
        {reviews.length === 0 ? <p className="text-sm text-ink/60">No reviews yet.</p> : null}
        {reviews.map((r) => (
          <li key={r.id} className="rounded-2xl bg-white p-4">
            <p className="text-sm">{r.user.name} on {r.product.name} · {r.rating}/5 · {r.status}</p>
            <p className="mt-1 text-sm text-ink/70">{r.body}</p>
            <form action={moderate} className="mt-3 flex gap-2 text-sm">
              <input type="hidden" name="id" value={r.id} />
              <select name="status" defaultValue={r.status} className="rounded-lg border border-ink/10 px-2">
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
                <option value="hidden">hidden</option>
              </select>
              <button className="rounded-full bg-ink px-3 py-1 text-cream">Save</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
