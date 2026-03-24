import type { CategoryId } from "@/constants/categories";

/** フィード投稿 */
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

/** 近隣投稿 */
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

/** チャットルーム */
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
