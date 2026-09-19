import { Field, inputClass } from "@/components/ui/primitives";

export function ImageFields({
  label,
  urlName,
  fileName,
  url,
}: {
  label: string;
  urlName: string;
  fileName: string;
  url?: string | null;
}) {
  return (
    <div className="space-y-2">
      {url ? (
        <div
          className="h-32 w-32 rounded-2xl bg-ink/10 bg-cover bg-center"
          style={{ backgroundImage: `url(${url})` }}
          aria-label={`Current ${label}`}
        />
      ) : (
        <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-ink/5 text-xs text-ink/40">
          No picture
        </div>
      )}
      <Field label={`${label} URL`}>
        <input name={urlName} defaultValue={url ?? ""} className={inputClass} placeholder="https://..." />
      </Field>
      <Field label={`Or upload a new ${label.toLowerCase()}`}>
        <input name={fileName} type="file" accept="image/*" />
      </Field>
    </div>
  );
}
