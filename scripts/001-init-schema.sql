-- ============================================================
-- Долина Молока — базовая схема
-- Идемпотентна: можно запускать повторно.
-- ============================================================

create extension if not exists pgcrypto;

-- ─── Товары ───────────────────────────────────────────────
create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  name                text not null,
  description         text not null default '',
  full_description    text not null default '',
  price               numeric(10, 2) not null check (price >= 0),
  image_url           text not null default '',
  volume              text not null default '',
  composition         text not null default '',
  storage_conditions  text not null default '',
  category            text not null default '',
  in_stock            boolean not null default true,
  created_at          timestamptz not null default now()
);

-- ─── Клиенты ──────────────────────────────────────────────
create table if not exists public.customers (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  phone           text not null,
  email           text,
  pickup_address  text,
  created_at      timestamptz not null default now()
);

create index if not exists customers_phone_idx on public.customers (phone);

-- ─── Заказы ───────────────────────────────────────────────
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text unique not null,
  customer_id      uuid references public.customers (id) on delete set null,
  total_amount     numeric(10, 2) not null check (total_amount >= 0),
  payment_status   text not null default 'pending',
  delivery_status  text not null default 'new',
  comment          text,
  created_at       timestamptz not null default now()
);

create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ─── Позиции заказа ───────────────────────────────────────
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  product_name  text not null,
  quantity      integer not null check (quantity > 0),
  price         numeric(10, 2) not null check (price >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ─── Настройки (key/value) ────────────────────────────────
create table if not exists public.settings (
  key         text primary key,
  value       text not null default '',
  updated_at  timestamptz not null default now()
);

-- ─── Акции ────────────────────────────────────────────────
create table if not exists public.promotions (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  description       text,
  badge_text        text,
  discount_percent  integer,
  active_from       date,
  active_until      date,
  is_active         boolean not null default true,
  show_on_homepage  boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ─── Документы ────────────────────────────────────────────
create table if not exists public.documents (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  category     text not null default 'other',
  file_url     text not null,
  file_name    text,
  file_size    bigint,
  is_public    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- Атомарное создание заказа.
-- Номер заказа генерируется ВНУТРИ функции под блокировкой,
-- поэтому клиенту не нужен доступ на чтение таблицы orders.
-- ============================================================
create or replace function public.create_order(
  p_full_name       text,
  p_phone           text,
  p_email           text,
  p_pickup_address  text,
  p_comment         text,
  p_total_amount    numeric,
  p_payment_status  text,
  p_items           jsonb
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id  uuid;
  v_order_id     uuid;
  v_order_number text;
  v_next         integer;
begin
  -- Один клиент на номер телефона
  select id into v_customer_id
  from customers
  where phone = p_phone
  limit 1;

  if v_customer_id is null then
    insert into customers (full_name, phone, email, pickup_address)
    values (p_full_name, p_phone, nullif(p_email, ''), nullif(p_pickup_address, ''))
    returning id into v_customer_id;
  else
    update customers
    set full_name      = p_full_name,
        email          = coalesce(nullif(p_email, ''), email),
        pickup_address = coalesce(nullif(p_pickup_address, ''), pickup_address)
    where id = v_customer_id;
  end if;

  -- Блокируем таблицу, чтобы два параллельных заказа не получили один номер
  lock table orders in exclusive mode;

  select coalesce(max(nullif(regexp_replace(order_number, '\D', '', 'g'), '')::integer), 0) + 1
  into v_next
  from orders;

  v_order_number := 'DM-' || lpad(v_next::text, 4, '0');

  insert into orders (order_number, customer_id, total_amount, payment_status, comment)
  values (v_order_number, v_customer_id, p_total_amount, p_payment_status, nullif(p_comment, ''))
  returning id into v_order_id;

  insert into order_items (order_id, product_id, product_name, quantity, price)
  select v_order_id,
         (item ->> 'productId')::uuid,
         item ->> 'productName',
         (item ->> 'quantity')::integer,
         (item ->> 'price')::numeric
  from jsonb_array_elements(p_items) as item;

  return json_build_object('orderId', v_order_id, 'orderNumber', v_order_number);
end;
$$;

-- ============================================================
-- Row Level Security.
-- Анонимному ключу доступны ТОЛЬКО публичные данные:
-- товары, активные акции и публичные документы.
-- Заказы, клиенты и настройки — исключительно service role.
-- ============================================================
alter table public.products    enable row level security;
alter table public.customers   enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.settings    enable row level security;
alter table public.promotions  enable row level security;
alter table public.documents   enable row level security;

-- Товары: читать может любой
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (true);

-- Акции: публично видны только активные
drop policy if exists "promotions_public_read" on public.promotions;
create policy "promotions_public_read" on public.promotions
  for select using (is_active = true);

-- Документы: публично видны только помеченные как публичные
drop policy if exists "documents_public_read" on public.documents;
create policy "documents_public_read" on public.documents
  for select using (is_public = true);

-- Авторизованный администратор управляет каталогом, акциями и документами
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all to authenticated using (true) with check (true);

drop policy if exists "promotions_admin_all" on public.promotions;
create policy "promotions_admin_all" on public.promotions
  for all to authenticated using (true) with check (true);

drop policy if exists "documents_admin_all" on public.documents;
create policy "documents_admin_all" on public.documents
  for all to authenticated using (true) with check (true);

-- Заказы и клиенты: политик для anon нет вовсе — доступ только service role,
-- администратор работает с ними через серверные роуты.
drop policy if exists "orders_admin_read" on public.orders;
create policy "orders_admin_read" on public.orders
  for all to authenticated using (true) with check (true);

drop policy if exists "order_items_admin_read" on public.order_items;
create policy "order_items_admin_read" on public.order_items
  for all to authenticated using (true) with check (true);

drop policy if exists "customers_admin_read" on public.customers;
create policy "customers_admin_read" on public.customers
  for all to authenticated using (true) with check (true);

drop policy if exists "settings_admin_all" on public.settings;
create policy "settings_admin_all" on public.settings
  for all to authenticated using (true) with check (true);

-- Функцию создания заказа вызывает только сервер (service role)
revoke all on function public.create_order(text, text, text, text, text, numeric, text, jsonb) from anon;
