import { useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, MessageSquare, Share, Bookmark, Navigation } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { FeedPost } from "@/types";
import { distLabel } from "@/lib/utils";
import CatPill from "@/components/ui/CatPill";
import UrgencyBar from "@/components/ui/UrgencyBar";
import CrowdTag from "@/components/ui/CrowdTag";

interface FeedPostCardProps {
  post: FeedPost;
  t: ThemeTokens;
  isDark: boolean;
}

/** フィード投稿カード */
export default function FeedPostCard({ post, t, isDark }: FeedPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <View className="mx-3.5 mb-3.5 rounded-[26px] overflow-hidden" style={{ shadowColor: isDark ? "#000" : "rgba(0,0,0,0.06)", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 }}>
      <View style={{ aspectRatio: 3 / 4 }}>
        <Image source={{ uri: post.image }} className="w-full h-full" contentFit="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.85)"]}
          locations={[0, 0.35, 1]}
          className="absolute inset-0"
        />

        {/* Top-left: avatar + name + category */}
        <View className="absolute top-3.5 left-3.5 flex-row items-center gap-2">
          <View>
            <Image source={{ uri: post.user.avatar }} className="w-[34px] h-[34px] rounded-full" style={{ borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" }} />
            {post.user.verified && (
              <View className="absolute -bottom-px -right-px w-[13px] h-[13px] rounded-full bg-info items-center justify-center">
                <Text className="text-white text-[7px] font-extrabold">✓</Text>
              </View>
            )}
          </View>
          <View>
            <Text className="font-bold text-xs text-white">{post.user.name}</Text>
            <View className="mt-0.5">
              <CatPill cat={post.category} small />
            </View>
          </View>
        </View>

        {/* Top-right: time */}
        <View className="absolute top-3.5 right-3.5">
          <Text className="text-[11px] text-white/60">{post.time}</Text>
        </View>

        {/* Right-center: distance */}
        <View className="absolute right-3.5 top-1/2 -translate-y-1/2 flex-row items-center gap-1 bg-black/50 rounded-pill px-2.5 py-[5px]">
          <Navigation size={11} color={t.accent} />
          <Text className="text-[11px] font-bold text-white">{distLabel(post.distance)}</Text>
        </View>

        {/* Bottom: caption + urgency + actions */}
        <View className="absolute bottom-0 left-0 right-0 p-3.5">
          <Text className="text-[15px] font-bold text-white leading-5">{post.caption}</Text>
          <View className="flex-row items-center gap-2 mt-1.5">
            <UrgencyBar timeLeft={post.timeLeft} subColor={t.sub} />
            {post.crowd ? <CrowdTag crowd={post.crowd} /> : null}
          </View>

          {/* Actions */}
          <View className="flex-row items-center gap-4 mt-2.5 pt-2.5" style={{ borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)" }}>
            <Pressable onPress={() => setIsLiked(!isLiked)} className="flex-row items-center gap-1">
              <Heart size={18} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : "rgba(255,255,255,.7)"} />
              <Text className="text-xs font-semibold" style={{ color: isLiked ? t.red : "rgba(255,255,255,.7)" }}>
                {post.likes + (isLiked ? 1 : 0)}
              </Text>
            </Pressable>
            <Pressable className="flex-row items-center gap-1">
              <MessageSquare size={18} color="rgba(255,255,255,.7)" />
            </Pressable>
            <Pressable className="flex-row items-center gap-1">
              <Share size={18} color="rgba(255,255,255,.7)" />
            </Pressable>
            <Pressable className="flex-row items-center gap-1 ml-auto">
              <Bookmark size={18} color="rgba(255,255,255,.7)" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
