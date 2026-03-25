<!-- このファイルは、リポジトリ全体で Claude Code が従う共通の開発ガイドラインを定義します。 -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

- **Name**: NaviOs — 地域情報共有モバイルアプリ
- **Stack**: Expo ~55 + React Native 0.83 + TypeScript 5.9
- **Backend**: Supabase (Auth, Postgres, PostGIS, Storage)
- **UI**: StyleSheet（style prop統一）+ React Native Reanimated (アニメーション) + React Native Gesture Handler (ジェスチャー) + React Hook Form + Zod
- **テーマ**: Dark / Light 切替（`ThemeProvider` + `useTheme()`）
- **対応言語**: 日本語のみ
- **エントリポイント**: `index.ts` → `App.tsx`
- **Path alias**: `@/*` → プロジェクトルート（`tsconfig.json` の `paths` で設定）

## Commands

- `npx expo start` — 開発サーバー起動
- `npm run android` / `npm run ios` / `npm run web` — プラットフォーム別起動

## ディレクトリ構成

| ディレクトリ  | 責務                         | ルール                                                  |
| ------------- | ---------------------------- | ------------------------------------------------------- |
| `app/`        | 画面・ルーティング           | UI + インタラクション処理のみ。`(auth)/`, `(tabs)/` でグループ化 |
| `components/` | 再利用可能 UI コンポーネント | `ui/`（プリミティブ）, `features/`（機能別）, `layout/`（レイアウト） |
| `hooks/`      | カスタム hooks               | `useAuth`, `useLocation` 等                             |
| `stores/`     | Zustand ストア               | 機能単位でファイル分割（`authStore.ts` 等）              |
| `lib/`        | サービス層 + ユーティリティ  | Supabase クエリ、認証、API、`appError.ts`、`utils.ts`   |
| `constants/`  | 定数・デザイントークン       | 色、カテゴリ、スペーシング                              |
| `types/`      | 型定義                       | `index.ts`(バレル), `post.ts`, `user.ts` 等             |
| `supabase/`   | DB マイグレーション          | SQL ファイルを `migrations/` に番号付きで管理           |

## 命名規則

| 対象                     | 規則                                   | 例                                     |
| ------------------------ | -------------------------------------- | -------------------------------------- |
| コンポーネントファイル   | `PascalCase.tsx`                       | `PostBubble.tsx`                       |
| 非コンポーネントファイル | `camelCase.ts`                         | `scoring.ts`, `useAuth.ts`             |
| コンポーネント           | `export default function PascalCase()` | default export 必須                    |
| hooks                    | `use` プレフィックス                   | `useAuth`, `useTheme`                  |
| 定数                     | `UPPER_SNAKE_CASE`                     | `CAT_META`, `TIME_TABS`                |
| 型                       | `PascalCase`                           | `Post`, `Comment`, `Theme`             |
| スタイル                 | ファイル末尾に定義                     | `const styles = StyleSheet.create({})` |

## コーディングルール

- **1ファイル500行以内を目標**
- **コメントは「なぜ」だけ書く**
- **不要な import / 変数は即削除**
- **関数・コンポーネントには JSDoc を付ける**

## 依存パッケージ追加ルール

- **Expo SDK 対応パッケージを優先する**（`expo install` でインストール）
- **ネイティブモジュールは原則禁止** — JS/TS のみで動作するライブラリを選ぶ。やむを得ず使用する場合は事前に決裁をとること
- **追加前に確認**: バンドルサイズ、メンテナンス状況（最終更新・Star数）、Expo との互換性
- **類似ライブラリの重複導入禁止** — 既存の依存を確認してから追加する

## 環境変数の管理

- **`.env` ファイルで管理**（`.env` は `.gitignore` に含めること）
- **`expo-constants`** の `expoConfig.extra` 経由でアプリ内からアクセス
- **必須変数**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- **シークレット（Service Role Key 等）はクライアントに絶対に含めない**
- 新しい環境変数を追加した際は `.env.example` にキー名だけ追記する

## エラーハンドリング方針

- **`lib/appError.ts` に統一エラークラスを定義**して使用する
- **ユーザー向けエラー**と**開発者向けエラー**を区別する（ユーザーには日本語メッセージを表示）
- **Supabase 呼び出しは必ず `error` をチェック**し、握り潰さない
- **try-catch は境界層（画面・hooks）で行う** — lib/ 層ではエラーを throw して呼び出し元に委ねる
- **console.error は開発時のみ** — 本番では logger を使う

## 外部API課金ルール

- **Google Maps SDK**: 地図を表示するだけで課金される（$200/月の無料枠あり）
- **MapView の使用は最小限に**: 不必要な画面での地図表示を避ける
- **遅延読み込み推奨**: 地図は「タップで表示」等のユーザーアクション後に読み込む
- **API呼び出しを意識する**: Places API 等もリクエストごとに課金されるため、デバウンス・キャッシュを必ず実装する
- **新しい外部APIを追加する際は、課金体系を必ず確認してからユーザーに報告する**

## ドキュメントルール

- **`MEMORY.md`**: 200行以内厳守（200行以降は切り捨てられる）
- **`.claude/rules/*.md`**: 1トピック1ファイル、30〜50行以内
- **`CLAUDE.md`（本ファイル）**: 簡潔に保つ。肥大化時は `rules/` に分離
