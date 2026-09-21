"use client";

import Link from "next/link";

export function DeleteButton({
  action,
  id,
  label = "Delete",
}: {
  action: (form: FormData) => void | Promise<void>;
  id: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm("Delete this item?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="rounded-full border border-ajrak/40 px-3 py-1.5 text-sm text-ajrak">{label}</button>
    </form>
  );
}

export function RowActions({
  editHref,
  deleteAction,
  id,
}: {
  editHref: string;
  deleteAction: (form: FormData) => void | Promise<void>;
  id: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={editHref} className="rounded-full bg-ink px-3 py-1.5 text-sm text-cream">
        Edit
      </Link>
      <DeleteButton action={deleteAction} id={id} />
    </div>
  );
}
