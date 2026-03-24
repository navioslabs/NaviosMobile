/**
 * 距離をフォーマットする（m/km）
 * @param d - メートル単位の距離
 */
export const distLabel = (d: number): string =>
  d < 1000 ? `${d}m` : `${(d / 1000).toFixed(1)}km`;
