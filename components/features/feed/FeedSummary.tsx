import { View, Text, Pressable, ScrollView } from "react-native";
import { Flame, MapPin, Timer } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { FeedPost } from "@/types";
import { FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";

type FilterType = "top" | "nearby" | "urgent" | null;

interface FeedSummaryProps {
  t: ThemeTokens;
  posts: FeedPost[];
  dateLabel: string;
  totalCount: number;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

/** フィード上部のサマリーブロック + 日付ラベル */
export default function FeedSummary({ t, posts, dateLabel, totalCount, activeFilter, onFilterChange }: FeedSummaryProps) {
  const nearbyCount = posts.filter((p) => p.distance <= 200).length;
  const urgentCount = posts.filter((p) => p.timeLeft <= 60).length;
  const topMatch = posts.length > 0 ? posts.reduce((a, b) => (a.matchScore > b.matchScore ? a : b)) : null;

  const blocks: { id: FilterType; icon: typeof Flame; label: string; value: string; sub: string; color: string }[] = [
    {
      id: "top",
      icon: Flame,
      label: "注目",
      value: topMatch ? `${posts.length}件` : "—",
      sub: topMatch ? `最高マッチ ${topMatch.matchScore}%` : "",
      color: "#F0425C",
    },
    {
      id: "nearby",
      icon: MapPin,
      label: "200m以内",
      value: `${nearbyCount}件`,
      sub: "すぐ近くの投稿",
      color: t.accent,
    },
    {
      id: "urgent",
      icon: Timer,
      label: "まもなく終了",
      value: `${urgentCount}件`,
      sub: "1時間以内に終了",
      color: "#F5A623",
    },
  ];

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACE.xl, gap: SPACE.sm + 2, paddingVertical: SPACE.sm }}
      >
        {blocks.map((b) => {
          const Icon = b.icon;
          const isActive = activeFilter === b.id;
          return (
            <Pressable
              key={b.id}
              onPress={() => onFilterChange(isActive ? null : b.id)}
              style={({ pressed }) => ({
                width: 130,
                padding: SPACE.md,
                opacity: pressed ? 0.7 : 1,
                borderRadius: RADIUS.xl,
                backgroundColor: b.color + (isActive ? "25" : "10"),
                borderWidth: isActive ? 2 : 1,
                borderColor: isActive ? b.color : b.color + "20",
                gap: SPACE.sm,
              })}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
                <Icon size={14} color={b.color} />
                <Text style={{ fontSize: FONT_SIZE.xs, fontWeight: WEIGHT.semibold, color: b.color }}>{b.label}</Text>
              </View>
              <Text style={{ fontSize: FONT_SIZE.xl, fontWeight: WEIGHT.extrabold, color: t.text }} numberOfLines={1}>
                {b.value}
              </Text>
              {b.sub ? <Text style={{ fontSize: FONT_SIZE.xxs, color: t.muted }}>{b.sub}</Text> : null}
            </Pressable>
          );
        })}
      </ScrollView>
      {/* Date label + count integrated */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: SPACE.xl, paddingTop: SPACE.xs, paddingBottom: SPACE.xs }}>
        <Text style={{ fontSize: FONT_SIZE.sm, color: t.sub }}>{dateLabel}</Text>
        <Text style={{ fontSize: FONT_SIZE.xs, fontWeight: WEIGHT.semibold, color: t.accent }}>{totalCount}件</Text>
      </View>
    </View>
  );
}
