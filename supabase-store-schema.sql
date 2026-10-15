-- Store: templates sold through Bachs. Run once in the Supabase SQL editor.
-- Row level security is on with no policies, so only the server (service role) can read or write.

create table if not exists store_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  cover text,                          -- public image URL
  file_path text,                      -- object path in the private "store-files" bucket
  price_amount numeric(12, 2) not null check (price_amount >= 0),
  price_currency text not null default 'USD',
  bachs_product_id text,               -- optional: a Bachs catalog product (prod_…); otherwise the price above is charged
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists store_orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references store_products(id),
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'review')),
  amount numeric(12, 2) not null,
  currency text not null,
  access_token text not null unique,   -- long random secret in the buyer's order/download link
  idempotency_key text not null unique,
  checkout_id text unique,             -- chk_… from Bachs
  charge_id text,
  email text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists store_orders_product_idx on store_orders(product_id);

-- Webhook deliveries are at-least-once: remember event ids so each is applied once
create table if not exists store_webhook_events (
  id text primary key,                 -- evt_… from Bachs
  type text not null,
  received_at timestamptz not null default now()
);

alter table store_products enable row level security;
alter table store_orders enable row level security;
alter table store_webhook_events enable row level security;

-- Private bucket for the files buyers download (served through short-lived signed URLs)
insert into storage.buckets (id, name, public)
values ('store-files', 'store-files', false)
on conflict (id) do nothing;
