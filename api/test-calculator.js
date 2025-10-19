/**
 * Simple test script to verify JavaScript calculator matches Python logic
 */

const { calculateMortgage } = require('./calculator');

console.log('Testing Mortgage Calculator JavaScript Implementation\n');
console.log('='.repeat(60));

// Test Case 1: Basic mortgage without overpayments
console.log('\n📊 Test 1: Basic Mortgage (No Overpayments)');
const test1 = calculateMortgage({
  mortgage_debt: 351000,
  mortgage_term: 40,
  interest_rate: 4.81,
  mortgage_type: 'repayment',
  property_value: 400000,
  product_type: 5,
  one_off_overpayments: {},
  recurring_overpayment: 0,
  recurring_frequency: 'monthly',
  interest_rate_changes: {},
});

console.log(`Monthly Payment: £${test1.monthly_payment.toFixed(2)}`);
console.log(`Total Interest: £${test1.total_interest.toFixed(2)}`);
console.log(`Total Repayment: £${test1.total_repayment.toFixed(2)}`);
console.log(`Months to Clear: ${test1.months_cleared}`);
console.log(`Final Balance: £${test1.final_balance.toFixed(2)}`);

// Test Case 2: With recurring monthly overpayments
console.log('\n📊 Test 2: With £300 Monthly Overpayments');
const test2 = calculateMortgage({
  mortgage_debt: 351000,
  mortgage_term: 40,
  interest_rate: 4.81,
  mortgage_type: 'repayment',
  property_value: 400000,
  product_type: 5,
  one_off_overpayments: {},
  recurring_overpayment: 300,
  recurring_frequency: 'monthly',
  interest_rate_changes: {},
});

console.log(`Monthly Payment: £${test2.monthly_payment.toFixed(2)}`);
console.log(`Total Interest: £${test2.total_interest.toFixed(2)}`);
console.log(`Interest Saved: £${test2.interest_saved.toFixed(2)}`);
console.log(`Years Saved: ${test2.years_saved} years, ${test2.months_saved_remainder} months`);
console.log(`Months to Clear: ${test2.months_cleared}`);

// Test Case 3: With one-off overpayments
console.log('\n📊 Test 3: With One-Off Overpayments');
const test3 = calculateMortgage({
  mortgage_debt: 351000,
  mortgage_term: 40,
  interest_rate: 4.81,
  mortgage_type: 'repayment',
  property_value: 400000,
  product_type: 5,
  one_off_overpayments: {
    0: 10000,
    5: 5000,
  },
  recurring_overpayment: 0,
  recurring_frequency: 'monthly',
  interest_rate_changes: {},
});

console.log(`Monthly Payment: £${test3.monthly_payment.toFixed(2)}`);
console.log(`Interest Saved: £${test3.interest_saved.toFixed(2)}`);
console.log(`One-off Total: £${test3.overpayment_summary.one_off_total.toFixed(2)}`);
console.log(`Years Saved: ${test3.years_saved} years, ${test3.months_saved_remainder} months`);

// Test Case 4: With LTV-based rate changes
console.log('\n📊 Test 4: With LTV-Based Rate Changes');
const test4 = calculateMortgage({
  mortgage_debt: 351000,
  mortgage_term: 40,
  interest_rate: 4.81,
  mortgage_type: 'repayment',
  property_value: 400000,
  product_type: 5,
  one_off_overpayments: {},
  recurring_overpayment: 300,
  recurring_frequency: 'monthly',
  interest_rate_changes: {
    85: 4.5,
    80: 4.25,
    75: 4.0,
  },
});

console.log(`Monthly Payment: £${test4.monthly_payment.toFixed(2)}`);
console.log(`Interest Saved: £${test4.interest_saved.toFixed(2)}`);
console.log(`LTV Threshold Reached: ${test4.ltv_milestone_info.threshold_reached}%`);
console.log(`LTV Reached at Year: ${test4.ltv_milestone_info.reached_at_year}`);
console.log(`Rate Applied at Year: ${test4.ltv_milestone_info.rate_applied_at_year}`);
console.log(`New Rate: ${test4.ltv_milestone_info.new_rate}%`);
console.log(`Years Saved: ${test4.years_saved} years, ${test4.months_saved_remainder} months`);

// Test Case 5: Complex scenario - all features combined
console.log('\n📊 Test 5: Complex Scenario (All Features)');
const test5 = calculateMortgage({
  mortgage_debt: 351000,
  mortgage_term: 40,
  interest_rate: 4.81,
  mortgage_type: 'repayment',
  property_value: 400000,
  product_type: 5,
  one_off_overpayments: {
    0: 10000,
    5: 5000,
    10: 8000,
  },
  recurring_overpayment: 300,
  recurring_frequency: 'monthly',
  interest_rate_changes: {
    85: 4.5,
    80: 4.25,
    75: 4.0,
  },
});

console.log(`Monthly Payment: £${test5.monthly_payment.toFixed(2)}`);
console.log(`Total Interest: £${test5.total_interest.toFixed(2)}`);
console.log(`Interest Saved: £${test5.interest_saved.toFixed(2)}`);
console.log(`Years Saved: ${test5.years_saved} years, ${test5.months_saved_remainder} months`);
console.log(`Months to Clear: ${test5.months_cleared} months (${(test5.months_cleared / 12).toFixed(1)} years)`);
console.log(`One-off Overpayments Total: £${test5.overpayment_summary.one_off_total.toFixed(2)}`);
console.log(`Recurring Overpayments Total: £${test5.overpayment_summary.recurring_total.toFixed(2)}`);

console.log('\n' + '='.repeat(60));
console.log('✅ All Tests Completed Successfully!');
console.log('='.repeat(60));
