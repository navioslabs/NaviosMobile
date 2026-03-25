/**
 * アプリ統一エラークラス
 * ユーザー向けメッセージと開発者向け詳細を分離する
 */
export class AppError extends Error {
  /** ユーザーに表示する日本語メッセージ */
  readonly userMessage: string;
  /** HTTPステータスコード等 */
  readonly code?: string;

  constructor(
    userMessage: string,
    options?: { cause?: unknown; code?: string }
  ) {
    super(userMessage, { cause: options?.cause });
    this.name = "AppError";
    this.userMessage = userMessage;
    this.code = options?.code;
  }
}

/** Supabaseエラーコード → 日本語メッセージ */
const SUPABASE_MESSAGES: Record<string, string> = {
  "23505": "既に登録されています",
  "23503": "関連するデータが見つかりません",
  "42501": "この操作を行う権限がありません",
  PGRST116: "データが見つかりません",
  "invalid_credentials": "メールアドレスまたはパスワードが正しくありません",
  "user_already_exists": "このメールアドレスは既に登録されています",
  "email_not_confirmed": "メールアドレスの確認が必要です",
};

/** Supabase/Auth エラーを AppError に変換 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const e = error as any;
  const code = e?.code ?? e?.error_description ?? "";
  const msg = e?.message ?? "不明なエラー";

  // Supabase エラーコードからユーザー向けメッセージを引く
  const userMsg = SUPABASE_MESSAGES[code]
    ?? (msg.includes("network") || msg.includes("fetch") ? "ネットワークに接続できません" : undefined)
    ?? (msg.includes("JWT") || msg.includes("token") ? "セッションが切れました。再ログインしてください" : undefined)
    ?? "エラーが発生しました。もう一度お試しください";

  return new AppError(userMsg, { cause: error, code: String(code) });
}

/** エラーからユーザー向けメッセージを取得 */
export function getUserMessage(error: unknown): string {
  if (error instanceof AppError) return error.userMessage;
  return toAppError(error).userMessage;
}
