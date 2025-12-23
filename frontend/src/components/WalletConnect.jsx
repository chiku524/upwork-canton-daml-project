import { useWallet } from '../hooks/useWallet'

export default function WalletConnect({ onConnect }) {
  const { connectWallet } = useWallet()

  return (
    <div className="card" style={{ textAlign: 'center', maxWidth: '500px', margin: '4rem auto' }}>
      <h2>Connect Your Wallet</h2>
      <p style={{ marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.6)' }}>
        Connect your Canton wallet to start trading on prediction markets.
        Your wallet uses passkey authentication for secure access.
      </p>
      <button className="btn-primary" onClick={connectWallet}>
        Connect Wallet
      </button>
    </div>
  )
}

