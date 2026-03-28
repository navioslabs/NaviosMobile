import { create } from "zustand";

interface GuestSheetState {
  visible: boolean;
  featureName: string | undefined;
  show: (featureName?: string) => void;
  hide: () => void;
}

/** ゲストログイン誘導シートの表示状態 */
export const useGuestSheetStore = create<GuestSheetState>((set) => ({
  visible: false,
  featureName: undefined,
  show: (featureName) => set({ visible: true, featureName }),
  hide: () => set({ visible: false, featureName: undefined }),
}));
