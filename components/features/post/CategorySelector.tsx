import { View, Text, Pressable } from "react-native";
import { CAT_CONFIG, type CategoryId } from "@/constants/categories";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import type { ThemeTokens } from "@/constants/theme";

/** カテゴリ別の説明文 */
const CAT_HINTS: Record<CategoryId, string> = {
  lifeline: "物資・行政・防災など暮らしに関わる情報に\n例: 野菜入荷 / 防災訓練 / 手続きお知らせ",
  event: "地域のイベント・集まりの告知に\n例: お祭り / 体験会 / 集まり",
  help: "困りごとの相談・助け合いに\n例: 手伝ってほしい / 手伝えます",
};

interface Props {
  value: CategoryId;
  onChange: (id: CategoryId) => void;
  t: ThemeTokens;
  fs: Record<string, number>;
  sectionLabelStyle: any;
}

/** カテゴリ選択UI（3つのカテゴリボタン） */
export default function CategorySelector({ value, onChange, t, fs, sectionLabelStyle }: Props) {
  return (
    <View>
      <Text style={[sectionLabelStyle, { marginBottom: SPACE.sm }]}>カテゴリ <Text style={{ color: t.red }}>*</Text></Text>
      <View style={{ flexDirection: "row", gap: SPACE.sm }}>
        {(Object.entries(CAT_CONFIG) as [CategoryId, typeof CAT_CONFIG[CategoryId]][]).map(([id, c]) => {
          const Icon = c.icon;
          const active = value === id;
          return (
            <Pressable
              key={id}
              onPress={() => onChange(id)}
              style={({ pressed }) => ({
                flex: 1,
                alignItems: "center" as const,
                gap: 6,
                borderRadius: RADIUS.lg,
                paddingVertical: SPACE.md,
                paddingHorizontal: 6,
                borderWidth: active ? 2 : 1,
                borderColor: active ? c.color : t.border,
                backgroundColor: active ? c.color + "18" : t.surface,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Icon size={20} color={active ? c.color : t.sub} />
              <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: active ? c.color : t.sub }}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={{ fontSize: fs.xxs, color: t.muted, marginTop: SPACE.sm }}>{CAT_HINTS[value]}</Text>
    </View>
  );
}
