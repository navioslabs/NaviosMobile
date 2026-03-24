import { Text, Pressable, ScrollView } from "react-native";
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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-[7px] px-5 pt-1.5 pb-3.5">
      {cats.map((cat) => {
        const Icon = cat.icon;
        const active = selected === cat.id;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            className="flex-row items-center gap-[5px] rounded-pill px-[13px] py-1.5"
            style={{ backgroundColor: active ? t.accent : t.surface, borderWidth: 1, borderColor: active ? t.accent : t.border }}
          >
            <Icon size={12} color={active ? "#000" : t.sub} />
            <Text className="text-[11px] font-semibold" style={{ color: active ? "#000" : t.sub }}>
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
