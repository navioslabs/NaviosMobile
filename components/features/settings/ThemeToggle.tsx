import { View, Text, Pressable } from "react-native";
import { Moon, Sun } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { SPACE, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface ThemeToggleProps {
  t: ThemeTokens;
  isDark: boolean;
  onToggle: () => void;
}

/** テーマ切替トグル */
export default function ThemeToggle({ t, isDark, onToggle }: ThemeToggleProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  return (
    <View style={{ marginTop: SPACE.sm, backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, borderBottomWidth: 1, borderBottomColor: t.border }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: SPACE.lg, paddingHorizontal: SPACE.xl }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.md }}>
          {isDark ? <Moon size={20} color={t.purple} /> : <Sun size={20} color="#F5A623" />}
          <Text style={{ fontSize: fs.lg + 1, color: t.text }}>テーマ</Text>
        </View>
        <Pressable
          onPress={onToggle}
          style={{ width: 52, height: 30, borderRadius: 15, justifyContent: "center", backgroundColor: isDark ? t.accent : t.surface3 }}
        >
          <View style={{ position: "absolute", top: 3, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "#000" : "#fff", transform: [{ translateX: isDark ? 25 : 3 }], shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 }}>
            {isDark ? <Moon size={12} color={t.accent} /> : <Sun size={12} color="#F5A623" />}
          </View>
        </Pressable>
      </View>
    </View>
  );
}
