import { create } from "zustand";
import { Appearance } from "react-native";

interface ThemeState {
  /** 現在のテーマ ("dark" | "light") */
  theme: "dark" | "light";
  /** ダークモードかどうか */
  isDark: boolean;
  /** テーマを切り替える */
  toggle: () => void;
}

/** テーマ状態管理ストア */
export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  isDark: false,
  toggle: () =>
    set((state) => ({
      theme: state.isDark ? "light" : "dark",
      isDark: !state.isDark,
    })),
}));
