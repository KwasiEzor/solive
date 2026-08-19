-- 0005_last_owner_lock — guarantee at least one active owner (SLV-070).
-- App-level checks exist too; this is the database backstop.

create or replace function public.enforce_last_owner()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  demoting boolean;
begin
  if tg_op = 'DELETE' then
    demoting := (old.role = 'owner' and old.disabled_at is null);
  else
    demoting := (old.role = 'owner' and old.disabled_at is null
      and (new.role <> 'owner' or new.disabled_at is not null));
  end if;

  if demoting then
    if (select count(*) from public.admin_users
        where role = 'owner' and disabled_at is null and id <> old.id) = 0 then
      raise exception 'at least one active owner is required';
    end if;
  end if;

  if tg_op = 'DELETE' then return old; else return new; end if;
end $$;

create trigger admin_users_last_owner_update before update on public.admin_users
  for each row execute function public.enforce_last_owner();
create trigger admin_users_last_owner_delete before delete on public.admin_users
  for each row execute function public.enforce_last_owner();
