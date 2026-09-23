import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { RowActions } from "@/components/admin/RowActions";
import { AdminThumb } from "@/components/admin/AdminThumb";
import { deleteArticle } from "@/app/admin/entity-actions";

export default async function AdminArticlesPage() {
  await requirePermission("content.manage");
  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Articles</h1>
        <Link href="/admin/articles/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add article</Link>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="text-ink/50"><th className="py-2">Picture</th><th>Title</th><th>Status</th><th className="text-right">Actions</th></tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id} className="border-t border-ink/10">
              <td className="py-3">
                <AdminThumb src={article.coverUrl} spec="article" />
              </td>
              <td>{article.title}</td>
              <td>{article.published ? "Published" : "Draft"}</td>
              <td><RowActions editHref={`/admin/articles/${article.id}`} deleteAction={deleteArticle} id={article.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
