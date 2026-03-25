import { View, Text } from "react-native";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import type { ReactNode } from "react";

interface SettingsSectionProps {
  title?: string;
  t: ThemeTokens;
  children: ReactNode;
}

/** 設定画面のセクション */
export default function SettingsSection({ title, t, children }: SettingsSectionProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  return (
    <View style={{ marginTop: SPACE.sm }}>
      {title && (
        <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.muted, paddingHorizontal: SPACE.xl, paddingVertical: SPACE.sm, letterSpacing: 0.3 }}>
          {title}
        </Text>
      )}
      <View style={{ backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, borderBottomWidth: 1, borderBottomColor: t.border }}>
        {children}
      </View>
    </View>
  );
}
