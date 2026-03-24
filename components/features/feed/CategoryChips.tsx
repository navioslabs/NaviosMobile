import { View, Text, Pressable, ScrollView } from "react-native";
import { Rss } from "@/lib/icons";
import { CAT_CONFIG, type CategoryId } from "@/constants/categories";
import type { ThemeTokens } from "@/constants/theme";

interface CategoryChipsProps {
  t: ThemeTokens;
  selected: string;
  onSelect: (id: string) => void;
}

/** カテゴリフィルターチップ */
export default function CategoryChips({ t, selected, onSelect }: CategoryChipsProps) {
  const cats = [
    { id: "all" as const, label: "すべて", icon: Rss },
    ...Object.entries(CAT_CONFIG).map(([id, c]) => ({
      id: id as CategoryId,
      label: c.label,
      icon: c.icon,
    })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}
    >
      {cats.map((cat) => {
        const Icon = cat.icon;
        const active = selected === cat.id;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              borderRadius: 9999,
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: active ? t.accent : t.surface,
              borderWidth: 1.5,
              borderColor: active ? t.accent : t.border,
            }}
          >
            <Icon size={16} color={active ? "#000" : t.sub} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: active ? "#000" : t.sub }}>
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
