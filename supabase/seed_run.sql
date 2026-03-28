-- =============================================================
-- NaviOs シードデータ実行用
-- =============================================================

-- ----- プロフィール更新 -----
UPDATE public.profiles SET display_name = '田中商店', bio = '越谷市で40年の八百屋です。毎朝新鮮な野菜を仕入れています。', location_text = '越谷市駅前', is_verified = true WHERE id = '19e552a2-673e-46ea-a488-6065c6be22ae';
UPDATE public.profiles SET display_name = '健康ヨガクラブ', bio = '毎朝中央公園でヨガ会を開催中！初心者大歓迎です。', location_text = '中央公園' WHERE id = '507abed1-3815-4a43-8b4c-3e48429bcb58';
UPDATE public.profiles SET display_name = 'ベーカリー佐藤', bio = '手作りパンのお店。毎日焼きたてをお届けします。', location_text = '商店街エリア', is_verified = true WHERE id = '7b3b3eed-00b6-43c2-be81-58481caab9b0';
UPDATE public.profiles SET display_name = '山田さん', bio = '家庭菜園が趣味です。お裾分けもしています！', location_text = '住宅街エリア' WHERE id = '836910f4-bed1-436b-9e6c-ec040408da59';
UPDATE public.profiles SET display_name = '〇〇市役所', bio = '〇〇市の公式アカウントです。行政情報をお届けします。', location_text = '市役所', is_verified = true WHERE id = '8a4be860-1b25-477b-8f40-2e562f8f3720';

-- ----- 投稿データ -----
INSERT INTO public.posts (author_id, category, title, content, location_text, crowd, location) VALUES
  ('19e552a2-673e-46ea-a488-6065c6be22ae', 'lifeline', '朝採れ野菜入荷しました！', 'トマト、きゅうり、なす 🍅 本日限り特別価格です', '越谷市駅前', 'crowded',
    ST_SetSRID(ST_MakePoint(139.7906, 35.8838), 4326)::geography),
  ('507abed1-3815-4a43-8b4c-3e48429bcb58', 'event', '毎朝7時から中央公園でヨガ会開催中', '初心者歓迎！参加費無料です 🧘‍♀️', '中央公園', 'empty',
    ST_SetSRID(ST_MakePoint(139.7920, 35.8850), 4326)::geography),
  ('7b3b3eed-00b6-43c2-be81-58481caab9b0', 'lifeline', '本日の焼きたてパン', 'クロワッサン、食パン、あんぱん揃ってます 🥐', '商店街エリア', 'moderate',
    ST_SetSRID(ST_MakePoint(139.7880, 35.8820), 4326)::geography),
  ('836910f4-bed1-436b-9e6c-ec040408da59', 'help', '庭の草刈りを手伝ってくれる方募集中', 'お礼に野菜をお渡しします 🌿', '住宅街エリア', NULL,
    ST_SetSRID(ST_MakePoint(139.7850, 35.8800), 4326)::geography),
  ('8a4be860-1b25-477b-8f40-2e562f8f3720', 'lifeline', '【重要】給付金申請の締め切りは今月末です', 'お早めにお手続きください 📋', '市役所', NULL,
    ST_SetSRID(ST_MakePoint(139.7950, 35.8870), 4326)::geography),
  ('19e552a2-673e-46ea-a488-6065c6be22ae', 'lifeline', '産みたて卵入荷', '平飼い鶏の新鮮卵、1パック300円です 🥚', '越谷市駅前', 'empty',
    ST_SetSRID(ST_MakePoint(139.7908, 35.8840), 4326)::geography),
  ('507abed1-3815-4a43-8b4c-3e48429bcb58', 'event', '日曜日に地域清掃活動を行います', 'ご参加お待ちしてます！🧹', '中央公園', NULL,
    ST_SetSRID(ST_MakePoint(139.7915, 35.8845), 4326)::geography),
  ('836910f4-bed1-436b-9e6c-ec040408da59', 'help', '大根たくさん採れました！お裾分けします', 'ご近所さんぜひどうぞ 🥬', '住宅街エリア', 'empty',
    ST_SetSRID(ST_MakePoint(139.7855, 35.8805), 4326)::geography),
  ('7b3b3eed-00b6-43c2-be81-58481caab9b0', 'lifeline', '春の花苗セール中', 'パンジー・チューリップ・ビオラ揃ってます 🌸', '商店街エリア', NULL,
    ST_SetSRID(ST_MakePoint(139.7885, 35.8825), 4326)::geography),
  ('8a4be860-1b25-477b-8f40-2e562f8f3720', 'lifeline', 'マイナンバー申請会のお知らせ', '予約不要です。お気軽にどうぞ', '市役所', NULL,
    ST_SetSRID(ST_MakePoint(139.7952, 35.8872), 4326)::geography);

-- ----- ひとことデータ -----
INSERT INTO public.talks (author_id, message, location_text, location) VALUES
  ('19e552a2-673e-46ea-a488-6065c6be22ae', '野菜すごく新鮮！トマト甘かった。朝イチで行くのがおすすめ', '駅前 半径300m',
    ST_SetSRID(ST_MakePoint(139.7906, 35.8838), 4326)::geography),
  ('507abed1-3815-4a43-8b4c-3e48429bcb58', 'ヨガ会めちゃ気持ちよかった〜 来週も参加したい', '中央公園エリア',
    ST_SetSRID(ST_MakePoint(139.7920, 35.8850), 4326)::geography),
  ('7b3b3eed-00b6-43c2-be81-58481caab9b0', 'パン屋のクロワッサン、残り少ない！急いだ方がいいかも', '商店街エリア',
    ST_SetSRID(ST_MakePoint(139.7880, 35.8820), 4326)::geography),
  ('8a4be860-1b25-477b-8f40-2e562f8f3720', '給付金の手続き思ったより簡単だった。書類は2枚だけで10分で終わるよ', '市役所周辺',
    ST_SetSRID(ST_MakePoint(139.7950, 35.8870), 4326)::geography),
  ('836910f4-bed1-436b-9e6c-ec040408da59', '夕方の散歩コース最高すぎる。夕焼けがきれい', '河川敷エリア',
    ST_SetSRID(ST_MakePoint(139.7900, 35.8810), 4326)::geography);

-- ----- コメントデータ -----
-- 最初の投稿（朝採れ野菜）にコメント
INSERT INTO public.comments (post_id, author_id, body)
SELECT p.id, '507abed1-3815-4a43-8b4c-3e48429bcb58', '今朝行きました！きゅうりが特に美味しかったです'
FROM public.posts p WHERE p.title = '朝採れ野菜入荷しました！' LIMIT 1;

INSERT INTO public.comments (post_id, author_id, body)
SELECT p.id, '836910f4-bed1-436b-9e6c-ec040408da59', 'トマトの在庫まだありますか？'
FROM public.posts p WHERE p.title = '朝採れ野菜入荷しました！' LIMIT 1;

-- ヨガ会にコメント
INSERT INTO public.comments (post_id, author_id, body)
SELECT p.id, '19e552a2-673e-46ea-a488-6065c6be22ae', '明日参加してみます！'
FROM public.posts p WHERE p.title = '毎朝7時から中央公園でヨガ会開催中' LIMIT 1;

-- ----- ひとこと返信データ -----
INSERT INTO public.talk_replies (talk_id, author_id, body)
SELECT t.id, '507abed1-3815-4a43-8b4c-3e48429bcb58', 'わかります！私も昨日行きました'
FROM public.talks t WHERE t.message LIKE '野菜すごく新鮮%' LIMIT 1;

INSERT INTO public.talk_replies (talk_id, author_id, body)
SELECT t.id, '836910f4-bed1-436b-9e6c-ec040408da59', '情報助かります、ありがとう！'
FROM public.talks t WHERE t.message LIKE '野菜すごく新鮮%' LIMIT 1;

INSERT INTO public.talk_replies (talk_id, author_id, body)
SELECT t.id, '19e552a2-673e-46ea-a488-6065c6be22ae', '今度一緒に行きましょう！'
FROM public.talks t WHERE t.message LIKE 'ヨガ会めちゃ%' LIMIT 1;

-- ----- いいねデータ -----
-- 投稿へのいいね
INSERT INTO public.likes (user_id, target_type, target_id)
SELECT '507abed1-3815-4a43-8b4c-3e48429bcb58', 'post', p.id FROM public.posts p WHERE p.title = '朝採れ野菜入荷しました！' LIMIT 1;
INSERT INTO public.likes (user_id, target_type, target_id)
SELECT '836910f4-bed1-436b-9e6c-ec040408da59', 'post', p.id FROM public.posts p WHERE p.title = '朝採れ野菜入荷しました！' LIMIT 1;
INSERT INTO public.likes (user_id, target_type, target_id)
SELECT '7b3b3eed-00b6-43c2-be81-58481caab9b0', 'post', p.id FROM public.posts p WHERE p.title = '朝採れ野菜入荷しました！' LIMIT 1;
INSERT INTO public.likes (user_id, target_type, target_id)
SELECT '19e552a2-673e-46ea-a488-6065c6be22ae', 'post', p.id FROM public.posts p WHERE p.title = '毎朝7時から中央公園でヨガ会開催中' LIMIT 1;
INSERT INTO public.likes (user_id, target_type, target_id)
SELECT '836910f4-bed1-436b-9e6c-ec040408da59', 'post', p.id FROM public.posts p WHERE p.title = '本日の焼きたてパン' LIMIT 1;

-- ひとことへのいいね
INSERT INTO public.likes (user_id, target_type, target_id)
SELECT '7b3b3eed-00b6-43c2-be81-58481caab9b0', 'talk', t.id FROM public.talks t WHERE t.message LIKE '野菜すごく新鮮%' LIMIT 1;
INSERT INTO public.likes (user_id, target_type, target_id)
SELECT '8a4be860-1b25-477b-8f40-2e562f8f3720', 'talk', t.id FROM public.talks t WHERE t.message LIKE 'ヨガ会めちゃ%' LIMIT 1;
INSERT INTO public.likes (user_id, target_type, target_id)
SELECT '19e552a2-673e-46ea-a488-6065c6be22ae', 'talk', t.id FROM public.talks t WHERE t.message LIKE 'パン屋のクロワッサン%' LIMIT 1;
