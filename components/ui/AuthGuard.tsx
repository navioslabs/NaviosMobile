import type { ReactNode } from "react";
import { Pressable } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: ReactNode;
  /** ゲスト時のカスタムハンドラー（省略時はログイン画面へ遷移） */
  onGuest?: () => void;
}

/**
 * 認証が必要な操作をラップするコンポーネント。
 * ゲスト状態でタップするとログイン画面へ誘導する。
 */
export default function AuthGuard({ children, onGuest }: AuthGuardProps) {
  const { isGuest } = useAuth();

  if (!isGuest) return <>{children}</>;

  return (
    <Pressable
      onPress={() => {
        if (onGuest) {
          onGuest();
        } else {
          router.push("/(auth)/login");
        }
      }}
    >
      {children}
    </Pressable>
  );
}
