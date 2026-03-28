import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTalks,
  fetchTalkById,
  searchTalks,
  createTalk,
  deleteTalk,
  createTalkReply,
} from "@/lib/talks";
import { refreshBadges } from "@/lib/badges";

/** ひとこと一覧 */
export function useTalks() {
  return useQuery({
    queryKey: ["talks", "list"],
    queryFn: fetchTalks,
  });
}

/** ひとこと詳細 + 返信 */
export function useTalk(id: string) {
  return useQuery({
    queryKey: ["talks", "detail", id],
    queryFn: () => fetchTalkById(id),
    enabled: !!id,
  });
}

/** ひとこと検索 */
export function useSearchTalks(query: string) {
  return useQuery({
    queryKey: ["talks", "search", query],
    queryFn: () => searchTalks(query),
    enabled: query.trim().length > 0,
  });
}

/** ひとこと投稿 */
export function useCreateTalk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTalk,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["talks", "list"] });
      refreshBadges().then(() => qc.invalidateQueries({ queryKey: ["badges"] }));
    },
  });
}

/** ひとこと削除 */
export function useDeleteTalk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTalk,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["talks", "list"] });
    },
  });
}

/** 返信投稿 */
export function useCreateReply(talkId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => createTalkReply(talkId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["talks", "detail", talkId] });
    },
  });
}
