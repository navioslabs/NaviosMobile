import { useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import Svg, { Rect, Polygon, G } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, User } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import { useThemeStore } from "@/stores/themeStore";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadCount } from "@/hooks/useNotifications";
import { createStyles, getScaledFontSize, SPACE, WEIGHT } from "@/lib/styles";

interface HeaderProps {
  t: ThemeTokens;
}

/** アプリ共通ヘッダー */
export default function Header({ t }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeStore();
  const { scale } = useFontSizeStore();
  const { profile, isGuest } = useAuth();
  const qc = useQueryClient();
  const s = createStyles(t, scale);
  const fs = getScaledFontSize(scale);

  /** ロゴ押下 → ちかくタブに戻る + Nearby データ再取得 */
  const handleLogoPress = useCallback(() => {
    router.replace("/(tabs)");
    qc.invalidateQueries({ queryKey: ["posts", "nearby"] });
  }, [qc]);

  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <View style={[s.rowBetween, { paddingHorizontal: SPACE.xl, paddingBottom: SPACE.md, paddingTop: insets.top + SPACE.sm, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border }]}>
      <Pressable onPress={handleLogoPress} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: SPACE.sm, opacity: pressed ? 0.7 : 1 })}>
        {/* ロゴマーク: SVG */}
        <Svg width={32} height={32} viewBox="0 0 640 640">
          <Rect x={0} y={0} width={640} height={640} rx={160} fill={t.accent} />
          <G transform="translate(320, 320)">
            <Polygon points="-120,-160 -60,-160 -60,160 -120,160" fill="rgba(255,255,255,0.85)" />
            <Polygon points="-60,-160 -120,-160 60,160 120,160" fill="rgba(255,255,255,0.6)" />
            <Polygon points="60,-160 120,-160 120,160 60,160" fill="rgba(255,255,255,0.85)" />
          </G>
        </Svg>
        {/* ロゴテキスト */}
        <Text style={{ fontSize: 24, fontWeight: WEIGHT.extrabold, letterSpacing: -0.8, color: t.text }}>
          navi<Text style={{ color: t.accent }}>os</Text>
        </Text>
      </Pressable>

      <View style={[s.row, { gap: SPACE.sm }]}>
        <Pressable
          onPress={() => router.push("/notifications")}
          accessibilityLabel={unreadCount > 0 ? `通知 ${unreadCount}件の未読` : "通知"}
          accessibilityRole="button"
          style={({ pressed }) => [s.iconButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Bell size={16} color={t.sub} />
          {unreadCount > 0 && (
            <View style={{ position: "absolute", top: -2, right: -2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: "#F0425C", alignItems: "center", justifyContent: "center", paddingHorizontal: 3 }}>
              <Text style={{ fontSize: 9, fontWeight: "800", color: "#fff" }}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
            </View>
          )}
        </Pressable>
        <Pressable
          onPress={() => router.push(isGuest ? "/(auth)/login" as any : "/profile/edit")}
          accessibilityLabel={isGuest ? "ログイン" : "プロフィール"}
          accessibilityRole="button"
          style={({ pressed }) => ({
            width: 34,
            height: 34,
            borderRadius: 17,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            overflow: "hidden" as const,
            borderWidth: !isGuest && profile?.avatar_url ? 1.5 : 1,
            borderColor: !isGuest && profile?.avatar_url ? t.accent : t.border,
            backgroundColor: t.surface2,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          {!isGuest && profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={{ width: 34, height: 34, borderRadius: 17 }}
              contentFit="cover"
            />
          ) : (
            <User size={16} color={isGuest ? t.accent : t.sub} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
