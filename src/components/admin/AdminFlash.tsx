"use client";

import { useSearchParams } from "next/navigation";

export function AdminFlash() {
  const params = useSearchParams();
  const error = params.get("error");
  const saved = params.get("saved");
  if (error) {
    return <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }
  if (saved) {
    return (
      <p className="mb-4 rounded-2xl bg-sage/15 px-4 py-3 text-sm text-ink">
        Saved. The public site will show the new picture immediately.
      </p>
    );
  }
  return null;
}
