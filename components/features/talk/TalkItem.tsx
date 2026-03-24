import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
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
    <View style={[styles.container, { borderBottomColor: t.border }]}>
      <Image source={{ uri: chat.avatar }} style={styles.avatar} contentFit="cover" />
      <View style={styles.content}>
        {/* Name + time */}
        <View style={styles.nameRow}>
          <Text style={[styles.user, { color: t.text }]}>@{chat.user}</Text>
          <Text style={[styles.dot, { color: t.muted }]}>•</Text>
          <Text style={[styles.time, { color: t.muted }]}>{chat.time}</Text>
        </View>

        {/* Location tag */}
        <View style={[styles.locTag, { backgroundColor: t.accent + "12" }]}>
          <MapPin size={9} color={t.accent} />
          <Text style={[styles.locText, { color: t.accent }]}>{chat.location}</Text>
        </View>

        {/* Message */}
        <Text style={[styles.msg, { color: t.text }]}>{chat.msg}</Text>

        {/* Image thumbnail */}
        {chat.image && (
          <View style={[styles.imageWrap, { borderColor: t.border }]}>
            <Image source={{ uri: chat.image }} style={styles.image} contentFit="cover" />
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <View style={styles.action}>
            <MessageCircle size={15} color={t.muted} />
            <Text style={[styles.actionText, { color: t.muted }]}>{chat.count}</Text>
          </View>
          <Pressable onPress={() => setIsLiked(!isLiked)} style={styles.action}>
            <Heart size={15} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : t.muted} />
            <Text style={[styles.actionText, { color: isLiked ? t.red : t.muted }]}>
              {chat.likes + (isLiked ? 1 : 0)}
            </Text>
          </Pressable>
          <Pressable style={styles.action}>
            <Share size={15} color={t.muted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 10, padding: 14, paddingHorizontal: 20, borderBottomWidth: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  content: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  user: { fontSize: 13, fontWeight: "700" },
  dot: { fontSize: 11 },
  time: { fontSize: 11 },
  locTag: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 6, alignSelf: "flex-start" },
  locText: { fontSize: 10, fontWeight: "600" },
  msg: { fontSize: 14, lineHeight: 21 },
  imageWrap: { width: "100%", height: 140, borderRadius: 14, overflow: "hidden", marginTop: 10, borderWidth: 1 },
  image: { width: "100%", height: "100%" },
  actionsRow: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 8 },
  action: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionText: { fontSize: 11, fontWeight: "600" },
});
