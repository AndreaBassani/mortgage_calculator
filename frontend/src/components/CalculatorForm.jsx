import { useState, useRef, useCallback } from 'react'
import InterestRateManager from './InterestRateManager'

function CalculatorForm({ onCalculate, loading }) {
  const [formData, setFormData] = useState({
    property_value: 400000,
    mortgage_debt: 351000,
    ltv: '',
    mortgage_term: 40,
    interest_rate: 4.81,
    product_type: 5,
    mortgage_type: 'repayment',
    monthly_payment: '',
    one_off_overpayment: 0,
    recurring_overpayment: 300,
    recurring_frequency: 'monthly',
    interest_rate_changes: {}
  })

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
    const debt = parseFloat(e.target.value)
    setFormData(prev => ({
      ...prev,
      mortgage_debt: e.target.value,
      ltv: debt && prev.property_value > 0
        ? ((debt / prev.property_value) * 100).toFixed(1)
        : ''
    }))
  }

  const handlePropertyValueChange = (e) => {
    const value = parseFloat(e.target.value)
    setFormData(prev => {
      const newFormData = {
        ...prev,
        property_value: e.target.value
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
    <div className="card">
      <h2 className="card-title">Mortgage Details</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Property Value</label>
          <div className="input-group">
            <span className="input-prefix">£</span>
            <input
              type="number"
              name="property_value"
              value={formData.property_value}
              onChange={handlePropertyValueChange}
              className="form-input"
              required
              min="0"
              step="1"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">LTV (%)</label>
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
                placeholder="Optional"
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
                type="number"
                name="mortgage_debt"
                value={formData.mortgage_debt}
                onChange={handleMortgageDebtChange}
                className="form-input"
                required
                min="0"
                step="1"
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
            >
              <option value="2">2 Years Fixed</option>
              <option value="3">3 Years Fixed</option>
              <option value="5">5 Years Fixed</option>
              <option value="10">10 Years Fixed</option>
            </select>
          </div>
          <p className="note">Your rate will change after this period</p>
        </div>

        <div className="form-group">
          <label className="form-label">Monthly Payment (Optional)</label>
          <div className="input-group">
            <span className="input-prefix">£</span>
            <input
              type="number"
              name="monthly_payment"
              value={formData.monthly_payment}
              onChange={handleChange}
              className="form-input"
              min="0"
              step="0.01"
              placeholder="Auto-calculated"
            />
          </div>
        </div>

        <div className="info-box">
          <p>
            <strong>Note:</strong> Typically you're only allowed to overpay by 10%
            of your outstanding mortgage balance per year, so bear this in mind
            particularly if you wish to make recurring overpayments more than once a year.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">One-off Overpayment</label>
          <div className="input-group">
            <span className="input-prefix">£</span>
            <input
              type="number"
              name="one_off_overpayment"
              value={formData.one_off_overpayment}
              onChange={handleChange}
              className="form-input"
              min="0"
              step="100"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Recurring Overpayment</label>
          <div className="input-group">
            <span className="input-prefix">£</span>
            <input
              type="number"
              name="recurring_overpayment"
              value={formData.recurring_overpayment}
              onChange={handleChange}
              className="form-input"
              min="0"
              step="10"
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

        <InterestRateManager
          initialRate={formData.interest_rate}
          mortgageTerm={formData.mortgage_term}
          onRateChangesUpdate={handleRateChanges}
        />

        <button
          type="submit"
          className="button"
          disabled={loading}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </form>
    </div>
  )
}

export default CalculatorForm
