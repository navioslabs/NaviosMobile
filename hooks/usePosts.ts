import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPosts,
  fetchPostById,
  fetchNearbyPosts,
  searchPosts,
  createPost,
  updatePost,
  deletePost,
} from "@/lib/posts";
import { refreshBadges } from "@/lib/badges";
import { getUserMessage } from "@/lib/appError";
import { useToastStore } from "@/stores/toastStore";

/** フィード一覧（ページネーション対応・距離付き） */
export function usePosts(filters?: { category?: string; limit?: number; createdAfter?: string; createdBefore?: string; userLat?: number; userLng?: number }) {
  // queryKey から座標を除外（位置移動で不要な再フェッチを防ぐ）
  const { userLat, userLng, ...keyFilters } = filters ?? {};
  return useInfiniteQuery({
    queryKey: ["posts", "list", keyFilters],
    queryFn: ({ pageParam = 0 }) => fetchPosts({ ...filters, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length >= 20 ? lastPageParam + 1 : undefined,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      flat: data.pages.flat(),
    }),
  });
}

/** 投稿詳細（距離・座標付き。位置情報を待たずに即取得開始） */
export function usePost(id: string, userLat = 0, userLng = 0, locationReady = false) {
  return useQuery({
    queryKey: ["posts", "detail", id, locationReady ? userLat : 0, locationReady ? userLng : 0],
    queryFn: () => fetchPostById(id, locationReady ? userLat : 0, locationReady ? userLng : 0),
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

/** 投稿更新 */
export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updatePost>[1] }) =>
      updatePost(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["posts", "detail"] });
      qc.invalidateQueries({ queryKey: ["posts", "list"] });
      useToastStore.getState().show("投稿を更新しました", "success");
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
      useToastStore.getState().show("投稿を削除しました", "success");
    },
    onError: (error) => {
      useToastStore.getState().show(getUserMessage(error), "error");
    },
  });
}
