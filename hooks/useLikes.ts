import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLike, checkIsLiked } from "@/lib/likes";
import { getUserMessage } from "@/lib/appError";
import { useToastStore } from "@/stores/toastStore";

/** いいね済み確認 */
export function useIsLiked(
  targetType: "post" | "talk" | "comment" | "reply",
  targetId: string | undefined
) {
  return useQuery({
    queryKey: ["likes", targetType, targetId],
    queryFn: () => checkIsLiked(targetType, targetId!),
    enabled: !!targetId,
  });
}

/** いいねトグル */
export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      targetType,
      targetId,
    }: {
      targetType: "post" | "talk" | "comment" | "reply";
      targetId: string;
    }) => toggleLike(targetType, targetId),
    onSuccess: (_data, { targetType, targetId }) => {
      // いいね状態のキャッシュを更新
      qc.invalidateQueries({ queryKey: ["likes", targetType, targetId] });
      if (targetType === "post") {
        qc.invalidateQueries({ queryKey: ["posts", "detail", targetId] });
        qc.invalidateQueries({ queryKey: ["posts", "list"] });
        qc.invalidateQueries({ queryKey: ["posts", "nearby"] });
      } else if (targetType === "talk") {
        qc.invalidateQueries({ queryKey: ["talks", "detail", targetId] });
        qc.invalidateQueries({ queryKey: ["talks", "list"] });
      }
    },
    onError: (error) => {
      useToastStore.getState().show(getUserMessage(error), "error");
    },
  });
}
