import { supabase } from "./supabase";
import { AppError } from "./appError";

export interface TrendingTag {
  tag: string;
  count: number;
}

/**
 * 直近7日間の近隣人気タグを取得
 * @param lat ユーザーの緯度
 * @param lng ユーザーの経度
 * @param radiusM 検索半径（デフォルト5000m）
 * @param maxCount 取得件数（デフォルト10）
 */
export async function fetchTrendingTags(
  lat: number,
  lng: number,
  radiusM = 5000,
  maxCount = 10,
): Promise<TrendingTag[]> {
  const { data, error } = await supabase.rpc("get_trending_tags", {
    user_lat: lat,
    user_lng: lng,
    radius_m: radiusM,
    max_count: maxCount,
  });
  if (error) throw new AppError("タグの取得に失敗しました", { cause: error.message });
  return (data ?? []) as TrendingTag[];
}
