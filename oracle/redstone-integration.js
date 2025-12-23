/**
 * RedStone Oracle Integration for Canton Prediction Markets
 * 
 * This service fetches data from RedStone oracles and updates
 * market resolution data on the Canton ledger.
 */

const axios = require('axios')
const { DamlLedger } = require('@digitalasset/daml-ledger')

const LEDGER_URL = process.env.LEDGER_URL || 'https://participant.dev.canton.wolfedgelabs.com'
const ORACLE_PARTY = process.env.ORACLE_PARTY || 'Oracle'

/**
 * Fetch data from RedStone oracle
 * @param {string} dataFeedId - RedStone data feed identifier
 * @returns {Promise<Object>} Oracle data
 */
async function fetchRedStoneData(dataFeedId) {
  try {
    // RedStone API endpoint
    const response = await axios.get(`https://api.redstone.finance/prices`, {
      params: {
        symbol: dataFeedId,
        provider: 'redstone',
      },
    })

    return {
      data: JSON.stringify(response.data),
      timestamp: new Date().toISOString(),
      source: 'RedStone',
    }
  } catch (error) {
    console.error('Error fetching RedStone data:', error)
    throw error
  }
}

/**
 * Update oracle data feed on Canton ledger
 * @param {string} marketId - Market ID
 * @param {Object} oracleData - Oracle data to publish
 */
async function updateOracleFeed(marketId, oracleData) {
  try {
    const ledger = new DamlLedger({
      token: process.env.ORACLE_TOKEN, // Would be set via authentication
      httpBaseUrl: LEDGER_URL,
    })

    // Create or update OracleDataFeed contract
    await ledger.create('PredictionMarkets:OracleDataFeed', {
      oracleParty: ORACLE_PARTY,
      marketId: marketId,
      dataSource: oracleData.source,
      data: oracleData.data,
      timestamp: oracleData.timestamp,
      signature: null, // Would include signature in production
    })

    console.log(`Updated oracle feed for market ${marketId}`)
  } catch (error) {
    console.error('Error updating oracle feed:', error)
    throw error
  }
}

/**
 * Monitor markets and update oracle data
 * @param {Array<string>} marketIds - List of market IDs to monitor
 * @param {Object} marketConfigs - Market configuration mapping
 */
async function monitorMarkets(marketIds, marketConfigs) {
  for (const marketId of marketIds) {
    const config = marketConfigs[marketId]
    if (!config) continue

    try {
      // Fetch oracle data based on market's data source
      const oracleData = await fetchRedStoneData(config.dataFeedId)
      
      // Update oracle feed on ledger
      await updateOracleFeed(marketId, oracleData)

      // If market is ready for resolution, trigger resolution
      if (config.shouldResolve && config.shouldResolve(oracleData)) {
        await triggerMarketResolution(marketId, oracleData)
      }
    } catch (error) {
      console.error(`Error monitoring market ${marketId}:`, error)
    }
  }
}

/**
 * Trigger market resolution based on oracle data
 * @param {string} marketId - Market ID
 * @param {Object} oracleData - Oracle data
 */
async function triggerMarketResolution(marketId, oracleData) {
  try {
    const ledger = new DamlLedger({
      token: process.env.ORACLE_TOKEN,
      httpBaseUrl: LEDGER_URL,
    })

    // Find the market contract
    const markets = await ledger.query('PredictionMarkets:Market', {
      marketId: marketId,
    })

    if (markets.length === 0) {
      throw new Error(`Market ${marketId} not found`)
    }

    const market = markets[0]

    // Exercise StartResolution choice
    await ledger.exercise(
      market.contractId,
      'PredictionMarkets:Market:StartResolution',
      {
        oracleData: oracleData.data,
      }
    )

    console.log(`Triggered resolution for market ${marketId}`)
  } catch (error) {
    console.error(`Error triggering resolution for market ${marketId}:`, error)
    throw error
  }
}

module.exports = {
  fetchRedStoneData,
  updateOracleFeed,
  monitorMarkets,
  triggerMarketResolution,
}

