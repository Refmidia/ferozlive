create type public.support_category as enum (
  'ocorrencia',
  'instalacao',
  'anticheat',
  'outro'
);

create type public.support_status as enum (
  'open',
  'in_progress',
  'resolved'
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete restrict,
  public_code text not null,
  category public.support_category not null,
  citizen_name text,
  staff_name text not null,
  status public.support_status not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index support_tickets_created_at_idx on public.support_tickets (created_at desc);
create index support_tickets_status_idx on public.support_tickets (status);
create index support_tickets_category_idx on public.support_tickets (category);
create index support_tickets_room_id_idx on public.support_tickets (room_id);
create index support_tickets_public_code_idx on public.support_tickets (public_code);

alter table public.support_tickets enable row level security;
revoke all on public.support_tickets from anon, authenticated;

comment on table public.support_tickets is 'Atendimentos da staff. Sem mídia da telagem.';
