# AI実装プロンプト・必要書類・今後タスク

> 対象: NaviOs
> 更新日: 2026-03-28
> 用途: 実装フェーズの進捗管理、AIに読み込ませるプロンプト、作成すべき書類、今後のタスクを整理する

---

## 1. 現在地

### できていること

| 項目 | 状態 | 備考 |
|------|------|------|
| プロジェクト構成 | **完了** | Expo Router, ディレクトリ構成, パスエイリアス |
| 全画面UI | **完了** | フィード, ちかく, トーク, さがす, 設定, 投稿, プロフィール等 |
| コンポーネント分割 | **完了** | ui / features / layout に34+コンポーネント |
| テーマシステム | **完了** | Dark/Light切替, デザイントークン, フォントスケーリング |
| ナビゲーション | **完了** | 5タブ + モーダル + 動的ルート |
| Supabaseクライアント | **完了** | `lib/supabase.ts` で初期化済み |
| エラークラス | **完了** | `lib/appError.ts` で定義済み |
| Zustandストア | **完了** | テーマ (`themeStore`), フォントサイズ (`fontSizeStore`) |
| DBテーブル設計・マイグレーション | **完了** | `supabase/migrations/` に3ファイル（初期スキーマ, PostGIS RPC, Realtime有効化） |
| 認証 | **完了** | Supabase Auth, `useAuth` hook, `(auth)/login.tsx`, `(auth)/signup.tsx`, AuthProvider |
| React Query | **完了** | `@tanstack/react-query` 導入済み, `QueryClientProvider` 設定済み |
| Supabase クエリ関数 | **完了** | `lib/posts.ts`, `lib/talks.ts`, `lib/comments.ts`, `lib/likes.ts`, `lib/profiles.ts`, `lib/reports.ts`, `lib/storage.ts` |
| React Query hooks | **完了** | `usePosts`, `useTalks`, `useComments`, `useLikes`, `useProfile`, `useRealtimeTalks` |
| 位置情報取得 | **完了** | `expo-location` + `useLocation` hook（フォールバック: 越谷駅付近） |
| 画像アップロード | **完了** | `lib/storage.ts` + `useImagePicker` hook |
| 通報機能 | **完了** | `ReportModal` + `lib/reports.ts` + `createReport` |
| アニメーション | **完了** | Reanimated による FAB開閉, Nearbyカード出現, LIVE/HOT脈動, AI検索遷移, タブアイコン演出 |
| ロゴタップでリフレッシュ | **完了** | Header のロゴ押下 → ちかくタブ遷移 + Nearby invalidate |
| 設計書類 | **完了** | データ設計, 認証設計, API・lib設計, 画面仕様書, バリデーション設計（`docs/設計-仕様書/`） |
| UI/UX改善提案 | **完了** | `docs/案-引継ぎ書/UI_UX改善提案.md` |
| アニメーション提案 | **完了** | `docs/案-引継ぎ書/アニメーション実装提案.md`（全5件実装済み） |
| UI/UX改善実装（9機能） | **完了** | ボトムシート、タブバッジ、オンボーディング、カテゴリ色分け、急上昇、a11y、エラーガイド、ダークモード最適化、プロフィールカード |

### まだできていないこと

| 項目 | 状態 | 備考 |
|------|------|------|
| React Hook Form + Zod | **完了** | 全フォーム（login, signup, post, talk-post, profile/edit）で React Hook Form + Zod 使用中 |
| RLS ポリシー | **レビュー完了** | 全テーブル・Storageの RLS を確認済み。問題なし（詳細は `docs/2026-03-26_改修レポート.md`） |
| 通知 | **未実装** | プッシュ通知・アプリ内通知ともに未着手 |
| Realtime 統合テスト | **要確認** | `useRealtimeTalks` は実装済みだが、Supabase側の Realtime 有効化が正しく動くか実機テスト未実施 |
| テスト | **未実装** | ユニットテスト・E2Eテスト一切なし |
| エラーハンドリング統一 | **完了** | 全画面で `getUserMessage()` を使用。`catch (e: unknown)` に統一済み |
| パフォーマンス最適化 | **一部** | FlatList `memo` は一部適用済み、画像最適化は未着手 |
| アクセシビリティ | **一部完了** | 主要タップ可能要素に `accessibilityLabel` / `accessibilityRole` 追加済み（2026-03-28）。残りの画面は未対応 |
| 環境変数整理 | **要確認** | `.env` の管理状況、`.env.example` の更新が必要 |
| Expo ビルド確認 | **一部** | 開発サーバーでは動作、プロダクションビルド未確認 |

---

## 2. AIに読み込ませる基本コンテキスト

以下は、今後どのプロンプトでも先頭に付ける共通文として使う。

```text
あなたは Expo / React Native / TypeScript / Supabase / React Query に強いシニアエンジニア兼テックリードです。

対象プロジェクト:
- 名前: NaviOs（地域情報共有モバイルアプリ）
- 技術スタック: Expo ~55, React Native 0.83, TypeScript 5.9, Supabase (Auth/Postgres/PostGIS/Storage/Realtime), React Query, React Hook Form, Zod, React Native Reanimated
- 状態管理方針: サーバーデータは React Query、UI状態はローカル state または Zustand
- 言語: 日本語のみ
- 制約: ネイティブモジュールは可能な限り避ける

現在の状態:
- 全画面のUI・コンポーネント・アニメーションは実装済み
- Supabase Auth 認証（メール+パスワード）実装済み。ゲスト閲覧可、投稿にはログイン必須
- DBマイグレーション3本（初期スキーマ / PostGIS RPC / Realtime有効化）作成済み
- React Query 導入済み。全画面がサーバーデータに接続済み（モックデータ不使用）
- lib/ にクエリ関数を分離済み（posts, talks, comments, likes, profiles, reports, storage）
- 位置情報（expo-location）、画像アップロード（Storage + ImagePicker）実装済み
- 投稿・トーク投稿・プロフィール編集フォームは useState 直書き（React Hook Form 未移行）
- 通知機能は未実装
- テストは未実装

前提:
- 既存UIを壊さず改善する方針で進めたい
- Supabase 呼び出しは画面から直接書かず、lib層へ分離する
- 抽象論ではなく、実装に落とせる粒度で提案してほしい
```

---

## 3. AI用プロンプト集

### 3.1 フォーム移行プロンプト（次の優先タスク）

用途:
- useState 直書きのフォームを React Hook Form + Zod に移行する

```text
[共通コンテキストを貼る]

以下のフォームを React Hook Form + Zod に移行してください。

対象:
- 投稿フォーム（app/post.tsx）
- トーク投稿（app/talk-post.tsx）
- プロフィール編集（app/profile/edit.tsx）

現在の状態:
- useState で各フィールドを個別管理している
- バリデーションは手書きまたは未実装
- 認証画面（login.tsx, signup.tsx）では既に React Hook Form + Zod を使用中

出力形式:
1. Zod スキーマ定義（lib/validations.ts に追加）
2. useForm の設定
3. フォームフィールドの接続方法
4. バリデーションルールとエラーメッセージ（日本語）
5. 送信ハンドラ（React Query mutation との連携）
6. 移行前後の差分
```

### 3.2 通知機能設計プロンプト

```text
[共通コンテキストを貼る]

NaviOs にプッシュ通知・アプリ内通知を追加する設計をしてください。

要件:
- 自分の投稿にいいね・コメントが付いたら通知
- 近くで新しい投稿があったら通知（オプトイン）
- Expo Notifications を使用
- Supabase のトリガーまたは Edge Functions で通知をディスパッチ

出力形式:
1. 通知の種類一覧
2. Supabase テーブル設計（notifications テーブル）
3. 通知トリガーの実装方法
4. Expo Notifications の設定手順
5. アプリ内通知一覧画面の設計
6. 通知設定画面（オン/オフ）
```

### 3.3 RLS・セキュリティ確認プロンプト

```text
[共通コンテキストを貼る]

現在の RLS ポリシーとセキュリティ設定を確認・強化してください。

確認対象:
- supabase/migrations/ の全マイグレーション SQL
- lib/ の全クエリ関数
- .env の管理状況

出力形式:
1. 現在の RLS ポリシー一覧と問題点
2. 不足している RLS ポリシーの追加 SQL
3. クエリ関数のセキュリティ上の懸念
4. 環境変数の管理に関する改善点
5. Storage のアクセス制御確認
```

### 3.4 テスト導入プロンプト

```text
[共通コンテキストを貼る]

NaviOs にテストを導入する計画を立ててください。

現在の状態:
- テストは一切なし
- Jest / React Native Testing Library はセットアップされていない

出力形式:
1. テストフレームワークの選定と導入手順
2. テスト対象の優先順位（lib層 → hooks → 画面の順）
3. lib/ のクエリ関数のユニットテスト例
4. React Query hooks のテスト方法
5. 認証フローのテスト方針
6. CI でのテスト実行設定
```

### 3.5 コードレビュー依頼プロンプト

```text
[共通コンテキストを貼る]

以下の実装差分をレビューしてください。

レビュー観点:
- バグの可能性
- 状態管理の不整合
- React Query の使い方
- Supabase 呼び出しの責務分離
- 型安全性
- UX劣化の可能性
- リファクタ余地

出力形式:
1. 重大な問題
2. 中程度の問題
3. 軽微な改善点
4. 良い点
5. 修正優先順位
```

### 3.6 リリース前確認プロンプト

```text
[共通コンテキストを貼る]

MVPリリース前チェックリストを作成してください。

チェック観点:
- 認証（ログイン/サインアップ/ログアウト/セッション永続化）
- 投稿（作成/表示/いいね/コメント）
- 検索
- 位置情報（距離計算/ちかく一覧）
- エラー処理（ネットワーク/認証/権限）
- ローディング・空状態
- セキュリティ（RLS/環境変数/Storage）
- パフォーマンス（画像最適化/リスト仮想化）

出力形式:
- must（リリース不可レベル）
- should（あった方がいい）
- nice to have（余裕があれば）
```

---

## 4. 書類の状況

### 完了

| 書類 | 場所 | 備考 |
|------|------|------|
| データ設計書 | `docs/設計-仕様書/データ設計.md` | テーブル定義、RLS、Storage方針 |
| 認証設計書 | `docs/設計-仕様書/認証設計.md` | Auth フロー、ゲスト制限 |
| API・lib設計書 | `docs/設計-仕様書/API・lib設計.md` | クエリ関数一覧、React Query 構成 |
| 画面仕様書 | `docs/設計-仕様書/画面仕様書.md` | 各画面の状態・操作・データ要件 |
| バリデーション設計書 | `docs/設計-仕様書/バリデーション設計.md` | Zod スキーマ定義一覧 |
| UI/UX改善提案 | `docs/案-引継ぎ書/UI_UX改善提案.md` | タブ名変更等の最終修正提案 |
| アニメーション実装提案 | `docs/案-引継ぎ書/アニメーション実装提案.md` | 全5件実装完了 |

### 未作成（今後必要になるもの）

| 書類 | 優先度 | 備考 |
|------|--------|------|
| 通知設計書 | High | 通知機能の実装前に必要 |
| テスト設計書 | Middle | テスト導入前に方針を決める |
| エラーハンドリング設計書 | Middle | 全画面統一のエラー処理方針 |
| 運用設計書 | Low | デプロイ・監視・ログ |
| リリースチェックリスト | Low | MVP出荷前に作成 |

---

## 5. これからのタスク

### ~~フェーズ1: フォーム強化~~ → 完了（2026-03-26）

- [x] `app/post.tsx` を React Hook Form + Zod に移行
- [x] `app/talk-post.tsx` を React Hook Form + Zod に移行
- [x] `app/profile/edit.tsx` を React Hook Form + Zod に移行
- [x] バリデーションエラーの日本語メッセージ統一
- [x] `lib/validations.ts` にスキーマ追加（deadline フィールド追加）

### ~~フェーズ2: RLS・セキュリティ確認~~ → 完了（2026-03-26）

- [x] RLS ポリシーの実運用テスト（認証ユーザー / 未認証ユーザー / 他人のデータ）
- [x] Storage のアクセス制御確認
- [ ] `.env.example` の更新
- [x] Supabase クエリ関数のセキュリティレビュー

### フェーズ3: Realtime 統合テスト

- [ ] `useRealtimeTalks` の実機テスト
- [ ] Supabase の Realtime 有効化が正しく動くか確認
- [ ] 接続断→再接続時の挙動確認

### フェーズ4: 通知機能

- [ ] 通知設計書の作成
- [ ] notifications テーブル追加
- [ ] Expo Notifications 導入
- [ ] いいね・コメント通知トリガー
- [ ] アプリ内通知一覧画面
- [ ] 通知設定（オン/オフ）

### フェーズ5: 品質強化

- [x] エラーハンドリングの全画面統一（`appError.ts` の活用）→ 完了（2026-03-26）
- [x] エラー状態のリカバリーガイド（種別別ガイド + アクションボタン）→ 完了（2026-03-28）
- [x] ダークモードのコントラスト最適化（WCAG AA準拠）→ 完了（2026-03-28）
- [x] アクセシビリティ改善（主要要素に `accessibilityLabel` / `accessibilityRole` 追加）→ 一部完了（2026-03-28）
- [ ] アクセシビリティ改善（残りの画面・コンポーネント）
- [ ] ローディング / 空状態の最終確認
- [ ] パフォーマンス改善（画像最適化、FlatList チューニング）
- [ ] テスト導入（lib → hooks → 画面の順）

### フェーズ6: リリース準備

- [ ] Expo ビルド確認（Android / iOS）
- [ ] 環境変数の本番設定
- [ ] RLS の最終確認
- [ ] リリースチェックリスト作成・実施
- [ ] App Store / Google Play 申請準備

---

## 6. 完了済みフェーズ（アーカイブ）

以下は既に完了したフェーズ。記録として残す。

### ~~DB設計・マイグレーション~~ → 完了

- [x] Supabase テーブル設計・マイグレーション作成（3ファイル）
- [x] PostGIS 有効化（`rpc_nearby.sql`）
- [x] Realtime 有効化マイグレーション

### ~~認証~~ → 完了

- [x] Supabase Auth 設定（メール+パスワード）
- [x] profiles テーブル作成（Auth users と連携）
- [x] `useAuth` hook 実装
- [x] ログイン / サインアップ画面作成
- [x] 認証リダイレクト（Expo Router）
- [x] ゲスト制限の実装

### ~~React Query 導入 + データ接続~~ → 完了

- [x] `@tanstack/react-query` インストール + QueryClientProvider 設定
- [x] lib/ に Supabase クエリ関数を作成
- [x] 全画面をサーバーデータに接続（モックデータ完全削除）
  - [x] フィード、ちかく、トーク、さがす、設定、プロフィール
- [x] 投稿作成を useMutation に移行
- [x] いいね・コメント機能を実装

### ~~位置情報~~ → 完了

- [x] expo-location 導入
- [x] `useLocation` hook 作成（フォールバック付き）
- [x] ちかく画面の距離計算をリアルデータに
- [x] 投稿時の位置情報付与

### ~~画像・メディア~~ → 完了

- [x] 画像ピッカー導入（`useImagePicker`）
- [x] Supabase Storage への画像アップロード（`lib/storage.ts`）
- [x] 投稿時の画像添付
- [x] プロフィール画像の変更

### ~~UIアニメーション~~ → 完了

- [x] FAB 開閉アニメーション（Backdrop フェード、メニュースタッガー、アイコン回転、ボタンバウンス）
- [x] Nearby カード出現（FadeInUp スタッガー）
- [x] ScanHeader LIVE / HOT 脈動（usePulse hook）
- [x] AI 検索の状態遷移（クロスフェード、スタッガー、FadeInUp）
- [x] タブ中央アイコンのフォーカス演出（withSpring scale + グロー）

### ~~その他の改善~~ → 完了

- [x] ロゴタップで「ちかく」タブに戻り + Nearby データ再取得
- [x] FAB の iOS 位置調整（bottom: 100）
- [x] lucide アイコンの rename 対応（`AlertCircle` → `CircleAlert as AlertCircle`）
- [x] 設計書類5点の作成

---

## 7. 直近でやるべきこと

1. ~~**投稿フォームの React Hook Form + Zod 移行**（フェーズ1）~~ → 完了
2. ~~**RLS の実運用テスト**（フェーズ2）~~ → 完了
3. ~~**エラーハンドリングの統一**（フェーズ5）~~ → 完了
4. ~~**UI/UX改善9機能の実装**~~ → 完了（2026-03-28）
   - ボトムシートプレビュー、タブバッジ、オンボーディング、カテゴリ色分け、急上昇セクション、アクセシビリティ、エラーリカバリーガイド、ダークモード最適化、プロフィールカード
5. **カテゴリ変更のDBマイグレーション適用**（Supabase SQL Editorで実行）
6. **Realtime の実機テスト**（フェーズ3）
7. **通知設計書の作成**（フェーズ4 の準備）
8. **iOS bundleIdentifier 追加 + プライバシーポリシー準備**（リリース準備）

詳細は `docs/2026-03-28_改修レポート.md` を参照。
