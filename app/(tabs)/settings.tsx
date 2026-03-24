import { View, Text, Pressable, ScrollView } from "react-native";
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
    <ScrollView className="flex-1" style={{ backgroundColor: t.bg }} contentContainerClassName="pb-[100px]" showsVerticalScrollIndicator={false}>
      <ProfileSection t={t} />

      {/* Stats */}
      <View className="flex-row justify-around p-4 mt-2" style={{ backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, borderBottomWidth: 1, borderBottomColor: t.border }}>
        {[{ v: "56", l: "チェックイン" }, { v: "8", l: "バッジ" }].map((s) => (
          <View key={s.l} className="items-center">
            <Text className="text-xl font-extrabold" style={{ color: t.accent }}>{s.v}</Text>
            <Text className="text-[10px]" style={{ color: t.sub }}>{s.l}</Text>
          </View>
        ))}
      </View>

      <ThemeToggle t={t} isDark={isDark} onToggle={handleToggleTheme} />
      <PremiumCard />

      {/* Menu items */}
      <View className="mt-2" style={{ backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border }}>
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <Pressable key={i} className="flex-row items-center gap-3.5 py-3.5 px-5" style={{ borderBottomWidth: 1, borderBottomColor: t.border }}>
              <Icon size={17} color={t.sub} />
              <Text className="flex-1 text-sm" style={{ color: t.text }}>{item.label}</Text>
              <ChevronRight size={15} color={t.muted} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
