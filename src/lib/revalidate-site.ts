import { revalidatePath } from "next/cache";

const PUBLIC_PATHS = [
  "/",
  "/music",
  "/albums",
  "/artists",
  "/books",
  "/shop",
  "/stories",
  "/membership",
  "/about",
  "/faq",
  "/contact",
];

export function revalidateSite() {
  try {
    revalidatePath("/", "layout");
    for (const path of PUBLIC_PATHS) {
      revalidatePath(path);
    }
  } catch {
    /* a cache miss must not fail an admin save */
  }
}
