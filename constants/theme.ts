import { Platform } from "react-native";

/** デザイントークン型定義 */
export interface ThemeTokens {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  glass: string;
  border: string;
  text: string;
  sub: string;
  muted: string;
  accent: string;
  accentDark: string;
  red: string;
  amber: string;
  purple: string;
  blue: string;
  like: string;
  glow: string;
}

/**
 * ダーク/ライトモードに応じたデザイントークンを生成する
 * @param dark - ダークモードかどうか
 */
export const makeTokens = (dark: boolean): ThemeTokens => ({
  bg: dark ? "#06060C" : "#F6F5F1",
  surface: dark ? "#0E0E18" : "#FFFFFF",
  surface2: dark ? "#161624" : "#F0EFEB",
  surface3: dark ? "#1E1E30" : "#E6E5E1",
  glass: dark ? "rgba(14,14,24,0.78)" : "rgba(255,255,255,0.82)",
  border: dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
  text: dark ? "#F2F1FA" : "#0C0C14",
  sub: dark ? "#9B9AB4" : "#6E6E80",
  muted: dark ? "#5E5D78" : "#A0A0B0",
  accent: dark ? "#00E8B0" : "#00D4A1",
  accentDark: "#00B88A",
  red: dark ? "#FF5A72" : "#F0425C",
  amber: dark ? "#FFB840" : "#F5A623",
  purple: dark ? "#A084D4" : "#8B6FC0",
  blue: dark ? "#5EB0FF" : "#4A9EFF",
  like: dark ? "#FFD233" : "#F5C518",
  glow: dark ? "rgba(0,232,176,0.28)" : "rgba(0,212,161,0.18)",
});

export const Fonts = Platform.select({
  ios: { sans: "system-ui", serif: "ui-serif", rounded: "ui-rounded", mono: "ui-monospace" },
  default: { sans: "normal", serif: "serif", rounded: "normal", mono: "monospace" },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, monospace",
  },
});
