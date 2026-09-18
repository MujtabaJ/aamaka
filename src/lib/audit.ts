import { prisma } from "@/lib/prisma";

export async function audit(options: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}) {
  await prisma.auditLog.create({
    data: {
      userId: options.userId ?? undefined,
      action: options.action,
      entity: options.entity,
      entityId: options.entityId,
      metadata: JSON.stringify(options.metadata ?? {}),
      ip: options.ip,
    },
  });
}
