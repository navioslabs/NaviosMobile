import { View, Text, Pressable } from "react-native";
import { ChevronRight, type LucideIcon } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { FONT_SIZE, SPACE } from "@/lib/styles";
import type { ReactNode } from "react";

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  t: ThemeTokens;
  right?: ReactNode;
  onPress?: () => void;
  isLast?: boolean;
}

/** 設定画面の行コンポーネント */
export default function SettingsRow({ icon: Icon, label, t, right, onPress, isLast }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: SPACE.lg,
        paddingVertical: SPACE.lg,
        paddingHorizontal: SPACE.xl,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: t.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon size={18} color={t.sub} />
      <Text style={{ flex: 1, fontSize: FONT_SIZE.lg + 1, color: t.text }}>{label}</Text>
      {right || <ChevronRight size={16} color={t.muted} />}
    </Pressable>
  );
}
