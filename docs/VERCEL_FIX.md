# Fixing Vercel API Routes 404 Issue

## Problem
API routes (`/api/query`, `/api/command`, `/api/oracle`) are returning 404 errors even though files exist at project root `/api/`.

## Root Cause
When you set **Root Directory** to `frontend` in Vercel, it may not automatically detect API routes at the project root.

## Solution Options

### Option 1: Remove Root Directory Setting (Recommended)

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **General**
2. **Clear** the "Root Directory" field (leave it empty)
3. Update `vercel.json` to specify build commands with paths:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "devCommand": "cd frontend && npm run dev",
  "framework": "vite",
  "functions": {
    "api/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

4. **Redeploy** the project

### Option 2: Keep Root Directory, Use CORS Proxy (Current Implementation)

The app now has a **CORS proxy fallback** built-in. If Vercel API routes return 404, it will automatically use a public CORS proxy service.

**Note**: Public CORS proxies may have rate limits and reliability issues. This is a temporary workaround.

### Option 3: Use Different Deployment Platform

Consider using:
- **Netlify** (similar to Vercel, better API route support)
- **Railway** (full Node.js environment)
- **Render** (supports both static and API routes)

## Testing After Fix

1. Test health endpoint:
   ```
   https://your-app.vercel.app/api/health
   ```

2. Test query endpoint:
   ```bash
   curl -X POST https://your-app.vercel.app/api/query \
     -H "Content-Type: application/json" \
     -d '{"templateIds":["Test"],"query":{}}'
   ```

3. Check Vercel Function Logs:
   - Go to Vercel Dashboard → Deployments → Latest
   - Click "Functions" tab
   - You should see `api/query.js`, `api/command.js`, etc.

## Current Workaround

The app now includes a **CORS proxy fallback** that will automatically activate if Vercel API routes aren't working. This means:

- ✅ App will work even if API routes return 404
- ⚠️ Uses public CORS proxy (may have rate limits)
- ⚠️ Slightly slower (extra proxy hop)

## Recommended Action

**Try Option 1 first** (remove root directory setting). This is the cleanest solution and will make API routes work properly.

