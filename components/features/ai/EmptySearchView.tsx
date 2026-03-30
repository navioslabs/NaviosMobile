import { View, Text } from "react-native";
import { Inbox } from "@/lib/icons";
import { WEIGHT, SPACE } from "@/lib/styles";
import type { ThemeTokens } from "@/constants/theme";

interface Props {
  query: string;
  t: ThemeTokens;
  fs: Record<string, number>;
  onSuggest: (q: string) => void;
}

/** 検索結果なし表示 */
export default function EmptySearchView({ query, t, fs }: Props) {
  return (
    <View style={{ paddingVertical: SPACE.xxxl, alignItems: "center" }}>
      <Inbox size={40} color={t.muted} />
      <Text
        style={{
          fontSize: fs.base,
          fontWeight: WEIGHT.semibold,
          color: t.sub,
          marginTop: SPACE.md,
          textAlign: "center",
        }}
      >
        「{query}」に一致する投稿が見つかりませんでした
      </Text>
      <Text style={{ fontSize: fs.sm, color: t.muted, textAlign: "center", marginTop: SPACE.sm }}>
        別のキーワードを試してみてください
      </Text>
    </View>
  );
}
