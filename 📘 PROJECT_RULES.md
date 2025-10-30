# 📘 FitIQtracker – Regole tecniche del progetto

Queste regole servono per **non rifare gli stessi errori** (nomi diversi, cartelle cambiate, ecc.) e per permettere all’assistente di continuare il lavoro senza perdere il contesto.

---

## 1. Struttura progetto

- Framework: **Next.js 16** (creato con app router)
- Root codice: **`/src`**
- Pagine: **`/src/app/.../page.tsx`**  
  - Esempi reali che esistono già:
    - `/src/app/dashboard/page.tsx`
    - `/src/app/nutrition/page.tsx`
    - `/src/app/workouts/page.tsx`
    - `/src/app/progress/page.tsx` (da completare)
    - `/src/app/journal/page.tsx`
    - `/src/app/settings/page.tsx`
    - `/src/app/login/page.tsx` (se non c’è ancora, sarà lì)
- Componenti condivisi: **`/src/components/`**
  - qui c’è già **`Navbar.tsx`** (navbar fissa in basso)
- Librerie / helper: **`/src/lib/`**
  - qui c’è **`supabaseClient.ts`**

👉 **NON usare `/pages` o maiuscole tipo `/Dashboard`**. Tutto minuscolo.

---

## 2. Stile e UI

- Tema: **sfondo scuro** `bg-slate-950` / `bg-slate-900`
- Colori evidenza: **lime-400 / lime-500** (per pulsanti e titoli)
- Titolo in alto: `FitIQtracker 💪` centrato nella navbar/topbar
- Navbar: **fissa in basso**, già esistente, con queste voci (in ordine):
  1. `/login` (se visibile)
  2. `/dashboard`
  3. `/nutrition`
  4. `/workouts`
  5. `/progress`
  6. `/journal`
  7. `/settings`

Se aggiungiamo nuove pagine, **le aggiungiamo anche qui**.

---

## 3. Supabase

Usiamo **la stessa istanza Supabase** che hai già collegato.

### 3.1 Tabelle che devono esistere

1. **`foods`**
   - `id` bigint PK
   - `name` text NOT NULL
   - `calories` numeric DEFAULT 0
   - `protein` numeric DEFAULT 0
   - `carbs` numeric DEFAULT 0
   - `fat` numeric DEFAULT 0

2. **`meals`**
   - `id` bigint PK
   - `user_id` uuid NOT NULL
   - `food` text NOT NULL
   - `calories` numeric DEFAULT 0
   - `protein` numeric DEFAULT 0
   - `carbs` numeric DEFAULT 0
   - `fat` numeric DEFAULT 0
   - `meal_type` text DEFAULT 'pranzo'
   - `note` text
   - `date` date DEFAULT CURRENT_DATE

3. **`workouts`**
   - `id` bigint PK
   - `user_id` uuid NOT NULL
   - `type` text NOT NULL
   - `duration_min` numeric DEFAULT 0
   - `calories_burned` numeric DEFAULT 0
   - `note` text
   - `date` date DEFAULT CURRENT_DATE

4. **`daily_progress`**
   - `id` bigint PK
   - `user_id` uuid NOT NULL
   - `date` date DEFAULT CURRENT_DATE
   - `calories_consumed` numeric DEFAULT 0
   - `calories_burned` numeric DEFAULT 0
   - `steps` int DEFAULT 0
   - `weight` numeric
   - `note` text
   - `inserted_at` timestamptz DEFAULT timezone('utc', now())

👉 Se qualche colonna non c’è (es. `note` sui workouts) **la aggiungiamo con ALTER** e NON ricreiamo la tabella.

---

## 4. RLS (Row Level Security)

- Tutte le tabelle legate all’utente (`meals`, `workouts`, `daily_progress`, poi anche `ai_journal`) devono avere **RLS attivo**.
- Policy standard:  
  - **select**: `auth.uid() = user_id`
  - **insert**: `auth.uid() = user_id`
  - **update/delete**: per ora non necessario, ma stessa logica.

Se una query in app “non restituisce nulla”, prima cosa: **controllare la policy**.

---

## 5. Frontend – regola sui dati

- Tutte le pagine che leggono dati utente fanno prima:

  ```ts
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) { /* mostrare messaggio o redirect */ }
•	Ogni salvataggio di dato utente DEVE mandare anche user.user.id a Supabase.
	•	Nessuna pagina deve salvare dati anonimi.

⸻

6. Librerie già usate/accettate
	•	@supabase/supabase-js
	•	recharts
	•	date-fns

Se ne aggiungiamo altre, le scriviamo qui.

⸻

7. Convenzioni TypeScript / React
	•	Tutte le pagine client hanno in testa:
"use client";
•	Le funzioni che fanno await devono essere async.
	•	Niente codice “a metà” tipo:
const res = await fetch(...)
// senza try/catch
→ Usare sempre try { ... } catch (err) { ... }.

⸻

8. Git / Repo
	•	Repo GitHub: (già esistente, attiva) → usare sempre questa.
	•	Flusso minimo:
	1.	git status
	2.	git add .
	3.	git commit -m "messaggio"
	4.	git push origin main (o master, secondo la tua repo)
	•	Non committare node_modules/, .next/, .env.local
	•	sono già in .gitignore

⸻

9. Cosa dire all’assistente quando riprendiamo

Scrivere SEMPRE all’inizio della sessione:

“📘 Usa le regole in PROJECT_RULES.md e continua da lì.”

Così evitiamo che ti proponga /pages/, che ti crei casing sbagliato o che ti tolga la navbar.

⸻

10. TODO fissi
	•	Riempire tabella foods (almeno 30 alimenti base)
	•	Aggiungere scanner / lookup da DB pubblico (OpenFoodFacts) → fase 2
	•	Rendere la dashboard dinamica (prende da meals, workouts, daily_progress)
	•	Creare pagina “Importa allenamenti” (CSV/Excel) → fase 2
	•	Music player flottante → fase 2




