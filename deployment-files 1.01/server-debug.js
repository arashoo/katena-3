const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Minimal Katena 3 Server is running',
    version: '1.01-debug',
    timestamp: new Date().toISOString(),
    port: PORT,
    nodeVersion: process.version
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Simple root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`=== KATENA 3 DEBUG SERVER ===`);
  console.log(`Port: ${PORT}`);
  console.log(`Node: ${process.version}`);
  console.log(`Directory: ${__dirname}`);
  console.log(`Health check: /health`);
  console.log(`========================`);
});

module.exports = app;