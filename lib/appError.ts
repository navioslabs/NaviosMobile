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
