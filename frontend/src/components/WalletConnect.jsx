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
      <div style={{ 
        background: 'rgba(100, 108, 255, 0.1)', 
        padding: '1rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        fontSize: '0.9rem',
        color: 'rgba(255, 255, 255, 0.8)'
      }}>
        <strong>How it works:</strong>
        <ul style={{ textAlign: 'left', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>Enter a party name or leave blank to generate one</li>
          <li>Your wallet will be saved locally in your browser</li>
          <li>In production, this will use secure passkey authentication</li>
        </ul>
      </div>
      <button className="btn-primary" onClick={connectWallet} style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
        Connect Wallet
      </button>
    </div>
  )
}

