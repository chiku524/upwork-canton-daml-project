# RedStone Oracle Setup Guide

## Overview

The prediction markets application uses RedStone Oracle for market resolution. RedStone provides reliable price data for various assets (cryptocurrencies, stocks, etc.) that can be used to resolve prediction markets.

## No API Key Required

**Good news:** RedStone's public API does not require an API key for basic usage. The application is configured to work out of the box with RedStone's public endpoints.

## How It Works

1. **Frontend Integration**: The `oracleService.js` fetches price data from RedStone
2. **API Proxy**: The `/api/oracle` route proxies requests to avoid CORS issues
3. **Market Resolution**: Admins can use oracle data to resolve markets

## Supported Symbols

RedStone supports a wide range of symbols:

### Cryptocurrencies
- BTC (Bitcoin)
- ETH (Ethereum)
- USDC, USDT (Stablecoins)
- And many more...

### Stocks
- AAPL (Apple)
- TSLA (Tesla)
- And many more...

### Other Assets
- Various commodities, indices, etc.

## Usage in the Application

### For Admins

1. Navigate to an active market
2. You'll see a "Market Resolution" section (only visible to Admin party)
3. Enter the oracle symbol (e.g., "BTC" for Bitcoin price)
4. Click "Fetch Oracle Data" to get current price
5. Click "Start Market Resolution" to begin the resolution process

### Example Market Resolution

If you have a market like "Will Bitcoin reach $100k by 2025?":

1. Admin navigates to the market
2. Enters "BTC" as the oracle symbol
3. Fetches current BTC price from RedStone
4. Uses this data to start market resolution
5. The market moves to "Resolving" status
6. Admin can then resolve the outcome based on the oracle data

## API Endpoints

### Public RedStone API
```
GET https://api.redstone.finance/prices?symbol=BTC&provider=redstone
```

### Proxy API (via Vercel)
```
GET /api/oracle?symbol=BTC
```

## Configuration

No configuration needed! The application uses RedStone's public API by default.

## Advanced Usage

If you need to use RedStone's premium features or higher rate limits:

1. Sign up at https://redstone.finance
2. Get an API key
3. Update the oracle service to include the API key in requests
4. Set environment variable `REDSTONE_API_KEY` in Vercel

## Error Handling

The application handles RedStone API errors gracefully:
- Network errors are retried automatically
- Invalid symbols show user-friendly error messages
- Fallback mechanisms ensure the app continues to work

## Testing

You can test the oracle integration:

1. Open browser console
2. Import the oracle service:
   ```javascript
   import { oracleService } from './services/oracleService'
   ```
3. Fetch a price:
   ```javascript
   await oracleService.fetchPrice('BTC')
   ```

## Monitoring

Monitor oracle API calls in:
- Browser console (development)
- Vercel function logs (production)
- Application analytics

## Rate Limits

RedStone's public API has rate limits. The application includes:
- Request caching (5 second TTL)
- Retry logic with exponential backoff
- Error handling for rate limit responses

If you hit rate limits frequently, consider:
- Using RedStone's premium tier
- Implementing additional caching
- Using WebSocket subscriptions for real-time data

