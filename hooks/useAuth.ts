import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import { useToastStore } from "@/stores/toastStore";

// ─── 型定義 ─────────────────────────────────────────

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isGuest: boolean;
}

interface AuthActions {
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

type AuthContextValue = AuthState & AuthActions;

// ─── Context ────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

/** 認証状態を参照するフック */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth は AuthProvider 内で使用してください");
  return ctx;
}

export { AuthContext };

// ─── Provider ロジック ──────────────────────────────

/** AuthProvider が内部で使うフック */
export function useAuthProvider(): AuthContextValue {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** profiles テーブルからプロフィールを取得 */
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) {
      if (__DEV__) console.error("プロフィール取得失敗:", error.message);
      useToastStore.getState().show("プロフィールの読み込みに失敗しました", "error");
      return;
    }
    setProfile(data as Profile);
  }, []);

  /** プロフィール再取得（外部から呼べる） */
  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  /** サインアップ */
  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) throw error;
    },
    []
  );

  /** ログイン */
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }, []);

  /** ログアウト */
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
    setSession(null);
  }, []);

  /** セッション監視 */
  useEffect(() => {
    // 初期セッション取得
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      setIsLoading(false);
    });

    // セッション変化を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  return {
    user,
    profile,
    session,
    isLoading,
    isGuest: !user,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };
}
