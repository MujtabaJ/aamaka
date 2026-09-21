import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { saveAnnouncement } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";

export default async function NewAnnouncementPage() {
  await requirePermission("content.manage");
  return (
    <div className="max-w-3xl">
      <Link href="/admin/homepage" className="text-sm text-ajrak">Back to homepage</Link>
      <h1 className="mt-3 font-display text-4xl">Add announcement</h1>
      <form action={saveAnnouncement} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <Field label="Message"><input name="message" required className={inputClass} /></Field>
        <Field label="Link"><input name="href" className={inputClass} /></Field>
        <Button type="submit">Save announcement</Button>
      </form>
    </div>
  );
}
