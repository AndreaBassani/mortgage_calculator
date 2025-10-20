import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
  const baselineEndMonth = baselineEndIndex > 0 ? baselineEndIndex : results.baseline_schedule.length
  const baselineEndYear = Math.floor(baselineEndMonth / 12)

  // Extend chart to one year after baseline ends
  const maxMonths = Math.min((baselineEndYear + 1) * 12, results.baseline_schedule.length)

  // Get product type for x-axis tick alignment (default to 2 if not available)
  const productType = results.product_type || 2

  // Combine schedule and baseline for chart
  // Create data showing beginning-of-year balances
  const chartData = []

  // Year 0: Initial mortgage debt (before any payments)
  const initialDebt = results.initial_mortgage_debt || 0
  chartData.push({
    year: 0,
    month: 0,
    withOverpayment: Math.round(initialDebt),
    withoutOverpayment: Math.round(initialDebt),
    rate: results.schedule[0]?.rate
  })

  // For subsequent years, show balance at start of year (after previous year's payments)
  for (let yearIndex = 1; yearIndex <= Math.floor(maxMonths / 12); yearIndex++) {
    const balanceMonthIndex = yearIndex * 12 - 1 // Last month of previous year (for balance)
    const rateMonthIndex = yearIndex * 12 // First month of current year (for rate)
    const baselineItem = results.baseline_schedule[balanceMonthIndex]
    const scheduleItemForBalance = results.schedule[balanceMonthIndex]
    const scheduleItemForRate = results.schedule[rateMonthIndex]

    if (scheduleItemForBalance || baselineItem) {
      chartData.push({
        year: yearIndex,
        month: yearIndex * 12,
        withOverpayment: Math.round(scheduleItemForBalance?.balance || 0),
        withoutOverpayment: Math.round(baselineItem?.balance || 0),
        rate: scheduleItemForRate?.rate || scheduleItemForBalance?.rate
      })
    }
  }

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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
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
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Note: LTV-based rate changes are applied at the start of fixed-rate periods. If an LTV milestone is reached at the beginning of a period (e.g., Year 2, 4, 6 for a 2-year fix), the new rate applies immediately. If reached mid-period, it applies at the next period start.
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
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData} margin={{ bottom: 20 }}>
            <defs>
              <linearGradient id="colorWithout" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b09a96" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#b09a96" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="colorWith" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4a59a" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#d4a59a" stopOpacity={0.08}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0d9cc" opacity={0.6} />
            <XAxis
              dataKey="year"
              type="number"
              domain={[0, 'dataMax']}
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)' }}
              label={{ value: 'Years', position: 'insideBottom', offset: -10, fill: 'var(--text-secondary)' }}
              tickCount={(() => {
                const maxYear = Math.max(...chartData.map(d => d.year))
                // Generate ticks at reasonable intervals
                if (maxYear <= 10) return maxYear + 1
                if (maxYear <= 20) return Math.floor(maxYear / 2) + 1
                return Math.floor(maxYear / 5) + 1
              })()}
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
              wrapperStyle={{ color: 'var(--text-secondary)', paddingTop: '15px' }}
              iconType="line"
            />

            {/* Without Overpayments Area */}
            <Area
              type="monotone"
              dataKey="withoutOverpayment"
              stroke="#b09a96"
              strokeWidth={2}
              fill="url(#colorWithout)"
              strokeDasharray="5 5"
              name="Without Overpayments"
            />

            {/* With Overpayments Area */}
            <Area
              type="monotone"
              dataKey="withOverpayment"
              stroke="#d4a59a"
              strokeWidth={3}
              fill="url(#colorWith)"
              name="With Overpayments"
            />
          </ComposedChart>
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
              fontWeight: 600
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                LTV Progress by Year (Property Value: {formatCurrency(propertyValue)})
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 400, fontStyle: 'italic', color: 'var(--text-muted)' }}>
                Table shows balance and LTV at the start of each year. When an LTV milestone is reached, the associated rate is applied at the beginning of the next fixed-rate period (or immediately if reached at a period start).
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="ltv-table" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, #c9998e 100%)',
                    color: 'white'
                  }}>
                    <th style={{
                      padding: '0.875rem 1rem',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      letterSpacing: '0.025em',
                      textAlign: 'left',
                      borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>Year</th>
                    <th style={{
                      padding: '0.875rem 1rem',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      letterSpacing: '0.025em',
                      textAlign: 'left',
                      borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>Capital at Year Start</th>
                    <th style={{
                      padding: '0.875rem 1rem',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      letterSpacing: '0.025em',
                      textAlign: 'left',
                      borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>LTV</th>
                    <th style={{
                      padding: '0.875rem 1rem',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      letterSpacing: '0.025em',
                      textAlign: 'left',
                      borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>Interest Rate</th>
                    <th style={{
                      padding: '0.875rem 1rem',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      letterSpacing: '0.025em',
                      textAlign: 'left'
                    }}>LTV Milestone Reached</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const importantLTVs = [95, 90, 85, 80, 75, 70, 60]
                    const yearlyData = []

                    if (!chartData || chartData.length === 0) {
                      return (
                        <tr>
                          <td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
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
                            previousLTV > threshold && ltvNum <= threshold
                          )
                        }

                        yearlyData.push({
                          year,
                          capital: yearData.withOverpayment,
                          ltv: ltvNum,
                          rate: yearData.rate,
                          milestone
                        })

                        previousLTV = ltvNum
                      }
                    }

                    return yearlyData.map((data, index) => {
                      const isImportant = data.milestone !== undefined
                      const periodNumber = Math.floor(data.year / productType)
                      const isEvenPeriod = periodNumber % 2 === 0
                      const bgColor = isEvenPeriod ? '#ffffff' : '#faf6f5'

                      return (
                        <tr
                          key={data.year}
                          className={isImportant ? 'highlight' : ''}
                          style={{
                            backgroundColor: bgColor,
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <td style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border-color)'
                          }}>
                            {data.year}
                          </td>
                          <td style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border-color)'
                          }}>
                            {formatCurrency(data.capital)}
                          </td>
                          <td style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border-color)'
                          }}>
                            {data.ltv}%
                          </td>
                          <td style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border-color)'
                          }}>
                            {data.rate ? `${data.rate}%` : '-'}
                          </td>
                          <td style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border-color)'
                          }}>
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
