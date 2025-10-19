import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { formatCurrency, formatYearMonth } from '../utils/formatters'

function ResultsDisplay({ results, loading, error }) {
  if (loading) {
    return (
      <div className="card">
        <h2 className="card-title">Your Results</h2>
        <div className="loading">Calculating your mortgage...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="card-title">Your Results</h2>
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="card">
        <h2 className="card-title">Your Results</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>
          Enter your mortgage details and click Calculate to see your results
        </p>
      </div>
    )
  }

  // Find where baseline ends (last non-zero balance)
  const baselineEndIndex = results.baseline_schedule.findIndex(item => item.balance <= 0.01)
  const maxMonths = baselineEndIndex > 0 ? baselineEndIndex : results.baseline_schedule.length

  // Combine schedule and baseline for chart, only up to where baseline ends
  const chartData = results.baseline_schedule
    .slice(0, maxMonths)
    .filter((_, index) => index % 3 === 0)
    .map((baselineItem, idx) => {
      const scheduleItem = results.schedule[idx * 3]
      return {
        year: baselineItem.year,
        month: baselineItem.month,
        withOverpayment: scheduleItem ? Math.round(scheduleItem.balance) : 0,
        withoutOverpayment: Math.round(baselineItem.balance),
        rate: scheduleItem?.rate
      }
    })

  const propertyValue = results.property_value || 0
  const maxBalance = Math.max(
    ...chartData.map(d => Math.max(d.withOverpayment, d.withoutOverpayment))
  )

  // Calculate LTV threshold values and find when they're crossed
  const ltvThresholds = [95, 90, 85, 80, 75, 70, 60]
  const ltvMarkers = ltvThresholds.map(ltv => {
    const ltvValue = (propertyValue * ltv) / 100

    // Find the year when balance crosses this LTV threshold with overpayments
    const crossingPoint = chartData.find(d => d.withOverpayment <= ltvValue && d.withOverpayment > 0)

    return {
      ltv,
      value: ltvValue,
      year: crossingPoint?.year
    }
  }).filter(marker => marker.year !== undefined)

  // Extract unique rates from schedule to show rate changes
  const rateChanges = []
  let lastRate = null
  results.schedule.forEach(item => {
    if (item.rate !== lastRate) {
      rateChanges.push({ year: item.year, rate: item.rate })
      lastRate = item.rate
    }
  })

  return (
    <div className="card">
      <h2 className="card-title">Your Results</h2>

      {rateChanges.length > 1 && (
        <div className="info-box" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Interest Rate Changes Applied:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {rateChanges.map((change, index) => (
              <span key={index} style={{
                background: 'var(--bg-secondary)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}>
                Year {change.year}: <strong style={{ color: 'var(--accent-primary)' }}>{change.rate}%</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="results-summary">
        <div className="result-item">
          <div className="result-label">Monthly Payment</div>
          <div className="result-value accent">
            {formatCurrency(results.monthly_payment)}
          </div>
        </div>

        <div className="result-item">
          <div className="result-label">Overpayment Saving</div>
          <div className="result-value accent">
            {formatCurrency(results.interest_saved)}
          </div>
          <div className="note">(in interest alone)</div>
        </div>

        <div className="result-item">
          <div className="result-label">Debt Cleared</div>
          <div className="result-value">
            {formatYearMonth(results.years_saved, results.months_saved_remainder)} earlier
          </div>
        </div>

        <div className="result-item">
          <div className="result-label">Total Repayment</div>
          <div className="result-value">
            {formatCurrency(results.total_repayment)}
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Your Mortgage Debt Over Time
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0d9cc" opacity={0.6} />
            <XAxis
              dataKey="year"
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)' }}
              label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: 'var(--text-secondary)' }}
            />
            <YAxis
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)' }}
              tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '0.5rem',
                color: 'var(--text-primary)'
              }}
              formatter={(value, name) => {
                if (name === 'withOverpayment') return [formatCurrency(value), 'With Overpayments']
                if (name === 'withoutOverpayment') return [formatCurrency(value), 'Without Overpayments']
                return [value, name]
              }}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend
              wrapperStyle={{ color: 'var(--text-secondary)' }}
              iconType="line"
            />

            {/* Without Overpayments Line */}
            <Line
              type="monotone"
              dataKey="withoutOverpayment"
              stroke="#b09a96"
              strokeWidth={2}
              dot={false}
              name="Without Overpayments"
              strokeDasharray="5 5"
            />

            {/* With Overpayments Line */}
            <Line
              type="monotone"
              dataKey="withOverpayment"
              stroke="#d4a59a"
              strokeWidth={3}
              dot={false}
              name="With Overpayments"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* LTV Table by Year */}
        {propertyValue > 0 && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'var(--bg-tertiary)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>LTV Progress by Year (Property Value: {formatCurrency(propertyValue)})</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="ltv-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Capital (With Overpayment)</th>
                    <th>LTV</th>
                    <th>Milestone</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const importantLTVs = [95, 90, 85, 80, 75, 70, 60]
                    const yearlyData = []

                    if (!chartData || chartData.length === 0) {
                      return (
                        <tr>
                          <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No data available
                          </td>
                        </tr>
                      )
                    }

                    const maxYear = Math.max(...chartData.map(d => d.year))

                    // Track previous year's LTV to detect crossings
                    let previousLTV = null

                    for (let year = 0; year <= maxYear; year++) {
                      const yearData = chartData.find(d => d.year === year)
                      if (yearData && yearData.withOverpayment > 0) {
                        const ltv = ((yearData.withOverpayment / propertyValue) * 100).toFixed(1)
                        const ltvNum = parseFloat(ltv)

                        // Check if we just crossed below any threshold
                        let milestone = undefined
                        if (previousLTV !== null) {
                          // Find if we crossed any threshold between previous year and this year
                          milestone = importantLTVs.find(threshold =>
                            previousLTV >= threshold && ltvNum < threshold
                          )
                        }

                        yearlyData.push({
                          year,
                          capital: yearData.withOverpayment,
                          ltv: ltvNum,
                          milestone
                        })

                        previousLTV = ltvNum
                      }
                    }

                    return yearlyData.map(data => {
                      const isImportant = data.milestone !== undefined
                      return (
                        <tr
                          key={data.year}
                          className={isImportant ? 'highlight' : ''}
                        >
                          <td>{data.year}</td>
                          <td>{formatCurrency(data.capital)}</td>
                          <td>{data.ltv}%</td>
                          <td>
                            {isImportant ? (
                              <span className="milestone-badge">{data.milestone}% LTV</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsDisplay
