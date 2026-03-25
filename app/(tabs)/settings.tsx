import { View, Text, Pressable, ScrollView } from "react-native";
import { Bell, Lock, Moon, Sun, Settings } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import { createStyles, SPACE } from "@/lib/styles";
import ProfileSection from "@/components/features/settings/ProfileSection";
import PremiumCard from "@/components/features/settings/PremiumCard";
import SettingsSection from "@/components/features/settings/SettingsSection";
import SettingsRow from "@/components/features/settings/SettingsRow";

/** 設定画面 */
export default function SettingsScreen() {
  const { isDark, toggle } = useThemeStore();
  const t = makeTokens(isDark);
  const s = createStyles(t);

  const ThemeToggle = (
    <Pressable
      onPress={toggle}
      style={{ width: 52, height: 30, borderRadius: 15, justifyContent: "center", backgroundColor: isDark ? t.accent : t.surface3 }}
    >
      <View style={{ position: "absolute", top: 3, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "#000" : "#fff", transform: [{ translateX: isDark ? 25 : 3 }], shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 }}>
        {isDark ? <Moon size={12} color={t.accent} /> : <Sun size={12} color="#F5A623" />}
      </View>
    </Pressable>
  );

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <ProfileSection t={t} />

      {/* Stats */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", padding: SPACE.lg, marginTop: SPACE.sm, backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, borderBottomWidth: 1, borderBottomColor: t.border }}>
        {[{ v: "56", l: "チェックイン" }, { v: "8", l: "バッジ" }].map((stat) => (
          <View key={stat.l} style={{ alignItems: "center" }}>
            <Text style={[s.textSectionTitle, { color: t.accent }]}>{stat.v}</Text>
            <Text style={s.textMeta}>{stat.l}</Text>
          </View>
        ))}
      </View>

      <SettingsSection title="表示" t={t}>
        <SettingsRow icon={isDark ? Moon : Sun} label="テーマ" t={t} right={ThemeToggle} />
      </SettingsSection>

      <SettingsSection title="通知" t={t}>
        <SettingsRow icon={Bell} label="通知設定" t={t} isLast />
      </SettingsSection>

      <SettingsSection title="アカウント" t={t}>
        <SettingsRow icon={Lock} label="プライバシー" t={t} />
        <SettingsRow icon={Settings} label="アカウント管理" t={t} isLast />
      </SettingsSection>

      <PremiumCard />
    </ScrollView>
  );
}
