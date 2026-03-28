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

/** 締切までの残り時間（分）。締切なしは9999、期限切れは負値 */
export function calcTimeLeft(deadline: string | null): number {
  if (!deadline) return 9999;
  return (new Date(deadline).getTime() - Date.now()) / 60000;
}

/** 投稿が期限切れかどうか */
export function isExpired(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

/** 緊急度スコア（0〜100） */
export function calcUrgencyScore(deadline: string | null): number {
  const left = calcTimeLeft(deadline);
  if (left <= 0) return 0;             // 期限切れ
  if (left <= 30) return 100;          // 30分以内
  if (left <= 60) return 80;           // 1時間以内
  if (left <= 180) return 60;          // 3時間以内
  if (left <= 1440) return 40;         // 24時間以内
  return 20;                           // それ以上
}

/** 距離スコア（0〜100） */
export function calcDistScore(distanceM: number): number {
  return Math.max(0, 100 - Math.floor(distanceM / 50));
}

/** 複合マッチスコア（距離70% + 緊急度30%） */
export function calcMatchScore(distanceM: number, deadline?: string | null): number {
  const dist = calcDistScore(distanceM);
  const urgency = deadline !== undefined ? calcUrgencyScore(deadline) : 20;
  return Math.round(dist * 0.7 + urgency * 0.3);
}
