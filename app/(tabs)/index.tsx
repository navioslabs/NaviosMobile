import { useState, useCallback } from "react";
import { View, Text, FlatList } from "react-native";
import { Calendar } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { FEED_POSTS } from "@/data/mockData";
import type { FeedPost } from "@/types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import DatePicker from "@/components/features/feed/DatePicker";
import CategoryChips from "@/components/features/feed/CategoryChips";
import FeedPostCard from "@/components/features/feed/FeedPostCard";

const getPostsForDate = (offset: number): FeedPost[] => {
  if (offset === 0) return FEED_POSTS.filter((p) => p.hoursAgo <= 24);
  if (offset === 1) return FEED_POSTS.filter((p) => p.hoursAgo > 24 && p.hoursAgo <= 48);
  if (offset <= 3) return FEED_POSTS.filter((p) => p.hoursAgo > 48 && p.hoursAgo <= 96);
  return FEED_POSTS.filter((_, i) => i % (offset + 1) === 0);
};

const getDateLabel = (offset: number): string => {
  if (offset === 0) return "📍 今日 • 越谷市";
  if (offset === 1) return "📅 明日";
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `📅 ${d.getMonth() + 1}/${d.getDate()}`;
};

/** Feed画面 */
export default function FeedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = makeTokens(isDark);

  const [selDate, setSelDate] = useState(0);
  const [selCat, setSelCat] = useState("all");

  const datePosts = getPostsForDate(selDate);
  const filtered = selCat === "all" ? datePosts : datePosts.filter((p) => p.category === selCat);

  const getPostCount = useCallback((offset: number) => getPostsForDate(offset).length, []);
  const renderItem = useCallback(
    ({ item }: { item: FeedPost }) => <FeedPostCard post={item} t={t} isDark={isDark} />,
    [t, isDark]
  );

  return (
    <View className="flex-1" style={{ backgroundColor: t.bg }}>
      <DatePicker t={t} selectedDate={selDate} onSelectDate={setSelDate} getPostCount={getPostCount} />

      <View className="flex-row justify-between items-center px-5 pt-2.5 pb-1">
        <Text className="text-[11px]" style={{ color: t.sub }}>{getDateLabel(selDate)}</Text>
        <Text className="text-[10px] font-semibold" style={{ color: t.accent }}>{filtered.length}件</Text>
      </View>

      <CategoryChips t={t} selected={selCat} onSelect={setSelCat} />

      {filtered.length === 0 ? (
        <View className="py-[60px] px-5 items-center">
          <Calendar size={32} color={t.muted} />
          <Text className="text-sm font-semibold mt-3" style={{ color: t.sub }}>この日の投稿はまだありません</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-[90px]"
        />
      )}
    </View>
  );
}
