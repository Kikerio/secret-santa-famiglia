-- =====================================================================
-- 900_test_privacy.sql — VERIFICA DELLA PRIVACY (facoltativo, sicuro)
--
-- Crea 3 utenti finti dentro una transazione, simula le loro sessioni
-- e verifica le regole. Alla fine fa ROLLBACK: NON lascia nessun dato.
--
-- Come usarlo: SQL Editor di Supabase → incolla tutto → Run.
--   ✅ Se non compare nessun errore rosso, tutti i test sono superati.
--   ❌ Se un test fallisce compare un errore "TEST FALLITO (...)".
-- =====================================================================
begin;

-- Utenti di prova: Anna (A), Bruno (B), Carla (C)
insert into auth.users (id, aud, role, email) values
  ('00000000-0000-4000-8000-00000000000a', 'authenticated', 'authenticated', 'test-a@famiglia.secretsanta.app'),
  ('00000000-0000-4000-8000-00000000000b', 'authenticated', 'authenticated', 'test-b@famiglia.secretsanta.app'),
  ('00000000-0000-4000-8000-00000000000c', 'authenticated', 'authenticated', 'test-c@famiglia.secretsanta.app');
insert into public.profiles (id, username, display_name) values
  ('00000000-0000-4000-8000-00000000000a', 'zz_test_a', 'Test Anna'),
  ('00000000-0000-4000-8000-00000000000b', 'zz_test_b', 'Test Bruno'),
  ('00000000-0000-4000-8000-00000000000c', 'zz_test_c', 'Test Carla');

-- Anna ha un desiderio; Bruno lo prenota
insert into public.wishlist_items (id, owner_id, title) values
  ('00000000-0000-4000-8000-0000000000f1', '00000000-0000-4000-8000-00000000000a', 'Sciarpa di prova');
insert into public.claims (item_id, claimer_id, status) values
  ('00000000-0000-4000-8000-0000000000f1', '00000000-0000-4000-8000-00000000000b', 'reserved');

-- Estrazione finta (destinatario cifrato) e Santa Mail:
-- Bruno è il Babbo Natale di Anna. Bruno scrive ad Anna.
insert into public.events (id, year, is_active)
  select '00000000-0000-4000-8000-0000000000e1', 1999, false;
insert into public.draws (event_id, giver_id, receiver_enc) values
  ('00000000-0000-4000-8000-0000000000e1', '00000000-0000-4000-8000-00000000000b', 'CIFRATO.CIFRATO.CIFRATO');
insert into public.messages (event_id, owner_id, box, sender_role, body) values
  ('00000000-0000-4000-8000-0000000000e1', '00000000-0000-4000-8000-00000000000b', 'giftee', 'santa', 'Ciao! Che taglia porti?'),
  ('00000000-0000-4000-8000-0000000000e1', '00000000-0000-4000-8000-00000000000a', 'santa',  'santa', 'Ciao! Che taglia porti?');

-- ---------------------------------------------------------------
-- (a) La proprietaria (Anna) NON vede le prenotazioni sui suoi oggetti
-- ---------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000a","role":"authenticated"}', true);
do $$ declare n int; begin
  select count(*) into n from public.claims where item_id = '00000000-0000-4000-8000-0000000000f1';
  if n <> 0 then raise exception 'TEST FALLITO (a): la proprietaria vede % prenotazioni', n; end if;
  -- non può nemmeno crearne o cancellarne sul proprio oggetto
  begin
    insert into public.claims (item_id, claimer_id) values ('00000000-0000-4000-8000-0000000000f1', '00000000-0000-4000-8000-00000000000a');
    raise exception 'TEST FALLITO (a): la proprietaria ha potuto prenotare il proprio oggetto';
  exception when insufficient_privilege or unique_violation or check_violation then null;
  end;
end $$;
reset role;

-- Carla (visitatrice) invece la vede
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000c","role":"authenticated"}', true);
do $$ declare n int; begin
  select count(*) into n from public.claims where item_id = '00000000-0000-4000-8000-0000000000f1';
  if n <> 1 then raise exception 'TEST FALLITO (a): la visitatrice dovrebbe vedere la prenotazione'; end if;
end $$;

-- ---------------------------------------------------------------
-- (b) Nessun utente può leggere la tabella draws (né la propria né le altrui)
-- ---------------------------------------------------------------
do $$ declare n int; begin
  begin
    select count(*) into n from public.draws;
    raise exception 'TEST FALLITO (b): un utente ha letto % righe di draws', n;
  exception when insufficient_privilege then null; -- atteso: permesso negato
  end;
  begin
    insert into public.draws (event_id, giver_id, receiver_enc) values ('00000000-0000-4000-8000-0000000000e1', '00000000-0000-4000-8000-00000000000c', 'x');
    raise exception 'TEST FALLITO (b): un utente ha scritto in draws';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- ---------------------------------------------------------------
-- (c) Santa Mail: Anna legge solo la sua copia e non c'è alcun ID del mittente
-- ---------------------------------------------------------------
do $$ declare n int; begin
  select count(*) into n from information_schema.columns
   where table_schema = 'public' and table_name = 'messages'
     and column_name in ('sender_id', 'from_id', 'author_id', 'user_id');
  if n <> 0 then raise exception 'TEST FALLITO (c): la tabella messages ha una colonna mittente'; end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000a","role":"authenticated"}', true);
do $$ declare n int; others int; begin
  select count(*) into n from public.messages;
  select count(*) into others from public.messages where owner_id <> '00000000-0000-4000-8000-00000000000a';
  if n <> 1 or others <> 0 then raise exception 'TEST FALLITO (c): Anna vede % messaggi (% non suoi)', n, others; end if;
  -- e non può scoprire chi è il suo Babbo Natale scrivendo messaggi a mano
  begin
    insert into public.messages (event_id, owner_id, box, sender_role, body)
    values ('00000000-0000-4000-8000-0000000000e1', '00000000-0000-4000-8000-00000000000b', 'giftee', 'recipient', 'hack');
    raise exception 'TEST FALLITO (c): un utente ha scritto direttamente in messages';
  exception when insufficient_privilege then null;
  end;
  -- non può darsi il ruolo di organizzatore
  begin
    update public.profiles set is_admin = true where id = '00000000-0000-4000-8000-00000000000a';
    raise exception 'TEST FALLITO: un utente ha modificato il proprio profilo/is_admin';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

select '✅ TUTTI I TEST DI PRIVACY SUPERATI' as risultato;

rollback;  -- nessun dato di prova resta nel database
