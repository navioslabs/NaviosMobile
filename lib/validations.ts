import { z } from "zod";

// ─── 認証 ───────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "入力してください")
    .email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "入力してください"),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    displayName: z
      .string()
      .min(1, "入力してください")
      .max(20, "20文字以内で入力してください"),
    email: z
      .string()
      .min(1, "入力してください")
      .email("有効なメールアドレスを入力してください"),
    password: z.string().min(8, "8文字以上で入力してください"),
    confirmPassword: z.string().min(1, "入力してください"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });
export type SignupForm = z.infer<typeof signupSchema>;

// ─── 投稿作成 ───────────────────────────────────────

export const createPostSchema = z.object({
  category: z.enum(["lifeline", "event", "help"], {
    error: "カテゴリを選択してください",
  }),
  title: z
    .string()
    .min(1, "タイトルを入力してください")
    .max(100, "100文字以内で入力してください"),
  content: z
    .string()
    .max(2000, "2000文字以内で入力してください")
    .optional()
    .or(z.literal("")),
  deadline: z.date({ error: "期限を選択してください" }),
});
export type CreatePostForm = z.infer<typeof createPostSchema>;

// ─── ひとこと投稿 ───────────────────────────────────

export const createTalkSchema = z.object({
  message: z
    .string()
    .min(1, "入力してください")
    .max(140, "140文字以内で入力してください"),
  imageUri: z.string().optional(),
});
export type CreateTalkForm = z.infer<typeof createTalkSchema>;

// ─── プロフィール編集 ───────────────────────────────

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, "表示名を入力してください")
    .max(20, "20文字以内で入力してください"),
  bio: z
    .string()
    .max(150, "150文字以内で入力してください")
    .optional()
    .or(z.literal("")),
  locationText: z.string().optional().or(z.literal("")),
  isPublic: z.boolean(),
  showLocation: z.boolean(),
  showCheckins: z.boolean(),
});
export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

// ─── 通報 ───────────────────────────────────────────

export const createReportSchema = z.object({
  targetType: z.enum(["feed", "talk", "nearby"]),
  targetId: z.string(),
  reason: z.enum(
    ["spam", "inappropriate", "misleading", "harassment", "dangerous", "other"],
    { error: "理由を選択してください" }
  ),
  detail: z
    .string()
    .max(500, "500文字以内で入力してください")
    .optional()
    .or(z.literal("")),
});
export type CreateReportForm = z.infer<typeof createReportSchema>;

// ─── コメント / 返信 ───────────────────────────────

export const commentSchema = z.object({
  body: z
    .string()
    .min(1, "入力してください")
    .max(500, "500文字以内で入力してください"),
});
export type CommentForm = z.infer<typeof commentSchema>;
