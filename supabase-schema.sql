-- Run this in Supabase Dashboard > SQL Editor

create extension if not exists "pgcrypto";

create table weeks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'draft',
  order_deadline timestamptz,
  share_token text unique default encode(gen_random_bytes(6), 'hex'),
  payment_venmo text,
  payment_zelle text,
  created_at timestamptz default now()
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  week_id uuid references weeks(id) on delete cascade,
  name text not null,
  description text,
  price numeric(6,2) not null default 0,
  pickup_day date not null,
  pickup_time_start time,
  pickup_time_end time,
  image_urls text[] default '{}',
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  week_id uuid references weeks(id),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  status text not null default 'pending',
  payment_status text not null default 'unpaid',
  total_amount numeric(6,2) default 0,
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  menu_item_name text,
  menu_item_price numeric(6,2),
  pickup_day date,
  quantity int default 1
);

create table item_library (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_urls text[] default '{}',
  last_price numeric(6,2),
  use_count int default 1,
  created_at timestamptz default now()
);

-- Disable RLS (small trusted user base, no auth needed)
alter table weeks disable row level security;
alter table menu_items disable row level security;
alter table orders disable row level security;
alter table order_items disable row level security;
alter table item_library disable row level security;
