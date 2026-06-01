# Gold Hunter AI

Gold Hunter AI is a Vite + React + Supabase app for uploading XAUUSD chart screenshots and getting an AI-assisted SMC/ICT signal with confidence, setup authenticity, risk grade, reasoning, and confirmations.

> **Important:** AI signals are educational analysis only. Always use your own risk management and do not treat any BUY/SELL output as guaranteed financial advice.

## Visual Studio Code mein app kaise chalani hai

### 1. Required software install karo

- **Visual Studio Code**
- **Node.js LTS** (Node 18+ recommended)
- **Git**
- **Supabase CLI** (sirf tab zaroori hai jab local Supabase/functions chalani hon)

### 2. Project VS Code mein open karo

1. VS Code open karo.
2. **File → Open Folder** par click karo.
3. Is project ka folder select karo.
4. VS Code terminal open karo: **Terminal → New Terminal**.

### 3. Node aur npm verify karo

Terminal mein yeh commands chalao:

```bash
node -v
npm -v
```

Agar version show ho jaye to Node/npm ready hain.

### 4. Dependencies install karo

```bash
npm install
```

Agar clean install chahiye aur `package-lock.json` use karna hai:

```bash
npm ci
```

### 5. Environment file banao

Root folder mein `.env` file banao. Example ke liye `.env.example` copy kar sakte ho:

```bash
cp .env.example .env
```

Phir `.env` mein apni Supabase values add karo:

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-or-publishable-key"
```

Frontend Supabase client inhi `VITE_` variables ko read karta hai.

### 6. Frontend app run karo

```bash
npm run dev
```

Terminal mein Vite ka local URL aayega, usually:

```text
http://localhost:5173
```

Browser mein URL open karo. App chal jayegi.

## AI chart analysis use karne ka tareeqa

1. App mein signup/login karo.
2. Dashboard se **Upload Chart** par jao.
3. TradingView ya kisi chart ka clear XAUUSD screenshot upload karo.
4. **Analyze** button click karo.
5. Result page par signal details dekho:
   - BUY / SELL / WAIT
   - Confidence %
   - Entry, Stop Loss, TP1, TP2
   - SMC/ICT confirmations
   - Setup Authenticity %
   - Risk Grade
   - Reasoning bullets

## Supabase + AI function setup

AI analysis Supabase Edge Function ke through chalti hai: `supabase/functions/analyze-chart/index.ts`.

### Local Supabase start karo

```bash
supabase start
```

### Database migrations apply karo

```bash
supabase db reset
```

Migrations tables, RLS policies, user settings, signals table, aur private `charts` storage bucket create karti hain.

### Edge function secrets set karo

Hosted Supabase project mein secrets set karne ke liye:

```bash
supabase secrets set LOVABLE_API_KEY="your-lovable-ai-key"
```

Agar local function serve karni ho to `supabase/.env` ya CLI secrets ke through yeh values available honi chahiye:

```env
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
LOVABLE_API_KEY="your-lovable-ai-key"
```

### Edge function local run karo

```bash
supabase functions serve analyze-chart --env-file supabase/.env
```

### Edge function deploy karo

```bash
supabase functions deploy analyze-chart
```

## Useful commands

```bash
npm run dev
npm run build
npm run lint
npm run test
```

## Common errors aur fixes

### `vite: not found`

Dependencies install nahi hui hoti. Run karo:

```bash
npm install
```

Phir dobara:

```bash
npm run dev
```

### `Missing Supabase env` ya blank page

`.env` file check karo aur ensure karo ke values exactly yeh names use kar rahi hain:

```env
VITE_SUPABASE_URL="..."
VITE_SUPABASE_PUBLISHABLE_KEY="..."
```

### `AI key missing`

Edge function ko `LOVABLE_API_KEY` nahi mil rahi. Supabase secrets ya local `supabase/.env` mein key add karo.

### Upload fail ho raha hai

Supabase migrations run honi chahiye, kyun ke `charts` storage bucket aur policies migration se create hoti hain.

### AI result `WAIT` aa raha hai

App intentionally strict hai. Agar SMC/ICT confirmations clear nahi hoti — pattern, liquidity, BOS/CHOCH, CRT, trend/multi-timeframe — to signal `WAIT` return hota hai.
