import { Text, type TextStyle } from "react-native";
import { router } from "expo-router";
import type { ThemeTokens } from "@/constants/theme";

/** ハッシュタグの正規表現 */
const TAG_REGEX = /(#[^\s#、。！？,.!?]+)/g;

interface HashtagTextProps {
  children: string;
  style?: TextStyle;
  t: ThemeTokens;
  numberOfLines?: number;
}

/** 本文中の #タグ をタップ可能なリンクとしてレンダリングする */
export default function HashtagText({ children, style, t, numberOfLines }: HashtagTextProps) {
  const parts = children.split(TAG_REGEX);

  if (parts.length === 1) {
    return <Text style={style} numberOfLines={numberOfLines}>{children}</Text>;
  }

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((part, i) =>
        TAG_REGEX.test(part) ? (
          <Text
            key={i}
            style={{ color: t.accent, fontWeight: "600" }}
            onPress={() => {
              const tag = part.slice(1);
              router.push({ pathname: "/(tabs)/ai", params: { q: tag } } as any);
            }}
          >
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
}
