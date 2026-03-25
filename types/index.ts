/** 型定義バレルファイル */

export type {
  Post,
  Talk,
  Comment,
  TalkReply,
  Like,
  Profile,
  Report,
  ReportReasonId,
  // レガシー互換（モック移行完了後に削除）
  FeedPost,
  NearbyPost,
  ChatRoom,
} from "./post";

export type { User } from "./user";
