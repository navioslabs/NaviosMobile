import { View, Text } from "react-native";
import { Image } from "expo-image";
import type { ThemeTokens } from "@/constants/theme";
import type { FeedPost } from "@/types";
import { FONT_SIZE, WEIGHT, SPACE } from "@/lib/styles";
import CatPill from "@/components/ui/CatPill";

interface CardHeaderProps {
  post: FeedPost;
  t: ThemeTokens;
}

/** カードヘッダー（アバター + ユーザー名 + カテゴリ + 時刻） */
export default function CardHeader({ post, t }: CardHeaderProps) {
  return (
    <>
      <View style={{ position: "absolute", top: SPACE.lg, left: SPACE.lg, flexDirection: "row", alignItems: "center", gap: SPACE.sm + 2 }}>
        <View>
          <Image source={{ uri: post.user.avatar }} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" }} />
          {post.user.verified && (
            <View style={{ position: "absolute", bottom: -1, right: -1, width: 16, height: 16, borderRadius: 8, backgroundColor: "#4A9EFF", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontSize: 8, fontWeight: WEIGHT.extrabold }}>✓</Text>
            </View>
          )}
        </View>
        <View>
          <Text style={{ fontWeight: WEIGHT.bold, fontSize: FONT_SIZE.base, color: "#fff" }}>{post.user.name}</Text>
          <View style={{ marginTop: 2 }}>
            <CatPill cat={post.category} />
          </View>
        </View>
      </View>
      <View style={{ position: "absolute", top: SPACE.lg, right: SPACE.lg }}>
        <Text style={{ fontSize: FONT_SIZE.sm, color: "rgba(255,255,255,0.6)" }}>{post.time}</Text>
      </View>
    </>
  );
}
