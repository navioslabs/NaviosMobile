import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchComments, createComment, deleteComment } from "@/lib/comments";
import { getUserMessage } from "@/lib/appError";
import { useToastStore } from "@/stores/toastStore";

/** コメント一覧 */
export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    enabled: !!postId,
  });
}

/** コメント投稿 */
export function useCreateComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => createComment(postId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["posts", "detail", postId] });
    },
    onError: (error) => {
      useToastStore.getState().show(getUserMessage(error), "error");
    },
  });
}

/** コメント削除 */
export function useDeleteComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["posts", "detail", postId] });
    },
    onError: (error) => {
      useToastStore.getState().show(getUserMessage(error), "error");
    },
  });
}
