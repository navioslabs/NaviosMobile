import { useQuery } from "@tanstack/react-query";
import { fetchTrendingTags } from "@/lib/tags";

/**
 * 直近7日間の近隣人気タグを取得
 * 位置情報が無効（0,0）の場合はクエリを実行しない
 */
export function useTrendingTags(lat: number, lng: number, maxCount = 10) {
  const hasLocation = lat !== 0 || lng !== 0;
  return useQuery({
    queryKey: ["tags", "trending", lat, lng, maxCount],
    queryFn: () => fetchTrendingTags(lat, lng, 5000, maxCount),
    enabled: hasLocation,
    staleTime: 5 * 60 * 1000,
  });
}
