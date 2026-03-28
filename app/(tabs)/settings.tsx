import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Moon, Sun, Eye, LogOut } from "@/lib/icons";
import { useThemeStore } from "@/stores/themeStore";
import { useFontSizeStore, FONT_SIZE_LABELS, FONT_SIZE_LEVELS } from "@/stores/fontSizeStore";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import { useAppStyles } from "@/hooks/useAppStyles";
import { useAuth } from "@/hooks/useAuth";
import ProfileSection from "@/components/features/settings/ProfileSection";
import SettingsSection from "@/components/features/settings/SettingsSection";
import SettingsRow from "@/components/features/settings/SettingsRow";

/** 設定画面（マイページ） */
export default function SettingsScreen() {
  const { isDark, toggle } = useThemeStore();
  const { level, setLevel } = useFontSizeStore();
  const { s, t, fs } = useAppStyles();
  const { profile, isGuest, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert("ログアウト", "ログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (e) {
            Alert.alert("エラー", "ログアウトに失敗しました");
          }
        },
      },
    ]);
  };

  const ThemeToggle = (
    <Pressable
      onPress={toggle}
      accessibilityLabel={isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      accessibilityRole="switch"
      style={{ width: 52, height: 30, borderRadius: 15, justifyContent: "center", backgroundColor: isDark ? t.accent : t.surface3 }}
    >
      <View style={{ position: "absolute", top: 3, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "#000" : "#fff", transform: [{ translateX: isDark ? 25 : 3 }], shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 }}>
        {isDark ? <Moon size={12} color={t.accent} /> : <Sun size={12} color="#F5A623" />}
      </View>
    </Pressable>
  );

  const FontSizeSelector = (
    <View style={{ flexDirection: "row", gap: SPACE.xs }}>
      {FONT_SIZE_LEVELS.map((l) => (
        <Pressable
          key={l}
          onPress={() => setLevel(l)}
          accessibilityLabel={`文字サイズ: ${FONT_SIZE_LABELS[l]}`}
          accessibilityRole="button"
          style={({ pressed }) => ({
            paddingHorizontal: SPACE.md,
            paddingVertical: SPACE.xs + 2,
            borderRadius: RADIUS.sm,
            backgroundColor: level === l ? t.accent : t.surface2,
            borderWidth: 1,
            borderColor: level === l ? t.accent : t.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: l === "xlarge" ? fs.base : l === "large" ? fs.sm : fs.xs, fontWeight: WEIGHT.bold, color: level === l ? "#000" : t.sub }}>
            {FONT_SIZE_LABELS[l]}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <ProfileSection t={t} isGuest={isGuest} profile={profile} />

      <SettingsSection title="表示設定" t={t}>
        <SettingsRow icon={isDark ? Moon : Sun} label="テーマ" subtitle={isDark ? "ダーク" : "ライト"} t={t} right={ThemeToggle} />
        <SettingsRow icon={Eye} label="文字サイズ" subtitle={FONT_SIZE_LABELS[level]} t={t} right={FontSizeSelector} isLast />
      </SettingsSection>

      {!isGuest && (
        <SettingsSection title="アカウント" t={t}>
          <SettingsRow icon={LogOut} label="ログアウト" onPress={handleSignOut} t={t} isLast />
        </SettingsSection>
      )}

      {/* バージョン */}
      <View style={{ alignItems: "center", paddingVertical: SPACE.xxl }}>
        <Text style={{ fontSize: fs.xs, color: t.muted }}>NaviOs v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
