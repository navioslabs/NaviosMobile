import type { ReactNode } from "react";
import { AuthContext, useAuthProvider } from "@/hooks/useAuth";

interface Props {
  children: ReactNode;
}

/** 認証状態を全アプリに配信する Provider */
export default function AuthProvider({ children }: Props) {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
