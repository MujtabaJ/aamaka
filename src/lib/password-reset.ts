import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function issuePasswordReset(email: string) {
  const normalized = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  await prisma.passwordResetToken.deleteMany({
    where: { OR: [{ email: normalized }, { expires: { lt: new Date() } }] },
  });
  if (!user) return;

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      email: normalized,
      token: hashResetToken(token),
      expires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  await sendMail({
    to: normalized,
    subject: "Reset your AA Maka Production password",
    text: "Use this link within one hour to choose a new password. If you did not ask for a reset, ignore this message.",
    href: `/reset-password?token=${token}`,
  });
}

export async function consumePasswordReset(token: string, password: string) {
  const row = await prisma.passwordResetToken.findUnique({
    where: { token: hashResetToken(token) },
  });
  if (!row || row.expires < new Date()) return false;
  const user = await prisma.user.findUnique({ where: { email: row.email } });
  if (!user) return false;
  const bcrypt = await import("bcryptjs");
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });
  await prisma.passwordResetToken.deleteMany({ where: { email: row.email } });
  return true;
}
