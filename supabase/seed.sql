-- =============================================================
-- NaviOs シードデータ（テスト用）
-- SQL Editor で実行してください
-- =============================================================

-- ----- テストユーザー作成 (Supabase Auth) -----
-- ※ Supabase Dashboard > Authentication > Users から手動作成するか、
--   以下をアプリのサインアップ画面から行ってください:
--
--   1. test@navios.local / password123 / 田中商店
--   2. test2@navios.local / password123 / 健康ヨガクラブ
--   3. test3@navios.local / password123 / ベーカリー佐藤
--   4. test4@navios.local / password123 / 山田さん
--   5. test5@navios.local / password123 / 〇〇市役所
--
-- サインアップ後、以下のSQLでプロフィールを更新してください:

-- ----- プロフィール更新（サインアップ後に実行） -----
-- display_name はトリガーで自動設定されるので、
-- bio, location_text, is_verified のみ更新

-- 以下は profiles テーブルにユーザーが存在する前提で実行してください。
-- auth.users の id は実際の値に置き換えてください。

-- UPDATE public.profiles SET bio = '越谷市で40年の八百屋です。毎朝新鮮な野菜を仕入れています。', location_text = '越谷市駅前', is_verified = true WHERE display_name = '田中商店';
-- UPDATE public.profiles SET bio = '毎朝中央公園でヨガ会を開催中！初心者大歓迎です。', location_text = '中央公園' WHERE display_name = '健康ヨガクラブ';
-- UPDATE public.profiles SET bio = '手作りパンのお店。毎日焼きたてをお届けします。', location_text = '商店街エリア', is_verified = true WHERE display_name = 'ベーカリー佐藤';
-- UPDATE public.profiles SET bio = '家庭菜園が趣味です。お裾分けもしています！', location_text = '住宅街エリア' WHERE display_name = '山田さん';
-- UPDATE public.profiles SET bio = '〇〇市の公式アカウントです。行政情報をお届けします。', location_text = '市役所', is_verified = true WHERE display_name = '〇〇市役所';

-- =============================================================
-- 投稿データ（profiles にユーザーが存在する前提）
-- author_id は実際のUUIDに置き換えてください
-- =============================================================

-- ■ 簡易シード: アプリのサインアップ → 投稿画面から手動で作成推奨
-- ■ SQL で一括投入する場合は以下のテンプレートを使用:

/*
INSERT INTO public.posts (author_id, category, title, content, location_text, crowd, location)
VALUES
  ('YOUR_USER_UUID', 'stock', '朝採れ野菜入荷しました！', 'トマト、きゅうり、なす。本日限り特別価格です', '越谷市駅前', 'crowded',
    ST_SetSRID(ST_MakePoint(139.7906, 35.8838), 4326)::geography),
  ('YOUR_USER_UUID', 'event', '毎朝7時から中央公園でヨガ会開催中', '初心者歓迎！参加費無料です', '中央公園', 'empty',
    ST_SetSRID(ST_MakePoint(139.7920, 35.8850), 4326)::geography),
  ('YOUR_USER_UUID', 'stock', '本日の焼きたてパン', 'クロワッサン、食パン、あんぱん揃ってます', '商店街エリア', 'moderate',
    ST_SetSRID(ST_MakePoint(139.7880, 35.8820), 4326)::geography),
  ('YOUR_USER_UUID', 'help', '庭の草刈りを手伝ってくれる方募集中', 'お礼に野菜をお渡しします', '住宅街エリア', NULL,
    ST_SetSRID(ST_MakePoint(139.7850, 35.8800), 4326)::geography),
  ('YOUR_USER_UUID', 'admin', '【重要】給付金申請の締め切りは今月末です', 'お早めにお手続きください', '市役所', NULL,
    ST_SetSRID(ST_MakePoint(139.7950, 35.8870), 4326)::geography);

INSERT INTO public.talks (author_id, message, location_text, location)
VALUES
  ('YOUR_USER_UUID', '野菜すごく新鮮！トマト甘かった。朝イチで行くのがおすすめ', '駅前 半径300m',
    ST_SetSRID(ST_MakePoint(139.7906, 35.8838), 4326)::geography),
  ('YOUR_USER_UUID', 'ヨガ会めちゃ気持ちよかった〜 来週も参加したい', '中央公園エリア',
    ST_SetSRID(ST_MakePoint(139.7920, 35.8850), 4326)::geography),
  ('YOUR_USER_UUID', 'パン屋のクロワッサン、残り少ない！急いだ方がいいかも', '商店街エリア',
    ST_SetSRID(ST_MakePoint(139.7880, 35.8820), 4326)::geography),
  ('YOUR_USER_UUID', '給付金の手続き思ったより簡単だった。書類は2枚だけで10分で終わるよ', '市役所周辺',
    ST_SetSRID(ST_MakePoint(139.7950, 35.8870), 4326)::geography),
  ('YOUR_USER_UUID', '夕方の散歩コース最高すぎる。夕焼けがきれい', '河川敷エリア',
    ST_SetSRID(ST_MakePoint(139.7900, 35.8810), 4326)::geography);
*/

-- =============================================================
-- 使い方:
-- 1. アプリから5人分のユーザーをサインアップ
-- 2. Supabase Dashboard > Table Editor > profiles で UUID を確認
-- 3. 上記 INSERT 文の 'YOUR_USER_UUID' を実際の UUID に置き換え
-- 4. コメントを外して SQL Editor で実行
-- =============================================================
