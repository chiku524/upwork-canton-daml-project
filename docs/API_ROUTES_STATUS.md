# API Routes Status & Diagnosis

## Current Status

✅ **API Routes ARE Deployed**
- Functions appear in Vercel Functions tab
- Direct tests work (e.g., `/api/health`, `/api/test`)
- Function logs show requests reaching functions

❌ **Frontend Requests Get 404**
- Frontend POST requests to `/api/query` and `/api/command` return 404
- This suggests rewrite rules are intercepting requests

## Root Cause

The catch-all rewrite rule `/:path*` is matching `/api/*` routes **before** Vercel can process them as serverless functions.

## Current Configuration

**vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ]
}
```

**Problem:** Vercel may not support negative lookahead regex patterns, so `/api/*` is still being caught by the catch-all.

## Verification Steps

### 1. Check Function Logs

After making a request from the frontend:

1. Go to **Vercel Dashboard** → **Deployments** → Latest
2. Click **Functions** tab
3. Click on `api/query.js`
4. Check **Logs** tab
5. Look for: `[api/query] ===== FUNCTION INVOKED =====`

**If you see the logs:**
- ✅ Routing IS working
- ❌ Function is being called but returning 404
- Check the rest of the logs to see why

**If you DON'T see the logs:**
- ❌ Routing is broken - rewrite rule is intercepting
- Need to fix rewrite rule

### 2. Test Direct API Access

```bash
# Should return 200 OK
curl https://upwork-canton-daml-project.vercel.app/api/health

# Should return 200 OK with data
curl https://upwork-canton-daml-project.vercel.app/api/test

# Should invoke function (check logs)
curl -X POST https://upwork-canton-daml-project.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"templateIds":["Test"],"query":{}}'
```

## Solutions to Try

### Solution 1: Remove Rewrite Rule Entirely (Test)

Temporarily remove all rewrite rules to confirm API routes work:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "devCommand": "cd frontend && npm run dev",
  "framework": "vite"
}
```

**Trade-off:** SPA routing will break (direct navigation to `/create`, `/portfolio` will return 404)

### Solution 2: Use Explicit Route List

Instead of catch-all, list specific routes:

```json
{
  "rewrites": [
    { "source": "/create", "destination": "/index.html" },
    { "source": "/portfolio", "destination": "/index.html" },
    { "source": "/market/:marketId", "destination": "/index.html" }
  ]
}
```

**Trade-off:** Need to maintain list of routes

### Solution 3: Check Vercel Function Invocation

If function logs show requests ARE reaching functions but returning 404, the issue is in the function code, not routing.

Check logs for:
- `[api/query] Fetching from ledger: ...`
- `[api/query] Ledger response status: ...`
- Any error messages

## Next Steps

1. **Check function logs** after making a frontend request
2. **Share the logs** - this will tell us if routing or function execution is the issue
3. **Test direct API access** to confirm functions work
4. **Try Solution 1** (remove rewrite) to isolate the issue

## API Routes Location

✅ **Correct:** API routes are at project root `/api/`
```
project-root/
├── api/              ← Correct location
│   ├── query.js
│   ├── command.js
│   ├── oracle.js
│   ├── health.js
│   └── test.js
├── frontend/
└── vercel.json
```

## Environment Variables

Ensure `VITE_LEDGER_URL` is set in Vercel:
1. Go to **Settings** → **Environment Variables**
2. Verify `VITE_LEDGER_URL` = `https://participant.dev.canton.wolfedgelabs.com`

