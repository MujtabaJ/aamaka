import { prisma } from "@/lib/prisma";

export type AccessType =
  | "free"
  | "preview"
  | "premium"
  | "paid"
  | "early"
  | "hidden"
  | "coming_soon";

export async function getActiveSubscription(userId?: string | null) {
  if (!userId) return null;
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["active", "trial"] },
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function userCanAccessFull(options: {
  userId?: string | null;
  accessType: string;
  exclusive?: boolean;
  earlyAccess?: boolean;
  published?: boolean;
  scheduledAt?: Date | null;
  albumId?: string | null;
  songId?: string | null;
}) {
  const {
    userId,
    accessType,
    exclusive,
    earlyAccess,
    published = true,
    scheduledAt,
    albumId,
    songId,
  } = options;

  if (!published) return { ok: false, reason: "unpublished" as const };
  if (accessType === "hidden") return { ok: false, reason: "hidden" as const };

  const now = new Date();
  const sub = await getActiveSubscription(userId);
  const isMember = Boolean(sub);

  if (scheduledAt && scheduledAt > now) {
    if (!(earlyAccess && isMember)) {
      return { ok: false, reason: "scheduled" as const };
    }
  }

  if (accessType === "free") return { ok: true, reason: "free" as const };
  if (accessType === "coming_soon") {
    return { ok: false, reason: "coming_soon" as const };
  }

  if (userId) {
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        OR: [
          albumId ? { albumId } : undefined,
          songId ? { songId } : undefined,
        ].filter(Boolean) as { albumId?: string; songId?: string }[],
      },
    });
    if (entitlement) return { ok: true, reason: "purchased" as const };
  }

  if ((accessType === "premium" || exclusive || earlyAccess || accessType === "early") && isMember) {
    return { ok: true, reason: "member" as const };
  }

  if (accessType === "preview" && isMember) {
    return { ok: true, reason: "member" as const };
  }

  return { ok: false, reason: "locked" as const };
}
