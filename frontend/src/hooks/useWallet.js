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
      // For now, we'll use a simple prompt with better UX
      const partyName = prompt(
        'Enter your party name:\n\n' +
        '• Leave empty to generate a new party\n' +
        '• Enter an existing party name to connect\n\n' +
        'Note: In production, this will use secure passkey authentication.'
      )
      
      if (partyName === null) {
        // User cancelled
        return
      }
      
      // In production, this would call the Canton party management API
      // to create or retrieve a party
      const party = partyName.trim() || `User_${Date.now()}`
      
      const newWallet = {
        party: party,
        connectedAt: new Date().toISOString(),
      }
      
      setWallet(newWallet)
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(newWallet))
      
      // Show success message
      console.log('Wallet connected:', party)
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

