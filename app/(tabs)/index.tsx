import { useState, useCallback, useMemo } from "react";
import { View, Text, FlatList } from "react-native";
import { Calendar, Inbox } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { FEED_POSTS } from "@/data/mockData";
import type { FeedPost } from "@/types";
import { useThemeStore } from "@/stores/themeStore";
import { createStyles, FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import DatePicker from "@/components/features/feed/DatePicker";
import FeedSummary from "@/components/features/feed/FeedSummary";
import CategoryChips from "@/components/features/feed/CategoryChips";
import FeedPostCard from "@/components/features/feed/FeedPostCard";

type FilterType = "top" | "nearby" | "urgent" | null;

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
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);
  const s = createStyles(t);

  const [selDate, setSelDate] = useState(0);
  const [selCat, setSelCat] = useState("all");
  const [summaryFilter, setSummaryFilter] = useState<FilterType>(null);

  const datePosts = getPostsForDate(selDate);

  const filtered = useMemo(() => {
    let posts = selCat === "all" ? datePosts : datePosts.filter((p) => p.category === selCat);

    if (summaryFilter === "top") {
      posts = [...posts].sort((a, b) => b.matchScore - a.matchScore);
    } else if (summaryFilter === "nearby") {
      posts = posts.filter((p) => p.distance <= 200);
    } else if (summaryFilter === "urgent") {
      posts = [...posts].sort((a, b) => a.timeLeft - b.timeLeft);
    }

    return posts;
  }, [datePosts, selCat, summaryFilter]);

  const getPostCount = useCallback((offset: number) => getPostsForDate(offset).length, []);
  const renderItem = useCallback(
    ({ item, index }: { item: FeedPost; index: number }) => (
      <FeedPostCard post={item} t={t} isDark={isDark} featured={index === 0} />
    ),
    [t, isDark]
  );

  const ListHeader = (
    <>
      <FeedSummary
        t={t}
        posts={datePosts}
        dateLabel={getDateLabel(selDate)}
        totalCount={filtered.length}
        activeFilter={summaryFilter}
        onFilterChange={setSummaryFilter}
      />
      <CategoryChips t={t} selected={selCat} onSelect={setSelCat} />
    </>
  );

  return (
    <View style={s.screen}>
      <DatePicker t={t} selectedDate={selDate} onSelectDate={setSelDate} getPostCount={getPostCount} />

      {filtered.length === 0 ? (
        <View style={{ flex: 1 }}>
          {ListHeader}
          <View style={{ paddingVertical: 60, paddingHorizontal: SPACE.xl, alignItems: "center" }}>
            <Inbox size={40} color={t.muted} />
            <Text style={[s.textSubheading, { marginTop: SPACE.md, color: t.text }]}>この日の投稿はまだありません</Text>
            <Text style={[s.textLabel, { marginTop: SPACE.xs, color: t.sub }]}>他の日付を選ぶか、投稿してみましょう</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 90 }}
        />
      )}
    </View>
  );
}
