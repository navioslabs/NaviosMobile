# API・lib設計書

> 対象: NaviOs
> 更新日: 2026-03-25
> ステータス: 実装済み（2026-03-25）

---

## 1. 方針

- Supabase 呼び出しは `lib/` に関数として切り出し、画面から直接書かない
- サーバーデータの取得・キャッシュは React Query（`@tanstack/react-query`）を使用
- カスタム hooks は `hooks/` に配置し、画面から使う
- エラーは `lib/appError.ts` の `AppError` を throw する

```
画面(app/) → hooks(useXxx) → lib(fetchXxx / createXxx) → Supabase
```

---

## 2. React Query 導入設定

### 2.1 パッケージ

```bash
npx expo install @tanstack/react-query
```

### 2.2 QueryClientProvider

`app/_layout.tsx` に設置する。

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5分
      retry: 2,
      refetchOnWindowFocus: false, // RN では不要
    },
  },
});

// <QueryClientProvider client={queryClient}> で全体をラップ
```

---

## 3. queryKey 設計

機能単位で安定したキーを設計する。

| queryKey | 用途 | 引数 |
|----------|------|------|
| `['posts', 'list', filters]` | フィード一覧 | `{ category?, date?, sort? }` |
| `['posts', 'detail', id]` | 投稿詳細 | 投稿ID |
| `['posts', 'nearby', coords]` | ちかく一覧 | `{ lat, lng, radius }` |
| `['talks', 'list']` | ひとこと一覧 | — |
| `['talks', 'detail', id]` | ひとこと詳細 + 返信 | トークID |
| `['search', query]` | 検索結果 | 検索クエリ文字列 |
| `['profile', userId]` | ユーザープロフィール | ユーザーID |
| `['profile', userId, 'posts']` | ユーザーの投稿一覧 | ユーザーID |
| `['profile', userId, 'talks']` | ユーザーのひとこと一覧 | ユーザーID |
| `['comments', postId]` | 投稿のコメント一覧 | 投稿ID |
| `['replies', talkId]` | ひとことの返信一覧 | トークID |

---

## 4. lib/ 関数一覧

### 4.1 投稿（lib/posts.ts）

| 関数 | 引数 | 戻り値 | 説明 |
|------|------|--------|------|
| `fetchPosts(filters)` | `{ category?, date?, sort?, limit? }` | `Post[]` | フィード一覧取得 |
| `fetchPostById(id)` | `string` | `Post` | 投稿詳細取得 |
| `fetchNearbyPosts(coords, radius)` | `{ lat, lng }, number` | `NearbyPost[]` | ちかく一覧（PostGIS） |
| `createPost(data)` | `CreatePostInput` | `Post` | 投稿作成 |
| `updatePost(id, data)` | `string, UpdatePostInput` | `Post` | 投稿更新 |
| `deletePost(id)` | `string` | `void` | 投稿削除 |
| `searchPosts(query)` | `string` | `Post[]` | テキスト検索 |

### 4.2 ひとこと（lib/talks.ts）

| 関数 | 引数 | 戻り値 | 説明 |
|------|------|--------|------|
| `fetchTalks()` | — | `Talk[]` | ひとこと一覧取得 |
| `fetchTalkById(id)` | `string` | `Talk & { replies: Reply[] }` | 詳細 + 返信取得 |
| `createTalk(data)` | `CreateTalkInput` | `Talk` | ひとこと投稿 |
| `deleteTalk(id)` | `string` | `void` | ひとこと削除 |
| `createTalkReply(talkId, body)` | `string, string` | `Reply` | 返信投稿 |

### 4.3 いいね（lib/likes.ts）

| 関数 | 引数 | 戻り値 | 説明 |
|------|------|--------|------|
| `toggleLike(targetType, targetId)` | `string, string` | `{ liked: boolean }` | いいねのトグル |
| `checkIsLiked(targetType, targetId)` | `string, string` | `boolean` | いいね済み確認 |

### 4.4 コメント（lib/comments.ts）

| 関数 | 引数 | 戻り値 | 説明 |
|------|------|--------|------|
| `fetchComments(postId)` | `string` | `Comment[]` | コメント一覧 |
| `createComment(postId, body)` | `string, string` | `Comment` | コメント投稿 |
| `deleteComment(id)` | `string` | `void` | コメント削除 |

### 4.5 プロフィール（lib/profiles.ts）

| 関数 | 引数 | 戻り値 | 説明 |
|------|------|--------|------|
| `fetchProfile(userId)` | `string` | `Profile` | プロフィール取得 |
| `updateProfile(data)` | `UpdateProfileInput` | `Profile` | プロフィール更新 |
| `fetchUserPosts(userId)` | `string` | `Post[]` | ユーザーの投稿一覧 |
| `fetchUserTalks(userId)` | `string` | `Talk[]` | ユーザーのひとこと一覧 |

### 4.6 通報（lib/reports.ts）

| 関数 | 引数 | 戻り値 | 説明 |
|------|------|--------|------|
| `createReport(data)` | `Report` | `void` | 通報送信 |

### 4.7 画像アップロード（lib/storage.ts）

| 関数 | 引数 | 戻り値 | 説明 |
|------|------|--------|------|
| `uploadImage(bucket, uri)` | `string, string` | `string (publicUrl)` | 画像アップロード |
| `deleteImage(bucket, path)` | `string, string` | `void` | 画像削除 |

---

## 5. カスタム hooks 一覧

`hooks/` に配置する React Query ラッパー。

### 5.1 投稿系

| hook | 使用箇所 | 内容 |
|------|---------|------|
| `usePosts(filters)` | ホーム画面 | `useQuery` + `fetchPosts` |
| `usePost(id)` | 投稿詳細画面 | `useQuery` + `fetchPostById` |
| `useNearbyPosts(coords)` | ちかく画面 | `useQuery` + `fetchNearbyPosts` |
| `useSearchPosts(query)` | さがす画面 | `useQuery` + `searchPosts`、`enabled: query.length > 0` |
| `useCreatePost()` | 投稿作成画面 | `useMutation` + `createPost` |
| `useDeletePost()` | 投稿詳細画面 | `useMutation` + `deletePost` |

### 5.2 ひとこと系

| hook | 使用箇所 | 内容 |
|------|---------|------|
| `useTalks()` | ひとこと画面 | `useQuery` + `fetchTalks` |
| `useTalk(id)` | ひとこと詳細画面 | `useQuery` + `fetchTalkById` |
| `useCreateTalk()` | ひとこと投稿画面 | `useMutation` + `createTalk` |
| `useCreateReply(talkId)` | ひとこと詳細画面 | `useMutation` + `createTalkReply` |

### 5.3 いいね・コメント系

| hook | 使用箇所 | 内容 |
|------|---------|------|
| `useToggleLike()` | 各カード・詳細画面 | `useMutation` + `toggleLike` |
| `useComments(postId)` | 投稿詳細画面 | `useQuery` + `fetchComments` |
| `useCreateComment()` | 投稿詳細画面 | `useMutation` + `createComment` |

### 5.4 プロフィール系

| hook | 使用箇所 | 内容 |
|------|---------|------|
| `useProfile(userId)` | プロフィール画面 | `useQuery` + `fetchProfile` |
| `useUpdateProfile()` | プロフィール編集画面 | `useMutation` + `updateProfile` |

---

## 6. Mutation 後の invalidate 方針

| Mutation | invalidate するキー | 備考 |
|----------|---------------------|------|
| `createPost` | `['posts', 'list']` | 一覧を再取得 |
| `deletePost` | `['posts', 'list']`, `['posts', 'detail', id]` | 一覧と詳細 |
| `createTalk` | `['talks', 'list']` | 一覧を再取得 |
| `createTalkReply` | `['talks', 'detail', talkId]` | 詳細を再取得（返信含む） |
| `toggleLike` | 対象の detail キー | `likes_count` 更新反映 |
| `createComment` | `['comments', postId]`, `['posts', 'detail', postId]` | コメント一覧 + カウント更新 |
| `updateProfile` | `['profile', userId]` | プロフィール再取得 |
| `createReport` | なし | UIで送信完了表示のみ |

---

## 7. ローディング・エラー・空状態の統一

既存の `StateView` コンポーネントを React Query と連携させる。

```typescript
// 使用パターン
const { data, isLoading, error } = usePosts(filters);

if (isLoading) return <StateView type="loading" />;
if (error) return <StateView type="error" message="読み込みに失敗しました" onRetry={refetch} />;
if (!data?.length) return <StateView type="empty" message="投稿がありません" />;

return <FlatList data={data} ... />;
```

---

## 8. モックデータからの移行手順

段階的に移行する。移行中もアプリが動く状態を維持する。

### 移行順序

1. **ホーム（Feed）** — 最もデータ量が多く、主要画面
2. **ひとこと（Talk）** — 構造がシンプル
3. **ちかく（Nearby）** — PostGIS 依存、位置情報取得が必要
4. **さがす（Search）** — 検索クエリ依存
5. **プロフィール** — 認証完了後
6. **投稿作成 / ひとこと投稿** — Mutation の実装

### 移行パターン（1画面あたり）

```
1. lib/ にクエリ関数を作成
2. hooks/ に useQuery ラッパーを作成
3. 画面でモック import を useQuery に差し替え
4. StateView でローディング・エラー・空状態を処理
5. 動作確認
```
