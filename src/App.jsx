import { useState } from 'react'
import CalculatorForm from './components/CalculatorForm'
import ResultsDisplay from './components/ResultsDisplay'

function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCalculate = async (formData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Calculation failed')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Overpayment Calculator</h1>
          <p>Calculate your mortgage savings with smart overpayments</p>
        </header>

        <div className="calculator-grid">
          <CalculatorForm onCalculate={handleCalculate} loading={loading} />
          <ResultsDisplay results={results} loading={loading} error={error} />
        </div>
      </div>
    </div>
  )
}

export default App
