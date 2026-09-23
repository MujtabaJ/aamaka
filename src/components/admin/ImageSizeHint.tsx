import { recommendedLine, specLine, type ImageSpecKey } from "@/lib/image-specs";

export function ImageSizeHint({
  spec,
  current,
  compact = false,
}: {
  spec: ImageSpecKey;
  current?: string | null;
  compact?: boolean;
}) {
  return (
    <p className="text-[11px] font-medium leading-snug text-red-600">
      {compact ? specLine(spec) : recommendedLine(spec)}
      {current ? <span className="block">{current}</span> : null}
    </p>
  );
}
