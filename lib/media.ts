export function itemPhotoUrl(itemId: string, version?: number) {
  const path = `/api/media/${encodeURIComponent(itemId)}`;
  return version ? `${path}?v=${version}` : path;
}
