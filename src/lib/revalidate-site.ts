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
  revalidatePath("/", "layout");
  for (const path of PUBLIC_PATHS) {
    revalidatePath(path);
  }
}
