export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}

export function formatPrice(price: number): string {
  return `${price} ₪`;
}

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
