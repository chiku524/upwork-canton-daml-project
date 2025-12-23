# Debugging Vercel API Routes 404 Issue

## Problem
API routes are listed in Vercel Functions tab but return 404 when called.

## Debugging Steps

### 1. Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Go to **Functions** tab
4. Click on `api/query.js` (or any function)
5. Check the **Logs** tab
6. Look for any errors or see if requests are reaching the function

### 2. Test Functions Directly

Try these URLs in your browser or with curl:

```bash
# Test endpoint (should work)
curl https://your-app.vercel.app/api/test

# Health endpoint
curl https://your-app.vercel.app/api/health

# Query endpoint (POST)
curl -X POST https://your-app.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"templateIds":["Test"],"query":{}}'
```

### 3. Check Function Format

Vercel functions should:
- Be in `/api/` directory at project root
- Export `export default async function handler(req, res)`
- Handle CORS properly
- Return responses correctly

### 4. Common Issues

#### Issue: Functions listed but return 404
**Possible causes:**
- Functions are deployed but routing isn't working
- Rewrite rules interfering
- Functions need to be in a different location

**Solution:**
- Check if functions are actually being invoked (check logs)
- Verify no conflicting rewrite rules in vercel.json
- Try accessing functions with full path

#### Issue: Functions not being invoked
**Possible causes:**
- Functions are in wrong location
- Export format is wrong
- Build process not including functions

**Solution:**
- Ensure functions are at project root `/api/`
- Verify export format matches Vercel requirements
- Check build logs for function deployment

### 5. Verify Environment Variables

Check that `VITE_LEDGER_URL` is set in Vercel:
1. Go to Settings → Environment Variables
2. Verify `VITE_LEDGER_URL` is set to `https://participant.dev.canton.wolfedgelabs.com`

### 6. Check Function Logs for Errors

If functions are being invoked but failing:
- Check logs for runtime errors
- Verify environment variables are accessible
- Check if fetch is working (Node.js 18+ supports fetch natively)

### 7. Alternative: Check Function Invocation

In Vercel Dashboard:
1. Go to Functions tab
2. Click on a function
3. Check "Invocations" - are there any?
4. If no invocations, the function isn't being called
5. If invocations but 404, there's a routing issue

## Next Steps

If functions are listed but still return 404:
1. Check Vercel function logs for any errors
2. Test `/api/test` endpoint directly
3. Verify the function format matches Vercel requirements
4. Check if there are any rewrite rules interfering

If you see function invocations in the logs but still get 404, the issue might be with how the response is being sent or CORS headers.

