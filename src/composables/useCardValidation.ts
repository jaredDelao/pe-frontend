import type { CardBrand } from "@/types";

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function detectBrand(num: string): CardBrand {
  const n = onlyDigits(num);
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return "unknown";
}

// Si la funcion detectBran detecta que es amex entonces agrupa 4-6-5;
// si es visa, mastercadd u otra entonces 4
export function formatCardNumber(value: string): string {
  const n = onlyDigits(value);
  const brand = detectBrand(n);
  if (brand === "amex") {
    return [n.slice(0, 4), n.slice(4, 10), n.slice(10, 15)]
      .filter(Boolean)
      .join(" ");
  }
  return (n.match(/.{1,4}/g) ?? []).join(" ").slice(0, 19);
}

export function cardMaxDigits(brand: CardBrand): number {
  return brand === "amex" ? 15 : 16;
}

export function cvvLength(brand: CardBrand): number {
  return brand === "amex" ? 4 : 3;
}

export function formatExpiry(value: string): string {
  const n = onlyDigits(value).slice(0, 4);
  if (n.length <= 2) return n;
  return `${n.slice(0, 2)}/${n.slice(2)}`;
}

export function expiryValid(value: string): boolean {
  const m = value.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const last = new Date(year, month, 0, 23, 59, 59);
  return last >= now;
}

export function maskCard(num: string): string {
  const n = onlyDigits(num);
  if (n.length < 8) return n;
  const middle = "*".repeat(n.length - 8);
  const grouped =
    `${n.slice(0, 4)}${middle}${n.slice(-4)}`.match(/.{1,4}/g) ?? [];
  return grouped.join(" ");
}
