"use client";

import { useEffect, useRef, useState } from "react";
import { IMAGE_SPECS, recommendedLine, type ImageSpecKey } from "@/lib/image-specs";

export function PicturePicker({
  fileName = "photoFile",
  urlName = "photoUrl",
  current,
  label = "Picture",
  spec = "section",
}: {
  fileName?: string;
  urlName?: string;
  current?: string | null;
  label?: string;
  spec?: ImageSpecKey;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(current || "");
  const [chosen, setChosen] = useState("");
  const [currentSize, setCurrentSize] = useState<string | null>(null);
  const guide = IMAGE_SPECS[spec];

  useEffect(() => {
    if (!preview) {
      setCurrentSize(null);
      return;
    }
    const image = new window.Image();
    image.onload = () => {
      setCurrentSize(`Current file: ${image.naturalWidth} × ${image.naturalHeight} px`);
    };
    image.onerror = () => setCurrentSize(null);
    image.src = preview;
  }, [preview]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink/70">{label}</p>
      <div
        className={`${guide.previewClass} bg-ink/10 bg-cover bg-center`}
        style={{ backgroundImage: preview ? `url(${preview})` : undefined }}
      >
        {!preview ? (
          <div className="flex h-full items-center justify-center text-sm text-ink/40">No picture</div>
        ) : null}
      </div>
      <p className="text-[11px] font-medium leading-snug text-red-600">
        {recommendedLine(spec)}
        {currentSize ? <span className="block">{currentSize}</span> : null}
      </p>
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
