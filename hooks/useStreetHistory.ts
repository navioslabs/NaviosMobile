import { useQuery } from "@tanstack/react-query";
import { fetchStreetHistory } from "@/lib/streetHistory";

/** 街の記憶（現在地周辺の人気投稿履歴） */
export function useStreetHistory(lat: number, lng: number) {
  return useQuery({
    queryKey: ["streetHistory", lat, lng],
    queryFn: () => fetchStreetHistory(lat, lng),
    enabled: lat !== 0 && lng !== 0,
    staleTime: 1000 * 60 * 5,
  });
}
