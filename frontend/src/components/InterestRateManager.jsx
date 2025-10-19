import { useState, useEffect } from 'react'

function InterestRateManager({ initialRate, mortgageTerm, onRateChangesUpdate }) {
  const [rateChanges, setRateChanges] = useState({})
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    console.log('Rate changes updated:', rateChanges)
    onRateChangesUpdate(rateChanges)
  }, [rateChanges])

  const addRateChange = (ltv, rate) => {
    if (ltv && rate && ltv > 0 && ltv <= 100) {
      const newChanges = {
        ...rateChanges,
        [ltv]: parseFloat(rate)
      }
      console.log('Adding rate change:', { ltv, rate, newChanges })
      setRateChanges(newChanges)
    }
  }

  const removeRateChange = (ltv) => {
    setRateChanges(prev => {
      const updated = { ...prev }
      delete updated[ltv]
      return updated
    })
  }

  const [ltvInput, setLtvInput] = useState('')
  const [rateInput, setRateInput] = useState('')

  const handleAddClick = () => {
    const ltv = parseFloat(ltvInput)
    const rate = parseFloat(rateInput)

    if (ltv && rate && !isNaN(ltv) && !isNaN(rate)) {
      addRateChange(ltv, rate)
      setLtvInput('')
      setRateInput('')
    }
  }

  const sortedRateChanges = Object.entries(rateChanges)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '2px solid var(--accent-primary)'
              }}
              onClick={() => alert('LTV-Based Rate Changes:\n\nSet new interest rates that apply when your LTV drops to specific levels.\n\nHow it works:\n1. When your LTV reaches or drops below a threshold (e.g., 85%), it\'s marked\n2. The new rate is NOT applied immediately\n3. It waits until your current fixed rate period ends\n4. Then the new rate for that LTV band is applied\n\nExample:\n- 2-year fix at 4.81%\n- You set: 85% LTV → 4.5%\n- LTV drops to 84.5% in year 1\n- Rate stays 4.81% until end of year 2\n- From year 3 onwards: 4.5% rate is applied')}
              title="Learn how LTV-based rate changes work"
            >
              ?
            </button>
          </div>
          {sortedRateChanges.length > 0 && (
            <p className="note" style={{ marginTop: '0.25rem', marginBottom: 0 }}>
              {sortedRateChanges.length} rate change{sortedRateChanges.length !== 1 ? 's' : ''} configured
            </p>
          )}
        </div>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          {showForm ? 'Hide' : '+ Add Rate Change'}
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: '1rem' }}>
          <div className="rate-change-item">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="input-group">
                <input
                  type="number"
                  placeholder="LTV %"
                  className="form-input"
                  min="1"
                  max="100"
                  step="0.1"
                  value={ltvInput}
                  onChange={(e) => setLtvInput(e.target.value)}
                />
                <span className="input-suffix">%</span>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="input-group">
                <input
                  type="number"
                  placeholder="New rate"
                  className="form-input"
                  min="0"
                  max="20"
                  step="0.01"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                />
                <span className="input-suffix">%</span>
              </div>
            </div>
            <button
              type="button"
              className="button"
              onClick={handleAddClick}
              style={{ padding: '0.75rem 1.5rem' }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div>
        <p className="note" style={{ marginBottom: '1rem' }}>
          Initial rate: {initialRate}% (applied until fixed period ends or LTV threshold reached)
        </p>
        {sortedRateChanges.length > 0 ? (
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '1rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}>
              Configured LTV-Based Rates:
            </div>
            {sortedRateChanges.map(([ltv, rate]) => (
              <div key={ltv} className="rate-change-item" style={{ marginBottom: '0.5rem' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {ltv}% LTV
                </div>
                <div style={{
                  color: 'var(--accent-primary)',
                  fontSize: '1.1rem',
                  fontWeight: 700
                }}>
                  {rate}%
                </div>
                <button
                  type="button"
                  className="button-icon button-remove"
                  onClick={() => removeRateChange(ltv)}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '1rem'
          }}>
            No LTV-based rate changes configured. The initial rate of {initialRate}% will be used for the entire mortgage term.
          </p>
        )}
      </div>
    </div>
  )
}

export default InterestRateManager
