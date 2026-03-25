import { supabase } from "@/lib/supabase";
import type { Profile, Post, Talk } from "@/types";

/** プロフィール取得 */
export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as Profile;
}

/** プロフィール更新 */
export async function updateProfile(input: {
  display_name: string;
  bio?: string;
  location_text?: string;
  avatar_url?: string;
  is_public: boolean;
  show_location: boolean;
  show_checkins: boolean;
}): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", user.id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Profile;
}

/** ユーザーの投稿一覧 */
export async function fetchUserPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*, author:profiles(*)")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Post[];
}

/** ユーザーのひとこと一覧 */
export async function fetchUserTalks(userId: string): Promise<Talk[]> {
  const { data, error } = await supabase
    .from("talks")
    .select("*, author:profiles(*)")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Talk[];
}
