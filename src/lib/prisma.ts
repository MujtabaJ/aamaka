import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function ensureServerlessSqlite() {
  if (!process.env.VERCEL) return;
  const dest = "/tmp/aamaka.db";
  if (!fs.existsSync(dest)) {
    for (const file of ["seeded.db", "dev.db"]) {
      const src = path.join(process.cwd(), "prisma", file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        break;
      }
    }
  }
  if (fs.existsSync(dest)) {
    process.env.DATABASE_URL = `file:${dest}`;
  }
}

ensureServerlessSqlite();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
