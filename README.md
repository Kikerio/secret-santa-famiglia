# 🎁 Secret Santa di Famiglia

Web app (PWA per iPhone) per il Secret Santa di famiglia: registrazione con codice famiglia, relazioni "Chi è per te?", estrazione segreta e cifrata, gratta e vinci, wishlist con prezzi in CHF, prenotazioni anti-doppione, Santa Mail anonima in tempo reale, notifiche push e Grande Svelamento.

**Stack:** Next.js 16 · Supabase (Auth, Postgres + RLS, Storage, Realtime) · web-push · Vercel (+ Cron)

---

## Indice
1. [Cosa serve](#1-cosa-serve)
2. [Supabase: database, storage, auth](#2-supabase)
3. [Chiavi e variabili d'ambiente](#3-variabili-dambiente)
4. [Repository GitHub](#4-github)
5. [Deploy su Vercel](#5-vercel)
6. [Cron dei promemoria](#6-cron)
7. [Primo avvio e uso](#7-primo-avvio)
8. [Verifica della privacy](#8-verifica-privacy)
9. [Checklist di test su iPhone](#9-checklist-iphone)
10. [Nuovo anno / manutenzione](#10-manutenzione)
11. [Problemi frequenti](#11-problemi-frequenti)

---

## 1. Cosa serve
- Un account **GitHub** (gratis) – https://github.com
- Un account **Supabase** (gratis) – https://supabase.com
- Un account **Vercel** (gratis, piano Hobby) – https://vercel.com → "Continue with GitHub"
- Per lavorare in locale (facoltativo): **Node.js 20+**

---

## 2. Supabase

### 2.1 Crea il progetto
1. Supabase → **New project**.
2. Nome: `secret-santa`. Regione: **Central EU (Zurich)** se disponibile, altrimenti Frankfurt.
3. Scegli una password del database e salvala in un posto sicuro.

### 2.2 Esegui lo schema (una sola volta)
1. Menu a sinistra → **SQL Editor** → **New query**.
2. Apri il file `supabase/001_schema.sql`, copia **tutto** il contenuto, incollalo e premi **Run**.
3. Deve comparire "Success". Lo script crea tabelle, regole di sicurezza (RLS), il bucket `avatars`, abilita il Realtime per `messages` e `claims` e crea l'evento dell'anno in corso.

> **Ordine dei file SQL**
> | Ordine | File | Quando |
> |---|---|---|
> | 1 | `001_schema.sql` | Subito, una volta sola |
> | 2 | `900_test_privacy.sql` | Facoltativo, per verificare la privacy (non lascia dati) |
> | 3+ | `002_…sql`, `003_…sql` | Solo per modifiche future, in ordine numerico |
>
> ⚠️ Non rieseguire né modificare `001_schema.sql` dopo il primo avvio: le modifiche vanno sempre in un nuovo file numerato.

### 2.3 Impostazioni Auth
1. **Authentication → Sign In / Providers**:
   - **Allow new users to sign up: OFF** (le iscrizioni passano solo dalla nostra API con codice famiglia).
   - Provider **Email: attivo**; "Confirm email" può restare com'è (gli utenti vengono creati già confermati).
2. **Authentication → URL Configuration → Site URL**: metti l'indirizzo Vercel (es. `https://secret-santa-famiglia.vercel.app`) dopo il deploy.

### 2.4 Storage
Il bucket pubblico **`avatars`** viene creato dallo script (max 1 MB, JPEG/PNG/WebP). Puoi controllarlo in **Storage**. Le foto vengono caricate solo dal server.

### 2.5 Realtime
Già attivato dallo script. Per controllare: **Database → Publications → supabase_realtime** deve includere `messages` e `claims`.

---

## 3. Variabili d'ambiente

Copia `.env.example` in `.env.local` (per il locale) e compila. Le stesse variabili vanno messe su Vercel.

| Variabile | Dove trovarla / cosa mettere | Pubblica? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | sì |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → `anon` `public` key | sì |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → `service_role` key | **NO, segreta** |
| `FAMILY_CODE` | Il codice da dare ai parenti (es. `PANETTONE2026`) | segreta |
| `ADMIN_USERNAMES` | Nome/i utente che diventano organizzatori alla registrazione, separati da virgola (es. `kika`) | — |
| `DRAW_SECRET` | Stringa casuale lunga (≥ 32 caratteri). Cifra gli abbinamenti. **Non cambiarla dopo l'estrazione!** | **NO** |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Vedi sotto | sì |
| `VAPID_PRIVATE_KEY` | Vedi sotto | **NO** |
| `VAPID_SUBJECT` | `mailto:` + la tua email | — |
| `CRON_SECRET` | Stringa casuale (Vercel la usa per chiamare il cron) | **NO** |

**Generare le chiavi delle notifiche (VAPID):**
```bash
npx web-push generate-vapid-keys
```
Copia "Public Key" in `NEXT_PUBLIC_VAPID_PUBLIC_KEY` e "Private Key" in `VAPID_PRIVATE_KEY`.

**Generare stringhe casuali** (per `DRAW_SECRET` e `CRON_SECRET`):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```
Oppure usa un generatore di password (40+ caratteri).

---

## 4. GitHub

### Opzione A — dal sito (senza terminale)
1. GitHub → **New repository** → nome `secret-santa-famiglia` → **Private** → Create.
2. Clicca **"uploading an existing file"** e trascina **tutto il contenuto** della cartella del progetto **tranne** `node_modules` e `.next` (se presenti).
3. **Commit changes**.

### Opzione B — con il terminale (mantiene la cronologia dei commit)
```bash
cd secret-santa
git remote add origin https://github.com/TUO-UTENTE/secret-santa-famiglia.git
git push -u origin main
```
> Il file `.env.local` **non** va mai caricato (è già escluso da `.gitignore`).

---

## 5. Vercel
1. Vercel → **Add New… → Project** → importa il repository `secret-santa-famiglia`.
2. Framework: **Next.js** (rilevato da solo). Lascia i comandi predefiniti.
3. **Environment Variables**: aggiungi **tutte** le variabili della tabella al punto 3.
4. **Deploy**. Dopo 1–2 minuti avrai l'indirizzo, es. `https://secret-santa-famiglia.vercel.app`.
5. Torna su Supabase (punto 2.3) e imposta la **Site URL** con questo indirizzo.

> Se cambi una variabile su Vercel, fai **Deployments → … → Redeploy** perché abbia effetto (le `NEXT_PUBLIC_` vengono inserite al momento della build).

---

## 6. Cron
Il file `vercel.json` programma `/api/cron/daily` **ogni giorno alle 08:00 UTC** (09:00 in Svizzera d'inverno). Vercel invia in automatico l'header `Authorization: Bearer CRON_SECRET`.

Il cron manda:
- 🛍️ promemoria a chi ha opzionato un regalo da **3+ giorni** senza segnarlo come acquistato (una volta per oggetto);
- 📝 promemoria **7 giorni prima** dello scambio a chi ha la wishlist vuota;
- 🎅 il **giorno prima** dello scambio, un messaggio a tutti.

Le notifiche di **estrazione** e **nuovo messaggio Santa Mail** partono subito, senza cron.

Per provarlo a mano:
```bash
curl -H "Authorization: Bearer IL_TUO_CRON_SECRET" https://TUO-SITO.vercel.app/api/cron/daily
```
Controllo: Vercel → progetto → **Settings → Cron Jobs**.

---

## 7. Primo avvio
1. Apri il sito su iPhone con **Safari** → **Crea il tuo account** usando come nome utente quello messo in `ADMIN_USERNAMES` → diventi organizzatore.
2. **Profilo → Pannello organizzatore**: imposta nome, budget, data/luogo dello scambio e data/ora dello **Svelamento**.
3. Manda ai parenti il **link** + il **codice famiglia**. Ognuno si registra con foto, nome, nome utente e password, poi compila "Chi è per te?".
4. Nel pannello controlla **Esclusioni** (default: partner, genitore, figlio, fratello/sorella) e **Partecipanti**.
5. Quando tutti sono dentro: **Scorri per estrarre** → conferma. Tutti ricevono la notifica e trovano la card da grattare in Home.
6. Password dimenticata? **Pannello → Partecipanti → 🔑 Reimposta password**.

---

## 8. Verifica privacy
Nel **SQL Editor** di Supabase incolla ed esegui `supabase/900_test_privacy.sql`.
Lo script crea 3 utenti finti, simula le loro sessioni e verifica che:
- **(a)** la proprietaria di una wishlist non veda le prenotazioni sui suoi oggetti (mentre gli altri sì);
- **(b)** nessun utente possa leggere o scrivere la tabella `draws`;
- **(c)** Santa Mail non abbia colonne del mittente, ognuno legga solo le proprie copie e nessuno possa scrivere messaggi aggirando l'API; inoltre nessuno può darsi il ruolo di organizzatore.

Risultato atteso: `✅ TUTTI I TEST DI PRIVACY SUPERATI`. Alla fine fa `ROLLBACK`: nessun dato di prova resta nel database.

**Altre garanzie (nel codice):**
- La `SUPABASE_SERVICE_ROLE_KEY` è usata solo in `lib/server.js` (marcato `server-only`): il build fallisce se finisse nel codice del browser.
- Gli abbinamenti sono **cifrati** (AES-256-GCM): anche aprendo la tabella `draws` dal pannello di Supabase si vede solo testo illeggibile.
- `/api/admin/overview` restituisce solo il **numero** di abbinamenti, mai i nomi. `/api/reveal` risponde con la catena completa solo dopo `reveal_at`.
- Le notifiche push non contengono mai nomi.

---

## 9. Checklist iPhone
- [ ] Registrazione con selfie (fotocamera) e con foto dalla galleria → ritaglio quadrato
- [ ] Codice famiglia sbagliato → messaggio chiaro
- [ ] Login con nome utente + password
- [ ] Flusso "Chi è per te?" dopo la registrazione; nel profilo vedo "Ti hanno indicato"
- [ ] Guida installazione: Safari → ••• → Condividi → Aggiungi alla schermata Home → Apri come app web → Aggiungi
- [ ] L'app si apre dall'icona a tutto schermo (niente barra di Safari), notch e barra Home rispettati
- [ ] Profilo → **Attiva notifiche** → arriva la notifica di prova
- [ ] Wishlist: incolla un link Galaxus/Digitec → titolo, foto e prezzo compilati; link Amazon → form manuale
- [ ] Stella "Desiderio top", fasce di prezzo e badge "Fascia Secret Santa"
- [ ] Da un altro account: "Lo prendo io" → "Segna acquistato" → il proprietario **non** vede nulla
- [ ] Estrazione dal pannello (slider + conferma) → notifica a tutti
- [ ] Gratta e vinci col dito → al 55% coriandoli e card del destinatario
- [ ] Santa Mail nei due sensi, in tempo reale, con notifica senza nomi
- [ ] Svelamento: prima bloccato, dopo la data mostra tutta la catena
- [ ] Impostazioni iPhone → Accessibilità → Movimento → **Riduci movimento**: niente neve/coriandoli

---

## 10. Manutenzione
- **Nuovo anno:** Pannello → Evento → cambia l'**Anno** e salva. Viene creata una nuova edizione; quella vecchia resta per **evitare di ripetere** gli stessi abbinamenti. Poi riattiva/disattiva i partecipanti ed estrai.
- **Modifiche al database:** nuovo file `supabase/002_….sql`, eseguilo nel SQL Editor, poi riesegui `900_test_privacy.sql`.
- **Sviluppo locale:**
  ```bash
  npm install
  cp .env.example .env.local   # e compila
  npm run dev                  # http://localhost:3000
  ```

---

## 11. Problemi frequenti
| Problema | Soluzione |
|---|---|
| "Registrazione non configurata" | Manca `FAMILY_CODE` su Vercel → aggiungila e fai Redeploy |
| "Variabili NEXT_PUBLIC_… mancanti" | Aggiungi URL e anon key su Vercel e fai **Redeploy** |
| Le notifiche non arrivano su iPhone | Serve iOS 16.4+, app aperta **dall'icona** in Home, notifiche attivate dal Profilo; controlla le chiavi VAPID |
| "DRAW_SECRET mancante" | Aggiungi la variabile su Vercel. Se la cambi dopo l'estrazione, ripeti l'estrazione |
| La foto profilo non si carica | Il bucket `avatars` deve esistere ed essere pubblico (Storage) |
| Il link prodotto non si compila | Alcuni negozi bloccano la lettura: compila a mano, l'app lo propone in automatico |
| Estrazione impossibile | Il messaggio dice chi è rimasto senza opzioni: disattiva una categoria di esclusione o aggiungi partecipanti |

---

### Struttura
```
app/
  (auth)/login, registrati        accesso
  (app)/home, desideri, famiglia, santa-mail, profilo, admin, svelamento, benvenuto
  installa/                       guida PWA iPhone
  api/                            register, profile, draw, reveal, messages, scrape, push, cron, admin/*
components/                       UI, icone glass, illustrazioni SVG, gratta e vinci, slider…
lib/                              server (service role), crypto, draw (backtracking), push, format
public/                           manifest.json, sw.js, icons/
supabase/                         001_schema.sql, 900_test_privacy.sql
```

### Illustrazioni
Le illustrazioni 3D (pacco regalo, bastoncino di zucchero, calza, palla di neve, omino di pan di zenzero) sono SVG multilivello in `components/Illustrations.js`: nessun file raster necessario. Se in futuro vuoi sostituirle con immagini generate, mettile in `public/illustrations/` (PNG trasparente, **600×600 px**): `gift.png`, `candy-cane.png`, `stocking.png`, `snow-globe.png`, `gingerbread.png`.
