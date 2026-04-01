import { supabase } from "@/lib/supabase";
import type { Profile, FollowCounts } from "@/types";

/** フォローのトグル（フォロー or 解除） */
export async function toggleFollow(
  followingId: string
): Promise<{ followed: boolean }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  // 既存のフォローを確認
  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", followingId)
    .maybeSingle();

  if (existing) {
    // フォロー解除
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return { followed: false };
  }

  // フォロー追加
  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id: followingId });
  if (error) throw error;
  return { followed: true };
}

/** フォロー済み確認 */
export async function checkIsFollowing(
  followingId: string
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", followingId)
    .maybeSingle();

  return !!data;
}

/** フォロー数取得 */
export async function fetchFollowCounts(
  userId: string
): Promise<FollowCounts> {
  const { data, error } = await supabase
    .from("profiles")
    .select("followers_count, following_count")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as FollowCounts;
}

/** フォロワー一覧取得 */
export async function fetchFollowers(
  userId: string
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("follower:profiles!follows_follower_id_fkey(*)")
    .eq("following_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => row.follower as Profile);
}

/** フォロー中一覧取得 */
export async function fetchFollowing(
  userId: string
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("following:profiles!follows_following_id_fkey(*)")
    .eq("follower_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => row.following as Profile);
}
