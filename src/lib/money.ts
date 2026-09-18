export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? "PKR";

export function paisaToRupees(paisa: number) {
  return paisa / 100;
}

export function rupeesToPaisa(rupees: number) {
  return Math.round(rupees * 100);
}

export function formatMoney(paisa: number, currency = CURRENCY) {
  const amount = paisaToRupees(paisa);
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-PK")}`;
  }
}

export function salePercent(pricePaisa: number, salePaisa?: number | null) {
  if (!salePaisa || salePaisa >= pricePaisa || pricePaisa <= 0) return null;
  return Math.round(((pricePaisa - salePaisa) / pricePaisa) * 100);
}

export function effectivePrice(pricePaisa: number, salePaisa?: number | null) {
  if (salePaisa != null && salePaisa > 0 && salePaisa < pricePaisa) return salePaisa;
  return pricePaisa;
}
