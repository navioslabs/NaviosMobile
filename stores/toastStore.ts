import { create } from "zustand";

interface ToastState {
  visible: boolean;
  message: string;
  type: "success" | "error";
  show: (message: string, type?: "success" | "error") => void;
  hide: () => void;
}

/** グローバルトースト状態 */
export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: "",
  type: "success",
  show: (message, type = "success") => set({ visible: true, message, type }),
  hide: () => set({ visible: false }),
}));
