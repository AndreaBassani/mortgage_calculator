export function formatCurrency(value) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatYearMonth(years, months) {
  const parts = []

  if (years > 0) {
    parts.push(`${years} year${years !== 1 ? 's' : ''}`)
  }

  if (months > 0) {
    parts.push(`${months} month${months !== 1 ? 's' : ''}`)
  }

  if (parts.length === 0) {
    return '0 months'
  }

  return parts.join(' and ')
}

export function formatPercentage(value, decimals = 2) {
  return `${value.toFixed(decimals)}%`
}
