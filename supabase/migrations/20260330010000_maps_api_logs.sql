-- Google Maps API 呼び出しログテーブル
create table if not exists maps_api_logs (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete set null,
  api_type   text not null default 'places_autocomplete',
  query      text,
  results    smallint not null default 0,
  status     text not null default 'OK',
  created_at timestamptz not null default now()
);

-- インデックス: 日別集計用
create index idx_maps_api_logs_created on maps_api_logs (created_at desc);
create index idx_maps_api_logs_type    on maps_api_logs (api_type, created_at desc);

-- RLS
alter table maps_api_logs enable row level security;

-- 認証済みユーザーは自分のログを挿入可能
create policy "Users can insert own logs"
  on maps_api_logs for insert
  to authenticated
  with check (user_id = auth.uid());

-- 管理者は全件参照可能（admin_usersテーブルで判定）
create policy "Admins can read all logs"
  on maps_api_logs for select
  to authenticated
  using (
    exists (select 1 from admin_users where id = auth.uid())
  );
