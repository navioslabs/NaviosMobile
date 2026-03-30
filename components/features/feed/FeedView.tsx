import { View, Text, FlatList, RefreshControl, Pressable, ActivityIndicator, Platform } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Inbox } from "@/lib/icons";
import { SPACE, WEIGHT, RADIUS } from "@/lib/styles";
import { isExpired } from "@/lib/adapters";
import type { Post } from "@/types";
import type { ThemeTokens } from "@/constants/theme";
import FeedPostCard from "@/components/features/feed/FeedPostCard";
import CategoryChips from "@/components/features/feed/CategoryChips";

interface Props {
  posts: Post[];
  dateLabel: string;
  selCat: string;
  onSelectCat: (cat: string) => void;
  onSelectDate: (offset: number) => void;
  onLongPressPost: (post: Post) => void;
  t: ThemeTokens;
  fs: Record<string, number>;
  isDark: boolean;
  isFetching: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;
  refetch: () => void;
}

/** フィードモードのレンダリング（FlatList含む） */
export default function FeedView({
  posts,
  dateLabel,
  selCat,
  onSelectCat,
  onSelectDate,
  onLongPressPost,
  t,
  fs,
  isDark,
  isFetching,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  refetch,
}: Props) {
  const ListHeader = (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: SPACE.xl,
          paddingTop: SPACE.sm,
          paddingBottom: SPACE.xs,
        }}
      >
        <Text style={{ fontSize: fs.sm, color: t.sub }}>{dateLabel}</Text>
        <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.accent }}>{posts.length}件</Text>
      </View>
      <CategoryChips t={t} selected={selCat} onSelect={onSelectCat} />
    </>
  );

  if (posts.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        {ListHeader}
        <View style={{ paddingVertical: 60, paddingHorizontal: SPACE.xl, alignItems: "center" }}>
          <Inbox size={40} color={t.muted} />
          <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text, marginTop: SPACE.md, textAlign: "center" }}>
            この日の投稿はまだありません
          </Text>
          <Text style={{ fontSize: fs.sm, color: t.sub, marginTop: SPACE.xs, textAlign: "center" }}>
            他の日付を選ぶか、投稿してみましょう
          </Text>
          <View style={{ flexDirection: "row", gap: SPACE.md, marginTop: SPACE.xl }}>
            <Pressable
              onPress={() => onSelectDate(0)}
              style={({ pressed }) => ({
                paddingHorizontal: SPACE.xl,
                paddingVertical: SPACE.md,
                borderRadius: RADIUS.full,
                backgroundColor: t.surface2,
                borderWidth: 1,
                borderColor: t.border,
                opacity: pressed ? 0.7 : 1,
              })}
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
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={({ item, index }) => (
        <FeedPostCard
          post={item}
          t={t}
          isDark={isDark}
          featured={index === 0 && !isExpired(item.deadline)}
          expired={isExpired(item.deadline)}
          onLongPress={() => onLongPressPost(item)}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={{ paddingBottom: 90 }}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={{ paddingVertical: SPACE.xl, alignItems: "center" }}>
            <ActivityIndicator size="small" color={t.accent} />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={isFetching && !isLoading && !isFetchingNextPage}
          onRefresh={() => refetch()}
          tintColor="transparent"
          colors={["transparent"]}
          progressBackgroundColor="transparent"
          style={Platform.OS === "android" ? { height: 0 } : undefined}
        />
      }
    />
  );
}
