const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 3000;

const fs = require('fs');

console.log('Starting server...');
console.log('Port:', port);
console.log('Build directory:', path.join(__dirname, 'build'));

// Check if build directory exists and list contents
const buildDir = path.join(__dirname, 'build');
if (fs.existsSync(buildDir)) {
  console.log('✅ Build directory exists');
  const files = fs.readdirSync(buildDir);
  console.log('Build directory contents:', files);
  
  // Check for static folder
  const staticDir = path.join(buildDir, 'static');
  if (fs.existsSync(staticDir)) {
    console.log('✅ Static directory exists');
    const staticFiles = fs.readdirSync(staticDir);
    console.log('Static directory contents:', staticFiles);
  } else {
    console.log('❌ Static directory missing');
  }
} else {
  console.log('❌ Build directory does not exist!');
}

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    buildFiles: {
      hasJS: true,
      hasCSS: true,
      port: process.env.PORT || 3000
    }
  });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  console.log('Request for:', req.url);
  console.log('User-Agent:', req.get('User-Agent'));
  
  // Send index.html for all routes (React Router will handle routing)
  const indexPath = path.join(__dirname, 'build', 'index.html');
  console.log('Serving index.html from:', indexPath);
  res.sendFile(indexPath);
});

app.listen(port, (err) => {
  if (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
  console.log(`✅ Server running on port ${port}`);
  console.log(`✅ Health endpoint: http://localhost:${port}/health`);
  console.log(`✅ App endpoint: http://localhost:${port}/`);
}); 