# ⚡ Business Intelligence Engine

AI-powered business idea analysis using **Groq + Llama 3**. Get deep analysis on demand, margins, competitors, personas, channels, legal, and exit potential — for any business idea.

## Features

- 🤖 **Real AI analysis** via Groq's free Llama 3 70B API
- 📊 **13-agent simulation** — demand, profit, gaps, supply, forecast, competitors, personas, channels, legal, exit, scoring, blueprint
- 🔗 **Share reports via URL** — analysis is encoded in the URL so you can share with anyone
- 📱 **Mobile optimized** — works great on phone
- 📥 **Export to Markdown** — download full report
- 🌙 **Dark theme** — easy on the eyes

---

## 🚀 Deploy in 5 minutes

### Step 1 — Get a free Groq API key

1. Go to **[console.groq.com](https://console.groq.com)**
2. Sign up (free, no credit card needed)
3. Go to **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_...`)

**Free tier:** 14,400 requests/day on Llama 3 70B — more than enough.

---

### Step 2 — Push to GitHub

```bash
# In this project folder:
git init
git add .
git commit -m "Initial commit — Business Intelligence Engine"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/business-intelligence-engine.git
git branch -M main
git push -u origin main
```

---

### Step 3 — Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)** → **Add New Project**
2. Import your GitHub repo
3. Vercel will auto-detect Next.js — no config needed
4. **Before clicking Deploy**, go to **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | `gsk_your_key_here` |

5. Click **Deploy** ✅

Your app will be live at `https://your-project.vercel.app` in ~1 minute.

---

### Step 4 — Local development (optional)

```bash
npm install

# Copy env example
cp .env.local.example .env.local
# Edit .env.local and add your GROQ_API_KEY

npm run dev
# Open http://localhost:3000
```

---

## Project structure

```
business-intelligence/
├── pages/
│   ├── index.js          # Main UI
│   ├── _app.js           # App wrapper
│   └── api/
│       └── analyze.js    # Groq API route
├── components/
│   └── RadarChart.js     # Chart.js radar chart
├── styles/
│   └── globals.css       # All styles
├── .env.local.example    # Copy to .env.local
├── next.config.js
└── package.json
```

---

## Customization

**Change the AI model** — in `pages/api/analyze.js`:
```js
model: 'llama3-70b-8192',     // Most capable (default)
model: 'llama3-8b-8192',      // Faster, lighter
model: 'mixtral-8x7b-32768',  // Alternative
```

**Add more quick-start ideas** — in `pages/index.js`, edit the `QUICK_STARTS` array.

---

## Tech stack

- **Next.js 14** — React framework
- **Groq SDK** — Fast LLM inference
- **Llama 3 70B** — Analysis model
- **Chart.js** — Radar chart visualization
- **Vercel** — Deployment

---

*Built with ⚡ Groq + Llama 3 + Next.js*
