import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useBadgeStore } from "@/stores/badgeStore";

/**
 * talks テーブルのリアルタイム購読
 * INSERT / DELETE を検知して React Query キャッシュを自動更新する
 */
export function useRealtimeTalks() {
  const qc = useQueryClient();
  const incrementTalkUnread = useBadgeStore((s) => s.incrementTalkUnread);

  useEffect(() => {
    const channel = supabase
      .channel("talks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "talks" },
        (payload) => {
          qc.invalidateQueries({ queryKey: ["talks", "list"] });
          if (payload.eventType === "INSERT") incrementTalkUnread();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "talk_replies" },
        (payload) => {
          // 返信が来たら該当トークの詳細も更新
          const talkId = (payload.new as any)?.talk_id ?? (payload.old as any)?.talk_id;
          if (talkId) {
            qc.invalidateQueries({ queryKey: ["talks", "detail", talkId] });
          }
          qc.invalidateQueries({ queryKey: ["talks", "list"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
