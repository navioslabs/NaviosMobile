import { View, Text, Pressable, ScrollView } from "react-native";
import { Rss } from "@/lib/icons";
import { CAT_CONFIG, type CategoryId } from "@/constants/categories";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface CategoryChipsProps {
  t: ThemeTokens;
  selected: string;
  onSelect: (id: string) => void;
}

/** カテゴリフィルターチップ */
export default function CategoryChips({ t, selected, onSelect }: CategoryChipsProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const cats = [
    { id: "all" as const, label: "すべて", icon: Rss },
    ...Object.entries(CAT_CONFIG).map(([id, c]) => ({
      id: id as CategoryId,
      label: c.label,
      icon: c.icon,
    })),
  ];

  return (
    <View style={{ height: 60 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center", paddingHorizontal: SPACE.xl, gap: SPACE.sm + 2 }}
      >
        {cats.map((cat) => {
          const Icon = cat.icon;
          const active = selected === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelect(cat.id)}
              style={({ pressed }) => ({
                flexDirection: "row" as const,
                alignItems: "center" as const,
                height: 44,
                opacity: pressed ? 0.7 : 1,
                gap: SPACE.sm,
                borderRadius: RADIUS.full,
                paddingHorizontal: SPACE.lg,
                backgroundColor: active ? t.accent : t.surface,
                borderWidth: 1.5,
                borderColor: active ? t.accent : t.border,
              })}
            >
              <Icon size={16} color={active ? "#000" : t.sub} />
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: active ? "#000" : t.sub, includeFontPadding: false }}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
