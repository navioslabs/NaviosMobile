import { View, Text, Pressable, Modal } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { router } from "expo-router";
import { UserCheck, MapPin, ChevronRight } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { Profile } from "@/types";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface ProfilePopoverProps {
  profile: Profile | null;
  visible: boolean;
  onClose: () => void;
  t: ThemeTokens;
}

/** ミニプロフィールカード（ポップオーバー） */
export default function ProfilePopover({ profile, visible, onClose, t }: ProfilePopoverProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  if (!profile) return null;

  const handleViewProfile = () => {
    onClose();
    setTimeout(() => router.push(`/profile/${profile.id}` as any), 200);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: SPACE.xl }}>
        <Pressable style={{ flex: 1, width: "100%" }} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.duration(250).springify().damping(16)}
          exiting={SlideOutDown.duration(200)}
          style={{
            width: "100%",
            maxWidth: 340,
            backgroundColor: t.surface,
            borderRadius: RADIUS.xxl + 4,
            borderWidth: 1,
            borderColor: t.border,
            overflow: "hidden",
          }}
        >
          {/* ヘッダー背景 */}
          <View style={{ height: 48, backgroundColor: t.accent + "18" }} />

          {/* アバター（ヘッダーにかぶせる） */}
          <View style={{ alignItems: "center", marginTop: -32 }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              borderWidth: 3,
              borderColor: t.surface,
              overflow: "hidden",
              backgroundColor: t.surface2,
            }}>
              <Image
                source={{ uri: profile.avatar_url ?? undefined }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
          </View>

          <View style={{ padding: SPACE.lg, alignItems: "center" }}>
            {/* 名前 + 認証バッジ */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs, marginBottom: SPACE.xs }}>
              <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color: t.text }}>
                {profile.display_name}
              </Text>
              {profile.is_verified && (
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: t.blue, alignItems: "center", justifyContent: "center" }}>
                  <UserCheck size={10} color="#fff" />
                </View>
              )}
            </View>

            {/* 自己紹介 */}
            {profile.bio && (
              <Text style={{ fontSize: fs.sm, color: t.sub, textAlign: "center", lineHeight: 18, marginBottom: SPACE.md }} numberOfLines={2}>
                {profile.bio}
              </Text>
            )}

            {/* 場所 */}
            {profile.location_text && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs, marginBottom: SPACE.md }}>
                <MapPin size={12} color={t.muted} />
                <Text style={{ fontSize: fs.xs, color: t.muted }}>{profile.location_text}</Text>
              </View>
            )}

            {/* プロフィールを見るボタン */}
            <Pressable
              onPress={handleViewProfile}
              accessibilityLabel="プロフィールを見る"
              accessibilityRole="button"
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: SPACE.xs,
                width: "100%",
                paddingVertical: SPACE.md,
                borderRadius: RADIUS.lg,
                backgroundColor: t.surface2,
                borderWidth: 1,
                borderColor: t.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text }}>プロフィールを見る</Text>
              <ChevronRight size={16} color={t.sub} />
            </Pressable>
          </View>
        </Animated.View>

        <Pressable style={{ flex: 1, width: "100%" }} onPress={onClose} />
      </Animated.View>
    </Modal>
  );
}
