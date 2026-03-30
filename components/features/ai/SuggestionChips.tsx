import { View, Text, Pressable } from "react-native";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface SuggestionChipsProps {
  t: ThemeTokens;
  onSelect: (query: string) => void;
  /** 動的サジェスト（渡されなければデフォルトを使用） */
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "空いてるカフェ",
  "今近いイベント",
  "子連れ向け",
  "野菜が買える場所",
  "無料で参加OK",
];

/** AI検索のサジェスションチップ（折り返し表示 + スタッガーアニメーション） */
export default function SuggestionChips({ t, onSelect, suggestions }: SuggestionChipsProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const items = suggestions ?? DEFAULT_SUGGESTIONS;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACE.sm, marginBottom: SPACE.lg }}>
      {items.map((s, i) => (
        <View key={s}>
          <Pressable
            onPress={() => onSelect(s)}
            style={({ pressed }) => ({
              paddingHorizontal: SPACE.md,
              paddingVertical: SPACE.sm,
              borderRadius: RADIUS.full,
              backgroundColor: t.surface2,
              borderWidth: 1,
              borderColor: t.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.medium, color: t.sub }}>{s}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
