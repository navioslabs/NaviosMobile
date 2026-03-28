/**
 * 位置情報関連の定数
 *
 * DEFAULT_RADIUS はリリースフェーズに応じて変更する:
 *   初期（ユーザー少）: 50000 (50km / 県内レベル)
 *   成長期:            10000 (10km)
 *   安定期:             5000 (5km / 徒歩圏)
 */
export const DEFAULT_RADIUS = 50000;

/** 位置情報の自動再取得閾値（メートル） */
export const REFETCH_THRESHOLD_M = 100;
