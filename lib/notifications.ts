import { supabase } from "@/lib/supabase";

export interface AppNotification {
  id: string;
  user_id: string;
  type: "like" | "comment" | "reply" | "hall_of_fame";
  title: string;
  body: string;
  target_type: "post" | "talk" | "comment";
  target_id: string;
  actor_id: string | null;
  is_read: boolean;
  created_at: string;
}

/** 通知一覧取得 */
export async function fetchNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as AppNotification[];
}

/** 未読件数取得 */
export async function fetchUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);
  if (error) throw error;
  return count ?? 0;
}

/** 全て既読にする */
export async function markAllAsRead(): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);
  if (error) throw error;
}
