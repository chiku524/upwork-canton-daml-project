import { lazy, Suspense } from 'react'
import LoadingSpinner from './LoadingSpinner'

// Lazy load MarketsList for code splitting
const MarketsList = lazy(() => import('./MarketsList'))

export default function LazyMarketsList() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading markets..." />}>
      <MarketsList />
    </Suspense>
  )
}

