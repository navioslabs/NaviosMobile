import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPosts,
  fetchPostById,
  fetchNearbyPosts,
  searchPosts,
  createPost,
  deletePost,
} from "@/lib/posts";

/** フィード一覧 */
export function usePosts(filters?: { category?: string; limit?: number }) {
  return useQuery({
    queryKey: ["posts", "list", filters],
    queryFn: () => fetchPosts(filters),
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

/** ちかく一覧 */
export function useNearbyPosts(lat: number, lng: number, radius?: number) {
  return useQuery({
    queryKey: ["posts", "nearby", { lat, lng, radius }],
    queryFn: () => fetchNearbyPosts(lat, lng, radius),
    enabled: lat !== 0 && lng !== 0,
  });
}

/** 検索 */
export function useSearchPosts(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchPosts(query),
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
  });
}
