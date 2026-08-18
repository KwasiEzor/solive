-- 0004_mfa_recovery_codes — hashed single-use MFA recovery codes (SLV-042).
create table public.mfa_recovery_codes (
  id uuid primary key default public.uuid_generate_v7(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,       -- Argon2id
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index mfa_recovery_codes_user_idx on public.mfa_recovery_codes (user_id);

alter table public.mfa_recovery_codes enable row level security;
-- Users may read their own codes' state (remaining count); all writes and
-- verification go through the service-role client (bypasses RLS).
create policy mfa_recovery_codes_select_self on public.mfa_recovery_codes
  for select to authenticated using (user_id = auth.uid());
