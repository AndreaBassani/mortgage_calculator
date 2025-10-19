# Troubleshooting Guide

## Common Issues and Solutions

### Error: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

This error occurs when the frontend cannot connect to the backend or receives an invalid response.

**Solutions:**

1. **Make sure the backend is running:**
   ```bash
   cd backend
   python app.py
   ```
   You should see:
   ```
   * Running on http://127.0.0.1:5000
   ```

2. **Check if the backend is accessible:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Expected response: `{"status":"healthy"}`

3. **Test the backend API:**
   ```bash
   cd backend
   python test_api.py
   ```

4. **Check for CORS issues:**
   - Open browser developer tools (F12)
   - Look for CORS errors in the Console tab
   - Verify the backend is running on port 5000
   - Verify the frontend is running on port 3000

### Backend Won't Start

**Issue: "ModuleNotFoundError: No module named 'flask'"**

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

**Issue: "Port 5000 is already in use"**

**Solution (Windows):**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Solution (Linux/Mac):**
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Frontend Won't Start

**Issue: "npm: command not found"**

**Solution:**
Install Node.js from https://nodejs.org/

**Issue: "Cannot find module"**

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Issue: "Port 3000 is already in use"**

**Solution:**
The Vite dev server will automatically try the next available port (3001, 3002, etc.)
Or you can change the port in `frontend/vite.config.js`:
```js
server: {
  port: 3001,  // Change to desired port
  ...
}
```

### Calculation Errors

**Issue: "Invalid mortgage parameters"**

**Solution:**
- Ensure mortgage debt is greater than 0
- Ensure mortgage term is between 1 and 40 years
- Ensure interest rate is between 0 and 20%
- Check that overpayment amounts are non-negative

**Issue: "Interest rate changes not working"**

**Solution:**
- Rate changes should be for years 1 through mortgage term
- Year 0 uses the initial interest rate
- Rate changes must be valid percentages (0-20%)

### Network Errors

**Issue: "ERR_CONNECTION_REFUSED"**

**Solution:**
1. Check that backend is running on port 5000
2. Check that you're accessing the correct URL
3. Verify there's no firewall blocking the connection

**Issue: "CORS policy error"**

**Solution:**
This is already handled by flask-cors, but if you still see it:
1. Restart the backend server
2. Clear browser cache
3. Try in incognito/private mode

## Testing the Application

### Manual Testing Steps

1. **Start the backend:**
   ```bash
   cd backend
   python app.py
   ```

2. **In a new terminal, test the API:**
   ```bash
   cd backend
   python test_api.py
   ```

3. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Open the browser:**
   - Go to http://localhost:3000
   - Open Developer Tools (F12)
   - Check the Console tab for errors
   - Check the Network tab to see API requests

### Quick Health Check

Run this in your terminal while both servers are running:

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test a calculation
curl -X POST http://localhost:5000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"mortgage_debt": 350000, "mortgage_term": 25, "interest_rate": 4.5, "mortgage_type": "repayment", "one_off_overpayment": 0, "recurring_overpayment": 0, "recurring_frequency": "monthly", "interest_rate_changes": {}}'
```

## Still Having Issues?

1. **Check the backend logs:**
   - Look at the terminal where you started `python app.py`
   - Errors will be printed there

2. **Check the browser console:**
   - Press F12 in your browser
   - Look for red error messages
   - Check the Network tab for failed requests

3. **Restart everything:**
   ```bash
   # Stop both servers (Ctrl+C)
   # Then restart:
   cd backend && python app.py
   # In another terminal:
   cd frontend && npm run dev
   ```

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or clear cache in browser settings

## Debug Mode

The backend runs in debug mode by default. To see more detailed error messages:

1. Check the terminal where the backend is running
2. All errors will be printed with full stack traces
3. The server auto-reloads when you make changes to the code
