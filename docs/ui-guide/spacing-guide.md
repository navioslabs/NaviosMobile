# スペーシング・余白ガイド

## 基本ルール

全画面で `lib/styles.ts` の `SPACE` 定数を使用する。マジックナンバーは禁止。

## スペーシングスケール

| 定数 | 値 | 用途 |
|------|-----|------|
| `SPACE.xs` | 4px | アイコンとテキストの間、ドット等 |
| `SPACE.sm` | 8px | チップ内パディング、小さいギャップ |
| `SPACE.md` | 12px | カード内パディング、セクション間 |
| `SPACE.lg` | 16px | 画面左右余白（標準）、カード内余白 |
| `SPACE.xl` | 20px | 画面左右余白（広め）、セクション間隔 |
| `SPACE.xxl` | 24px | 大セクション間隔 |
| `SPACE.xxxl` | 32px | 画面間余白、ヒーローセクション |

## 画面余白ルール

| 場所 | 値 | 定数 |
|------|-----|------|
| 画面左右パディング | 20px | `SPACE.xl` |
| リスト内パディング | 16px | `SPACE.lg` |
| カード内パディング | 16px | `SPACE.lg` |
| セクション間マージン | 8px | `SPACE.sm` |
| ScrollView下部余白 | 100px | 固定（タブバー+FAB考慮） |

## フォントサイズスケール

| 定数 | 値 | 用途 |
|------|-----|------|
| `FONT_SIZE.xxs` | 12px | 極小（バッジ内等） |
| `FONT_SIZE.xs` | 12px | 小（キャプション、補助ラベル） |
| `FONT_SIZE.sm` | 13px | やや小（メタ情報、時刻等） |
| `FONT_SIZE.md` | 14px | 標準（チップ、ラベル） |
| `FONT_SIZE.base` | 15px | 本文（投稿文、メッセージ等） |
| `FONT_SIZE.lg` | 16px | やや大（小見出し、カード名） |
| `FONT_SIZE.xl` | 17px | 中見出し |
| `FONT_SIZE.xxl` | 20px | セクションタイトル |
| `FONT_SIZE.xxxl` | 22px | 画面タイトル |
| `FONT_SIZE.hero` | 28px | ヒーロー（AI画面ロゴ等） |

## フォントウェイトスケール

| 定数 | 値 | 用途 |
|------|-----|------|
| `WEIGHT.normal` | 400 | 本文、メタ情報 |
| `WEIGHT.medium` | 500 | — |
| `WEIGHT.semibold` | 600 | ラベル、キャプション、メタ太字 |
| `WEIGHT.bold` | 700 | 見出し、小見出し、バッジ |
| `WEIGHT.extrabold` | 800 | 画面タイトル、セクションタイトル、ヒーロー |

## 角丸スケール

| 定数 | 値 | 用途 |
|------|-----|------|
| `RADIUS.sm` | 8px | 小さいタグ |
| `RADIUS.md` | 12px | 入力、カード角丸 |
| `RADIUS.lg` | 14px | 日付チップ、画像 |
| `RADIUS.xl` | 16px | カード |
| `RADIUS.xxl` | 18px | 大カード |
| `RADIUS.full` | 9999px | ピル、丸ボタン |

## テキストスタイルプリセット（`createStyles(t)`）

`lib/styles.ts` の `createStyles` で生成される共通テキストスタイル:

| スタイル名 | サイズ | ウェイト | 色 | 用途 |
|-----------|--------|----------|-----|------|
| `textHero` | hero (28) | extrabold (800) | text | ヒーロー見出し |
| `textScreenTitle` | xxxl (22) | extrabold (800) | text | 画面タイトル |
| `textSectionTitle` | xxl (20) | extrabold (800) | text | セクションタイトル |
| `textHeading` | xl (17) | bold (700) | text | 見出し |
| `textSubheading` | lg (16) | bold (700) | text | 小見出し・カード名 |
| `textBody` | base (15) | normal (400) | text | 本文 (lineHeight: 20) |
| `textBodyBold` | base (15) | bold (700) | text | 本文太字 |
| `textLabel` | md (14) | semibold (600) | sub | ラベル |
| `textMeta` | sm (13) | normal (400) | muted | メタ情報 |
| `textMetaBold` | sm (13) | semibold (600) | muted | メタ情報太字 |
| `textCaption` | xs (12) | semibold (600) | sub | キャプション |
| `textBadge` | xxs (12) | bold (700) | sub | 極小ラベル |
| `textSectionLabel` | sm (13) | bold (700) | sub | セクションヘッダーラベル |
