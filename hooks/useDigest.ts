import { useQuery } from "@tanstack/react-query";
import { fetchDailyDigest } from "@/lib/digest";
import { useLocationStore } from "@/stores/locationStore";

/** デイリーダイジェスト取得（日付でキャッシュキーを分離） */
export function useDigest() {
  const { lat, lng } = useLocationStore();

  return useQuery({
    queryKey: ["daily-digest", new Date().toDateString()],
    queryFn: () => fetchDailyDigest(lat, lng),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
}
