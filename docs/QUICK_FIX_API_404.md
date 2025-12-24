# Quick Fix for API Route 404 Errors

## The Problem
API routes return 404 from the frontend even though they work when tested directly.

## Most Likely Cause
**Root Directory** is set to `frontend` in Vercel Dashboard settings, which prevents Vercel from detecting API routes at the project root.

## Quick Fix (5 minutes)

### Step 1: Check Vercel Dashboard Settings

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **General**
3. Scroll to **Root Directory**
4. **If it says `frontend`**: This is the problem!

### Step 2: Clear Root Directory

1. Click the **Root Directory** field
2. **Delete** the value (leave it empty)
3. Click **Save**
4. **Redeploy** your project (or push a new commit)

### Step 3: Verify

After redeployment:
1. Go to **Deployments** → Latest
2. Click **Functions** tab
3. You should see:
   - `api/query.js`
   - `api/command.js`
   - `api/oracle.js`
   - `api/health.js`

If functions appear, API routes should now work!

## Alternative: If Root Directory Must Stay `frontend`

If you MUST keep Root Directory as `frontend`, move API routes:

1. Move `api/` folder to `frontend/api/`
2. Update `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "/index.html"
    }
  ]
}
```

## Why This Happens

When Root Directory is set to `frontend`:
- Vercel treats `frontend/` as the project root
- API routes at project root `/api/` are not detected
- Only routes in `frontend/api/` would be detected

When Root Directory is empty:
- Vercel treats the repo root as project root
- API routes at `/api/` are automatically detected
- Everything works as expected

## Test After Fix

```bash
# Should return 200 OK
curl https://your-app.vercel.app/api/health

# Should return data (not 404)
curl -X POST https://your-app.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"templateIds":["Test"],"query":{}}'
```

