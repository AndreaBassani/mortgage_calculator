import { useState, useEffect } from 'react'

function OneOffOverpaymentManager({ mortgageTerm, onOverpaymentsUpdate }) {
  const [overpayments, setOverpayments] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [amountInput, setAmountInput] = useState('')
  const [yearInput, setYearInput] = useState('')

  useEffect(() => {
    onOverpaymentsUpdate(overpayments)
  }, [overpayments])

  const handleAddClick = () => {
    const amount = parseFloat(amountInput)
    const year = parseInt(yearInput)

    if (amount && !isNaN(amount) && !isNaN(year) && amount > 0 && year >= 0) {
      setOverpayments(prev => ({
        ...prev,
        [year]: (prev[year] || 0) + amount
      }))
      setAmountInput('')
      setYearInput('')
    }
  }

  const removeOverpayment = (year) => {
    setOverpayments(prev => {
      const updated = { ...prev }
      delete updated[year]
      return updated
    })
  }

  const sortedOverpayments = Object.entries(overpayments)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))

  const totalOverpayments = Object.values(overpayments).reduce((sum, val) => sum + val, 0)

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label className="form-label" style={{ marginBottom: 0 }}>
            One-off Overpayments
          </label>
          {sortedOverpayments.length > 0 && (
            <p className="note" style={{ marginTop: '0.25rem', marginBottom: 0 }}>
              {sortedOverpayments.length} overpayment{sortedOverpayments.length !== 1 ? 's' : ''} (Total: £{totalOverpayments.toLocaleString()})
            </p>
          )}
        </div>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          {showForm ? 'Hide' : '+ Add Overpayment'}
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
                  min="0"
                  max={mortgageTerm}
                  step="1"
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                />
                <span className="input-suffix">year</span>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="input-group">
                <span className="input-prefix">£</span>
                <input
                  type="number"
                  placeholder="Amount"
                  className="form-input"
                  min="0"
                  step="100"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                />
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

      {sortedOverpayments.length > 0 ? (
        <div style={{
          background: 'var(--bg-tertiary)',
          padding: '1rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem'
          }}>
            Scheduled Overpayments:
          </div>
          {sortedOverpayments.map(([year, amount]) => (
            <div key={year} className="rate-change-item" style={{ marginBottom: '0.5rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                Year {year}
              </div>
              <div style={{
                color: 'var(--accent-primary)',
                fontSize: '1.1rem',
                fontWeight: 700
              }}>
                £{amount.toLocaleString()}
              </div>
              <button
                type="button"
                className="button-icon button-remove"
                onClick={() => removeOverpayment(year)}
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
          No one-off overpayments scheduled
        </p>
      )}
    </div>
  )
}

export default OneOffOverpaymentManager
