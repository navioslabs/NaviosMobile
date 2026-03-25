import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLike } from "@/lib/likes";

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
      // 詳細画面のキャッシュを更新
      if (targetType === "post") {
        qc.invalidateQueries({ queryKey: ["posts", "detail"] });
        qc.invalidateQueries({ queryKey: ["posts", "list"] });
      } else if (targetType === "talk") {
        qc.invalidateQueries({ queryKey: ["talks", "detail"] });
        qc.invalidateQueries({ queryKey: ["talks", "list"] });
      }
    },
  });
}
