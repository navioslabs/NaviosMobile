/**
 * Supabase型 → レガシーモック型への変換アダプター
 * モック型を使うコンポーネントの移行完了後に削除する
 */
import type { Post, Talk } from "@/types";
import type { FeedPost, NearbyPost, ChatRoom } from "@/types";

/** 経過時間テキスト */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}分前`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
}

/** Post → FeedPost */
export function postToFeedPost(p: Post): FeedPost {
  const hoursAgo = (Date.now() - new Date(p.created_at).getTime()) / 3600000;
  return {
    id: 0, // UUIDをnumber化できないのでダミー。keyExtractorはp.idを使う
    user: {
      name: p.author?.display_name ?? "ユーザー",
      avatar: p.author?.avatar_url ?? "https://i.pravatar.cc/100",
      verified: p.author?.is_verified ?? false,
    },
    image: p.image_url ?? "",
    likes: p.likes_count,
    caption: p.title + (p.content ? `\n${p.content}` : ""),
    time: timeAgo(p.created_at),
    category: p.category,
    distance: p.distance_m ?? 0,
    matchScore: 50,
    timeLeft: p.deadline
      ? Math.max(0, (new Date(p.deadline).getTime() - Date.now()) / 60000)
      : 9999,
    crowd: p.crowd === "crowded" ? "混雑" : p.crowd === "moderate" ? "やや混み" : p.crowd === "empty" ? "空いてる" : "",
    hoursAgo,
  };
}

/** Post → NearbyPost */
export function postToNearbyPost(p: Post): NearbyPost {
  return {
    id: 0,
    category: p.category,
    title: p.title,
    content: p.content ?? "",
    time: new Date(p.created_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
    author: p.author?.display_name ?? "ユーザー",
    distance: p.distance_m ?? 0,
    image: p.image_url ?? "",
    matchScore: 50,
  };
}

/** Talk → ChatRoom */
export function talkToChatRoom(t: Talk): ChatRoom {
  return {
    id: 0,
    location: t.location_text ?? "",
    msg: t.message,
    user: t.author?.display_name ?? "ユーザー",
    time: timeAgo(t.created_at),
    count: t.replies_count,
    avatar: t.author?.avatar_url ?? "https://i.pravatar.cc/100",
    image: t.image_url,
    likes: t.likes_count,
  };
}
