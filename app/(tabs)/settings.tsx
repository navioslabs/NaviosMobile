import { useEffect, useRef } from "react";
import { View, Text, Pressable, ScrollView, Alert, Linking, Animated } from "react-native";
import Svg, { Rect, Polygon, G } from "react-native-svg";
import { Moon, Sun, Eye, LogOut, Shield, FileText, Mail, ExternalLink } from "@/lib/icons";
import { useThemeStore } from "@/stores/themeStore";
import { useFontSizeStore, FONT_SIZE_LABELS, FONT_SIZE_LEVELS } from "@/stores/fontSizeStore";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import { useAppStyles } from "@/hooks/useAppStyles";
import { useAuth } from "@/hooks/useAuth";
import ProfileSection from "@/components/features/settings/ProfileSection";
import SettingsSection from "@/components/features/settings/SettingsSection";
import SettingsRow from "@/components/features/settings/SettingsRow";

/** アニメーション付きテーマトグル */
function AnimatedThemeToggle({ isDark, onToggle, t }: { isDark: boolean; onToggle: () => void; t: any }) {
  const progress = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, { toValue: isDark ? 1 : 0, damping: 15, stiffness: 180, useNativeDriver: false }).start();
  }, [isDark]);

  const thumbTranslateX = progress.interpolate({ inputRange: [0, 1], outputRange: [3, 25], extrapolate: "clamp" });
  const thumbRotation = progress.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"], extrapolate: "clamp" });

  return (
    <Pressable
      onPress={onToggle}
      accessibilityLabel={isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      accessibilityRole="switch"
    >
      <Animated.View style={[{ width: 52, height: 30, borderRadius: 15, justifyContent: "center" }, { backgroundColor: isDark ? t.accent : t.surface3 }]}>
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 24,
              height: 24,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isDark ? "#000" : "#fff",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 2,
            },
            {
              transform: [
                { translateX: thumbTranslateX },
                { rotate: thumbRotation },
              ],
            },
          ]}
        >
          {isDark ? <Moon size={12} color={t.accent} /> : <Sun size={12} color="#F5A623" />}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

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

  const FontSizeSelector = (
    <View style={{ gap: SPACE.md, paddingHorizontal: SPACE.xl, paddingVertical: SPACE.md }}>
      <View style={{ flexDirection: "row", gap: SPACE.sm }}>
        {FONT_SIZE_LEVELS.map((l) => {
          const active = level === l;
          return (
            <Pressable
              key={l}
              onPress={() => setLevel(l)}
              accessibilityLabel={`文字サイズ: ${FONT_SIZE_LABELS[l]}`}
              accessibilityRole="button"
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: SPACE.md,
                borderRadius: RADIUS.md,
                backgroundColor: active ? t.accent : t.surface2,
                borderWidth: 1,
                borderColor: active ? t.accent : t.border,
                alignItems: "center",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: l === "xlarge" ? fs.lg : l === "large" ? fs.base : fs.sm, fontWeight: WEIGHT.bold, color: active ? "#000" : t.sub }}>
                {FONT_SIZE_LABELS[l]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {/* プレビュー */}
      <View style={{ backgroundColor: t.surface2, borderRadius: RADIUS.md, padding: SPACE.md }}>
        <Text style={{ fontSize: fs.base, color: t.text, lineHeight: fs.base * 1.6 }}>
          この文章はプレビューです。文字サイズの変更がここに反映されます。
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <ProfileSection t={t} isGuest={isGuest} profile={profile} />

      <SettingsSection title="表示設定" t={t}>
        <SettingsRow
          icon={isDark ? Moon : Sun}
          label="テーマ"
          subtitle={isDark ? "ダーク" : "ライト"}
          t={t}
          right={
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
              <AnimatedThemeToggle isDark={isDark} onToggle={toggle} t={t} />
              <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.sub }}>{isDark ? "ダーク" : "ライト"}</Text>
            </View>
          }
        />
        <SettingsRow icon={Eye} label="文字サイズ" subtitle={FONT_SIZE_LABELS[level]} t={t} right={<View />} isLast />
        {FontSizeSelector}
      </SettingsSection>

      {!isGuest && (
        <SettingsSection title="アカウント" t={t}>
          <SettingsRow icon={LogOut} label="ログアウト" onPress={handleSignOut} t={t} isLast />
        </SettingsSection>
      )}

      <SettingsSection title="その他" t={t}>
        <SettingsRow
          icon={FileText}
          label="利用規約"
          t={t}
          onPress={() => Linking.openURL("https://example.com/terms")}
          right={<ExternalLink size={16} color={t.muted} />}
        />
        <SettingsRow
          icon={Shield}
          label="プライバシーポリシー"
          t={t}
          onPress={() => Linking.openURL("https://example.com/privacy")}
          right={<ExternalLink size={16} color={t.muted} />}
        />
        <SettingsRow
          icon={Mail}
          label="お問い合わせ"
          t={t}
          onPress={() => Linking.openURL("mailto:support@example.com")}
          right={<ExternalLink size={16} color={t.muted} />}
          isLast
        />
      </SettingsSection>

      {/* フッター: ロゴ + バージョン + コピーライト */}
      <View style={{ alignItems: "center", paddingVertical: SPACE.xxxl, gap: SPACE.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
          <Svg width={24} height={24} viewBox="0 0 640 640">
            <Rect x={0} y={0} width={640} height={640} rx={160} fill={t.muted} />
            <G transform="translate(320, 320)">
              <Polygon points="-120,-160 -60,-160 -60,160 -120,160" fill="rgba(255,255,255,0.85)" />
              <Polygon points="-60,-160 -120,-160 60,160 120,160" fill="rgba(255,255,255,0.6)" />
              <Polygon points="60,-160 120,-160 120,160 60,160" fill="rgba(255,255,255,0.85)" />
            </G>
          </Svg>
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.muted, letterSpacing: -0.3 }}>
            navi<Text style={{ color: t.muted }}>os</Text>
          </Text>
        </View>
        <Text style={{ fontSize: fs.xxs, color: t.muted }}>v1.0.0</Text>
        <Text style={{ fontSize: fs.xxs, color: t.muted }}>&copy; 2026 navios</Text>
      </View>
    </ScrollView>
  );
}
