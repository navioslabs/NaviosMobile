import { View, Text } from "react-native";
import { Image } from "expo-image";
import { User } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { Post } from "@/types";
import { timeAgo } from "@/lib/adapters";
import { WEIGHT, SPACE, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import CatPill from "@/components/ui/CatPill";

interface CardHeaderProps {
  post: Post;
  t: ThemeTokens;
}

/** カードヘッダー（アバター + ユーザー名 + カテゴリ + 時刻） */
export default function CardHeader({ post, t }: CardHeaderProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  return (
    <>
      <View style={{ position: "absolute", top: SPACE.lg, left: SPACE.lg, flexDirection: "row", alignItems: "center", gap: SPACE.sm + 2 }}>
        <View>
          {post.author?.avatar_url ? (
            <Image source={{ uri: post.author.avatar_url }} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" }} />
          ) : (
            <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)", backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
              <User size={20} color="rgba(255,255,255,0.7)" />
            </View>
          )}
          {(post.author?.is_verified ?? false) && (
            <View style={{ position: "absolute", bottom: -1, right: -1, width: 16, height: 16, borderRadius: 8, backgroundColor: "#4A9EFF", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontSize: 8, fontWeight: WEIGHT.extrabold }}>✓</Text>
            </View>
          )}
        </View>
        <View>
          <Text style={{ fontWeight: WEIGHT.bold, fontSize: fs.base, color: "#fff" }}>{post.author?.display_name ?? "ユーザー"}</Text>
          <View style={{ marginTop: 2 }}>
            <CatPill cat={post.category} />
          </View>
        </View>
      </View>
      <View style={{ position: "absolute", top: SPACE.lg, right: SPACE.lg }}>
        <Text style={{ fontSize: fs.sm, color: "rgba(255,255,255,0.6)" }}>{timeAgo(post.created_at)}</Text>
      </View>
    </>
  );
}
