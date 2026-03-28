import { supabase } from "@/lib/supabase";
import type { UserBadge } from "@/types";

/** ユーザーのバッジ一覧取得 */
export async function fetchUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as UserBadge[];
}

/** ユーザーのトップバッジ取得 */
export async function fetchUserTopBadge(
  userId: string
): Promise<{ badge_type: string; area_name: string } | null> {
  const { data, error } = await supabase.rpc("get_user_top_badge", {
    target_user_id: userId,
  });
  if (error) throw error;
  if (!data || data.length === 0) return null;
  return data[0];
}

/** バッジ再計算 */
export async function refreshBadges(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.rpc("refresh_user_badges", {
    target_user_id: user.id,
  });
  if (error) throw error;
}
