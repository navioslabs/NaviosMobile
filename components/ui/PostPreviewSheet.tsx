import { useCallback } from "react";
import { View, Text, Pressable, Modal, ScrollView, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { router } from "expo-router";
import { Clock, Navigation, Heart, X } from "@/lib/icons";
import { CAT_CONFIG } from "@/constants/categories";
import type { ThemeTokens } from "@/constants/theme";
import type { Post } from "@/types";
import { distLabel } from "@/lib/utils";
import { timeAgo, calcTimeLeft } from "@/lib/adapters";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import CatPill from "@/components/ui/CatPill";
import UrgencyBar from "@/components/ui/UrgencyBar";

interface PostPreviewSheetProps {
  post: Post | null;
  visible: boolean;
  onClose: () => void;
  t: ThemeTokens;
  isDark: boolean;
}

/** 投稿プレビュー用ボトムシート */
export default function PostPreviewSheet({ post, visible, onClose, t, isDark }: PostPreviewSheetProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const { height: screenHeight } = useWindowDimensions();

  const handleDetail = useCallback(() => {
    if (!post) return;
    onClose();
    setTimeout(() => router.push(`/feed/${post.id}` as any), 200);
  }, [post, onClose]);

  if (!post) return null;

  const catConfig = CAT_CONFIG[post.category];
  const timeLeft = calcTimeLeft(post.deadline);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* 背景オーバーレイ */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        {/* シート本体 */}
        <Animated.View
          entering={SlideInDown.duration(300).springify().damping(16)}
          exiting={SlideOutDown.duration(200)}
          style={{
            maxHeight: screenHeight * 0.55,
            backgroundColor: t.surface,
            borderTopLeftRadius: RADIUS.xxl + 4,
            borderTopRightRadius: RADIUS.xxl + 4,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: t.border,
            overflow: "hidden",
          }}
        >
          {/* ハンドルバー */}
          <View style={{ alignItems: "center", paddingTop: SPACE.sm + 2, paddingBottom: SPACE.xs }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: t.muted + "40" }} />
          </View>

          {/* 閉じるボタン */}
          <Pressable
            onPress={onClose}
            accessibilityLabel="閉じる"
            accessibilityRole="button"
            style={({ pressed }) => ({
              position: "absolute",
              top: SPACE.sm,
              right: SPACE.md,
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: t.surface2,
              opacity: pressed ? 0.7 : 1,
              zIndex: 10,
            })}
          >
            <X size={16} color={t.sub} />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACE.xxxl }}>
            {/* ヒーロー画像 */}
            {post.image_url && (
              <Image
                source={{ uri: post.image_url }}
                style={{ width: "100%", height: 160 }}
                contentFit="cover"
              />
            )}

            <View style={{ padding: SPACE.lg }}>
              {/* カテゴリ + 距離 */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.md }}>
                <CatPill cat={post.category} />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <Navigation size={12} color={catConfig.color} />
                  <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.bold, color: catConfig.color }}>
                    {distLabel(post.distance_m ?? 0)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginLeft: "auto" }}>
                  <Clock size={11} color={t.muted} />
                  <Text style={{ fontSize: fs.xs, color: t.muted }}>{timeAgo(post.created_at)}</Text>
                </View>
              </View>

              {/* タイトル */}
              <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color: t.text, lineHeight: 24, marginBottom: SPACE.sm }}>
                {post.title}
              </Text>

              {/* 概要（3行まで） */}
              {post.content && (
                <Text style={{ fontSize: fs.base, color: t.sub, lineHeight: 22, marginBottom: SPACE.md }} numberOfLines={3}>
                  {post.content}
                </Text>
              )}

              {/* 緊急度バー */}
              <View style={{ marginBottom: SPACE.lg }}>
                <UrgencyBar timeLeft={timeLeft} subColor={t.sub} />
              </View>

              {/* 投稿者 */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.xl }}>
                <Image
                  source={{ uri: post.author?.avatar_url ?? undefined }}
                  style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: t.border }}
                  contentFit="cover"
                />
                <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.text }}>
                  {post.author?.display_name ?? "匿名"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginLeft: "auto" }}>
                  <Heart size={14} color={t.muted} />
                  <Text style={{ fontSize: fs.sm, color: t.muted }}>{post.likes_count}</Text>
                </View>
              </View>

              {/* 詳しく見るボタン */}
              <Pressable
                onPress={handleDetail}
                accessibilityLabel="詳しく見る"
                accessibilityRole="button"
                style={({ pressed }) => ({
                  alignItems: "center",
                  paddingVertical: SPACE.md,
                  borderRadius: RADIUS.lg,
                  backgroundColor: t.accent,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: "#000" }}>
                  詳しく見る
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
