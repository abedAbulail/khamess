const PREFIX = "khamis-last-order-";

export type LastOrder = {
  id: string;
  name: string;
  total: number;
  whatsapp: string;
  message: string;
};

export function saveLastOrder(branchSlug: string, order: LastOrder) {
  sessionStorage.setItem(`${PREFIX}${branchSlug}`, JSON.stringify(order));
}

export function readLastOrder(branchSlug: string): LastOrder | null {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${branchSlug}`);
    if (!raw) return null;
    return JSON.parse(raw) as LastOrder;
  } catch {
    return null;
  }
}
