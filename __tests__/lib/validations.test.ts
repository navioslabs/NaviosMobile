import {
  loginSchema,
  signupSchema,
  createPostSchema,
  createTalkSchema,
  updateProfileSchema,
  commentSchema,
} from "@/lib/validations";

describe("loginSchema", () => {
  it("有効な入力を受け付ける", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("8文字未満のパスワードを拒否する", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("無効なメールを拒否する", () => {
    const result = loginSchema.safeParse({
      email: "invalid-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("空のパスワードを拒否する", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("有効な入力を受け付ける", () => {
    const result = signupSchema.safeParse({
      displayName: "テストユーザー",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("パスワード不一致を拒否する", () => {
    const result = signupSchema.safeParse({
      displayName: "テストユーザー",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });

  it("表示名21文字以上を拒否する", () => {
    const result = signupSchema.safeParse({
      displayName: "あ".repeat(21),
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("createPostSchema", () => {
  it("有効な投稿を受け付ける", () => {
    const result = createPostSchema.safeParse({
      category: "event",
      title: "テスト投稿",
      content: "本文です",
      deadline: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it("空タイトルを拒否する", () => {
    const result = createPostSchema.safeParse({
      category: "event",
      title: "",
      deadline: new Date(),
    });
    expect(result.success).toBe(false);
  });

  it("101文字のタイトルを拒否する", () => {
    const result = createPostSchema.safeParse({
      category: "event",
      title: "あ".repeat(101),
      deadline: new Date(),
    });
    expect(result.success).toBe(false);
  });

  it("無効なカテゴリを拒否する", () => {
    const result = createPostSchema.safeParse({
      category: "invalid",
      title: "テスト",
      deadline: new Date(),
    });
    expect(result.success).toBe(false);
  });
});

describe("createTalkSchema", () => {
  it("140文字以内のメッセージを受け付ける", () => {
    const result = createTalkSchema.safeParse({ message: "テスト" });
    expect(result.success).toBe(true);
  });

  it("141文字のメッセージを拒否する", () => {
    const result = createTalkSchema.safeParse({ message: "あ".repeat(141) });
    expect(result.success).toBe(false);
  });

  it("空メッセージを拒否する", () => {
    const result = createTalkSchema.safeParse({ message: "" });
    expect(result.success).toBe(false);
  });
});

describe("updateProfileSchema", () => {
  it("有効なプロフィールを受け付ける", () => {
    const result = updateProfileSchema.safeParse({
      displayName: "ユーザー",
      bio: "自己紹介です",
      isPublic: true,
      showLocation: true,
      showCheckins: false,
    });
    expect(result.success).toBe(true);
  });

  it("151文字のbioを拒否する", () => {
    const result = updateProfileSchema.safeParse({
      displayName: "ユーザー",
      bio: "あ".repeat(151),
      isPublic: true,
      showLocation: true,
      showCheckins: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("commentSchema", () => {
  it("有効なコメントを受け付ける", () => {
    const result = commentSchema.safeParse({ body: "コメントです" });
    expect(result.success).toBe(true);
  });

  it("501文字のコメントを拒否する", () => {
    const result = commentSchema.safeParse({ body: "あ".repeat(501) });
    expect(result.success).toBe(false);
  });
});
