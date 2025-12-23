/**
 * Market monitoring service
 * Continuously monitors markets and updates oracle data
 */

const { monitorMarkets, fetchRedStoneData } = require('./redstone-integration')

// Configuration: Map market IDs to their data feed configurations
const MARKET_CONFIGS = {
  // Example: 'market-123': {
  //   dataFeedId: 'BTC',
  //   shouldResolve: (oracleData) => {
  //     // Custom logic to determine if market should resolve
  //     const price = JSON.parse(oracleData.data).price
  //     return price > 100000 // Example: resolve if BTC > $100k
  //   }
  // }
}

// List of market IDs to monitor
const MARKET_IDS = Object.keys(MARKET_CONFIGS)

/**
 * Main monitoring loop
 */
async function startMonitoring() {
  console.log('Starting market monitoring service...')
  console.log(`Monitoring ${MARKET_IDS.length} markets`)

  // Run monitoring every 30 seconds
  setInterval(async () => {
    try {
      await monitorMarkets(MARKET_IDS, MARKET_CONFIGS)
      console.log(`[${new Date().toISOString()}] Market check completed`)
    } catch (error) {
      console.error('Error in monitoring loop:', error)
    }
  }, 30000) // 30 seconds

  // Initial check
  await monitorMarkets(MARKET_IDS, MARKET_CONFIGS)
}

// Start monitoring
if (require.main === module) {
  startMonitoring().catch(console.error)
}

module.exports = { startMonitoring }

