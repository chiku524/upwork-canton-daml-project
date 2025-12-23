# Deployment Guide

## Prerequisites

1. **Canton Network Access**
   - Access to Canton test environment
   - Participant node URL: `https://participant.dev.canton.wolfedgelabs.com`
   - Admin credentials/party

2. **DAML SDK**
   - DAML SDK 2.8.0 or later installed
   - Verify: `daml version`

3. **Node.js**
   - Node.js 18+ installed
   - npm or yarn package manager

4. **RedStone API Access**
   - RedStone API access for oracle integration
   - API key if required

## Step 1: Build DAML Contracts

```bash
# Navigate to project root
cd upwork-canton-daml-project

# Build DAML project
daml build
```

This creates a `.dar` file in `.daml/dist/` directory.

## Step 2: Deploy to Canton

### Option A: Using JSON API

```bash
# Upload DAR file to participant
curl -X POST \
  https://participant.dev.canton.wolfedgelabs.com/v1/packages \
  -H "Content-Type: application/octet-stream" \
  --data-binary @.daml/dist/prediction-markets-1.0.0.dar
```

### Option B: Using DAML Script

```bash
# Run setup script
daml script \
  --ledger-host participant.dev.canton.wolfedgelabs.com \
  --ledger-port 443 \
  --dar .daml/dist/prediction-markets-1.0.0.dar \
  --script-name Setup:setup
```

## Step 3: Initialize Market Configuration

After deployment, you need to:

1. **Get Stablecoin Contract ID**
   - Query for existing USDC.x token contract
   - Or create a new token contract

2. **Create MarketConfig**
   - Use the admin party to create MarketConfig
   - Set stablecoin contract ID
   - Configure fees (can be set to 0.0 initially)

Example using JSON API:

```bash
curl -X POST \
  https://participant.dev.canton.wolfedgelabs.com/v1/command \
  -H "Content-Type: application/json" \
  -d '{
    "commands": {
      "party": "Admin",
      "applicationId": "prediction-markets",
      "commandId": "init-config",
      "list": [{
        "templateId": "PredictionMarkets:MarketConfig",
        "payload": {
          "admin": "Admin",
          "marketCreationDeposit": 100.0,
          "marketCreationFee": 0.0,
          "positionChangeFee": 0.0,
          "partialCloseFee": 0.0,
          "settlementFee": 0.0,
          "oracleParty": "Oracle",
          "stablecoinCid": "<STABLECOIN_CONTRACT_ID>"
        }
      }]
    }
  }'
```

## Step 4: Set Up Oracle Service

```bash
# Navigate to oracle directory
cd oracle

# Install dependencies
npm install

# Set environment variables
export LEDGER_URL=https://participant.dev.canton.wolfedgelabs.com
export ORACLE_PARTY=Oracle
export ORACLE_TOKEN=<ORACLE_AUTH_TOKEN>

# Start oracle monitoring service
npm run monitor
```

## Step 5: Deploy Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set VITE_LEDGER_URL

# Build for production
npm run build

# Or run development server
npm run dev
```

### Frontend Deployment Options

#### Option A: Static Hosting (Vercel, Netlify, etc.)

```bash
# Build
npm run build

# Deploy dist/ directory to your hosting provider
```

#### Option B: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Step 6: Verify Deployment

1. **Check Contracts**
   - Query for MarketConfig contract
   - Verify admin and oracle parties are set

2. **Test Market Creation**
   - Connect wallet in frontend
   - Create a test market
   - Verify deposit requirement

3. **Test Oracle Integration**
   - Create a market with event-based settlement
   - Verify oracle service updates data
   - Test market resolution

## Environment Variables

### Frontend (.env)
```
VITE_LEDGER_URL=https://participant.dev.canton.wolfedgelabs.com
```

### Oracle Service
```
LEDGER_URL=https://participant.dev.canton.wolfedgelabs.com
ORACLE_PARTY=Oracle
ORACLE_TOKEN=<auth_token>
```

## Troubleshooting

### DAML Build Errors
- Verify DAML SDK version: `daml version`
- Check `daml.yaml` dependencies
- Ensure all imports are correct

### Deployment Errors
- Verify Canton network connectivity
- Check participant node URL
- Verify party permissions

### Frontend Connection Issues
- Check CORS settings on Canton participant
- Verify LEDGER_URL in .env
- Check browser console for errors

### Oracle Integration Issues
- Verify RedStone API access
- Check oracle party permissions
- Verify oracle service is running

## Production Considerations

1. **Security**
   - Use HTTPS for all connections
   - Secure oracle service credentials
   - Implement proper authentication

2. **Performance**
   - Optimize contract queries
   - Use connection pooling
   - Implement caching where appropriate

3. **Monitoring**
   - Set up logging for oracle service
   - Monitor contract execution
   - Track market activity

4. **Backup**
   - Regular backups of configuration
   - Document all party IDs and contracts
   - Keep deployment scripts versioned

