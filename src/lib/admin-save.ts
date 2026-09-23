import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { revalidateSite } from "@/lib/revalidate-site";

export function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).includes("NEXT_REDIRECT")
  );
}

export function finishSave(path: string): never {
  try {
    revalidateSite();
    revalidatePath(path);
  } catch {
    /* revalidation must never fail a save */
  }
  redirect(`${path}${path.includes("?") ? "&" : "?"}saved=1`);
}

export function failSave(path: string, error: unknown): never {
  const message =
    error instanceof Error && error.message
      ? error.message.replace(/^Error:\s*/, "")
      : "Could not save changes";
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message.slice(0, 180))}`);
}

export async function runAdminSave(successPath: string, work: () => Promise<void>, errorPath = successPath) {
  try {
    await work();
    finishSave(successPath);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    failSave(errorPath, error);
  }
}
