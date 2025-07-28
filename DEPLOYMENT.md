# EndowmentIQ Deployment Guide

## Prerequisites
- GitHub account with repository access
- Railway account (railway.app)
- Vercel account (vercel.com)

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Deploy EndowmentIQ"
git push origin main
```

## Step 2: Deploy Backend to Railway

1. **Login to Railway** at https://railway.app

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `prompt-stack/endowment-calculator`

3. **Configure Environment Variables**
   In Railway project settings, add:
   ```
   PORT=5000
   DEBUG=False
   SECRET_KEY=<generate-a-secure-key>
   ```

4. **Deploy Settings**
   - Railway will detect the `railway.json` and use `Dockerfile.backend`
   - The backend will be available at: `https://your-app.railway.app`

5. **Copy Backend URL**
   - You'll need this for the frontend configuration

## Step 3: Deploy Frontend to Vercel

1. **Create `.env.production` in frontend folder**
   ```bash
   cd frontend
   echo "VITE_API_URL=https://your-backend.railway.app" > .env.production
   ```

2. **Login to Vercel** at https://vercel.com

3. **Import Project**
   - Click "New Project"
   - Import `prompt-stack/endowment-calculator`
   - Set root directory to: `frontend`

4. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Add Environment Variables**
   - Key: `VITE_API_URL`
   - Value: `https://your-backend.railway.app` (your Railway backend URL)

6. **Deploy**
   - Click "Deploy"
   - Your frontend will be at: `https://endowmentiq.vercel.app`

## Step 4: Configure CORS

Update the Railway backend environment variable:
```
FRONTEND_URL=https://endowmentiq.vercel.app
```

This ensures CORS allows your Vercel frontend to communicate with Railway backend.

## Step 5: Test Deployment

1. Visit your Vercel URL
2. Try a calculation:
   - Starting Balance: $1,000,000
   - Withdrawal Rate: 4%
   - Time Horizon: 30 years
3. Verify results appear
4. Test PDF download

## Custom Domain (Optional)

### For Frontend (Vercel)
1. In Vercel project settings → Domains
2. Add your domain (e.g., `app.endowmentiq.com`)
3. Follow DNS configuration instructions

### For Backend (Railway)
1. In Railway project settings → Domains
2. Add custom domain (e.g., `api.endowmentiq.com`)
3. Update frontend's `VITE_API_URL` to use new domain

## Monitoring

- **Railway**: Check logs in Railway dashboard
- **Vercel**: Check function logs and analytics
- **Errors**: Both platforms provide error tracking

## Updates

To deploy updates:
1. Push changes to GitHub
2. Railway and Vercel will auto-deploy from main branch