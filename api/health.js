/**
 * Vercel Serverless Function for health check.
 * This replaces the Flask /api/health endpoint.
 */

/**
 * Handle CORS preflight requests
 */
function handleCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Serverless function handler for /api/health
 */
module.exports = async (req, res) => {
  // Handle CORS
  handleCORS(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Return health status
  res.status(200).json({ status: 'healthy' });
};
