import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deleteAnnouncement, saveAnnouncement } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/admin/RowActions";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content.manage");
  const { id } = await params;
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/homepage" className="text-sm text-ajrak">Back to homepage</Link>
      <h1 className="mt-3 font-display text-4xl">Edit announcement</h1>
      <form action={saveAnnouncement} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={announcement.id} />
        <Field label="Message"><input name="message" defaultValue={announcement.message} required className={inputClass} /></Field>
        <Field label="Link"><input name="href" defaultValue={announcement.href ?? ""} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={announcement.active} /> Active</label>
        <Button type="submit">Save changes</Button>
      </form>
      <div className="mt-4"><DeleteButton action={deleteAnnouncement} id={announcement.id} label="Delete announcement" /></div>
    </div>
  );
}
