-- 0003_harden_functions — pin search_path on helper functions (advisor 0011).
-- gen_random_uuid lives in the `extensions` schema, so qualify it explicitly.

create or replace function public.uuid_generate_v7()
returns uuid language plpgsql volatile set search_path = '' as $$
declare
  unix_ts_ms bytea;
  uuid_bytes bytea;
begin
  unix_ts_ms := substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3);
  uuid_bytes := uuid_send(extensions.gen_random_uuid());
  uuid_bytes := overlay(uuid_bytes placing unix_ts_ms from 1 for 6);
  uuid_bytes := set_byte(uuid_bytes, 6, (b'0111' || get_byte(uuid_bytes, 6)::bit(4))::bit(8)::int);
  uuid_bytes := set_byte(uuid_bytes, 8, (b'10' || get_byte(uuid_bytes, 8)::bit(6))::bit(8)::int);
  return encode(uuid_bytes, 'hex')::uuid;
end $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

create or replace function public.forbid_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin raise exception 'append-only table: % not allowed', tg_op; end $$;
