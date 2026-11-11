# PropValue AI — Free Deployment Guide

This guide explains how to deploy **PropValue AI** (FastAPI Backend + Next.js Frontend) to the cloud using 100% free hosting tiers.

---

## Option 1: One-Click Free Deployment on Render (Recommended)

Render offers a free tier for both web services (FastAPI) and frontend (Next.js / Node).

This repository includes a `render.yaml` blueprint that deploys both services automatically:

### Steps:
1. Push your latest code to GitHub:
   ```bash
   git add .
   git commit -m "feat: add render blueprint and deployment config"
   git push origin master
   ```
2. Log in to [Render.com](https://render.com) (free signup with your GitHub account).
3. On the Render Dashboard, click **New +** in the top navigation and select **Blueprint**.
4. Select your repository: `Satyam00069/PropValue`.
5. Render will detect `render.yaml` and configure both services:
   - `propvalue-backend` (FastAPI Python web service)
   - `propvalue-frontend` (Next.js web service)
6. Click **Apply**. Render will build and deploy both services!

---

## Option 2: Vercel (Frontend) + Render (Backend)

Vercel provides the fastest free hosting for Next.js applications with global edge caching:

### Step 1: Deploy Backend on Render (Free)
1. Go to [Render.com](https://render.com) -> **New +** -> **Web Service**.
2. Connect `Satyam00069/PropValue`.
3. Set the following settings:
   - **Name**: `propvalue-backend`
   - **Root Directory**: Leave blank (repo root)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free
4. Click **Create Web Service**.
5. Once deployed, copy your backend URL (e.g. `https://propvalue-backend.onrender.com`).

### Step 2: Deploy Frontend on Vercel (Free)
1. Go to [Vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import `Satyam00069/PropValue`.
4. Configure Project:
   - **Root Directory**: Click edit and choose `frontend`.
   - **Framework Preset**: `Next.js`
   - **Environment Variables**:
     - Key: `NEXT_PUBLIC_API_URL`
     - Value: `https://your-backend-name.onrender.com/api/v1`
5. Click **Deploy**.
6. Your Next.js SaaS frontend will be live on a free `.vercel.app` domain!

---

## Option 3: Railway (Free Trial)
1. Go to [Railway.app](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo** -> Select `Satyam00069/PropValue`.
3. Railway will detect `docker-compose.yml` and deploy both backend and frontend.
