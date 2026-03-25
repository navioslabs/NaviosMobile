/**
 * 表示用ヘルパー関数
 */

/** 経過時間テキスト */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}分前`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
}

/** 混雑度ラベル */
export function crowdLabel(crowd: string | null): string {
  if (crowd === "crowded") return "混雑";
  if (crowd === "moderate") return "やや混み";
  if (crowd === "empty") return "空いてる";
  return "";
}

/** 距離ベースのマッチスコア（0〜100） */
export function calcMatchScore(distanceM: number): number {
  return Math.max(0, 100 - Math.floor(distanceM / 50));
}

/** 締切までの残り時間（分）。締切なしは9999 */
export function calcTimeLeft(deadline: string | null): number {
  if (!deadline) return 9999;
  return Math.max(0, (new Date(deadline).getTime() - Date.now()) / 60000);
}
