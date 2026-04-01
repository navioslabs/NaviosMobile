import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  toggleFollow,
  checkIsFollowing,
  fetchFollowCounts,
  fetchFollowers,
  fetchFollowing,
} from "@/lib/follows";
import { getUserMessage } from "@/lib/appError";
import { useToastStore } from "@/stores/toastStore";

/** フォロー済み確認 */
export function useIsFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: ["follows", "isFollowing", userId],
    queryFn: () => checkIsFollowing(userId!),
    enabled: !!userId,
  });
}

/** フォロー数取得 */
export function useFollowCounts(userId: string | undefined) {
  return useQuery({
    queryKey: ["follows", "counts", userId],
    queryFn: () => fetchFollowCounts(userId!),
    enabled: !!userId,
  });
}

/** フォロワー一覧 */
export function useFollowers(userId: string | undefined) {
  return useQuery({
    queryKey: ["follows", "followers", userId],
    queryFn: () => fetchFollowers(userId!),
    enabled: !!userId,
  });
}

/** フォロー中一覧 */
export function useFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: ["follows", "following", userId],
    queryFn: () => fetchFollowing(userId!),
    enabled: !!userId,
  });
}

/** フォロートグル */
export function useToggleFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (followingId: string) => toggleFollow(followingId),
    onSuccess: (_data, followingId) => {
      qc.invalidateQueries({ queryKey: ["follows", "isFollowing", followingId] });
      qc.invalidateQueries({ queryKey: ["follows", "counts", followingId] });
      qc.invalidateQueries({ queryKey: ["follows", "followers", followingId] });
      qc.invalidateQueries({ queryKey: ["follows", "counts"] });
      qc.invalidateQueries({ queryKey: ["follows", "following"] });
      qc.invalidateQueries({ queryKey: ["profile", followingId] });
    },
    onError: (error) => {
      useToastStore.getState().show(getUserMessage(error), "error");
    },
  });
}
