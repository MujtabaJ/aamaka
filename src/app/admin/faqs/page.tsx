import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { RowActions } from "@/components/admin/RowActions";
import { deleteFaq } from "@/app/admin/entity-actions";

export default async function AdminFaqsPage() {
  await requirePermission("content.manage");
  const faqs = await prisma.faq.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">FAQs</h1>
        <Link href="/admin/faqs/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add FAQ</Link>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="text-ink/50"><th className="py-2">Question</th><th>Status</th><th className="text-right">Actions</th></tr>
        </thead>
        <tbody>
          {faqs.map((faq) => (
            <tr key={faq.id} className="border-t border-ink/10">
              <td className="py-3">{faq.question}</td>
              <td>{faq.published ? "Published" : "Hidden"}</td>
              <td><RowActions editHref={`/admin/faqs/${faq.id}`} deleteAction={deleteFaq} id={faq.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
