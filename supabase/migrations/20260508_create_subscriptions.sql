-- Tracks Stripe recurring subscriptions (e.g. WordPress maintenance)
create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  stripe_subscription_id text unique not null,
  stripe_customer_id     text not null,
  customer_email         text,
  customer_name          text,
  service                text,           -- e.g. 'wordpress_maintenance'
  status                 text not null,  -- active | past_due | canceled | paused | incomplete
  cancel_at_period_end   boolean default false,
  current_period_end     timestamptz,
  last_payment_at        timestamptz,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

-- Allow server-side reads (service role bypasses RLS anyway)
alter table public.subscriptions enable row level security;

-- Index for quick lookups by customer or status
create index if not exists subscriptions_stripe_customer_id_idx on public.subscriptions (stripe_customer_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);
