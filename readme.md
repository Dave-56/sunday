# sunday.

A minimal weekly meal planner PWA for two. Pick one dish every Sunday, cook it in bulk, eat well all week.

Built with Next.js, deployed on Vercel, powered by Claude.

---

## What it does

- Suggests 3 dinner options each Sunday, tailored to your cuisine preferences and dietary needs
- You pick one, lock it in, get the full recipe scaled for a week of meal prep
- Remembers your recent history so it never repeats dishes
- Installable on iPhone and Android as a home screen app (PWA)

---

## Prerequisites

Before you start, make sure you have:

- [Node.js](https://nodejs.org/) v18 or higher
- [Claude Code](https://claude.ai/code) — install with `npm install -g @anthropic-ai/claude-code`
- An Anthropic API key — get one at [console.anthropic.com](https://console.anthropic.com)
- A [Vercel account](https://vercel.com) (free tier is fine)
- Vercel CLI — install with `npm install -g vercel`

---

## Building with Claude Code

### Step 1 — Open Claude Code in your terminal

```bash
claude
```

### Step 2 — Paste this prompt

```
Build a Next.js PWA called "sunday." — a weekly meal planner for two people. Mobile-first, minimal aesthetic (think Vercel/Notion: white space, sharp typography, no clutter). Font: Geist. Colors: black, white, subtle grays.

Core flow:
- Home screen shows 3 AI-generated dinner options for the week, each as a card with dish name, cuisine tag, one-line description, difficulty, prep time, and a "view recipe" link
- Tap a card to select it. "Lock in this dish" confirms the week's pick
- Recipe view shows full ingredients (scaled for 2 people × 5–6 days) and step-by-step instructions
- "Suggest different dishes" regenerates, avoiding recent history
- History is stored in localStorage — last 8 weeks

Constraints baked into the AI prompt:
- No dairy (lactose intolerant)
- No ungrilled fish. Prawns, crab, shrimp are fine
- Batch-cookable: cook once Sunday, reheat all week
- Cuisine lean: Nigerian/West African first, then Asian, then anything delicious
- Skill level: easy to intermediate
- 2–3 hour Sunday cook time

API: Call Anthropic API server-side via a Next.js API route (/api/suggest). Use claude-sonnet-4-20250514. Return JSON array of 3 dishes with: name, cuisine, why, difficulty, prepTime, servings, ingredients[], steps[].

PWA: Add manifest.json (name: "sunday.", short_name: "sunday", theme_color: "#000000", background_color: "#ffffff", display: standalone, icons at 192 and 512). Add service worker for offline shell. Make it installable on iOS and Android.

Deploy: Set up for Vercel. ANTHROPIC_API_KEY as environment variable.
```

Claude Code will scaffold the entire project. This takes about 5–10 minutes.

---

## Running locally

Once Claude Code finishes building:

```bash
# Install dependencies
npm install

# Add your API key
cp .env.example .env.local
# Then edit .env.local and add your key:
# ANTHROPIC_API_KEY=sk-ant-...

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone (make sure your phone is on the same WiFi) or in your browser.

---

## Deploying to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
gh repo create sunday-app --public --push
```

> If you don't have the GitHub CLI, create a repo at github.com and follow the push instructions there.

### Step 2 — Deploy

```bash
vercel --prod
```

Follow the prompts. When asked about environment variables, add:

```
ANTHROPIC_API_KEY = sk-ant-your-key-here
```

### Step 3 — Share the URL

Vercel gives you a URL like `sunday-app.vercel.app`. Share it with your partner. On iPhone, open it in Safari → Share → Add to Home Screen. On Android, open in Chrome → menu → Install app.

---

## Installing on your phones

### iPhone (Safari only)
1. Open the app URL in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the three-dot menu
3. Tap **Install app** or **Add to Home Screen**
4. Tap **Install**

---

## Project structure

```
sunday/
├── app/
│   ├── page.tsx          # Home screen — dish cards
│   ├── recipe/page.tsx   # Recipe detail view
│   └── api/
│       └── suggest/
│           └── route.ts  # Server-side Anthropic API call
├── public/
│   ├── manifest.json     # PWA manifest
│   ├── sw.js             # Service worker
│   ├── icon-192.png      # App icon
│   └── icon-512.png      # App icon (large)
├── .env.local            # Your API key (never commit this)
└── README.md
```

---

## Environment variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key from console.anthropic.com |

Never commit `.env.local` to GitHub. It is already in `.gitignore`.

---

## Customising the dish preferences

The AI prompt lives in `app/api/suggest/route.ts`. Edit the constraints section to adjust cuisine preferences, dietary needs, or skill level for your household.

---

## Tech stack

- [Next.js 14](https://nextjs.org) — framework
- [Geist](https://vercel.com/font) — typography
- [Anthropic Claude](https://anthropic.com) — dish suggestions and recipes
- [Vercel](https://vercel.com) — hosting
