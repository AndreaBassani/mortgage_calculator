import { useState, useEffect } from 'react'

function InterestRateManager({ initialRate, mortgageTerm, onRateChangesUpdate }) {
  const [rateChanges, setRateChanges] = useState({})
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    console.log('Rate changes updated:', rateChanges)
    onRateChangesUpdate(rateChanges)
  }, [rateChanges])

  const addRateChange = (year, rate) => {
    if (year && rate && year > 0 && year <= mortgageTerm) {
      const newChanges = {
        ...rateChanges,
        [year]: parseFloat(rate)
      }
      console.log('Adding rate change:', { year, rate, newChanges })
      setRateChanges(newChanges)
    }
  }

  const removeRateChange = (year) => {
    setRateChanges(prev => {
      const updated = { ...prev }
      delete updated[year]
      return updated
    })
  }

  const [yearInput, setYearInput] = useState('')
  const [rateInput, setRateInput] = useState('')

  const handleAddClick = () => {
    const year = parseInt(yearInput)
    const rate = parseFloat(rateInput)

    if (year && rate && !isNaN(year) && !isNaN(rate)) {
      addRateChange(year, rate)
      setYearInput('')
      setRateInput('')
    }
  }

  const sortedRateChanges = Object.entries(rateChanges)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))

  return (
    <div className="rate-changes-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <label className="form-label" style={{ marginBottom: 0 }}>
            Interest Rate Changes
          </label>
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
                  placeholder="Year"
                  className="form-input"
                  min="1"
                  max={mortgageTerm}
                  step="1"
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                />
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
          Year 0 starts with {initialRate}%
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
              Configured Rate Changes:
            </div>
            {sortedRateChanges.map(([year, rate]) => (
              <div key={year} className="rate-change-item" style={{ marginBottom: '0.5rem' }}>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Year {year}
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
                  onClick={() => removeRateChange(year)}
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
            No rate changes configured. The initial rate of {initialRate}% will be used for the entire mortgage term.
          </p>
        )}
      </div>
    </div>
  )
}

export default InterestRateManager
