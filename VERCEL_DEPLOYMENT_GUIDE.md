# Complete Vercel Deployment & OAuth Setup Guide

This guide walks you through deploying **Veritas AI** to Vercel and configuring **Google OAuth** and **Google Gemini AI Detection (Free Tier)**.

---

## Part 1: Obtain Google OAuth Credentials (Gmail Login)

To allow students and users to sign in with their Google accounts:

### Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top and click **New Project**.
3. Name it `Veritas-AI-Detector` and click **Create**.

### Step 2: Configure the OAuth Consent Screen
1. In the left navigation, go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** (this allows any Gmail or university account to sign in) and click **Create**.
3. Fill in the required fields:
   - **App name**: `Veritas AI Detector`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click **Save and Continue** through the Scopes and Test Users steps (the default scopes `email`, `profile`, `openid` are all that's required).
5. Click **Back to Dashboard**. If you want any student to sign in without being manually added as a test user, click **Publish App** under Publishing Status.

### Step 3: Create OAuth 2.0 Client Credentials
1. Go to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** at the top and select **OAuth client ID**.
3. Set **Application type** to `Web application`.
4. Name: `Veritas Web App`.
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (for local development)
   - `https://your-project-name.vercel.app` (your Vercel URL once deployed)
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://your-project-name.vercel.app/api/auth/callback/google` (your Vercel URL once deployed)
7. Click **Create**.
8. Copy the **Client ID** and **Client Secret**.

---

## Part 2: Obtain Google Gemini API Key (100% Free Tier)

For semantic paraphrase, patchwriting, and AI detection:

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with any Google account.
3. Click **Create API key**.
4. Select or create a project, then copy the generated key (`AIzaSy...`).

> **Free Tier Benefits:**
> - **Model**: `gemini-1.5-flash`
> - **Rate Limit**: 15 Requests Per Minute (RPM)
> - **Daily Quota**: 1,500 Requests Per Day (RPD)
> - **Cost**: $0.00 / completely free, no credit card required.

---

## Part 3: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Veritas AI Detector"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Log into [Vercel](https://vercel.com).
3. Click **Add New...** > **Project**.
4. Import your GitHub repository.
5. In the **Environment Variables** section, enter the following:

| Key | Value | Description |
|---|---|---|
| `NEXTAUTH_SECRET` | *(Generate via `openssl rand -base64 32`)* | Encryption key for JWT session cookies |
| `NEXTAUTH_URL` | `https://<your-project-name>.vercel.app` | Your production Vercel URL |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google Cloud OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxx` | Google Cloud OAuth Client Secret |
| `GEMINI_API_KEY` | `AIzaSyxxx` | Google AI Studio free API key |

6. Click **Deploy**.
7. Once deployed, copy your production domain (e.g., `https://veritas-ai.vercel.app`).
8. Return to [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials), edit your OAuth Client, and ensure:
   - `https://veritas-ai.vercel.app` is in **Authorized JavaScript origins**
   - `https://veritas-ai.vercel.app/api/auth/callback/google` is in **Authorized redirect URIs**

---

### Option B: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Log in to Vercel
vercel login

# 3. Deploy
vercel

# 4. Add your production environment variables when prompted or via:
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add GEMINI_API_KEY

# 5. Deploy to production
vercel --prod
```

---

## Part 4: Testing the Live Deployment

1. Visit your Vercel URL.
2. Click **Sign in with Google** in the top navigation. Verify you are logged in and see the **Student Free Pass** indicator.
3. Test with the preloaded samples:
   - Click **Paraphrased** > **Run Free Plagiarism & Paraphrase Check**.
   - Click any highlighted sentence in the **Document Inspector** to review the match explanation and academic rewrite suggestion.
4. Try clicking **Print / Save PDF** to generate an academic report.
