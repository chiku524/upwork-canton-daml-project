# API Route 404 Troubleshooting Guide

## Current Issue
API routes (`/api/query`, `/api/command`, `/api/oracle`) return 404 when called from the frontend, but work when tested directly (e.g., `/api/health`, `/api/test`).

## Root Cause Analysis

### Why Direct Tests Work But Frontend Fails
- **Direct tests work**: Serverless functions ARE deployed correctly
- **Frontend fails**: Rewrite rules are intercepting requests before they reach serverless functions

## Solution Steps

### Step 1: Check Vercel Dashboard Settings

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **General**
2. Check the **Root Directory** setting:
   - **If set to `frontend`**: This may cause API routes at project root to not be detected
   - **Recommended**: Clear this field (leave empty) OR ensure API routes are in the correct location

### Step 2: Verify API Route Location

API routes should be at:
```
project-root/
├── api/              ← API routes HERE
│   ├── query.js
│   ├── command.js
│   ├── oracle.js
│   └── health.js
├── frontend/
│   └── ...
└── vercel.json
```

### Step 3: Check vercel.json Configuration

Current configuration uses negative lookahead to exclude `/api` from SPA routing:

```json
{
  "rewrites": [
    {
      "source": "/((?!api|_next|static|favicon.ico|.*\\..*).*)",
      "destination": "/index.html"
    }
  ]
}
```

**If this doesn't work**, try these alternatives:

#### Alternative 1: Remove Rewrite Entirely (Test)
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "devCommand": "cd frontend && npm run dev",
  "framework": "vite"
}
```

This will break SPA routing but will confirm if rewrites are the issue.

#### Alternative 2: Explicit Static File Patterns
```json
{
  "rewrites": [
    {
      "source": "/assets/:path*",
      "destination": "/assets/:path*"
    },
    {
      "source": "/:path*",
      "destination": "/index.html"
    }
  ]
}
```

#### Alternative 3: Use 404.html Fallback
Remove rewrite rule and create `frontend/public/404.html` that redirects to `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <script>
    window.location.replace('/index.html' + window.location.pathname + window.location.search);
  </script>
</head>
<body></body>
</html>
```

### Step 4: Verify Function Deployment

1. Go to **Vercel Dashboard** → **Deployments** → Latest deployment
2. Click **Functions** tab
3. Verify you see:
   - `api/query.js`
   - `api/command.js`
   - `api/oracle.js`
   - `api/health.js`

If functions are NOT listed, the issue is deployment, not routing.

### Step 5: Check Function Logs

1. Go to **Vercel Dashboard** → **Deployments** → Latest
2. Click on a function (e.g., `api/query.js`)
3. Check **Logs** tab
4. Make a request from frontend
5. See if logs show the request arriving

**If logs show requests**: Routing is working, issue is in function code
**If logs show nothing**: Routing is broken, rewrite rule is intercepting

### Step 6: Test API Routes Directly

Test each endpoint directly to confirm they work:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Test endpoint
curl https://your-app.vercel.app/api/test

# Query endpoint (POST)
curl -X POST https://your-app.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"templateIds":["Test"],"query":{}}'

# Command endpoint (POST)
curl -X POST https://your-app.vercel.app/api/command \
  -H "Content-Type: application/json" \
  -d '{"commands":[]}'
```

## Common Issues & Solutions

### Issue 1: Root Directory Set to `frontend`
**Symptom**: Functions not listed in Functions tab
**Solution**: Clear Root Directory in Vercel settings

### Issue 2: Rewrite Rule Too Broad
**Symptom**: Functions listed but return 404 from frontend
**Solution**: Use negative lookahead or explicit exclusions

### Issue 3: API Routes in Wrong Location
**Symptom**: Functions not deployed
**Solution**: Ensure routes are at project root `/api/`, not `frontend/api/`

### Issue 4: Build Not Including API Routes
**Symptom**: Functions not in deployment
**Solution**: API routes should NOT be in build output, they're separate serverless functions

## Nuclear Option: Move API Routes to frontend/api/

If nothing else works and Root Directory MUST be `frontend`:

1. Move API routes from `api/` to `frontend/api/`
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
3. Set Root Directory to `frontend` in Vercel

## Debugging Checklist

- [ ] Root Directory is cleared or set correctly
- [ ] API routes are at project root `/api/`
- [ ] Functions appear in Vercel Functions tab
- [ ] Direct API tests work (curl/browser)
- [ ] Function logs show requests arriving
- [ ] Rewrite rule excludes `/api`
- [ ] No conflicting routes or files
- [ ] Browser cache cleared (hard refresh)
- [ ] Latest deployment is active

## Next Steps

If none of these solutions work:

1. **Check Vercel Support**: This may be a platform-specific issue
2. **Consider Alternative**: Use Netlify, Railway, or Render
3. **Workaround**: Implement direct API calls with CORS proxy (already in code but disabled)

## Current Status

- ✅ API routes are deployed (direct tests work)
- ❌ Frontend requests are intercepted by rewrite rule
- 🔄 Testing negative lookahead pattern in rewrite rule

