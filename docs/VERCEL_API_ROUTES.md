# Vercel API Routes Configuration

## Issue: API Routes Returning 404

If you're seeing 404 errors for `/api/query`, `/api/command`, or `/api/oracle`, this guide will help you fix it.

## Root Directory Configuration

When you set the **Root Directory** to `frontend` in Vercel settings, API routes must still be at the **project root** `/api/` directory, NOT inside `frontend/`.

### Correct Structure:
```
project-root/
├── api/              ← API routes HERE (project root)
│   ├── query.js
│   ├── command.js
│   ├── oracle.js
│   └── health.js
├── frontend/         ← Root directory setting
│   ├── src/
│   └── package.json
└── vercel.json
```

### Incorrect Structure:
```
project-root/
├── frontend/
│   ├── api/          ← WRONG! Don't put API routes here
│   └── src/
└── vercel.json
```

## Vercel Settings

### In Vercel Dashboard:

1. Go to **Project Settings** → **General**
2. Set **Root Directory** to: `frontend`
3. **DO NOT** change the API routes location

### vercel.json Configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": "vite",
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

## Testing API Routes

### Health Check:
```bash
curl https://your-app.vercel.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "API routes are working",
  "timestamp": "2025-12-23T20:00:00.000Z"
}
```

### Query Endpoint:
```bash
curl -X POST https://your-app.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"templateIds":["Test"],"query":{}}'
```

## Troubleshooting

### If API routes still return 404:

1. **Check file location**: Ensure files are at project root `/api/`, not in `frontend/api/`
2. **Check Vercel logs**: Go to Vercel Dashboard → Deployments → View Function Logs
3. **Verify environment variables**: Ensure `VITE_LEDGER_URL` is set in Vercel
4. **Redeploy**: After moving files, trigger a new deployment
5. **Check function runtime**: Ensure Node.js 18.x is specified in vercel.json

### Common Issues:

- **404 on all routes**: API routes are in wrong location
- **500 errors**: Check function logs for errors
- **CORS errors**: Should be handled by API routes, check headers
- **Timeout**: Increase function timeout in vercel.json if needed

## Environment Variables

Make sure these are set in Vercel:

- `VITE_LEDGER_URL`: `https://participant.dev.canton.wolfedgelabs.com`

## Function Logs

To debug API route issues:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Deployments**
4. Click on a deployment
5. Go to **Functions** tab
6. Click on an API route to see logs

## Manual Test

You can test the API routes directly:

```javascript
// In browser console
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
```

If this returns 404, the API routes are not being recognized by Vercel.

