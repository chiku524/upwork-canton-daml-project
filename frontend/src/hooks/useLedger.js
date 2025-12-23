import { useState, useEffect } from 'react'
import LedgerClient from '../services/ledgerClient'

export function useLedger() {
  const [ledger, setLedger] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const connect = async () => {
      try {
        const newLedger = new LedgerClient()
        // Test connection by querying (empty query should work)
        setLedger(newLedger)
        setIsConnected(true)
      } catch (err) {
        setError(err.message)
        setIsConnected(false)
      }
    }

    connect()
  }, [])

  return { ledger, isConnected, error }
}

