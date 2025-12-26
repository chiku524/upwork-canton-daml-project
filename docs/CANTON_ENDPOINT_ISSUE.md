# Canton Endpoint 404 Issue

## Problem

The Canton participant at `https://participant.dev.canton.wolfedgelabs.com` is returning 404 for POST requests to `/v1/query` and `/v1/command`.

**Error Response:**
```json
{
  "errors": ["HttpMethod(POST), uri: http://participant.dev.canton.wolfedgelabs.com/v1/query"],
  "status": 404
}
```

## Observations

1. ✅ **Vercel API routes are working** - Functions are being called correctly
2. ✅ **Routing is correct** - Requests reach the functions
3. ❌ **Canton participant returns 404** - The endpoint doesn't exist or isn't configured

## Possible Causes

### 1. Endpoint Not Configured
The Canton participant may not have the JSON API endpoints enabled or configured.

**Solution:** Verify with the Canton participant administrator that:
- JSON API is enabled
- `/v1/query` and `/v1/command` endpoints are accessible
- The participant is configured to accept external requests

### 2. Incorrect Endpoint Path
The endpoint path might be different than `/v1/query`.

**Possible alternatives:**
- `/query` (without `/v1`)
- `/v1/stream/query` (streaming endpoint)
- `/ledger-api/v1/query` (different base path)
- `/json-api/v1/query` (different base path)

**Solution:** Check Canton JSON API documentation or test different paths.

### 3. Authentication Required
The endpoint might require authentication that we're not providing.

**Solution:** Check if the Canton participant requires:
- API keys
- JWT tokens
- Basic authentication
- Other authentication headers

### 4. Protocol Mismatch
The error shows `http://` instead of `https://`, suggesting Canton might be expecting HTTP or there's a redirect issue.

**Solution:** Test with both HTTP and HTTPS.

## Next Steps

1. **Contact Canton Participant Administrator**
   - Verify JSON API is enabled
   - Confirm correct endpoint paths
   - Check authentication requirements

2. **Test Endpoint Directly**
   ```bash
   # Test query endpoint
   curl -X POST https://participant.dev.canton.wolfedgelabs.com/v1/query \
     -H "Content-Type: application/json" \
     -d '{"templateIds":["PredictionMarkets:Market"],"query":{}}'
   
   # Test alternative paths
   curl -X POST https://participant.dev.canton.wolfedgelabs.com/query \
     -H "Content-Type: application/json" \
     -d '{"templateIds":["PredictionMarkets:Market"],"query":{}}'
   ```

3. **Check Canton Documentation**
   - Review Canton JSON API documentation
   - Verify endpoint paths and formats
   - Check authentication requirements

4. **Review Participant Configuration**
   - Ensure JSON API is enabled in participant config
   - Verify CORS settings if needed
   - Check network/firewall rules

## Current Status

- ✅ Vercel API routes: Working
- ✅ Function invocation: Working
- ✅ Request formatting: Correct
- ❌ Canton endpoint: 404 (endpoint not found)

## Temporary Workaround

Until the Canton endpoint is configured, the application will:
- Show empty results for queries
- Fail gracefully for commands
- Display error messages to users
- Log detailed error information

