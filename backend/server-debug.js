const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();

// More flexible port configuration for cPanel
const PORT = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || process.env.npm_package_config_port || 3001;
const HOST = process.env.HOST || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

console.log(`Starting Katena Backend Server...`);
console.log(`Port: ${PORT}, Host: ${HOST}`);
console.log(`Node.js Version: ${process.version}`);
console.log(`Current Directory: ${process.cwd()}`);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://your-domain.com'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the frontend build directory
const frontendPath = path.join(__dirname, '../dist');
console.log(`Frontend path: ${frontendPath}`);
app.use(express.static(frontendPath));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const GLASSES_FILE = path.join(DATA_DIR, 'glasses.json');
const BACKLOG_FILE = path.join(DATA_DIR, 'backlog.json');
const PENDING_ORDERS_FILE = path.join(DATA_DIR, 'pendingOrders.json');

console.log(`Data directory: ${DATA_DIR}`);

// Initialize data files if they don't exist
async function initializeDataFiles() {
  try {
    // Ensure data directory exists
    await fs.ensureDir(DATA_DIR);
    
    // Initialize glasses.json if it doesn't exist
    if (!await fs.pathExists(GLASSES_FILE)) {
      console.log('Creating glasses.json...');
      await fs.writeJson(GLASSES_FILE, []);
    }
    
    // Initialize backlog.json if it doesn't exist
    if (!await fs.pathExists(BACKLOG_FILE)) {
      console.log('Creating backlog.json...');
      await fs.writeJson(BACKLOG_FILE, []);
    }
    
    // Initialize pendingOrders.json if it doesn't exist
    if (!await fs.pathExists(PENDING_ORDERS_FILE)) {
      console.log('Creating pendingOrders.json...');
      await fs.writeJson(PENDING_ORDERS_FILE, []);
    }
    
    console.log('Data files initialized successfully');
  } catch (error) {
    console.error('Error initializing data files:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Katena Backend API is running',
    version: '1.02',
    timestamp: new Date().toISOString(),
    port: PORT,
    node_version: process.version
  });
});

// Get all glasses
app.get('/api/glasses', async (req, res) => {
  try {
    const glasses = await fs.readJson(GLASSES_FILE);
    res.json(glasses);
  } catch (error) {
    console.error('Error reading glasses:', error);
    res.status(500).json({ error: 'Failed to read glasses data' });
  }
});

// Add new glass
app.post('/api/glasses', async (req, res) => {
  try {
    const glasses = await fs.readJson(GLASSES_FILE);
    const newGlass = {
      id: uuidv4(),
      ...req.body,
      reservedProjects: [],
      reservedProject: null
    };
    glasses.push(newGlass);
    await fs.writeJson(GLASSES_FILE, glasses, { spaces: 2 });
    res.status(201).json(newGlass);
  } catch (error) {
    console.error('Error adding glass:', error);
    res.status(500).json({ error: 'Failed to add glass' });
  }
});

// Update glass
app.put('/api/glasses/:id', async (req, res) => {
  try {
    const glasses = await fs.readJson(GLASSES_FILE);
    const index = glasses.findIndex(g => g.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Glass not found' });
    }
    
    glasses[index] = { ...glasses[index], ...req.body };
    await fs.writeJson(GLASSES_FILE, glasses, { spaces: 2 });
    res.json(glasses[index]);
  } catch (error) {
    console.error('Error updating glass:', error);
    res.status(500).json({ error: 'Failed to update glass' });
  }
});

// Delete glass
app.delete('/api/glasses/:id', async (req, res) => {
  try {
    const glasses = await fs.readJson(GLASSES_FILE);
    const filteredGlasses = glasses.filter(g => g.id !== req.params.id);
    
    if (filteredGlasses.length === glasses.length) {
      return res.status(404).json({ error: 'Glass not found' });
    }
    
    await fs.writeJson(GLASSES_FILE, filteredGlasses, { spaces: 2 });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting glass:', error);
    res.status(500).json({ error: 'Failed to delete glass' });
  }
});

// Get backlog
app.get('/api/backlog', async (req, res) => {
  try {
    const backlog = await fs.readJson(BACKLOG_FILE);
    res.json(backlog);
  } catch (error) {
    console.error('Error reading backlog:', error);
    res.status(500).json({ error: 'Failed to read backlog data' });
  }
});

// Add to backlog
app.post('/api/backlog', async (req, res) => {
  try {
    const backlog = await fs.readJson(BACKLOG_FILE);
    const newBacklogItem = {
      id: uuidv4(),
      ...req.body,
      timestamp: new Date().toISOString()
    };
    backlog.push(newBacklogItem);
    await fs.writeJson(BACKLOG_FILE, backlog, { spaces: 2 });
    res.status(201).json(newBacklogItem);
  } catch (error) {
    console.error('Error adding to backlog:', error);
    res.status(500).json({ error: 'Failed to add to backlog' });
  }
});

// Update backlog
app.put('/api/backlog/:id', async (req, res) => {
  try {
    const backlog = await fs.readJson(BACKLOG_FILE);
    const index = backlog.findIndex(item => item.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Backlog item not found' });
    }
    
    backlog[index] = { ...backlog[index], ...req.body };
    await fs.writeJson(BACKLOG_FILE, backlog, { spaces: 2 });
    res.json(backlog[index]);
  } catch (error) {
    console.error('Error updating backlog:', error);
    res.status(500).json({ error: 'Failed to update backlog' });
  }
});

// Delete from backlog
app.delete('/api/backlog/:id', async (req, res) => {
  try {
    const backlog = await fs.readJson(BACKLOG_FILE);
    const filteredBacklog = backlog.filter(item => item.id !== req.params.id);
    
    if (filteredBacklog.length === backlog.length) {
      return res.status(404).json({ error: 'Backlog item not found' });
    }
    
    await fs.writeJson(BACKLOG_FILE, filteredBacklog, { spaces: 2 });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting from backlog:', error);
    res.status(500).json({ error: 'Failed to delete from backlog' });
  }
});

// Get pending orders
app.get('/api/pending-orders', async (req, res) => {
  try {
    const pendingOrders = await fs.readJson(PENDING_ORDERS_FILE);
    res.json(pendingOrders);
  } catch (error) {
    console.error('Error reading pending orders:', error);
    res.status(500).json({ error: 'Failed to read pending orders data' });
  }
});

// Add pending order
app.post('/api/pending-orders', async (req, res) => {
  try {
    const pendingOrders = await fs.readJson(PENDING_ORDERS_FILE);
    const newOrder = {
      id: uuidv4(),
      ...req.body,
      timestamp: new Date().toISOString()
    };
    pendingOrders.push(newOrder);
    await fs.writeJson(PENDING_ORDERS_FILE, pendingOrders, { spaces: 2 });
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error adding pending order:', error);
    res.status(500).json({ error: 'Failed to add pending order' });
  }
});

// Update pending order
app.put('/api/pending-orders/:id', async (req, res) => {
  try {
    const pendingOrders = await fs.readJson(PENDING_ORDERS_FILE);
    const index = pendingOrders.findIndex(order => order.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Pending order not found' });
    }
    
    pendingOrders[index] = { ...pendingOrders[index], ...req.body };
    await fs.writeJson(PENDING_ORDERS_FILE, pendingOrders, { spaces: 2 });
    res.json(pendingOrders[index]);
  } catch (error) {
    console.error('Error updating pending order:', error);
    res.status(500).json({ error: 'Failed to update pending order' });
  }
});

// Delete pending order
app.delete('/api/pending-orders/:id', async (req, res) => {
  try {
    const pendingOrders = await fs.readJson(PENDING_ORDERS_FILE);
    const filteredOrders = pendingOrders.filter(order => order.id !== req.params.id);
    
    if (filteredOrders.length === pendingOrders.length) {
      return res.status(404).json({ error: 'Pending order not found' });
    }
    
    await fs.writeJson(PENDING_ORDERS_FILE, filteredOrders, { spaces: 2 });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting pending order:', error);
    res.status(500).json({ error: 'Failed to delete pending order' });
  }
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  console.log(`Serving frontend: ${indexPath}`);
  res.sendFile(indexPath);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Initialize and start server
async function startServer() {
  try {
    await initializeDataFiles();
    
    const server = app.listen(PORT, HOST, () => {
      console.log(`✅ Katena Backend API server running on http://${HOST}:${PORT}`);
      console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
      console.log(`📁 Data directory: ${DATA_DIR}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();