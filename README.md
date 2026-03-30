# Navios

**近くを知る。暮らしが変わる。**

Navios は、あなたの「今・ここ」に関係する地域情報だけを届けるモバイルアプリです。
近くのイベント、入荷情報、助け合い、行政のお知らせ——検索しなくても、開くだけで街が見えます。

---

## コンセプト

> 生活の判断を支援する OS

遠くのニュースは届くのに、隣で何が起きているか知らない。
Navios は「検索」を前提にしません。位置情報と AI が、必要な情報を自動で届けます。

---

## 主な機能

### ちかく — 半径で読む街（ホーム画面）

「すぐ近く（200m）」「徒歩圏内（500m）」「少し先」——距離で区切ると、街は驚くほど読みやすくなります。歩くとリストが自動で変わります。

### タイムライン — リアルタイムな声

140 文字のつぶやき投稿。「パン屋の残り少ない」「ヨガ会よかった」——今この瞬間の空気が流れてきます。Supabase Realtime で自動更新。

### さがす — AI おすすめ + 検索

位置・時間・関心を読み取り、今行くべき場所・今知るべき情報を自動で並べます。テキスト検索にも対応。

### フィード — 街のタイムライン

日付・カテゴリで地域の投稿を一覧。朝採れ野菜の入荷から給付金の締め切りまで、今日起きていることが時系列で流れてきます。

### カテゴリ

| カテゴリ | 内容 | 色 |
|---------|------|-----|
| 物資 | 入荷・在庫・お裾分け | `#00D4A1` |
| イベント | 地域の催し・教室 | `#F5A623` |
| 近助 | 助け合い・ボランティア | `#F0425C` |
| 行政 | お知らせ・手続き | `#8B6FC0` |

---

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | Expo ~54 + React Native 0.81 |
| 言語 | TypeScript 5.9 |
| ルーティング | Expo Router（ファイルベース） |
| バックエンド | Supabase（Auth, Postgres, PostGIS, Storage） |
| データ取得 | React Query（`@tanstack/react-query`） |
| フォーム | React Hook Form + Zod |
| 状態管理 | Zustand（テーマ・フォントサイズ等の UI 状態のみ） |
| アニメーション | React Native 組み込み Animated API |
| ジェスチャー | React Native Gesture Handler |
| UI | StyleSheet（style prop 統一、NativeWind 不使用） |

---

## ディレクトリ構成

```
NaviosMobile/
├── app/                  # 画面・ルーティング
│   ├── (auth)/           #   認証画面（ログイン, サインアップ）
│   ├── (tabs)/           #   タブ画面（ちかく, タイムライン, さがす, フィード, 設定）
│   ├── feed/[id].tsx     #   投稿詳細
│   ├── talk-detail/[id]  #   タイムライン詳細
│   ├── profile/[id].tsx  #   プロフィール
│   ├── profile/edit.tsx  #   プロフィール編集
│   ├── post.tsx          #   投稿作成
│   └── talk-post.tsx     #   つぶやき投稿
├── components/
│   ├── ui/               #   プリミティブ（StateView, ReportModal 等）
│   ├── features/         #   機能別（feed, talk, nearby, ai, settings）
│   ├── layout/           #   レイアウト（Header, Fab）
│   └── providers/        #   Context Provider（AuthProvider）
├── hooks/                # カスタム hooks（React Query ラッパー, useAuth, useLocation 等）
├── lib/                  # Supabase クエリ, ユーティリティ, エラー処理, バリデーション
├── stores/               # Zustand ストア（テーマ, フォントサイズ）
├── constants/            # デザイントークン, カテゴリ定義
├── types/                # 型定義
├── supabase/             # DB マイグレーション, シードデータ
└── docs/                 # 設計書・仕様書・改善案
```

---

## 画面一覧

| 画面 | ルート | タブ名 | 概要 |
|------|--------|--------|------|
| ちかく | `/(tabs)/` | ちかく | 距離区分で投稿表示。ホーム画面 |
| タイムライン | `/(tabs)/talk` | タイムライン | つぶやきのリアルタイムフィード |
| さがす | `/(tabs)/ai` | さがす | テキスト検索 + AI レコメンド |
| フィード | `/(tabs)/feed` | フィード | 日付・カテゴリ・並び順で投稿一覧 |
| 設定 | `/(tabs)/settings` | 設定 | テーマ・フォントサイズ・通知・アカウント |
| 投稿作成 | `/post` | — | カテゴリ選択 + タイトル + 詳細 + 写真（3枚） + 位置 |
| つぶやき投稿 | `/talk-post` | — | 140文字 + 写真（3枚） + 自動位置情報 |
| 投稿詳細 | `/feed/[id]` | — | ヒーロー画像・期限・コメント・通報 |
| タイムライン詳細 | `/talk-detail/[id]` | — | スレッド表示・返信 |
| プロフィール | `/profile/[id]` | — | ユーザー情報・投稿一覧 |
| プロフィール編集 | `/profile/edit` | — | 表示名・自己紹介・地域・アバター |
| ログイン | `/(auth)/login` | — | メール + パスワード |
| サインアップ | `/(auth)/signup` | — | 表示名 + メール + パスワード |

---

## セットアップ

### 前提条件

- Node.js 18 以上
- npm
- Expo CLI
- Android Studio（Android 開発）/ Xcode（iOS 開発）

### インストール

```bash
npm install
```

### 環境変数

`.env` ファイルをプロジェクトルートに作成:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 起動

```bash
# 開発サーバー起動（キャッシュクリア）
npx expo start -c

# プラットフォーム別起動
npm run android
npm run ios
npm run web
```

---

## テーマ

Dark / Light 切替に対応。`useThemeStore` で管理し、デザイントークン経由で全コンポーネントに反映されます。フォントサイズは 3 段階（標準 / 大 / 特大）で調整可能。デフォルトはライトモード。

---

## 設計ドキュメント

| ドキュメント | 場所 |
|-------------|------|
| アーキテクチャ | `docs/設計書/アーキテクチャ.md` |
| データベース設計 | `docs/設計書/データベース設計.md` |
| デザイントークン | `docs/設計書/デザイントークン.md` |
| 画面一覧 | `docs/設計書/画面一覧.md` |
| リリース前最終レビュー | `docs/チェック引継ぎ/リリース前最終レビュー.md` |
| 開発環境セットアップ | `docs/運用ガイド/開発環境セットアップ.md` |
| 次回タスク | `docs/運用ガイド/次回タスク.md` |

---

## ライセンス

Private — All rights reserved.

---

**NaviosLabs** — 足元の日本を、起動する。
