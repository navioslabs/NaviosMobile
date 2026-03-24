import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { MapPin, MessageCircle, Heart, Share } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { ChatRoom } from "@/types";

interface TalkItemProps {
  chat: ChatRoom;
  t: ThemeTokens;
}

/** Talk タイムラインアイテム */
export default function TalkItem({ chat, t }: TalkItemProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <View className="flex-row gap-2.5 py-3.5 px-5" style={{ borderBottomWidth: 1, borderBottomColor: t.border }}>
      <Image source={{ uri: chat.avatar }} className="w-10 h-10 rounded-full" contentFit="cover" />
      <View className="flex-1">
        {/* Name + time */}
        <View className="flex-row items-center gap-1.5 mb-[3px]">
          <Text className="text-[13px] font-bold" style={{ color: t.text }}>@{chat.user}</Text>
          <Text className="text-[11px]" style={{ color: t.muted }}>•</Text>
          <Text className="text-[11px]" style={{ color: t.muted }}>{chat.time}</Text>
        </View>

        {/* Location tag */}
        <View className="self-start flex-row items-center gap-[3px] rounded-full px-2 py-0.5 mb-1.5" style={{ backgroundColor: t.accent + "12" }}>
          <MapPin size={9} color={t.accent} />
          <Text className="text-[10px] font-semibold" style={{ color: t.accent }}>{chat.location}</Text>
        </View>

        {/* Message */}
        <Text className="text-sm leading-[21px]" style={{ color: t.text }}>{chat.msg}</Text>

        {/* Image thumbnail */}
        {chat.image && (
          <View className="w-full h-[140px] rounded-[14px] overflow-hidden mt-2.5" style={{ borderWidth: 1, borderColor: t.border }}>
            <Image source={{ uri: chat.image }} className="w-full h-full" contentFit="cover" />
          </View>
        )}

        {/* Actions */}
        <View className="flex-row items-center gap-5 mt-2">
          <View className="flex-row items-center gap-[5px]">
            <MessageCircle size={15} color={t.muted} />
            <Text className="text-[11px] font-semibold" style={{ color: t.muted }}>{chat.count}</Text>
          </View>
          <Pressable onPress={() => setIsLiked(!isLiked)} className="flex-row items-center gap-[5px]">
            <Heart size={15} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : t.muted} />
            <Text className="text-[11px] font-semibold" style={{ color: isLiked ? t.red : t.muted }}>
              {chat.likes + (isLiked ? 1 : 0)}
            </Text>
          </Pressable>
          <Pressable className="flex-row items-center gap-[5px]">
            <Share size={15} color={t.muted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
