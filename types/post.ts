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
  location_text: string | null;
  deadline: string | null;
  crowd: "crowded" | "moderate" | "empty" | null;
  is_featured: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  /** JOIN で取得する投稿者プロフィール */
  author?: Profile;
  /** PostGIS で算出した距離 (メートル) */
  distance_m?: number;
}

// ─── ひとこと ───────────────────────────────────────

/** talks テーブルの行 */
export interface Talk {
  id: string;
  author_id: string;
  message: string;
  image_url: string | null;
  location_text: string | null;
  likes_count: number;
  replies_count: number;
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

// ─── いいね ─────────────────────────────────────────

/** likes テーブルの行 */
export interface Like {
  id: string;
  user_id: string;
  target_type: "post" | "talk" | "comment" | "reply";
  target_id: string;
  created_at: string;
}

// ─── レガシー互換（モック移行完了後に削除） ──────────

/** @deprecated モック用。移行後は Post を使う */
export interface FeedPost {
  id: number;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  image: string;
  likes: number;
  caption: string;
  time: string;
  category: CategoryId;
  distance: number;
  matchScore: number;
  timeLeft: number;
  crowd: string;
  hoursAgo: number;
}

/** @deprecated モック用。移行後は Post を使う */
export interface NearbyPost {
  id: number;
  category: CategoryId;
  title: string;
  content: string;
  time: string;
  author: string;
  distance: number;
  image: string;
  matchScore: number;
}

/** @deprecated モック用。移行後は Talk を使う */
export interface ChatRoom {
  id: number;
  location: string;
  msg: string;
  user: string;
  time: string;
  count: number;
  avatar: string;
  image: string | null;
  likes: number;
}
