/**
 * Mortgage calculation logic with variable interest rates.
 * Ported from Python calculator.py
 */

/**
 * Calculate monthly payment for a mortgage.
 *
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate as percentage
 * @param {number} months - Number of months
 * @returns {number} Monthly payment amount
 */
function calculateMonthlyPayment(principal, annualRate, months) {
  if (annualRate === 0) {
    return principal / months;
  }

  const monthlyRate = annualRate / 100 / 12;
  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return payment;
}

/**
 * Calculate baseline mortgage schedule without overpayments.
 *
 * @param {number} initialBalance - Starting mortgage balance
 * @param {number} basePayment - Monthly payment amount
 * @param {number} totalMonths - Total mortgage term in months
 * @param {number} initialRate - Initial interest rate
 * @param {Object} rateChanges - Dictionary of LTV-based rate changes
 * @param {number} propertyValue - Property value for LTV calculation
 * @param {number} productType - Fixed rate period in years
 * @returns {Array} List of monthly balance snapshots
 */
function calculateBaselineSchedule(
  initialBalance,
  basePayment,
  totalMonths,
  initialRate,
  rateChanges = {},
  propertyValue = 0,
  productType = 5
) {
  let balance = initialBalance;
  const baselineSchedule = [];
  let currentRate = initialRate;

  // Setup fixed rate periods
  let bestLtvRate = null;
  let pendingRate = null;

  const fixedRatePeriodStarts = [0];
  let yearCounter = productType;
  while (yearCounter < Math.floor(totalMonths / 12)) {
    fixedRatePeriodStarts.push(yearCounter);
    yearCounter += productType;
  }

  for (let month = 0; month < totalMonths; month++) {
    if (balance <= 0.01) {
      baselineSchedule.push({
        month,
        year: Math.floor(month / 12),
        balance: 0.0,
      });
      continue;
    }

    const year = Math.floor(month / 12);

    // At the start of each year (first month), check LTV and potentially apply rate changes
    if (month % 12 === 0) {
      // Calculate LTV at the start of the year
      const currentLtv = propertyValue > 0 ? (balance / propertyValue) * 100 : 100;

      // Find the best rate for current LTV
      let currentBestRate = null;
      const ltvThresholds = Object.keys(rateChanges)
        .map(Number)
        .sort((a, b) => b - a);

      for (const ltvThreshold of ltvThresholds) {
        if (currentLtv <= ltvThreshold) {
          if (currentBestRate === null || rateChanges[ltvThreshold] < currentBestRate) {
            currentBestRate = rateChanges[ltvThreshold];
          }
        }
      }

      // Track the best rate ever achieved
      if (currentBestRate !== null) {
        if (bestLtvRate === null || currentBestRate < bestLtvRate) {
          bestLtvRate = currentBestRate;
          pendingRate = currentBestRate;
        }
      }

      // Apply rate changes at fixed period starts
      if (fixedRatePeriodStarts.includes(year) && pendingRate !== null) {
        if (pendingRate < currentRate) {
          // Only apply if it's better
          currentRate = pendingRate;
          pendingRate = null; // Rate has been applied
        }
      }
    }

    const monthlyRate = currentRate / 100 / 12;
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(basePayment - interestPayment, balance);
    balance -= principalPayment;

    baselineSchedule.push({
      month,
      year,
      balance: Math.max(0.0, balance),
    });
  }

  return baselineSchedule;
}

/**
 * Calculate mortgage with overpayments and variable rates.
 *
 * @param {Object} params - Mortgage calculation parameters
 * @returns {Object} Calculation results
 */
function calculateMortgage(params) {
  const {
    mortgage_debt,
    mortgage_term,
    interest_rate,
    mortgage_type = 'repayment',
    one_off_overpayments = {},
    recurring_overpayment = 0.0,
    recurring_frequency = 'monthly',
    interest_rate_changes = {},
    property_value = 0.0,
    product_type = 5,
  } = params;

  let balance = mortgage_debt;
  const totalMonths = mortgage_term * 12;
  let currentRate = interest_rate;

  const basePayment = calculateMonthlyPayment(balance, currentRate, totalMonths);

  // Calculate baseline schedule without overpayments
  const baselineSchedule = calculateBaselineSchedule(
    mortgage_debt,
    basePayment,
    totalMonths,
    interest_rate,
    interest_rate_changes,
    property_value,
    product_type
  );

  const schedule = [];
  let totalInterestPaid = 0.0;
  let totalPrincipalPaid = 0.0;
  let month = 0;

  // Track the best LTV-based rate achieved
  let bestLtvRate = null;
  let ltvThresholdReached = null;
  let ltvRateReachedAtYear = null;
  let rateAppliedAtYear = null;
  let pendingRate = null; // Rate that's been reached but waiting for period start

  // Fixed rate periods (years when new rates can be applied)
  const fixedRatePeriodStarts = [0]; // Year 0 is always a period start
  let yearCounter = product_type;
  while (yearCounter < mortgage_term) {
    fixedRatePeriodStarts.push(yearCounter);
    yearCounter += product_type;
  }

  while (balance > 0.01 && month < totalMonths) {
    const year = Math.floor(month / 12);

    // At the start of each year (first month), check LTV and potentially apply rate changes
    if (month % 12 === 0) {
      // Calculate current LTV at the start of the year
      const currentLtv = property_value > 0 ? (balance / property_value) * 100 : 100;

      // Find the best rate for current LTV
      let currentBestRate = null;
      let currentBestThreshold = null;
      const ltvThresholds = Object.keys(interest_rate_changes)
        .map(Number)
        .sort((a, b) => b - a);

      for (const ltvThreshold of ltvThresholds) {
        if (currentLtv <= ltvThreshold) {
          if (
            currentBestRate === null ||
            interest_rate_changes[ltvThreshold] < currentBestRate
          ) {
            currentBestRate = interest_rate_changes[ltvThreshold];
            currentBestThreshold = ltvThreshold;
          }
        }
      }

      // Track the best rate ever achieved and when it was first reached
      if (currentBestRate !== null) {
        if (bestLtvRate === null || currentBestRate < bestLtvRate) {
          bestLtvRate = currentBestRate;
          if (ltvRateReachedAtYear === null) {
            ltvRateReachedAtYear = year;
            ltvThresholdReached = currentBestThreshold;
          }
          pendingRate = currentBestRate;
        }
      }

      // Apply rate changes at fixed period starts
      if (fixedRatePeriodStarts.includes(year) && pendingRate !== null) {
        if (pendingRate < currentRate) {
          // Only apply if it's better
          currentRate = pendingRate;
          if (rateAppliedAtYear === null) {
            rateAppliedAtYear = year;
          }
          pendingRate = null; // Rate has been applied
        }
      }
    }

    const monthlyRate = currentRate / 100 / 12;
    const interestPayment = balance * monthlyRate;

    let principalPayment;
    if (mortgage_type === 'interest_only') {
      principalPayment = 0.0;
    } else {
      principalPayment = Math.min(basePayment - interestPayment, balance);
    }

    let overpayment = 0.0;

    // Check if there's a one-off overpayment scheduled for this year (apply at end of year, last month)
    if (one_off_overpayments[year] && month % 12 === 11) {
      overpayment += one_off_overpayments[year];
    }

    if (recurring_overpayment > 0) {
      if (recurring_frequency === 'monthly') {
        overpayment += recurring_overpayment;
      } else if (recurring_frequency === 'yearly' && month % 12 === 0) {
        overpayment += recurring_overpayment;
      }
    }

    const totalPrincipal = Math.min(principalPayment + overpayment, balance);
    balance -= totalPrincipal;

    totalInterestPaid += interestPayment;
    totalPrincipalPaid += totalPrincipal;

    schedule.push({
      month,
      year,
      balance: Math.max(0, balance),
      interest: interestPayment,
      principal: totalPrincipal,
      overpayment,
      rate: currentRate,
    });

    month += 1;
  }

  const monthsSaved = totalMonths - month;
  const yearsSaved = Math.floor(monthsSaved / 12);
  const monthsRemainder = monthsSaved % 12;

  const baseTotalInterest = basePayment * totalMonths - mortgage_debt;
  const interestSaved = baseTotalInterest - totalInterestPaid;

  // Calculate overpayment summary
  const oneOffTotal = Object.values(one_off_overpayments).reduce(
    (sum, val) => sum + val,
    0
  );
  const recurringTotal =
    recurring_overpayment *
    (recurring_frequency === 'monthly' ? month : Math.floor(month / 12));

  return {
    monthly_payment: basePayment,
    total_repayment: totalPrincipalPaid + totalInterestPaid,
    total_interest: totalInterestPaid,
    interest_saved: Math.max(0, interestSaved),
    months_cleared: month,
    years_saved: yearsSaved,
    months_saved_remainder: monthsRemainder,
    final_balance: balance,
    initial_mortgage_debt: mortgage_debt,
    product_type,
    schedule,
    baseline_schedule: baselineSchedule,
    overpayment_summary: {
      one_off_total: oneOffTotal,
      one_off_by_year: one_off_overpayments,
      recurring_total: recurringTotal,
    },
    ltv_milestone_info: {
      threshold_reached: ltvThresholdReached,
      reached_at_year: ltvRateReachedAtYear,
      rate_applied_at_year: rateAppliedAtYear,
      new_rate: bestLtvRate,
    },
  };
}

module.exports = {
  calculateMonthlyPayment,
  calculateBaselineSchedule,
  calculateMortgage,
};
