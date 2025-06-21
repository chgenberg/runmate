const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 3000;

console.log('Starting server...');
console.log('Port:', port);
console.log('Build directory:', path.join(__dirname, 'build'));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  console.log('Request for:', req.url);
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
  console.log(`✅ Server running on http://0.0.0.0:${port}`);
}); 