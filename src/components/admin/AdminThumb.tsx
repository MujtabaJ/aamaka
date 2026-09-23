import { ImageSizeHint } from "@/components/admin/ImageSizeHint";
import { type ImageSpecKey } from "@/lib/image-specs";

export function AdminThumb({
  src,
  spec,
  wide = false,
}: {
  src?: string | null;
  spec: ImageSpecKey;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "w-28 space-y-1" : "w-[4.5rem] space-y-1"}>
      <div
        className={
          wide
            ? "h-14 w-24 rounded-2xl bg-ink/10 bg-cover bg-center"
            : "h-14 w-14 rounded-2xl bg-ink/10 bg-cover bg-center"
        }
        style={{ backgroundImage: src ? `url(${src})` : undefined }}
      />
      <ImageSizeHint spec={spec} compact />
    </div>
  );
}
