import { View, Text, Pressable } from "react-native";
import { Moon, Sun } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";

interface ThemeToggleProps {
  t: ThemeTokens;
  isDark: boolean;
  onToggle: () => void;
}

/** テーマ切替トグル */
export default function ThemeToggle({ t, isDark, onToggle }: ThemeToggleProps) {
  return (
    <View className="mt-2" style={{ backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, borderBottomWidth: 1, borderBottomColor: t.border }}>
      <View className="flex-row items-center justify-between py-3.5 px-5">
        <View className="flex-row items-center gap-3">
          {isDark ? <Moon size={18} color={t.purple} /> : <Sun size={18} color="#F5A623" />}
          <Text className="text-[15px]" style={{ color: t.text }}>テーマ</Text>
        </View>
        <Pressable
          onPress={onToggle}
          className="w-[50px] h-7 rounded-full justify-center"
          style={{ backgroundColor: isDark ? t.accent : t.surface3 }}
        >
          <View
            className="absolute top-0.5 w-6 h-6 rounded-full items-center justify-center shadow"
            style={{ backgroundColor: isDark ? "#000" : "#fff", transform: [{ translateX: isDark ? 24 : 2 }] }}
          >
            {isDark ? <Moon size={11} color={t.accent} /> : <Sun size={11} color="#F5A623" />}
          </View>
        </Pressable>
      </View>
    </View>
  );
}
