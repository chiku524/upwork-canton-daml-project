# Canton JSON API Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Check OpenAPI Specification

Visit or call the diagnostic endpoint to see the actual API structure:

```bash
# Via browser or curl
curl https://your-vercel-app.vercel.app/api/openapi

# Or directly from Canton participant
curl https://participant.dev.canton.wolfedgelabs.com/docs/openapi
```

This will show you:
- Available endpoints
- Correct endpoint paths
- Required request formats
- Authentication requirements

### 2. Test Endpoints Directly

Test the Canton participant endpoints directly:

```bash
# Test query endpoint
curl -X POST https://participant.dev.canton.wolfedgelabs.com/v2/query \
  -H "Content-Type: application/json" \
  -d '{"templateIds":["PredictionMarkets:Market"],"query":{}}'

# Test v1 endpoint
curl -X POST https://participant.dev.canton.wolfedgelabs.com/v1/query \
  -H "Content-Type: application/json" \
  -d '{"templateIds":["PredictionMarkets:Market"],"query":{}}'

# Test command endpoint
curl -X POST https://participant.dev.canton.wolfedgelabs.com/v2/commands/submit-and-wait \
  -H "Content-Type: application/json" \
  -d '{"commands":{"party":"User1","applicationId":"prediction-markets","commandId":"test-123","list":[]}}'
```

### 3. Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Go to "Functions" tab
4. Check logs for `/api/query` and `/api/command`
5. Look for:
   - Which endpoints were tried
   - Response status codes
   - Error messages

### 4. Verify Environment Variables

Ensure `VITE_LEDGER_URL` is set correctly in Vercel:
- Go to Project Settings → Environment Variables
- Verify `VITE_LEDGER_URL` is set to `https://participant.dev.canton.wolfedgelabs.com`

## Common Issues

### Issue: All endpoints return 404

**Possible causes:**
1. JSON API not enabled on Canton participant
2. Incorrect base URL
3. Network/firewall blocking requests
4. Participant not configured for external access

**Solutions:**
- Contact Canton participant administrator
- Verify JSON API is enabled
- Check if participant requires authentication
- Verify network connectivity

### Issue: 404 with `http://` in error message

The error shows `http://` instead of `https://`:
```json
{"errors":["HttpMethod(POST), uri: http://participant.dev.canton.wolfedgelabs.com/v1/query"]}
```

This suggests:
- Canton might be redirecting HTTPS to HTTP
- Or the error message format includes the wrong protocol
- Check if participant supports HTTPS

### Issue: Authentication Required

If you see 401/403 errors:
- Check if Canton participant requires API keys
- Verify if JWT tokens are needed
- Check authentication headers in requests

## Endpoint Formats

### Canton 3.4 (v2 API)
- Query: `POST /v2/query`
- Command: `POST /v2/commands/submit-and-wait`
- OpenAPI: `GET /docs/openapi`

### Legacy (v1 API)
- Query: `POST /v1/query`
- Command: `POST /v1/command`

## Request Formats

### Query Request (v1/v2)
```json
{
  "templateIds": ["PredictionMarkets:Market"],
  "query": {
    "status": "Active"
  }
}
```

### Command Request (v1)
```json
{
  "commands": {
    "party": "User1",
    "applicationId": "prediction-markets",
    "commandId": "create-123",
    "list": [...]
  }
}
```

### Command Request (v2)
```json
{
  "party": "User1",
  "applicationId": "prediction-markets",
  "commandId": "create-123",
  "list": [...]
}
```

Note: v2 might expect the commands object directly, not wrapped.

## Next Steps

1. **Check OpenAPI Spec**: Use `/api/openapi` endpoint to see actual API structure
2. **Test Directly**: Use curl to test endpoints directly
3. **Check Logs**: Review Vercel function logs for detailed error information
4. **Contact Admin**: Verify with Canton participant administrator that JSON API is enabled

## Resources

- Canton JSON API Documentation: https://docs.digitalasset.com/build/3.4/reference/json-api/openapi.html
- Participant URL: https://participant.dev.canton.wolfedgelabs.com
- OpenAPI Spec: https://participant.dev.canton.wolfedgelabs.com/docs/openapi

