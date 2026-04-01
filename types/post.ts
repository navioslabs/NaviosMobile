import type { CategoryId } from "@/constants/categories";

// ─── 通報 ───────────────────────────────────────────

/** 通報理由ID */
export type ReportReasonId =
  | "spam"
  | "inappropriate"
  | "misleading"
  | "harassment"
  | "dangerous"
  | "other";

/** 通報データ */
export interface Report {
  targetType: "feed" | "talk" | "nearby";
  targetId: string;
  reason: ReportReasonId;
  detail: string;
}

// ─── プロフィール ───────────────────────────────────

/** profiles テーブルの行 */
export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  location_text: string | null;
  is_verified: boolean;
  is_public: boolean;
  show_location: boolean;
  show_checkins: boolean;
  created_at: string;
  updated_at: string;
}

// ─── 投稿 ───────────────────────────────────────────

/** posts テーブルの行 */
export interface Post {
  id: string;
  author_id: string;
  category: CategoryId;
  title: string;
  content: string | null;
  image_url: string | null;
  image_urls: string[];
  location_text: string | null;
  deadline: string | null;
  crowd: "crowded" | "moderate" | "empty" | null;
  is_featured: boolean;
  likes_count: number;
  comments_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  /** JOIN で取得する投稿者プロフィール */
  author?: Profile;
  /** PostGIS で算出した距離 (メートル) */
  distance_m?: number;
  /** 投稿の緯度（詳細取得時のみ） */
  lat?: number;
  /** 投稿の経度（詳細取得時のみ） */
  lng?: number;
}

// ─── ひとこと ───────────────────────────────────────

/** talks テーブルの行 */
export interface Talk {
  id: string;
  author_id: string;
  message: string;
  image_url: string | null;
  image_urls: string[];
  location_text: string | null;
  likes_count: number;
  replies_count: number;
  tags: string[];
  is_hall_of_fame: boolean;
  created_at: string;
  /** JOIN で取得する投稿者プロフィール */
  author?: Profile;
}

// ─── コメント ───────────────────────────────────────

/** comments テーブルの行 */
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  /** JOIN で取得する投稿者プロフィール */
  author?: Profile;
}

// ─── 返信 ───────────────────────────────────────────

/** talk_replies テーブルの行 */
export interface TalkReply {
  id: string;
  talk_id: string;
  author_id: string;
  body: string;
  likes_count: number;
  created_at: string;
  /** JOIN で取得する投稿者プロフィール */
  author?: Profile;
}

// ─── バッジ ─────────────────────────────────────────

/** バッジ種別 */
export type BadgeType = "resident" | "face" | "legend";

/** user_badges テーブルの行 */
export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  area_name: string;
  earned_at: string;
}

// ─── 街の記憶 ───────────────────────────────────────

/** get_street_history RPC の返り値 */
export interface StreetHistoryItem {
  id: string;
  item_type: "talk" | "post";
  author_id: string;
  title: string | null;
  message: string | null;
  image_url: string | null;
  location_text: string | null;
  likes_count: number;
  created_at: string;
  author_display_name: string;
  author_avatar_url: string | null;
  author_is_verified: boolean;
}

// ─── フォロー ───────────────────────────────────────

/** follows テーブルの行 */
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  /** JOIN で取得するプロフィール */
  follower?: Profile;
  following?: Profile;
}

/** フォロー数 */
export interface FollowCounts {
  followers_count: number;
  following_count: number;
}

// ─── いいね ─────────────────────────────────────────

/** likes テーブルの行 */
export interface Like {
  id: string;
  user_id: string;
  target_type: "post" | "talk" | "comment" | "reply";
  target_id: string;
  created_at: string;
}

