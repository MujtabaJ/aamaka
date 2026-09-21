"use client";

import { useRef, useState } from "react";

export function PicturePicker({
  fileName = "photoFile",
  urlName = "photoUrl",
  current,
  label = "Picture",
}: {
  fileName?: string;
  urlName?: string;
  current?: string | null;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(current || "");
  const [chosen, setChosen] = useState("");

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink/70">{label}</p>
      <div
        className="h-52 w-52 rounded-3xl bg-ink/10 bg-cover bg-center"
        style={{ backgroundImage: preview ? `url(${preview})` : undefined }}
      >
        {!preview ? (
          <div className="flex h-full items-center justify-center text-sm text-ink/40">No picture</div>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        name={fileName}
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setChosen(file.name);
          setPreview(URL.createObjectURL(file));
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream"
      >
        Change picture
      </button>
      {chosen ? <p className="text-xs text-ink/60">Selected: {chosen}</p> : null}
      <label className="block space-y-1.5 text-sm">
        <span className="text-ink/70">Or paste an image URL</span>
        <input
          name={urlName}
          defaultValue={current ?? ""}
          placeholder="https://"
          className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm"
          onBlur={(event) => {
            if (event.target.value && !chosen) setPreview(event.target.value);
          }}
        />
      </label>
    </div>
  );
}
