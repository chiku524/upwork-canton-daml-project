export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading" style={{ textAlign: 'center', padding: '2rem' }}>
      <div 
        style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid #646cff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}
      />
      <p>{message}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

