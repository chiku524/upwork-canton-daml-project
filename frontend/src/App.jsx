import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useLedger } from './hooks/useLedger'
import { useWallet } from './hooks/useWallet'
import MarketsList from './components/MarketsList'
import MarketDetail from './components/MarketDetail'
import CreateMarket from './components/CreateMarket'
import WalletConnect from './components/WalletConnect'
import Portfolio from './components/Portfolio'
import { analytics } from './utils/analytics'
import './App.css'

// Component to track page views
function PageViewTracker() {
  const location = useLocation()
  
  useEffect(() => {
    analytics.trackPageView(location.pathname)
  }, [location])
  
  return null
}

function App() {
  const { ledger, isConnected } = useLedger()
  const { wallet, connectWallet, disconnectWallet } = useWallet()

  return (
    <Router>
      <PageViewTracker />
      <div className="app">
        <header className="app-header">
          <div className="container">
            <Link to="/" className="logo">
              <h1>Canton Prediction Markets</h1>
            </Link>
            <nav>
              <Link to="/">Markets</Link>
              <Link to="/create">Create Market</Link>
              <Link to="/portfolio">Portfolio</Link>
              {wallet ? (
                <div className="wallet-info">
                  <span>{wallet.party.substring(0, 10)}...</span>
                  <button onClick={disconnectWallet}>Disconnect</button>
                </div>
              ) : (
                <button onClick={connectWallet}>Connect Wallet</button>
              )}
            </nav>
          </div>
        </header>

        <main className="app-main">
          <div className="container">
            {!wallet ? (
              <WalletConnect onConnect={connectWallet} />
            ) : (
              <Routes>
                <Route path="/" element={<MarketsList />} />
                <Route path="/market/:marketId" element={<MarketDetail />} />
                <Route path="/create" element={<CreateMarket />} />
                <Route path="/portfolio" element={<Portfolio />} />
              </Routes>
            )}
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App

