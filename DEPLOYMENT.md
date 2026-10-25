# Creator Pulse Portfolio Builder - Production Deployment Guide

This document provides a step-by-step guide to deploying the **Creator Social Metric Aggregator & Portfolio Builder** to production environments.

---

## 1. System Architecture Overview

```
 ┌─────────────────────────┐         ┌─────────────────────────┐         ┌────────────────────────┐
 │   Frontend (Vercel)     │ ──────> │    Backend (Render)     │ ──────> │ Database (MongoDB Atlas)│
 │   React / Vite / Tailwind│  HTTPS  │ Node.js / Express / API │  TLS    │ MongoDB Cluster v7     │
 └─────────────────────────┘         └─────────────────────────┘         └────────────────────────┘
```

---

## 2. Database Setup: MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster (Shared M0 Free Tier or Dedicated).
3. **Database Access**: Create a Database User (e.g. `creator_admin`) with password.
4. **Network Access**: Add IP Address `0.0.0.0/0` (Allow Access from Anywhere) to permit Render backend connections.
5. **Connection String**: Click **Connect** -> **Drivers** -> Copy the SRV URI:
   ```env
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/creator_portfolio?retryWrites=true&w=majority
   ```

---

## 3. Backend Deployment: Render

1. Log in to [Render](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository containing the portfolio codebase.
4. Configure service settings:
   - **Name**: `creator-portfolio-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Health Check Path**: `/api/health`

5. **Environment Variables on Render**:

| Variable Key | Example Production Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production security & cookies |
| `PORT` | `5000` | Target port |
| `API_PREFIX` | `/api` | REST API prefix |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/creator_portfolio` | MongoDB Atlas SRV URI |
| `CLIENT_URL` | `https://your-portfolio.vercel.app` | Vercel frontend domain |
| `CORS_ORIGIN` | `https://your-portfolio.vercel.app` | CORS whitelist domain |
| `JWT_SECRET` | `super_secret_production_jwt_key_32_chars` | Secret key for JWT signing |
| `COOKIE_SECRET` | `super_secret_cookie_parser_key_32_chars` | Secret key for cookie parser |
| `GITHUB_USERNAME` | `your_github_handle` | Target GitHub username |
| `GITHUB_TOKEN` | `ghp_your_github_access_token` | GitHub API access token |
| `YOUTUBE_CHANNEL_ID` | `UC_your_channel_id` | YouTube Channel ID |
| `YOUTUBE_API_KEY` | `AIzaSy_your_youtube_api_key` | Google YouTube Data API v3 key |

6. Click **Create Web Service**. Wait for build completion and note your Render URL (e.g., `https://creator-portfolio-backend.onrender.com`).

---

## 4. Frontend Deployment: Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure build settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variables on Vercel**:

| Variable Key | Production Value |
| :--- | :--- |
| `VITE_API_URL` | `https://creator-portfolio-backend.onrender.com/api` |
| `VITE_API_BASE_URL` | `https://creator-portfolio-backend.onrender.com/api` |

6. Click **Deploy**. Vercel will build the frontend bundle and issue your production HTTPS domain (e.g., `https://your-portfolio.vercel.app`).

---

## 5. Post-Deployment Verification & Diagnostics

Run diagnostics to verify complete full-stack health:

### 1. Health Endpoint Verification
Request `GET https://creator-portfolio-backend.onrender.com/api/health`:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 452.18,
    "timestamp": "2026-10-03T09:00:00.000Z",
    "environment": "production",
    "database": {
      "connected": true,
      "status": "Connected",
      "name": "creator_portfolio"
    }
  }
}
```

### 2. Frontend & Authentication Check
1. Open your Vercel URL `https://your-portfolio.vercel.app`.
2. Verify home page, creator metrics cards, and public portfolio.
3. Click **Sign In** and register/login with creator credentials.
4. Verify HTTP-Only cookie `token` is issued with `SameSite=None; Secure`.
5. Check `/dashboard` access and platform integration controls.

### 3. CLI Verification
Run from local terminal:
```bash
npx portfolio init
npx portfolio status
npx portfolio sync
```

---

## 6. Security Checklist

- [x] `.env` files added to `.gitignore` and never committed.
- [x] `.env.example` templates created for root, server, and client.
- [x] All private API tokens (`YOUTUBE_API_KEY`, `GITHUB_TOKEN`, `JWT_SECRET`) stored exclusively in backend env variables.
- [x] `Helmet` security headers enabled.
- [x] CORS allowed origins restricted to production Vercel client URL.
- [x] Rate limiting active on authentication endpoints (`express-rate-limit`).
- [x] MongoDB query injection protection enabled (`express-mongo-sanitize`).
- [x] HTTP-only cookies configured with `SameSite=None; Secure` in production.
