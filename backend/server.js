const express = require('express');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = 4000;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

// Use local storage for now (will be replaced with Cloudinary)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// CORS for frontend dev and production
app.use(cors({ 
  origin: ['http://localhost:3000', 'https://gpt360.vercel.app'], 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(
  session({
    secret: 'supersecret',
    resave: true,
    saveUninitialized: true,
    cookie: { 
      secure: true,           // must be true for HTTPS
      sameSite: 'none',       // must be 'none' for cross-site cookies
      httpOnly: false,        // allow JavaScript access
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Multer setup for file uploads (using local storage for now)

// Hardcoded admin credentials
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password';

// Auth middleware
function requireLogin(req, res, next) {
  // Check session first
  if (req.session && req.session.loggedIn) return next();
  
  // Check Authorization header for token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Simple token validation (in production, use JWT)
    if (token && token.length > 10) {
      return next();
    }
  }
  
  console.log('Auth failed - session:', req.session, 'auth header:', req.headers.authorization);
  res.status(401).json({ error: 'Unauthorized' });
}

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.loggedIn = true;
    // Generate a simple token for localStorage
    const token = Buffer.from(username + Date.now()).toString('base64');
    res.json({ success: true, token: token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Check login status
app.get('/api/status', (req, res) => {
  res.json({ loggedIn: !!req.session.loggedIn });
});

// Upload endpoint
app.post('/api/upload', requireLogin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  req.session.uploadedImage = req.file.filename;
  res.json({ filename: req.file.filename });
});

// Deploy endpoint
app.post('/api/deploy', requireLogin, (req, res) => {
  const uploadedImage = req.session.uploadedImage;
  if (!uploadedImage) return res.status(400).json({ error: 'No image uploaded' });
  const deployId = uuidv4();
  const staticDir = path.join(__dirname, 'static', deployId);
  fs.mkdirSync(staticDir, { recursive: true });
  // Copy image
  fs.copyFileSync(
    path.join(__dirname, 'uploads', uploadedImage),
    path.join(staticDir, uploadedImage)
  );
  // Generate viewer HTML
  const html = generateViewerHTML(uploadedImage);
  fs.writeFileSync(path.join(staticDir, 'index.html'), html);
  // Return live URL
  res.json({ url: `/view/${deployId}` });
});

// Serve static deployed viewers
app.use('/view/:id', (req, res, next) => {
  const dir = path.join(__dirname, 'static', req.params.id);
  const file = path.join(dir, 'index.html');
  if (fs.existsSync(file)) {
    res.sendFile(file);
  } else {
    res.status(404).send('Not found');
  }
});
// Serve images for viewers
app.use('/static/:id/:img', (req, res) => {
  const file = path.join(__dirname, 'static', req.params.id, req.params.img);
  if (fs.existsSync(file)) {
    res.sendFile(file);
  } else {
    res.status(404).send('Not found');
  }
});

// Helper: Generate Marzipano viewer HTML
function generateViewerHTML(imageFilename) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset=\"utf-8\">
  <title>360 Viewer</title>
  <style>html,body { height:100%; margin:0; } #pano { width:100vw; height:100vh; }</style>
  <script src=\"https://www.marzipano.net/demos/vendor/marzipano.js\"></script>
</head>
<body>
  <div id=\"pano\"></div>
  <script>
    var viewer = new Marzipano.Viewer(document.getElementById('pano'));
    var source = Marzipano.ImageUrlSource.fromString('/static/' + window.location.pathname.split('/')[2] + '/${imageFilename}');
    var geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);
    var view = new Marzipano.RectilinearView(null, Marzipano.RectilinearView.limit.traditional(1024, 100*Math.PI/180));
    var scene = viewer.createScene({ source, geometry, view });
    scene.switchTo();
  </script>
</body>
</html>`;
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 