import { useState, useEffect } from 'react'

const WALLET_STORAGE_KEY = 'canton_wallet'

export function useWallet() {
  const [wallet, setWallet] = useState(null)

  useEffect(() => {
    // Load wallet from localStorage
    const stored = localStorage.getItem(WALLET_STORAGE_KEY)
    if (stored) {
      try {
        setWallet(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to load wallet from storage', e)
      }
    }
  }, [])

  const connectWallet = async () => {
    try {
      // In production, this would use WebAuthn/passkey for authentication
      // For now, we'll use a simple prompt
      const partyName = prompt('Enter your party name (or leave empty to generate):')
      
      // In production, this would call the Canton party management API
      // to create or retrieve a party
      const party = partyName || `User_${Date.now()}`
      
      const newWallet = {
        party: party,
        connectedAt: new Date().toISOString(),
      }
      
      setWallet(newWallet)
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(newWallet))
    } catch (error) {
      console.error('Failed to connect wallet', error)
      alert('Failed to connect wallet: ' + error.message)
    }
  }

  const disconnectWallet = () => {
    setWallet(null)
    localStorage.removeItem(WALLET_STORAGE_KEY)
  }

  return { wallet, connectWallet, disconnectWallet }
}

