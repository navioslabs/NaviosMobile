import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bell, Lock, Moon, Sun, Settings, MapPin, Eye, LogOut, User, Info } from "@/lib/icons";
import { useThemeStore } from "@/stores/themeStore";
import { useFontSizeStore, FONT_SIZE_LABELS, FONT_SIZE_LEVELS } from "@/stores/fontSizeStore";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import { useAppStyles } from "@/hooks/useAppStyles";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import ProfileSection from "@/components/features/settings/ProfileSection";
import PremiumCard from "@/components/features/settings/PremiumCard";
import SettingsSection from "@/components/features/settings/SettingsSection";
import SettingsRow from "@/components/features/settings/SettingsRow";

const ONBOARDING_KEY = "@navios_onboarding_done";

/** 設定画面 */
export default function SettingsScreen() {
  const { isDark, toggle } = useThemeStore();
  const { level, setLevel } = useFontSizeStore();
  const { s, t, fs } = useAppStyles();
  const { user, profile, isGuest, signOut } = useAuth();

  /** ログアウト確認ダイアログ */
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
      style={{ width: 52, height: 30, borderRadius: 15, justifyContent: "center", backgroundColor: isDark ? t.accent : t.surface3 }}
    >
      <View style={{ position: "absolute", top: 3, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "#000" : "#fff", transform: [{ translateX: isDark ? 25 : 3 }], shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 }}>
        {isDark ? <Moon size={12} color={t.accent} /> : <Sun size={12} color="#F5A623" />}
      </View>
    </Pressable>
  );

  /** 文字サイズ切替 */
  const FontSizeSelector = (
    <View style={{ flexDirection: "row", gap: SPACE.xs }}>
      {FONT_SIZE_LEVELS.map((l) => (
        <Pressable
          key={l}
          onPress={() => setLevel(l)}
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

  /** オートチェックイントグル */
  const CheckInToggle = (
    <Pressable style={({ pressed }) => ({ borderRadius: RADIUS.full, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.sm, backgroundColor: t.accent, opacity: pressed ? 0.7 : 1 })}>
      <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: "#000" }}>ON</Text>
    </Pressable>
  );

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <ProfileSection t={t} isGuest={isGuest} profile={profile} />

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
        <SettingsRow icon={isDark ? Moon : Sun} label="テーマ" subtitle={isDark ? "ダーク" : "ライト"} t={t} right={ThemeToggle} />
        <SettingsRow icon={Eye} label="文字サイズ" subtitle={FONT_SIZE_LABELS[level]} t={t} right={FontSizeSelector} isLast />
      </SettingsSection>

      <SettingsSection title="サポート" t={t}>
        <SettingsRow
          icon={Info}
          label="チュートリアル"
          subtitle="使い方をもう一度見る"
          onPress={async () => {
            await AsyncStorage.removeItem(ONBOARDING_KEY);
            Alert.alert("チュートリアル", "次回アプリ起動時にチュートリアルが表示されます");
          }}
          t={t}
          isLast
        />
      </SettingsSection>

      <SettingsSection title="通知" t={t}>
        <SettingsRow icon={Bell} label="通知設定" subtitle="ON" t={t} />
        <SettingsRow icon={MapPin} label="AIオートチェックイン" subtitle="近づいたら自動で通知" t={t} right={CheckInToggle} isLast />
      </SettingsSection>

      <SettingsSection title="アカウント" t={t}>
        <SettingsRow icon={Lock} label="プライバシー" t={t} />
        {isGuest ? (
          <SettingsRow icon={User} label="ログイン" onPress={() => router.push("/(auth)/login")} t={t} isLast />
        ) : (
          <>
            <SettingsRow icon={Settings} label="アカウント管理" t={t} />
            <SettingsRow icon={LogOut} label="ログアウト" onPress={handleSignOut} t={t} isLast />
          </>
        )}
      </SettingsSection>

      <PremiumCard />
    </ScrollView>
  );
}
