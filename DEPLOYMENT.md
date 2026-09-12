# Campus Lost & Found – Deployment Guide

This guide walks you through deploying the **Backend to Render** and the **Frontend to Vercel**.

---

## Step 1: Push Your Project to GitHub

If you haven't already initialized git, run the following in the project root:

```bash
git init
git add .
git commit -m "Initial commit: Complete Campus Lost & Found app with backend, Supabase, and Gemini"
```

Then create a new repository on [GitHub](https://github.com/new) and push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git branch -M main
git push -u origin main
```

*(Note: Sensitive keys in `.env` files are automatically ignored by `.gitignore` and will NOT be committed).*

---

## Step 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name:** `campus-lost-found-api` (or your choice)
   - **Region:** Choose the closest region (e.g., Singapore, Frankfurt, Oregon)
   - **Root Directory:** `server`  *(Important!)*
   - **Environment:** `Node`
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Under **Advanced > Health Check Path**, set:
   ```
   /api/health
   ```
5. Under **Environment Variables**, add the following:

| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `5000` | (Render sets its own PORT, server will adapt) |
| `SUPABASE_URL` | `https://erhkxlecvsztdoevvbjn.supabase.co` | Your Supabase project URL |
| `SUPABASE_SECRET_KEY` | `eyJ...` | Your Supabase Service Role Secret Key |
| `SUPABASE_ANON_KEY` | `eyJ...` | Your Supabase Anon Public Key |
| `GEMINI_API_KEY` | `your-gemini-api-key` | Your Gemini API Key |
| `FRONTEND_URL` | `*` *(or update with your Vercel URL in Step 4)* | Allowed CORS origin |

6. Click **Create Web Service**.
7. Wait 2-3 minutes for Render to build and deploy. Once live, copy your Render URL:
   ```
   https://campus-lost-found-api.onrender.com
   ```
   *(Test in browser: `https://campus-lost-found-api.onrender.com/api/health` should return `{"success": true, "data": {"status": "healthy"}}`)*.

---

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
2. Import your GitHub repository.
3. In the project configuration:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (leave default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
4. Under **Environment Variables**, add:

| Key | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://campus-lost-found-api.onrender.com/api` | **Must end with `/api`** |

5. Click **Deploy**.
6. Vercel will build and deploy your application in ~30 seconds.
7. You will get a live Vercel domain:
   ```
   https://your-project-name.vercel.app
   ```

---

## Step 4: Link Vercel Domain in Render

1. Open your Render Dashboard and go to your backend service settings.
2. Under **Environment Variables**, update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-project-name.vercel.app
   ```
3. Render will auto-redeploy with the new origin.

---

## Architecture in Production

```
+------------------------------------+
|  Vercel (React 19 + Vite Frontend) |
|   https://your-app.vercel.app      |
+-----------------+------------------+
                  |
                  | HTTPS REST API
                  v
+-----------------+------------------+
|  Render (Express Node.js Backend)  |
|   https://your-api.onrender.com    |
+---+-------------+--------------+---+
    |             |              |
    v             v              v
+-------+   +-----------+   +----------+
|Supabase|  | Supabase  |   |  Google  |
|Postgres|  |  Storage  |   |Gemini AI |
| & Auth |  |  (Images) |   |Embedding |
+-------+   +-----------+   +----------+
```
