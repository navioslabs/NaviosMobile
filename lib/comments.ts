import { supabase } from "@/lib/supabase";
import type { Comment } from "@/types";

/** コメント一覧取得 */
export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*, author:profiles(*)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Comment[];
}

/** コメント投稿 */
export async function createComment(
  postId: string,
  body: string
): Promise<Comment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: user.id, body })
    .select("*, author:profiles(*)")
    .single();
  if (error) throw error;
  return data as Comment;
}

/** コメント削除 */
export async function deleteComment(id: string): Promise<void> {
  const { error, count } = await supabase.from("comments").delete().eq("id", id);
  if (__DEV__) console.log("deleteComment:", { id, error, count });
  if (error) throw error;
}
