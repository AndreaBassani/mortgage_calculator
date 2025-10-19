# Deployment Guide - Vercel Production Setup

This guide covers deploying the Mortgage Calculator to Vercel for production use.

## Architecture Overview

The application has been refactored for **serverless deployment** on Vercel:

- **Frontend**: React + Vite (static site)
- **Backend**: Node.js serverless functions in `/api` directory
- **Deployment**: Single unified deployment on Vercel

```
Project Structure (Vercel-Optimized):
mortgage_calculator/
├── api/                    # Serverless API functions
│   ├── calculate.js        # POST /api/calculate (main calculation)
│   ├── health.js           # GET /api/health (health check)
│   └── calculator.js       # Core calculation logic
├── src/                    # React frontend source
├── public/                 # Static assets
├── index.html              # HTML entry point
├── vite.config.js          # Vite configuration
├── vercel.json             # Vercel deployment config
└── package.json            # Unified dependencies
```

## Prerequisites

1. **Node.js** >= 18.0.0
2. **npm** or **yarn**
3. **Vercel Account** (free tier works perfectly)
4. **Git** repository (GitHub, GitLab, or Bitbucket)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

You have two options for local development:

#### Option A: Using Vite Dev Server (Frontend Only)
```bash
npm run dev
# Frontend runs on http://localhost:3000
# API calls will fail unless you're also running the API separately
```

#### Option B: Using Vercel CLI (Recommended - Full Stack)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Run in development mode (simulates production environment)
npm run dev:api
# Both frontend and API run together
# Access at http://localhost:3000
```

### 3. Test Locally

Visit `http://localhost:3000` and test the calculator:
- Enter mortgage details
- Add overpayments
- Configure LTV-based rate changes
- Verify calculations work correctly

## Deploying to Vercel

### Method 1: Vercel CLI (Recommended for First Deployment)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Preview** (staging):
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose your project name
   - Select the root directory
   - Vercel will auto-detect Vite framework

4. **Deploy to Production**:
   ```bash
   vercel --prod
   # or use the npm script:
   npm run deploy
   ```

5. **Your app is live!** Vercel will provide a URL like:
   ```
   https://mortgage-calculator-xxxx.vercel.app
   ```

### Method 2: Git Integration (Recommended for Continuous Deployment)

1. **Push to GitHub/GitLab/Bitbucket**:
   ```bash
   git add .
   git commit -m "Refactor for Vercel production deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Vercel auto-detects settings from `vercel.json`

3. **Configure Build Settings** (auto-detected):
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Deploy**:
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Every push to `main` branch auto-deploys

5. **Set Up Environment Variables** (if needed):
   - Go to Project Settings → Environment Variables
   - Add any required variables (currently none required)

## Production Optimizations

The refactored codebase includes several production optimizations:

### Performance
- ✅ Code splitting (React, Recharts in separate chunks)
- ✅ Minified JavaScript and CSS
- ✅ Tree-shaking for smaller bundle sizes
- ✅ Serverless functions with 10s max duration
- ✅ CDN distribution via Vercel Edge Network

### Security
- ✅ CORS properly configured
- ✅ Input validation on API endpoints
- ✅ Error handling with appropriate status codes
- ✅ No sensitive data exposure

### Reliability
- ✅ Health check endpoint (`/api/health`)
- ✅ Comprehensive error messages
- ✅ Request logging for debugging
- ✅ Automatic HTTPS

### Monitoring
- ✅ Console logs captured by Vercel
- ✅ Access logs in Vercel dashboard
- ✅ Performance metrics available

## Vercel Configuration Explained

The `vercel.json` file configures:

```json
{
  "framework": "vite",           // Auto-detected Vite setup
  "buildCommand": "npm run build",
  "outputDirectory": "dist",     // Vite build output
  "rewrites": [...],             // Route /api/* to serverless functions
  "headers": [...],              // CORS headers for API
  "functions": {
    "api/calculate.js": {
      "maxDuration": 10          // 10 seconds max (free tier allows up to 10s)
    }
  }
}
```

## Environment Variables (Optional)

Currently, the app works without environment variables. If you need to add any:

1. **Create `.env.local`** (for local development):
   ```bash
   cp .env.example .env.local
   ```

2. **Add to Vercel** (for production):
   - Go to Project Settings → Environment Variables
   - Add variables for Production/Preview/Development

## Custom Domain (Optional)

To use a custom domain:

1. Go to Project Settings → Domains
2. Add your domain (e.g., `mortgage-calc.yourdomain.com`)
3. Follow DNS configuration instructions
4. Vercel automatically provisions SSL certificate

## Monitoring and Logs

### View Logs
1. Go to Vercel Dashboard → Your Project
2. Click on "Deployments"
3. Select a deployment → "Functions" tab
4. View logs for each API call

### Analytics
- Enable Vercel Analytics in Project Settings
- Track page views, performance, and user behavior

## Troubleshooting

### Build Fails
- Check Node.js version (requires >= 18.0.0)
- Verify all dependencies in `package.json`
- Review build logs in Vercel dashboard

### API Errors
- Check function logs in Vercel dashboard
- Verify CORS headers are set correctly
- Ensure request payload matches expected format

### Frontend Not Loading
- Verify `dist/` directory is created during build
- Check build output in Vercel deployment logs
- Ensure `index.html` exists in root

### Calculation Issues
- Compare results with Python version (in `/backend` directory)
- Check browser console for JavaScript errors
- Verify API response format

## Rollback

To rollback to a previous deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the working deployment
3. Click "..." → "Promote to Production"

## Performance Benchmarks

Expected performance:
- **Cold start**: < 500ms
- **Warm response**: < 100ms
- **Calculation time**: < 50ms (for 40-year mortgage)
- **Page load**: < 2s (initial visit)
- **Page load**: < 500ms (cached)

## Cost Estimation

Vercel Free Tier includes:
- 100 GB bandwidth/month
- 100 hours serverless execution/month
- Unlimited API requests
- Automatic SSL
- Global CDN

**This application easily fits within free tier limits** for personal/moderate use.

## Migration Notes

### What Changed from Original Architecture

1. **Backend**: Python Flask → Node.js Serverless Functions
2. **Deployment**: Separate services → Unified Vercel deployment
3. **API**: Development proxy → Production-ready serverless
4. **Structure**: `/frontend` and `/backend` → Unified root with `/api`

### Original Code Preserved

The original Python backend is preserved in `/backend` directory for reference. You can still run it locally if needed:

```bash
cd backend
python app.py
```

## Next Steps After Deployment

1. ✅ Test all calculator features in production
2. ✅ Set up custom domain (optional)
3. ✅ Enable Vercel Analytics (optional)
4. ✅ Configure monitoring alerts (optional)
5. ✅ Share your production URL!

## Support

For issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review `TROUBLESHOOTING.md` in this repository
- Check Vercel deployment logs

## Summary

You now have a **production-ready, serverless mortgage calculator** that:
- ✅ Deploys with a single command
- ✅ Scales automatically
- ✅ Costs $0 for typical usage
- ✅ Includes automatic HTTPS and CDN
- ✅ Supports continuous deployment from Git

**Deploy command**: `vercel --prod` or push to Git!
