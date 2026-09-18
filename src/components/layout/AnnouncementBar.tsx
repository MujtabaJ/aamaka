import { prisma } from "@/lib/prisma";
import Link from "next/link";

export async function AnnouncementBar() {
  const item = await prisma.announcement.findFirst({
    where: { active: true },
    orderBy: { id: "desc" },
  });
  if (!item) return null;
  const inner = (
    <p className="bg-ajrak px-4 py-2 text-center text-xs tracking-wide text-cream md:text-sm">
      {item.message}
    </p>
  );
  if (item.href) return <Link href={item.href}>{inner}</Link>;
  return inner;
}
