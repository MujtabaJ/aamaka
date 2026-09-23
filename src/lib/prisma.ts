import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function copyWritable(src: string, dest: string) {
  fs.writeFileSync(dest, fs.readFileSync(src));
  try {
    fs.chmodSync(dest, 0o666);
  } catch {
    /* /tmp files are writable by the process that created them */
  }
}

function serverlessDatabaseUrl() {
  if (!process.env.VERCEL) return process.env.DATABASE_URL;
  const dest = "/tmp/aamaka.db";
  const missing = !fs.existsSync(dest) || fs.statSync(dest).size === 0;
  if (missing) {
    for (const file of ["seeded.db", "dev.db"]) {
      const src = path.join(process.cwd(), "prisma", file);
      if (fs.existsSync(src)) {
        copyWritable(src, dest);
        break;
      }
    }
  }
  if (fs.existsSync(dest)) {
    try {
      fs.accessSync(dest, fs.constants.W_OK);
    } catch {
      copyWritable(dest, dest);
    }
    return `file:${dest}`;
  }
  return process.env.DATABASE_URL;
}

const databaseUrl = serverlessDatabaseUrl();
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
  });

globalForPrisma.prisma = prisma;
