import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { formatMoney } from "@/lib/money";
import { RowActions } from "@/components/admin/RowActions";
import { deleteBook } from "@/app/admin/entity-actions";

export default async function AdminBooksPage() {
  await requirePermission("content.manage");
  const books = await prisma.book.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Books</h1>
        <Link href="/admin/books/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add book</Link>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="text-ink/50"><th className="py-2">Cover</th><th>Title</th><th>Author</th><th>Price</th><th className="text-right">Actions</th></tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id} className="border-t border-ink/10">
              <td className="py-3">
                <div className="h-14 w-14 rounded-2xl bg-ink/10 bg-cover bg-center" style={{ backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : undefined }} />
              </td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{formatMoney(book.pricePaisa)}</td>
              <td><RowActions editHref={`/admin/books/${book.id}`} deleteAction={deleteBook} id={book.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
