import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProfile,
  updateProfile,
  fetchUserPosts,
  fetchUserTalks,
} from "@/lib/profiles";

/** プロフィール取得 */
export function useProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
  });
}

/** プロフィール更新 */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["profile", data.id] });
    },
  });
}

/** ユーザーの投稿一覧 */
export function useUserPosts(userId: string) {
  return useQuery({
    queryKey: ["profile", userId, "posts"],
    queryFn: () => fetchUserPosts(userId),
    enabled: !!userId,
  });
}

/** ユーザーのひとこと一覧 */
export function useUserTalks(userId: string) {
  return useQuery({
    queryKey: ["profile", userId, "talks"],
    queryFn: () => fetchUserTalks(userId),
    enabled: !!userId,
  });
}
