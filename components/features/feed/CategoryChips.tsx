import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {cats.map((cat) => {
        const Icon = cat.icon;
        const active = selected === cat.id;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={[
              styles.chip,
              { backgroundColor: active ? t.accent : t.surface, borderColor: active ? t.accent : t.border },
            ]}
          >
            <Icon size={12} color={active ? "#000" : t.sub} />
            <Text style={[styles.label, { color: active ? "#000" : t.sub }]}>{cat.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 7, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 13, paddingVertical: 6, borderRadius: 99, borderWidth: 1 },
  label: { fontSize: 11, fontWeight: "600" },
});
