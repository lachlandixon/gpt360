# 360 Image Viewer App

A full-stack application for uploading and viewing 360-degree images using Marzipano viewer.

## Features

- Admin login portal
- Upload 360-degree images
- Deploy images to get public viewing URLs
- Marzipano-powered 360 viewer
- Session-based authentication

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React
- **360 Viewer**: Marzipano
- **File Upload**: Multer
- **Authentication**: Express Session

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd 360-viewer-app
   ```

2. **Start the Backend**
   ```bash
   cd backend
   npm install
   node server.js
   ```
   Backend will run on `http://localhost:4000`

3. **Start the Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend will run on `http://localhost:3000`

4. **Access the Admin Portal**
   - Go to `http://localhost:3000`
   - Login with username: `admin`, password: `password`
   - Upload a 360 image and deploy to get a public URL

## Deployment

### Backend Deployment (Render.com)

1. Go to [Render.com](https://render.com/) and sign up
2. Click "New Web Service" → "Connect your GitHub"
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Add Disk**: For persistent storage of uploads
5. Deploy and note your backend URL

### Frontend Deployment (Vercel)

1. Go to [Vercel.com](https://vercel.com/) and sign up
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Deploy

### Update API Endpoint

After deploying the backend, update the API endpoint in `frontend/src/App.js`:

```javascript
const API = 'https://your-backend-url.onrender.com/api';
```

## Usage

1. **Login**: Use admin/password to access the portal
2. **Upload**: Select a 360-degree image file (equirectangular format recommended)
3. **Deploy**: Click deploy to generate a public viewing URL
4. **Share**: The generated URL can be shared and viewed on any device

## File Structure

```
360-viewer-app/
├── backend/
│   ├── server.js          # Express server
│   ├── package.json       # Backend dependencies
│   ├── uploads/           # Uploaded images
│   └── static/            # Deployed viewers
├── frontend/
│   ├── src/
│   │   └── App.js         # React admin portal
│   └── package.json       # Frontend dependencies
└── README.md
```

## API Endpoints

- `POST /api/login` - Admin login
- `POST /api/logout` - Admin logout
- `GET /api/status` - Check login status
- `POST /api/upload` - Upload 360 image
- `POST /api/deploy` - Deploy image and get URL
- `GET /view/:id` - View deployed 360 image

## Security Notes

- Change default admin credentials in production
- Use HTTPS in production
- Consider implementing proper user management
- Add rate limiting for uploads

## Troubleshooting

- **CORS errors**: Ensure backend CORS is configured for your frontend URL
- **Upload fails**: Check file size limits and supported formats
- **Deploy fails**: Ensure backend has write permissions for static directory

## License

MIT
