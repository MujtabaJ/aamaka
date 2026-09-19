import { requirePermission } from "@/lib/session";
import { getSettings, saveSettings } from "@/lib/settings";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";

export default async function AdminSettingsPage() {
  await requirePermission("settings.manage");
  const settings = await getSettings();
  async function save(form: FormData) {
    "use server";
    await requirePermission("settings.manage");
    const current = await getSettings();
    await saveSettings({
      ...current,
      siteName: String(form.get("siteName")),
      siteNameSd: String(form.get("siteNameSd") || current.siteNameSd),
      tagline: String(form.get("tagline") || current.tagline),
      mission: String(form.get("mission") || current.mission),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      address: String(form.get("address")),
      whatsapp: String(form.get("whatsapp")),
      shippingFeePaisa: Math.round(Number(form.get("shippingFee") || 0) * 100),
      freeShippingOverPaisa: Math.round(Number(form.get("freeShipping") || 0) * 100),
      bankInstructions: String(form.get("bankInstructions")),
      socials: {
        youtube: String(form.get("youtube") || ""),
        facebook: String(form.get("facebook") || ""),
        tiktok: String(form.get("tiktok") || ""),
        instagram: String(form.get("instagram") || ""),
      },
    });
    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/about");
  }
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-4xl">Settings</h1>
      <form action={save} className="mt-6 space-y-3 rounded-3xl bg-white p-5">
        <Field label="Site name"><input name="siteName" defaultValue={settings.siteName} className={inputClass} /></Field>
        <Field label="Sindhi site name"><input name="siteNameSd" defaultValue={settings.siteNameSd} className={inputClass} /></Field>
        <Field label="Tagline"><input name="tagline" defaultValue={settings.tagline} className={inputClass} /></Field>
        <Field label="Mission / about text"><textarea name="mission" defaultValue={settings.mission} className={inputClass} rows={3} /></Field>
        <Field label="Email"><input name="email" defaultValue={settings.email} className={inputClass} /></Field>
        <Field label="Phone"><input name="phone" defaultValue={settings.phone} className={inputClass} /></Field>
        <Field label="WhatsApp"><input name="whatsapp" defaultValue={settings.whatsapp} className={inputClass} /></Field>
        <Field label="Address"><input name="address" defaultValue={settings.address} className={inputClass} /></Field>
        <Field label="YouTube"><input name="youtube" defaultValue={settings.socials.youtube} className={inputClass} /></Field>
        <Field label="Facebook"><input name="facebook" defaultValue={settings.socials.facebook} className={inputClass} /></Field>
        <Field label="TikTok"><input name="tiktok" defaultValue={settings.socials.tiktok} className={inputClass} /></Field>
        <Field label="Instagram"><input name="instagram" defaultValue={settings.socials.instagram} className={inputClass} /></Field>
        <Field label="Shipping fee (PKR)"><input name="shippingFee" type="number" defaultValue={settings.shippingFeePaisa / 100} className={inputClass} /></Field>
        <Field label="Free shipping over (PKR)"><input name="freeShipping" type="number" defaultValue={settings.freeShippingOverPaisa / 100} className={inputClass} /></Field>
        <Field label="Bank transfer instructions"><textarea name="bankInstructions" defaultValue={settings.bankInstructions} className={inputClass} rows={4} /></Field>
        <Button type="submit">Save settings</Button>
      </form>
    </div>
  );
}
