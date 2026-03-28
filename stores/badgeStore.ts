import { create } from "zustand";

interface BadgeState {
  /** トークタブの未読件数 */
  talkUnread: number;
  /** フィードタブの新着フラグ */
  feedHasNew: boolean;
  /** トーク未読を加算 */
  incrementTalkUnread: () => void;
  /** トーク未読をリセット */
  clearTalkUnread: () => void;
  /** フィード新着フラグをセット */
  setFeedHasNew: (v: boolean) => void;
}

/** タブバッジ状態管理ストア */
export const useBadgeStore = create<BadgeState>((set) => ({
  talkUnread: 0,
  feedHasNew: false,
  incrementTalkUnread: () => set((s) => ({ talkUnread: s.talkUnread + 1 })),
  clearTalkUnread: () => set({ talkUnread: 0 }),
  setFeedHasNew: (v) => set({ feedHasNew: v }),
}));
