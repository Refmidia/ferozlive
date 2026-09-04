-- ScreenParty initial schema
-- Never store audio, video, images or any media from the live session.

create extension if not exists pgcrypto;

create type public.room_status as enum ('active', 'ended', 'expired');

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  public_code text not null,
  livekit_room_name text not null,
  host_token_hash text not null,
  password_hash text,
  status public.room_status not null default 'active',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ended_at timestamptz,
  constraint rooms_public_code_format check (public_code ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$'),
  constraint rooms_livekit_name_prefix check (livekit_room_name like 'sp_%'),
  constraint rooms_expires_after_created check (expires_at > created_at)
);

create unique index rooms_public_code_uidx on public.rooms (public_code);
create unique index rooms_livekit_room_name_uidx on public.rooms (livekit_room_name);
create index rooms_status_expires_idx on public.rooms (status, expires_at);
create index rooms_created_at_idx on public.rooms (created_at desc);

create table public.room_events (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete restrict,
  event_type text not null,
  participant_identity text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint room_events_type_check check (
    event_type in (
      'created',
      'joined',
      'left',
      'kicked',
      'share_started',
      'share_stopped',
      'ended',
      'expired',
      'cleanup_marked'
    )
  )
);

create index room_events_room_id_created_idx on public.room_events (room_id, created_at desc);
create index room_events_type_idx on public.room_events (event_type);

alter table public.rooms enable row level security;
alter table public.room_events enable row level security;

-- The browser never talks to these tables directly.
-- All access happens through the Next.js server using the service role.

revoke all on public.rooms from anon, authenticated;
revoke all on public.room_events from anon, authenticated;

create or replace function public.normalize_room_code(input text)
returns text
language sql
immutable
as $$
  select case
    when length(compact) = 8 then substr(compact, 1, 4) || '-' || substr(compact, 5, 4)
    else compact
  end
  from (
    select upper(regexp_replace(coalesce(input, ''), '[^A-Za-z0-9]', '', 'g')) as compact
  ) normalized;
$$;

create or replace function public.room_is_joinable(target public.rooms)
returns boolean
language sql
stable
as $$
  select target.status = 'active' and target.expires_at > now();
$$;

comment on table public.rooms is 'Temporary screen-share rooms. No media content is stored.';
comment on table public.room_events is 'Basic audit trail. Never includes audio, video or screenshots.';
comment on function public.normalize_room_code(text) is 'Normalizes a public invite code to XXXX-XXXX.';
comment on function public.room_is_joinable(public.rooms) is 'True when the room is active and not expired.';
