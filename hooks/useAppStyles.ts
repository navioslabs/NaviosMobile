import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import { createStyles, getScaledFontSize } from "@/lib/styles";

/**
 * テーマ + 文字サイズスケールを統合して返すフック
 * @returns s: プリセットスタイル, t: テーマトークン, fs: スケール済みフォントサイズ
 */
export function useAppStyles() {
  const { isDark } = useThemeStore();
  const { scale } = useFontSizeStore();
  const t = makeTokens(isDark);
  const s = createStyles(t, scale);
  const fs = getScaledFontSize(scale);
  return { s, t, fs, isDark };
}
