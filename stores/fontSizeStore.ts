import { create } from "zustand";

type FontSizeLevel = "standard" | "large" | "xlarge";

interface FontSizeState {
  /** 現在の文字サイズレベル */
  level: FontSizeLevel;
  /** フォントサイズ倍率 */
  scale: number;
  /** 文字サイズを変更する */
  setLevel: (level: FontSizeLevel) => void;
}

const SCALES: Record<FontSizeLevel, number> = {
  standard: 1,
  large: 1.15,
  xlarge: 1.3,
};

const LABELS: Record<FontSizeLevel, string> = {
  standard: "標準",
  large: "大",
  xlarge: "特大",
};

/** 文字サイズ状態管理ストア */
export const useFontSizeStore = create<FontSizeState>((set) => ({
  level: "standard",
  scale: 1,
  setLevel: (level) => set({ level, scale: SCALES[level] }),
}));

export const FONT_SIZE_LABELS = LABELS;
export const FONT_SIZE_LEVELS: FontSizeLevel[] = ["standard", "large", "xlarge"];
export type { FontSizeLevel };
