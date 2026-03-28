/**
 * 距離をフォーマットする（m/km）
 * @param d - メートル単位の距離
 */
export const distLabel = (d: number): string => {
  if (d < 100) return `${Math.round(d)}m`;
  if (d < 1000) return `${Math.round(d / 10) * 10}m`;
  if (d < 10000) return `${(d / 1000).toFixed(1)}km`;
  return `${Math.round(d / 1000)}km`;
};

/** 2点間の距離をメートルで返す（Haversine公式） */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
