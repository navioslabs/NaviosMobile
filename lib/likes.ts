import { supabase } from "@/lib/supabase";

/** いいねのトグル（追加 or 削除） */
export async function toggleLike(
  targetType: "post" | "talk" | "comment" | "reply",
  targetId: string
): Promise<{ liked: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  // 既存のいいねを確認
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (existing) {
    // いいね取消
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return { liked: false };
  }

  // いいね追加
  const { error } = await supabase
    .from("likes")
    .insert({ user_id: user.id, target_type: targetType, target_id: targetId });
  if (error) throw error;
  return { liked: true };
}

/** いいね済み確認 */
export async function checkIsLiked(
  targetType: string,
  targetId: string
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  return !!data;
}
