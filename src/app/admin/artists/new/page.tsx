import { saveArtist } from "@/app/admin/entity-actions";
import { requirePermission } from "@/lib/session";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import Link from "next/link";

export default async function NewArtistPage() {
  await requirePermission("music.manage");
  return (
    <div className="max-w-3xl">
      <Link href="/admin/artists" className="text-sm text-ajrak">Back to artists</Link>
      <h1 className="mt-3 font-display text-4xl">Add artist</h1>
      <form action={saveArtist} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <PicturePicker label="Artist picture" fileName="photoFile" urlName="photoUrl" />
        <PicturePicker label="Cover picture" fileName="coverFile" urlName="coverUrl" />
        <Field label="Name"><input name="name" required className={inputClass} /></Field>
        <Field label="Sindhi name"><input name="nameSd" className={inputClass} /></Field>
        <Field label="Biography"><textarea name="biography" rows={5} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Featured</label>
        <Button type="submit">Save artist</Button>
      </form>
    </div>
  );
}
