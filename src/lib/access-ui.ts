export function accessBadge(accessType: string, exclusive?: boolean, earlyAccess?: boolean) {
  if (earlyAccess) return { label: "Early access", tone: "gold" as const };
  if (exclusive || accessType === "premium") return { label: "Members", tone: "ajrak" as const };
  if (accessType === "paid") return { label: "Purchase", tone: "ink" as const };
  if (accessType === "free") return { label: "Free", tone: "sage" as const };
  if (accessType === "coming_soon") return { label: "Coming soon", tone: "ink" as const };
  return null;
}
