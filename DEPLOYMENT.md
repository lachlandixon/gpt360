# 🚀 360 Viewer App - Deployment Guide

## Your app is ready! Here's how to deploy it:

### 1. Connect to GitHub
```bash
# Add your GitHub repo as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Deploy Backend (Render.com - FREE)
1. Go to [Render.com](https://render.com/) and sign up
2. Click "New Web Service" → "Connect your GitHub"
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Add Disk**: For persistent storage (uploads and static files)
5. Deploy and note your backend URL (e.g., `https://your-app.onrender.com`)

### 3. Deploy Frontend (Vercel - FREE)
1. Go to [Vercel.com](https://vercel.com/) and sign up
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Deploy

### 4. Update API Endpoint
After deploying the backend, update the API endpoint in `frontend/src/App.js`:
```javascript
const API = 'https://your-backend-url.onrender.com/api';
```
Then commit and push to GitHub:
```bash
git add .
git commit -m "Update API endpoint"
git push
```

### 5. Access Your App
- **Admin Portal**: Your Vercel URL (e.g., `https://your-app.vercel.app`)
- **Login**: username: `admin`, password: `password`
- **Upload**: Select a 360 image and deploy to get a public URL

### 6. Test Your App
1. Go to your admin portal
2. Login with admin/password
3. Upload a 360-degree image
4. Click "Deploy & Get Live URL"
5. Share the generated URL - it works on any device!

## Local Development
```bash
# Backend
cd backend
npm install
node server.js

# Frontend (in another terminal)
cd frontend
npm install
npm start
```

## Troubleshooting
- **CORS errors**: Ensure backend CORS is configured for your frontend URL
- **Upload fails**: Check file size limits (default: 10MB)
- **Deploy fails**: Ensure backend has write permissions for static directory

## Security Notes
- Change default admin credentials in production
- Use HTTPS in production
- Consider implementing proper user management

Your 360 viewer app is now ready for the world! 🌍
