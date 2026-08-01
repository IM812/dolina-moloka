-- Таблица для логирования вызовов вебхука PayKeeper.
-- Пишется запись при КАЖДОМ обращении на /api/payment/webhook,
-- ещё до любых проверок подписи — чтобы точно видеть, доходит ли запрос от PayKeeper.

create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'paykeeper',
  order_number text,
  paykeeper_id text,
  amount text,
  signature_valid boolean,
  result text not null,            -- напр. 'received', 'ok', 'invalid_signature', 'order_not_found', ...
  status_code integer,
  raw_payload text,                -- сырое тело запроса (для диагностики)
  headers jsonb,                   -- заголовки запроса (User-Agent, IP и т.п.)
  created_at timestamptz not null default now()
);

create index if not exists webhook_logs_created_at_idx on public.webhook_logs (created_at desc);
create index if not exists webhook_logs_order_number_idx on public.webhook_logs (order_number);

-- RLS: доступ только через service-role (вебхук и админ-API). Публичных политик нет.
alter table public.webhook_logs enable row level security;
