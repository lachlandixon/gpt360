const express = require('express');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = 4000;

// Multer storage config using uploadsDir
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
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

// trust the Render proxy so secure cookies work
app.set('trust proxy', 1);

// Session setup for cross-site cookies
app.use(
  session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: true,
      sameSite: 'none'
    }
  })
);

// Hardcoded admin credentials
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password';

// Auth middleware
function requireLogin(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  // Check Authorization header for token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token && token.length > 10) {
      return next();
    }
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.loggedIn = true;
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

  // store the filename on the session
  req.session.uploadedImage = req.file.filename;

  // explicitly save the session before sending the response
  req.session.save(() => {
    res.json({ filename: req.file.filename });
  });
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
    path.join(uploadsDir, uploadedImage),
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