import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGuestSheetStore } from "@/stores/guestSheetStore";

/**
 * ゲストユーザーのアクションをガードするフック
 * ゲスト時はログイン誘導シートを表示し、アクションを実行しない
 *
 * @example
 * const guard = useGuestGuard();
 * guard(() => toggleLike(), "いいね");
 */
export function useGuestGuard() {
  const { isGuest } = useAuth();
  const show = useGuestSheetStore((s) => s.show);

  return useCallback(
    (action: () => void, featureName?: string) => {
      if (isGuest) {
        show(featureName);
        return;
      }
      action();
    },
    [isGuest, show],
  );
}
