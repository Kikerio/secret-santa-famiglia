# CLAUDE.md — Regole fisse del progetto Secret Santa di Famiglia

## Stack
- Next.js 16 (App Router, **JavaScript**, niente TypeScript), React 19
- **CSS puro** con variabili in `app/globals.css` (niente Tailwind, niente CSS-in-JS)
- Supabase: Auth, PostgreSQL + RLS, Storage (`avatars`), Realtime (`messages`, `claims`)
- `web-push` (notifiche), `canvas-confetti` (celebrazioni)
- Deploy: GitHub privato → Vercel (con Cron). **Mai GitHub Pages.**

## Regole di privacy (inviolabili)
1. Il proprietario di una wishlist **non legge mai** i `claims` sui propri oggetti (policy RLS `claims_select`).
2. `draws` è scritta e letta **solo lato server** con `SUPABASE_SERVICE_ROLE_KEY`; il destinatario è **cifrato** (AES-256-GCM, `DRAW_SECRET`). Nessuna API restituisce abbinamenti altrui prima di `reveal_at`. Niente `console.log` di abbinamenti.
3. Santa Mail: modello a "casella postale" (due copie per messaggio, `owner_id` + `box` + `sender_role`). **Nessuna colonna mittente.** I messaggi si scrivono solo via `/api/messages`.
4. Payload delle notifiche push: **mai nomi** di abbinamenti.
5. `SUPABASE_SERVICE_ROLE_KEY`, `DRAW_SECRET`, `VAPID_PRIVATE_KEY`, `CRON_SECRET` solo in Route Handlers (`lib/server.js` importa `server-only`). Mai prefisso `NEXT_PUBLIC_`.
6. `profiles` non è modificabile dal client (niente auto-promozione `is_admin`): si passa da `/api/profile` e `/api/admin/*`.

## Database
- `supabase/001_schema.sql` è già stato eseguito: **non modificarlo**.
- Ogni modifica va in un nuovo file numerato: `supabase/002_descrizione.sql`, `003_...`.
- `supabase/900_test_privacy.sql` va rieseguito dopo ogni modifica alle policy.

## Design system "Apple Festive Glass"
- Zero dark mode. Sfondo `--snow #F7F3EC` + aloni radiali (bacca, abete, oro, ghiaccio).
- Vetro: classi `.glass` / `.glass.strong`; raggi 22–28px; bottoni a pillola.
- Accenti: `--berry #E0312B` (azioni), `--fir #1F8A55` (acquistato), `--gold #D9A13B` (top / lamina).
- Icone: componente `GlassIcon` (squircle). Illustrazioni: `components/Illustrations.js` (SVG).
- Prezzi e countdown sempre con classe `.price` / `.num` (tabular-nums) e formato `chf()` → `CHF 45.–`.
- Touch target ≥ 44×44 px, `aria-label` sui bottoni a icona, rispettare `prefers-reduced-motion`.
- Microcopy in italiano, caldo e conciso, emoji con misura.

## Convenzioni
- Pagine utente in `app/(app)/…` (protette + tab bar); accesso in `app/(auth)/…`.
- Chiamate alle API interne con `api()` di `lib/supabaseClient.js` (aggiunge il Bearer token).
- Prima di ogni commit: `npm run build` senza errori. Commit in italiano.
