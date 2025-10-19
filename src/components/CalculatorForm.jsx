import { useState, useRef, useCallback } from 'react'
import InterestRateManager from './InterestRateManager'
import OneOffOverpaymentManager from './OneOffOverpaymentManager'

function InfoButton({ message, title }) {
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    setShowModal(true)
  }

  const handleClose = () => {
    setShowModal(false)
  }

  const parseMessage = (msg) => {
    const lines = msg.split('\\n')
    const elements = []
    let currentSection = []
    let sectionTitle = null

    lines.forEach((line) => {
      const trimmedLine = line.trim()

      if (!trimmedLine) {
        if (currentSection.length > 0) {
          elements.push({ type: 'section', title: sectionTitle, content: currentSection })
          currentSection = []
          sectionTitle = null
        }
        return
      }

      if (trimmedLine.endsWith(':') && !trimmedLine.startsWith('•') && !trimmedLine.startsWith('-')) {
        if (currentSection.length > 0) {
          elements.push({ type: 'section', title: sectionTitle, content: currentSection })
          currentSection = []
        }
        sectionTitle = trimmedLine.slice(0, -1)
      } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        currentSection.push({ type: 'bullet', text: trimmedLine.replace(/^[•-]\s*/, '') })
      } else {
        currentSection.push({ type: 'text', text: trimmedLine })
      }
    })

    if (currentSection.length > 0) {
      elements.push({ type: 'section', title: sectionTitle, content: currentSection })
    }

    return elements
  }

  const sections = parseMessage(message)

  return (
    <>
      <button
        type="button"
        style={{
          background: 'none',
          border: '2px solid var(--accent-primary)',
          color: 'var(--accent-primary)',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600',
          padding: '0',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          marginLeft: '0.5rem',
          transition: 'all 0.2s ease'
        }}
        onClick={handleClick}
        title={title}
        onMouseEnter={(e) => {
          e.target.style.background = 'var(--accent-primary)'
          e.target.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'none'
          e.target.style.color = 'var(--accent-primary)'
        }}
      >
        ?
      </button>
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(51, 39, 42, 0.6)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={handleClose}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: '1rem',
              padding: '2.5rem 2.5rem 2rem 2.5rem',
              maxWidth: '560px',
              maxHeight: '85vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(51, 39, 42, 0.1), 0 10px 10px -5px rgba(51, 39, 42, 0.04)',
              position: 'relative',
              animation: 'slideIn 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                fontSize: '1.75rem',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0.375rem',
                transition: 'all 0.2s ease',
                lineHeight: '1'
              }}
              onClick={handleClose}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--bg-hover)'
                e.target.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none'
                e.target.style.color = 'var(--text-muted)'
              }}
            >
              ×
            </button>
            <div style={{ paddingRight: '1.5rem' }}>
              {sections.map((section, sIndex) => (
                <div key={sIndex} style={{ marginBottom: sIndex < sections.length - 1 ? '1.5rem' : '0' }}>
                  {section.title && (
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.875rem',
                      lineHeight: '1.4'
                    }}>
                      {section.title}
                    </h3>
                  )}
                  {section.content.map((item, iIndex) => {
                    if (item.type === 'bullet') {
                      return (
                        <div key={iIndex} style={{
                          display: 'flex',
                          marginBottom: '0.625rem',
                          lineHeight: '1.6'
                        }}>
                          <span style={{
                            color: 'var(--accent-primary)',
                            marginRight: '0.625rem',
                            fontWeight: '600',
                            fontSize: '1.1em',
                            flexShrink: 0
                          }}>•</span>
                          <span style={{
                            color: 'var(--text-primary)',
                            fontSize: '0.9375rem'
                          }}>{item.text}</span>
                        </div>
                      )
                    } else {
                      return (
                        <p key={iIndex} style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.9375rem',
                          lineHeight: '1.65',
                          marginBottom: iIndex < section.content.length - 1 ? '0.75rem' : '0'
                        }}>
                          {item.text}
                        </p>
                      )
                    }
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function CalculatorForm({ onCalculate, loading }) {
  const [formData, setFormData] = useState({
    property_value: '',
    mortgage_debt: '',
    ltv: '',
    mortgage_term: '',
    interest_rate: '',
    product_type: '',
    mortgage_type: 'repayment',
    one_off_overpayments: {},
    recurring_overpayment: '',
    recurring_frequency: 'monthly',
    interest_rate_changes: {}
  })

  // Format number with commas for display
  const formatNumberWithCommas = (value) => {
    if (!value) return ''
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // Remove commas from formatted number
  const removeCommas = (value) => {
    return value.replace(/,/g, '')
  }

  const calculateLTV = () => {
    if (formData.property_value > 0 && formData.mortgage_debt > 0) {
      return ((formData.mortgage_debt / formData.property_value) * 100).toFixed(1)
    }
    return ''
  }

  const handleLTVChange = (e) => {
    const ltv = parseFloat(e.target.value)
    if (ltv && formData.property_value > 0) {
      const calculatedDebt = (formData.property_value * ltv) / 100
      setFormData(prev => ({
        ...prev,
        ltv: e.target.value,
        mortgage_debt: Math.round(calculatedDebt)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        ltv: e.target.value
      }))
    }
  }

  const handleMortgageDebtChange = (e) => {
    const rawValue = removeCommas(e.target.value)
    const debt = parseFloat(rawValue)
    setFormData(prev => ({
      ...prev,
      mortgage_debt: rawValue,
      ltv: debt && prev.property_value > 0
        ? ((debt / prev.property_value) * 100).toFixed(1)
        : ''
    }))
  }

  const handlePropertyValueChange = (e) => {
    const rawValue = removeCommas(e.target.value)
    const value = parseFloat(rawValue)
    setFormData(prev => {
      const newFormData = {
        ...prev,
        property_value: rawValue
      }

      if (prev.ltv && value > 0) {
        newFormData.mortgage_debt = Math.round((value * prev.ltv) / 100)
      } else if (prev.mortgage_debt && value > 0) {
        newFormData.ltv = ((prev.mortgage_debt / value) * 100).toFixed(1)
      }

      return newFormData
    })
  }

  const rateChangesRef = useRef({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRateChanges = useCallback((rateChanges) => {
    console.log('handleRateChanges called with:', rateChanges)
    rateChangesRef.current = rateChanges
    setFormData(prev => ({
      ...prev,
      interest_rate_changes: rateChanges
    }))
  }, [])

  const handleOneOffOverpayments = useCallback((overpayments) => {
    setFormData(prev => ({
      ...prev,
      one_off_overpayments: overpayments
    }))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Use the ref to get the latest rate changes
    const submitData = {
      ...formData,
      interest_rate_changes: rateChangesRef.current
    }

    console.log('Form submitted with data:', submitData)
    console.log('Interest rate changes:', submitData.interest_rate_changes)
    onCalculate(submitData)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* MORTGAGE DETAILS SECTION */}
      <div className="card">
        <h2 className="card-title">Mortgage Details</h2>
        <div className="form-group">
          <label className="form-label">Property Value</label>
          <div className="input-group">
            <span className="input-prefix">£</span>
            <input
              type="text"
              name="property_value"
              value={formatNumberWithCommas(formData.property_value)}
              onChange={handlePropertyValueChange}
              className="form-input"
              required
              placeholder="e.g. 400,000"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">LTV <span style={{ fontWeight: 'normal', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem' }}>(Optional)</span></label>
            <div className="input-group">
              <input
                type="number"
                name="ltv"
                value={formData.ltv}
                onChange={handleLTVChange}
                className="form-input"
                min="0"
                max="100"
                step="0.1"
                placeholder="e.g. 90"
              />
              <span className="input-suffix">%</span>
            </div>
            <p className="note">Enter LTV to auto-calculate debt</p>
          </div>

          <div className="form-group">
            <label className="form-label">Mortgage Debt</label>
            <div className="input-group">
              <span className="input-prefix">£</span>
              <input
                type="text"
                name="mortgage_debt"
                value={formatNumberWithCommas(formData.mortgage_debt)}
                onChange={handleMortgageDebtChange}
                className="form-input"
                required
                placeholder="e.g. 351,000"
              />
            </div>
            <p className="note">Or enter debt to calculate LTV</p>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Mortgage Term</label>
          <div className="input-group">
            <input
              type="number"
              name="mortgage_term"
              value={formData.mortgage_term}
              onChange={handleChange}
              className="form-input"
              required
              min="1"
              max="40"
              placeholder="e.g. 25"
            />
            <span className="input-suffix">years</span>
          </div>
          <p className="note">1 to 40 years</p>
        </div>

        <div className="form-group">
          <label className="form-label">Mortgage Type</label>
          <div className="radio-group">
            <div className="radio-option">
              <input
                type="radio"
                id="repayment"
                name="mortgage_type"
                value="repayment"
                checked={formData.mortgage_type === 'repayment'}
                onChange={handleChange}
              />
              <label htmlFor="repayment" className="radio-label">
                Repayment
              </label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="interest_only"
                name="mortgage_type"
                value="interest_only"
                checked={formData.mortgage_type === 'interest_only'}
                onChange={handleChange}
              />
              <label htmlFor="interest_only" className="radio-label">
                Interest Only
              </label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Initial Interest Rate</label>
          <div className="input-group">
            <input
              type="number"
              name="interest_rate"
              value={formData.interest_rate}
              onChange={handleChange}
              className="form-input"
              required
              min="0"
              max="20"
              step="0.01"
              placeholder="e.g. 4.81"
            />
            <span className="input-suffix">%</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Fixed Rate Period (Product Type)</label>
          <div className="select-wrapper">
            <select
              name="product_type"
              value={formData.product_type}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select period...</option>
              <option value="2">2 Years Fixed</option>
              <option value="3">3 Years Fixed</option>
              <option value="5">5 Years Fixed</option>
              <option value="10">10 Years Fixed</option>
            </select>
          </div>
          <p className="note">Your rate will change after this period</p>
        </div>
      </div>

      {/* OVERPAYMENTS SECTION */}
      <div className="card">
        <h2 className="card-title">
          Overpayments
          <InfoButton
            message="How Overpayment Timing Works:\n\nOne-off overpayments are applied at the END of the selected year, after all 12 monthly payments for that year have been made.\n\n• Year 0: Overpayment applied after month 12 (end of first year)\n• Year 1: Overpayment applied after month 24 (end of second year)\n• The table on the right shows your mortgage balance at the BEGINNING of each year\n\nExample: A £10,000 overpayment in Year 0 will be applied after month 12. You'll see the reduced balance at the start of Year 1 in the results table."
            title="Learn how overpayment timing works"
          />
        </h2>

        <OneOffOverpaymentManager
          mortgageTerm={formData.mortgage_term}
          onOverpaymentsUpdate={handleOneOffOverpayments}
        />

        <div className="form-group">
          <label className="form-label">Recurring Overpayment <span style={{ fontWeight: 'normal', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem' }}>(Optional)</span></label>
          <div className="input-group">
            <span className="input-prefix">£</span>
            <input
              type="text"
              name="recurring_overpayment"
              value={formatNumberWithCommas(formData.recurring_overpayment)}
              onChange={(e) => {
                const rawValue = removeCommas(e.target.value)
                handleChange({ target: { name: 'recurring_overpayment', value: rawValue } })
              }}
              className="form-input"
              placeholder="e.g. 300"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Overpayment Frequency</label>
          <div className="select-wrapper">
            <select
              name="recurring_frequency"
              value={formData.recurring_frequency}
              onChange={handleChange}
              className="form-select"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* LTV-BASED RATE CHANGES SECTION */}
      <div className="card">
        <h2 className="card-title">
          LTV-Based Rate Changes
          <InfoButton
            message="LTV-Based Rate Changes:\n\nSet new interest rates that apply when your LTV drops to specific levels.\n\nHow it works:\n1. LTV is checked at the start of each year (beginning of year)\n2. When your LTV reaches or drops below a threshold (e.g., 85%), it's marked as reached\n3. Rate application depends on when the threshold is reached:\n   • If reached at a fixed-rate period start (Year 0, 2, 4, etc.): New rate applies IMMEDIATELY\n   • If reached mid-period (Year 1, 3, 5, etc.): New rate applies at the NEXT period start\n\nExample with 2-year fixed rate:\n- Initial: 4.81% rate, 2-year fix\n- You set: 85% LTV → 4.5%\n\nScenario A (Reached at period start):\n- LTV drops to 84% at start of Year 2\n- Year 2+: 4.5% rate applies immediately\n\nScenario B (Reached mid-period):\n- LTV drops to 84% at start of Year 3\n- Year 3: Still 4.81% (mid-period)\n- Year 4+: 4.5% rate applies (next period start)"
            title="Learn how LTV-based rate changes work"
          />
        </h2>

        <InterestRateManager
          initialRate={formData.interest_rate}
          mortgageTerm={formData.mortgage_term}
          onRateChangesUpdate={handleRateChanges}
        />
      </div>

      <button
        type="submit"
        className="button"
        disabled={loading}
        style={{ width: '100%', marginTop: '0' }}
      >
        {loading ? 'Calculating...' : 'Calculate'}
      </button>
    </form>
  )
}

export default CalculatorForm
