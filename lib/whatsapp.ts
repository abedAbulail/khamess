import type { Branch, CartLine } from "@/lib/types";

export function whatsappDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function getWhatsAppUrl(phone: string, message: string) {
  const number = whatsappDigits(phone);
  const text = encodeURIComponent(message);
  if (!number) return `https://wa.me/?text=${text}`;
  return `https://wa.me/${number}?text=${text}`;
}

export function buildOrderMessage(
  branch: Branch,
  items: CartLine[],
  customerName: string,
  notes: string,
  phone = "",
) {
  const lines = items.map(
    (item) =>
      `• ${item.nameAr}${item.sizeLabel === "one" ? "" : ` (${item.sizeNameAr})`} × ${item.quantity} = ${item.price * item.quantity} ₪`,
  );
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return [
    `طلب جديد — مطاعم خميس`,
    `الفرع: ${branch.nameAr}`,
    customerName ? `الاسم: ${customerName}` : "",
    phone ? `الهاتف: ${phone}` : "",
    "",
    ...lines,
    "",
    `المجموع: ${total} ₪`,
    notes ? `ملاحظات: ${notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
