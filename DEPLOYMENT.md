# HostelHub Deployment Guide

This guide will help you get **HostelHub** from your local machine to the live web. We use a professional 3-tier architecture:

1.  **Frontend**: Angular on [Vercel](https://vercel.com)
2.  **Backend**: Rust on [Render](https://render.com) or [Railway](https://railway.app)
3.  **Database**: PostgreSQL on [Supabase](https://supabase.com) (Already Setup!)
4.  **Cache**: Redis on [Upstash](https://upstash.com)

---

## 1. Prerequisites
- A GitHub repository with your code pushed.
- A [Supabase](https://supabase.com) account (You already have a working `DATABASE_URL`).
- An [Upstash](https://upstash.com) account for a Free Serverless Redis.

---

## 2. Deploy Backend (Rust) on Render
Render is chosen for its native Docker support and high stability for Rust.

1.  **Go to [Render Dashboard](https://dashboard.render.com)** and click **"New" -> "Web Service"**.
2.  Connect your GitHub repository.
3.  **Settings**:
    - **Root Directory**: `backend`
    - **Environment**: `Docker`
4.  **Add Environment Variables**:
    - `DATABASE_URL`: Your Supabase connection string.
    - `JWT_SECRET`: A long random string (e.g., `openssl rand -base64 32`).
    - `REDIS_URL`: Your Upstash Redis connection string.
    - `PORT`: `8080` (Render will manage this automatically).
5.  **Deploy**: Render will build the Docker container and provide a URL (e.g., `https://hostelhub-backend.onrender.com`).

---

## 3. Deploy Frontend (Angular) on Vercel
Vercel is the gold standard for Angular deployments.

1.  **Preparation**:
    - I've already added a `vercel.json` to handle page refreshes (SPA routing).
2.  **Go to [Vercel](https://vercel.com)** and click **"Add New" -> "Project"**.
3.  Connect your GitHub repository.
4.  **Configure Project**:
    - **Root Directory**: `frontend`
    - **Framework Preset**: `Angular`
    - **Output Directory**: `dist/frontend/browser` (Vercel usually auto-detects this).
5.  **Deploy**: Once deployed, you'll get a production URL (e.g., `https://hostelhub-ui.vercel.app`).

---

## 4. Connecting the Two
1.  **Update Vercel Configuration**: 
    - In your `frontend/vercel.json`, I've already added a rewrite rule.
    - Ensure the `destination` URL in `vercel.json` matches your **Render** backend URL.
    - If you change the backend location, simply update `vercel.json` and push to GitHub.

---

## Important Tips 💡
> [!TIP]
> **Database Seed**: Since you are using a live Supabase DB, you don't need to seed it again if the data is already there. If you need a fresh start, you can run the `seed_database` function by setting an environment variable if implemented, or just use the `supabase_seed.sql` provided in the root.

> [!WARNING]
> Ensure your Supabase **Allow IP Access** is set to `0.0.0.0/0` (standard for many hosts) so Render can connect to it.
