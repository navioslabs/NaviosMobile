import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPosts,
  fetchPostById,
  fetchNearbyPosts,
  searchPosts,
  createPost,
  deletePost,
} from "@/lib/posts";
import { refreshBadges } from "@/lib/badges";
import { getUserMessage } from "@/lib/appError";
import { useToastStore } from "@/stores/toastStore";

/** フィード一覧（ページネーション対応） */
export function usePosts(filters?: { category?: string; limit?: number; createdAfter?: string; createdBefore?: string }) {
  return useInfiniteQuery({
    queryKey: ["posts", "list", filters],
    queryFn: ({ pageParam = 0 }) => fetchPosts({ ...filters, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length >= 20 ? lastPageParam + 1 : undefined,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      // フラット化したデータ（既存コードとの互換性）
      flat: data.pages.flat(),
    }),
  });
}

/** 投稿詳細 */
export function usePost(id: string) {
  return useQuery({
    queryKey: ["posts", "detail", id],
    queryFn: () => fetchPostById(id),
    enabled: !!id,
  });
}

/**
 * ちかく一覧
 * queryKey に座標を含めず、100m閾値で手動 invalidate する方式
 */
export function useNearbyPosts(lat: number, lng: number, radius?: number) {
  return useQuery({
    queryKey: ["posts", "nearby"],
    queryFn: () => fetchNearbyPosts(lat, lng, radius),
    enabled: lat !== 0 && lng !== 0,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

/** 検索（カテゴリフィルタ対応） */
export function useSearchPosts(query: string, category?: string) {
  return useQuery({
    queryKey: ["search", "posts", query, category],
    queryFn: () => searchPosts(query, category),
    enabled: query.trim().length > 0,
  });
}

/** 投稿作成 */
export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts", "list"] });
      refreshBadges().then(() => qc.invalidateQueries({ queryKey: ["badges"] }));
    },
    onError: (error) => {
      useToastStore.getState().show(getUserMessage(error), "error");
    },
  });
}

/** 投稿削除 */
export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["posts", "list"] });
      qc.invalidateQueries({ queryKey: ["posts", "detail", id] });
    },
    onError: (error) => {
      useToastStore.getState().show(getUserMessage(error), "error");
    },
  });
}
