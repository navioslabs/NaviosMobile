import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { AlertCircle, Inbox } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface StateViewProps {
  t: ThemeTokens;
  type: "loading" | "empty" | "error";
  message?: string;
  onRetry?: () => void;
}

/** 画面状態コンポーネント（ローディング・空・エラー） */
export default function StateView({ t, type, message, onRetry }: StateViewProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  if (type === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: SPACE.xxxl }}>
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={{ fontSize: fs.base, color: t.sub, marginTop: SPACE.lg }}>
          {message || "読み込み中..."}
        </Text>
      </View>
    );
  }

  if (type === "error") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: SPACE.xxxl }}>
        <AlertCircle size={40} color={t.red} />
        <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text, marginTop: SPACE.lg }}>
          エラーが発生しました
        </Text>
        <Text style={{ fontSize: fs.md, color: t.sub, marginTop: SPACE.sm, textAlign: "center", lineHeight: 20 }}>
          {message || "しばらく時間をおいてから再試行してください"}
        </Text>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            style={{ marginTop: SPACE.xl, paddingHorizontal: SPACE.xxl, paddingVertical: SPACE.sm + 2, borderRadius: SPACE.sm, backgroundColor: t.accent }}
          >
            <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: "#000" }}>再試行</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // empty
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: SPACE.xxxl }}>
      <Inbox size={40} color={t.muted} />
      <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text, marginTop: SPACE.lg }}>
        まだ投稿がありません
      </Text>
      <Text style={{ fontSize: fs.md, color: t.sub, marginTop: SPACE.sm, textAlign: "center", lineHeight: 20 }}>
        {message || "近くの投稿が表示されます"}
      </Text>
    </View>
  );
}
