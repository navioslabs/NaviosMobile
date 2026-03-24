import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Bell, Lock, ChevronRight } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import ProfileSection from "@/components/features/settings/ProfileSection";
import ThemeToggle from "@/components/features/settings/ThemeToggle";
import PremiumCard from "@/components/features/settings/PremiumCard";

/** 設定画面 */
export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = makeTokens(isDark);

  const handleToggleTheme = () => {
    // TODO: テーマ切替のロジックを実装
  };

  const menuItems = [
    { icon: Bell, label: "通知設定" },
    { icon: Lock, label: "プライバシー" },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.bg }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ProfileSection t={t} />

      {/* Stats */}
      <View style={[styles.statsRow, { backgroundColor: t.surface, borderTopColor: t.border, borderBottomColor: t.border }]}>
        {[{ v: "56", l: "チェックイン" }, { v: "8", l: "バッジ" }].map((s) => (
          <View key={s.l} style={styles.stat}>
            <Text style={[styles.statValue, { color: t.accent }]}>{s.v}</Text>
            <Text style={[styles.statLabel, { color: t.sub }]}>{s.l}</Text>
          </View>
        ))}
      </View>

      <ThemeToggle t={t} isDark={isDark} onToggle={handleToggleTheme} />
      <PremiumCard />

      {/* Menu items */}
      <View style={[styles.menu, { backgroundColor: t.surface, borderTopColor: t.border }]}>
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <Pressable key={i} style={[styles.menuItem, { borderBottomColor: t.border }]}>
              <Icon size={17} color={t.sub} />
              <Text style={[styles.menuLabel, { color: t.text }]}>{item.label}</Text>
              <ChevronRight size={15} color={t.muted} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", padding: 16, marginTop: 8, borderTopWidth: 1, borderBottomWidth: 1 },
  stat: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 10 },
  menu: { marginTop: 8, borderTopWidth: 1 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1 },
  menuLabel: { flex: 1, fontSize: 14 },
});
