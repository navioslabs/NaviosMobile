import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserBadges, fetchUserTopBadge, refreshBadges } from "@/lib/badges";

/** ユーザーのバッジ一覧 */
export function useUserBadges(userId: string) {
  return useQuery({
    queryKey: ["badges", userId],
    queryFn: () => fetchUserBadges(userId),
    enabled: !!userId,
  });
}

/** ユーザーのトップバッジ */
export function useUserTopBadge(userId: string | undefined) {
  return useQuery({
    queryKey: ["badges", "top", userId],
    queryFn: () => fetchUserTopBadge(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/** バッジ再計算 mutation */
export function useRefreshBadges() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: refreshBadges,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["badges"] });
    },
  });
}
