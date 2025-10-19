/**
 * Vercel Serverless Function for mortgage calculation.
 * This replaces the Flask backend endpoint.
 */

const { calculateMortgage } = require('./calculator');

/**
 * Handle CORS preflight requests
 */
function handleCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Serverless function handler for /api/calculate
 */
module.exports = async (req, res) => {
  // Handle CORS
  handleCORS(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const data = req.body;

    // Log incoming request (Vercel will capture this)
    console.log('Received calculation request');
    console.log('Interest rate changes:', data.interest_rate_changes || {});

    // Convert interest_rate_changes keys from strings to floats (LTV percentages)
    let rateChanges = data.interest_rate_changes || {};
    if (Object.keys(rateChanges).length > 0) {
      const converted = {};
      for (const [key, value] of Object.entries(rateChanges)) {
        converted[parseFloat(key)] = parseFloat(value);
      }
      rateChanges = converted;
      console.log('Converted LTV-based rate changes:', rateChanges);
    }

    // Convert one_off_overpayments keys from strings to integers (years)
    let oneOffOverpayments = data.one_off_overpayments || {};
    if (Object.keys(oneOffOverpayments).length > 0) {
      const converted = {};
      for (const [key, value] of Object.entries(oneOffOverpayments)) {
        converted[parseInt(key, 10)] = parseFloat(value);
      }
      oneOffOverpayments = converted;
      console.log('One-off overpayments:', oneOffOverpayments);
    }

    // Build parameters object
    const params = {
      mortgage_debt: parseFloat(data.mortgage_debt),
      mortgage_term: parseInt(data.mortgage_term, 10),
      interest_rate: parseFloat(data.interest_rate),
      mortgage_type: data.mortgage_type || 'repayment',
      one_off_overpayments: oneOffOverpayments,
      recurring_overpayment: parseFloat(data.recurring_overpayment || 0),
      recurring_frequency: data.recurring_frequency || 'monthly',
      interest_rate_changes: rateChanges,
      property_value: parseFloat(data.property_value || 0),
      product_type: parseInt(data.product_type || 5, 10),
    };

    // Validate required parameters
    if (isNaN(params.mortgage_debt) || params.mortgage_debt <= 0) {
      throw new Error('Invalid mortgage_debt: must be a positive number');
    }
    if (isNaN(params.mortgage_term) || params.mortgage_term <= 0) {
      throw new Error('Invalid mortgage_term: must be a positive integer');
    }
    if (isNaN(params.interest_rate) || params.interest_rate < 0) {
      throw new Error('Invalid interest_rate: must be a non-negative number');
    }

    // Perform calculation
    const result = calculateMortgage(params);

    // Add property value and product type to result
    result.property_value = params.property_value;
    result.product_type = params.product_type;

    // Log calculation summary
    console.log(
      `Calculation complete - Interest saved: £${result.interest_saved.toFixed(2)}, Years saved: ${result.years_saved}`
    );

    // Return successful response
    res.status(200).json(result);
  } catch (error) {
    console.error('Calculation error:', error.message);

    // Handle validation errors vs unexpected errors
    if (
      error.message.includes('Invalid') ||
      error.message.includes('required') ||
      error.message.includes('must be')
    ) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: `Server error: ${error.message}` });
    }
  }
};
