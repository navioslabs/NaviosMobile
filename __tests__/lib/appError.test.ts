import { AppError, toAppError, getUserMessage } from "@/lib/appError";

describe("AppError", () => {
  it("userMessage を保持する", () => {
    const err = new AppError("テストエラー");
    expect(err.userMessage).toBe("テストエラー");
    expect(err.name).toBe("AppError");
  });

  it("code を保持する", () => {
    const err = new AppError("テスト", { code: "TEST_001" });
    expect(err.code).toBe("TEST_001");
  });
});

describe("toAppError", () => {
  it("AppError はそのまま返す", () => {
    const original = new AppError("元のエラー");
    expect(toAppError(original)).toBe(original);
  });

  it("Supabase 23505 → 既に登録されています", () => {
    const err = toAppError({ code: "23505", message: "duplicate key" });
    expect(err.userMessage).toBe("既に登録されています");
  });

  it("invalid_credentials → ログイン失敗メッセージ", () => {
    const err = toAppError({ code: "invalid_credentials", message: "" });
    expect(err.userMessage).toBe("メールアドレスまたはパスワードが正しくありません");
  });

  it("ネットワークエラー → ネットワーク接続メッセージ", () => {
    const err = toAppError({ message: "network request failed" });
    expect(err.userMessage).toBe("ネットワークに接続できません");
  });

  it("JWTエラー → セッション切れメッセージ", () => {
    const err = toAppError({ message: "JWT expired" });
    expect(err.userMessage).toBe("セッションが切れました。再ログインしてください");
  });

  it("不明なエラー → 汎用メッセージ", () => {
    const err = toAppError({ message: "unknown" });
    expect(err.userMessage).toBe("エラーが発生しました。もう一度お試しください");
  });

  it("null を渡してもクラッシュしない", () => {
    const err = toAppError(null);
    expect(err).toBeInstanceOf(AppError);
  });

  it("undefined を渡してもクラッシュしない", () => {
    const err = toAppError(undefined);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe("getUserMessage", () => {
  it("AppError から userMessage を返す", () => {
    expect(getUserMessage(new AppError("ユーザー向け"))).toBe("ユーザー向け");
  });

  it("通常の Error から汎用メッセージを返す", () => {
    expect(getUserMessage(new Error("internal"))).toBe(
      "エラーが発生しました。もう一度お試しください"
    );
  });
});
