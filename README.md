# Mortgage Overpayment Calculator

A modern, edgy web application for calculating mortgage overpayments with variable interest rates. Features a React frontend with a sleek dark design and a Python Flask backend.

## Features

- Calculate mortgage payments with overpayments
- Support for both repayment and interest-only mortgages
- One-off and recurring overpayment options
- Variable interest rates by year
- Interactive chart showing debt reduction over time
- Modern, responsive dark UI with gradient accents
- Real-time calculation results

## Tech Stack

**Frontend:**
- React 18
- Vite
- Recharts for data visualization
- Modern CSS with custom properties

**Backend:**
- Python 3.x
- Flask
- Flask-CORS

## Project Structure

```
mortgage_calculator/
├── backend/
│   ├── app.py              # Flask API server
│   ├── calculator.py       # Mortgage calculation logic
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CalculatorForm.jsx
│   │   │   ├── ResultsDisplay.jsx
│   │   │   └── InterestRateManager.jsx
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Setup Instructions

### Quick Start

**Option 1: Using the start scripts (Recommended)**

Windows:
```bash
# Double-click start.bat or run:
start.bat
```

Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

**Option 2: Manual start**

1. **Start the backend (Terminal 1):**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```
   Wait until you see: `* Running on http://127.0.0.1:5000`

2. **Start the frontend (Terminal 2):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Wait until you see: `Local: http://localhost:3000/`

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Testing the Backend

Before starting the frontend, verify the backend is working:

```bash
cd backend
python test_api.py
```

You should see all tests pass. If you encounter errors, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Usage

1. Start both the backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. Enter your mortgage details:
   - Mortgage debt amount
   - Mortgage term (1-40 years)
   - Mortgage type (Repayment or Interest Only)
   - Initial interest rate
   - Optional: Custom monthly payment
   - One-off overpayment amount
   - Recurring overpayment amount and frequency
4. Add interest rate changes for specific years (optional)
5. Click "Calculate" to see your results

## Features Explained

### Mortgage Types
- **Repayment**: Pay off both principal and interest each month
- **Interest Only**: Pay only interest, principal remains unchanged

### Overpayment Options
- **One-off**: A single additional payment applied at the start
- **Recurring**: Regular additional payments (monthly or yearly)

### Interest Rate Changes
Add specific interest rates for different years of your mortgage term. This is useful for:
- Fixed rate periods ending
- Planned remortgaging
- Rate change scenarios

### Results Display
- Monthly payment amount
- Total interest saved through overpayments
- Time saved in clearing the debt
- Total repayment amount
- Interactive chart showing debt reduction over time

## API Endpoints

### POST /api/calculate
Calculate mortgage with overpayments

**Request Body:**
```json
{
  "mortgage_debt": 351000,
  "mortgage_term": 40,
  "interest_rate": 4.81,
  "mortgage_type": "repayment",
  "monthly_payment": null,
  "one_off_overpayment": 0,
  "recurring_overpayment": 300,
  "recurring_frequency": "monthly",
  "interest_rate_changes": {
    "5": 5.5,
    "10": 4.0
  }
}
```

**Response:**
```json
{
  "monthly_payment": 1650.00,
  "total_repayment": 623750.00,
  "total_interest": 272750.00,
  "interest_saved": 167840.00,
  "months_cleared": 320,
  "years_saved": 13,
  "months_saved_remainder": 4,
  "final_balance": 0,
  "schedule": [...],
  "overpayment_summary": {...}
}
```

### GET /api/health
Health check endpoint

## Development

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist`

### Code Style

This project follows the guidelines in `CLAUDE.md`:
- Python: PEP 8, type hints, docstrings
- JavaScript: Modern ES6+, functional components
- CSS: Custom properties, BEM-inspired naming
- Line length: 88 characters maximum

## Notes

- Typically, lenders allow overpayments up to 10% of the outstanding balance per year
- Always verify with your mortgage provider before making overpayments
- Interest rates can be changed for each year of the mortgage term
- The calculator assumes overpayments are applied immediately to the principal

## License

This project is for educational and personal use.
