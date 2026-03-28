import { useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, RefreshControl, Pressable } from "react-native";
import { Inbox } from "@/lib/icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { isExpired } from "@/lib/adapters";
import type { Post } from "@/types";
import PostPreviewSheet from "@/components/ui/PostPreviewSheet";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import { usePosts } from "@/hooks/usePosts";
import DatePicker from "@/components/features/feed/DatePicker";
import FeedSummary from "@/components/features/feed/FeedSummary";
import CategoryChips from "@/components/features/feed/CategoryChips";
import FeedPostCard from "@/components/features/feed/FeedPostCard";

type FilterType = "top" | "nearby" | "urgent" | null;

/** created_at から現在までの経過時間（時間）を算出 */
const hoursAgo = (createdAt: string): number =>
  (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);

const getDateLabel = (offset: number): string => {
  if (offset === 0) return "📍 今日 • 越谷市";
  if (offset === 1) return "📅 明日";
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `📅 ${d.getMonth() + 1}/${d.getDate()}`;
};

/** Feed画面 */
export default function FeedScreen() {
  const { s, t, fs, isDark } = useAppStyles();

  const [selDate, setSelDate] = useState(0);
  const [selCat, setSelCat] = useState("all");
  const [summaryFilter, setSummaryFilter] = useState<FilterType>(null);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  const { data: serverPosts, isLoading: queryLoading, refetch } = usePosts({
    category: selCat === "all" ? undefined : selCat,
  });

  const allPosts: Post[] = serverPosts ?? [];

  /** 日付オフセットに応じて投稿をフィルタ */
  const getPostsForDate = (offset: number, posts: Post[]): Post[] => {
    if (offset === 0) return posts.filter((p) => hoursAgo(p.created_at) <= 24);
    if (offset === 1) return posts.filter((p) => hoursAgo(p.created_at) > 24 && hoursAgo(p.created_at) <= 48);
    if (offset <= 3) return posts.filter((p) => hoursAgo(p.created_at) > 48 && hoursAgo(p.created_at) <= 96);
    return posts.filter((_, i) => i % (offset + 1) === 0);
  };

  const datePosts = getPostsForDate(selDate, allPosts);

  const filtered = useMemo(() => {
    let posts = selCat === "all" ? datePosts : datePosts.filter((p) => p.category === selCat);

    if (summaryFilter === "top") {
      posts = [...posts].sort((a, b) => b.likes_count - a.likes_count);
    } else if (summaryFilter === "nearby") {
      posts = posts.filter((p) => (p.distance_m ?? Infinity) <= 200);
    } else if (summaryFilter === "urgent") {
      posts = [...posts]
        .filter((p) => !isExpired(p.deadline))
        .sort((a, b) => {
          const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return aTime - bTime;
        });
    }

    // 期限切れ投稿をリスト末尾に回す
    const active = posts.filter((p) => !isExpired(p.deadline));
    const expired = posts.filter((p) => isExpired(p.deadline));
    return [...active, ...expired];
  }, [datePosts, selCat, summaryFilter]);

  const getPostCount = useCallback((offset: number) => getPostsForDate(offset, allPosts).length, [allPosts]);
  const renderItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <FeedPostCard post={item} t={t} isDark={isDark} featured={index === 0 && !isExpired(item.deadline)} expired={isExpired(item.deadline)} onLongPress={() => setPreviewPost(item)} />
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
            <View style={{ flexDirection: "row", gap: SPACE.md, marginTop: SPACE.xl }}>
              <Pressable
                onPress={() => setSelDate(0)}
                style={({ pressed }) => ({ paddingHorizontal: SPACE.xl, paddingVertical: SPACE.md, borderRadius: RADIUS.full, backgroundColor: t.surface2, borderWidth: 1, borderColor: t.border, opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>今日を見る</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/post")}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <LinearGradient
                  colors={[t.accent, t.blue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingHorizontal: SPACE.xl, paddingVertical: SPACE.md, borderRadius: RADIUS.full }}
                >
                  <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: "#000" }}>投稿する</Text>
                </LinearGradient>
              </Pressable>
            </View>
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
          refreshControl={
            <RefreshControl
              refreshing={queryLoading}
              onRefresh={() => refetch()}
              tintColor={t.accent}
              colors={[t.accent]}
              progressBackgroundColor={t.surface}
            />
          }
        />
      )}

      <PostPreviewSheet
        post={previewPost}
        visible={!!previewPost}
        onClose={() => setPreviewPost(null)}
        t={t}
        isDark={isDark}
      />
    </View>
  );
}
