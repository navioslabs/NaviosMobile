import { View, Text } from "react-native";
import type { ThemeTokens } from "@/constants/theme";
import { FONT_SIZE, WEIGHT, SPACE } from "@/lib/styles";
import type { ReactNode } from "react";

interface SettingsSectionProps {
  title?: string;
  t: ThemeTokens;
  children: ReactNode;
}

/** 設定画面のセクション */
export default function SettingsSection({ title, t, children }: SettingsSectionProps) {
  return (
    <View style={{ marginTop: SPACE.sm }}>
      {title && (
        <Text style={{ fontSize: FONT_SIZE.xs, fontWeight: WEIGHT.semibold, color: t.muted, paddingHorizontal: SPACE.xl, paddingVertical: SPACE.sm, letterSpacing: 0.3 }}>
          {title}
        </Text>
      )}
      <View style={{ backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, borderBottomWidth: 1, borderBottomColor: t.border }}>
        {children}
      </View>
    </View>
  );
}
