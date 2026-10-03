# Veritas AI — Academic Plagiarism & Paraphrase Detector

Veritas AI is a production-ready, full-stack web application designed for students and researchers. It detects verbatim plagiarism, semantic paraphrasing, patchwriting, and AI-synthesized prose with sentence-level transparency.

---

## 🌟 Key Features

- **Semantic Paraphrase & Patchwriting Detection**: Identifies synonym substitutions, active-to-passive alterations, and clause rearrangement.
- **Direct Plagiarism & Literature Matching**: Cross-references academic literature, open repositories, and web indices.
- **AI Synthetic Cadence Detection**: Evaluates text perplexity and burstiness to distinguish authentic student voices from LLM-generated prose.
- **Gmail & Student OAuth**: Free, single-click authentication via Google OAuth with immediate Student Tier activation (`.edu`, `.ac.*`, and all `@gmail.com` accounts).
- **Interactive Sentence Inspector**: Clickable highlighted text with color-coded severity tags, confidence ratings, and authentic academic rewrite suggestions.
- **Zero Student Data Retention**: Student submissions are never stored in public databases, indexed, or shared with third parties.
- **Vercel Zero-Config Deployment**: Optimized for Vercel serverless functions with Edge & Node.js runtimes.

---

## 🏗️ Architecture Overview

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Serverless API routes, optimized React Server Components, instant Vercel deployments |
| **Authentication** | NextAuth.js (`next-auth` v4) | Secure Google OAuth 2.0 provider with stateless JWT session tokens (no external database required) |
| **Styling** | Vanilla CSS Design System | Custom dark obsidian glassmorphism, responsive grid, zero external CSS runtime overhead, full `@media print` support |
| **Detection Engine** | Google Gemini 1.5 Flash + Fallback Heuristics | **100% Free tier** via Google AI Studio (15 RPM / 1,500 requests/day) with zero-key heuristic fallback |
| **Hosting** | Vercel | Global CDN edge caching, automatic SSL, preview deployments, environment variable management |

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd Code-Titan--main-1
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials:
- `NEXTAUTH_SECRET`: Run `openssl rand -base64 32` or any 32-character string.
- `NEXTAUTH_URL`: `http://localhost:3000` (for local dev).
- `GEMINI_API_KEY`: Get a free key at [Google AI Studio](https://aistudio.google.com/).
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth Google OAuth handler
│   │   ├── detect/route.ts              # Plagiarism & Paraphrase API route
│   │   └── user/route.ts                # Session & student entitlement status
│   ├── globals.css                      # Design tokens, glassmorphism, animations
│   ├── layout.tsx                       # Root layout & NextAuth Provider
│   └── page.tsx                         # Main Dashboard (Uploader + Results)
├── components/
│   ├── AuthProvider.tsx                 # NextAuth SessionProvider wrapper
│   ├── Navbar.tsx                       # Header with Google Auth & Student badge
│   ├── ResultsView.tsx                  # Interactive score dials & sentence inspector
│   ├── ScanHistoryModal.tsx             # Local scan comparison history
│   └── TextUploader.tsx                 # Drag-and-drop file upload & sample texts
├── lib/
│   ├── auth.ts                          # NextAuth configuration & student verification
│   └── detector-service.ts              # Multi-tier AI detection service
├── types/
│   └── detector.ts                      # TypeScript data definitions
├── .env.example                         # Environment variable template
└── VERCEL_DEPLOYMENT_GUIDE.md           # Step-by-step deployment instructions
```

---

## 📄 License
MIT License. Open-source educational software.
