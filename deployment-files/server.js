const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Data directory setup
const DATA_DIR = path.join(__dirname, 'data');
const GLASSES_FILE = path.join(DATA_DIR, 'glasses.json');
const BACKLOG_FILE = path.join(DATA_DIR, 'backlog.json');
const PENDING_ORDERS_FILE = path.join(DATA_DIR, 'pendingOrders.json');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Initialize data files on startup
async function initializeDataFiles() {
  try {
    await fs.ensureDir(DATA_DIR);
    
    // Initialize glasses.json if it doesn't exist
    if (!(await fs.pathExists(GLASSES_FILE))) {
      await fs.writeJson(GLASSES_FILE, [], { spaces: 2 });
      console.log('Created empty glasses.json file');
    }
    
    // Initialize backlog.json if it doesn't exist
    if (!(await fs.pathExists(BACKLOG_FILE))) {
      await fs.writeJson(BACKLOG_FILE, [], { spaces: 2 });
      console.log('Created empty backlog.json file');
    }
    
    // Initialize pendingOrders.json if it doesn't exist
    if (!(await fs.pathExists(PENDING_ORDERS_FILE))) {
      await fs.writeJson(PENDING_ORDERS_FILE, [], { spaces: 2 });
      console.log('Created empty pendingOrders.json file');
    }
    
    console.log('Data files initialized successfully');
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

// Utility functions for data operations
async function readGlasses() {
  try {
    return await fs.readJson(GLASSES_FILE);
  } catch (error) {
    console.error('Error reading glasses data:', error);
    return [];
  }
}

async function writeGlasses(glasses) {
  try {
    await fs.writeJson(GLASSES_FILE, glasses, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error writing glasses data:', error);
    return false;
  }
}

async function readBacklog() {
  try {
    return await fs.readJson(BACKLOG_FILE);
  } catch (error) {
    console.error('Error reading backlog data:', error);
    return [];
  }
}

async function writeBacklog(backlog) {
  try {
    await fs.writeJson(BACKLOG_FILE, backlog, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error writing backlog data:', error);
    return false;
  }
}

async function readPendingOrders() {
  try {
    return await fs.readJson(PENDING_ORDERS_FILE);
  } catch (error) {
    console.error('Error reading pending orders data:', error);
    return [];
  }
}

async function writePendingOrders(orders) {
  try {
    await fs.writeJson(PENDING_ORDERS_FILE, orders, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error writing pending orders data:', error);
    return false;
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Katena 3 API is running',
    timestamp: new Date().toISOString(),
    dataDir: DATA_DIR
  });
});

// Get all glasses
app.get('/api/glasses', async (req, res) => {
  try {
    const glasses = await readGlasses();
    res.json(glasses);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Failed to fetch glasses data' });
  }
});

// Add new glass
app.post('/api/glasses', async (req, res) => {
  try {
    const glasses = await readGlasses();
    const newGlass = {
      ...req.body,
      id: uuidv4(),
      dateAdded: new Date().toLocaleDateString(),
      availableCount: req.body.count || 0,
      reservedCount: 0,
      reservedProjects: []
    };
    
    glasses.push(newGlass);
    
    if (await writeGlasses(glasses)) {
      res.status(201).json(newGlass);
    } else {
      res.status(500).json({ error: 'Failed to save glass data' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Failed to add glass' });
  }
});

// Update glass
app.put('/api/glasses/:id', async (req, res) => {
  try {
    const glasses = await readGlasses();
    const glassIndex = glasses.findIndex(g => g.id === req.params.id);
    
    if (glassIndex === -1) {
      return res.status(404).json({ error: 'Glass not found' });
    }
    
    glasses[glassIndex] = { ...glasses[glassIndex], ...req.body };
    
    if (await writeGlasses(glasses)) {
      res.json(glasses[glassIndex]);
    } else {
      res.status(500).json({ error: 'Failed to update glass data' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Failed to update glass' });
  }
});

// Delete glass
app.delete('/api/glasses/:id', async (req, res) => {
  try {
    const glasses = await readGlasses();
    const glassIndex = glasses.findIndex(g => g.id === req.params.id);
    
    if (glassIndex === -1) {
      return res.status(404).json({ error: 'Glass not found' });
    }
    
    glasses.splice(glassIndex, 1);
    
    if (await writeGlasses(glasses)) {
      res.json({ message: 'Glass deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete glass data' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Failed to delete glass' });
  }
});

// Reserve glass
app.post('/api/glasses/:id/reserve', async (req, res) => {
  try {
    console.log('=== RESERVATION REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Glass ID:', req.params.id);

    const { quantity, projectName } = req.body;
    
    if (!quantity || !projectName) {
      return res.status(400).json({ error: 'Missing quantity or projectName' });
    }

    console.log('Reading glasses data...');
    const glasses = await readGlasses();
    console.log('Total glasses found:', glasses.length);
    
    const glassIndex = glasses.findIndex(g => g.id === req.params.id);
    console.log('Glass index found:', glassIndex);
    
    if (glassIndex === -1) {
      return res.status(404).json({ error: 'Glass not found' });
    }

    const glass = glasses[glassIndex];
    console.log('Found glass:', JSON.stringify(glass, null, 2));

    // Check availability
    const availableCount = glass.availableCount || (glass.count - (glass.reservedCount || 0));
    if (availableCount < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity available' });
    }

    console.log('Creating reservation object...');
    // Create reservation object
    const reservation = {
      id: uuidv4(),
      projectName,
      quantity: parseInt(quantity),
      reservedDate: new Date().toISOString(),
      glassId: req.params.id
    };
    console.log('Reservation object:', reservation);

    // Initialize reservedProjects if it doesn't exist
    if (!glass.reservedProjects) {
      glass.reservedProjects = [];
    }
    console.log('Current reservedProjects:', glass.reservedProjects);

    // Find existing project or create new one
    let existingProjectIndex = glass.reservedProjects.findIndex(p => 
      p && p.projectName === projectName
    );
    console.log('Existing project index:', existingProjectIndex);

    if (existingProjectIndex !== -1) {
      console.log('Adding to existing project');
      // Add to existing project
      if (!glass.reservedProjects[existingProjectIndex].reservations) {
        glass.reservedProjects[existingProjectIndex].reservations = [];
      }
      glass.reservedProjects[existingProjectIndex].quantity += parseInt(quantity);
      glass.reservedProjects[existingProjectIndex].reservations.push(reservation);
    } else {
      console.log('Creating new project reservation');
      // Create new project reservation
      glass.reservedProjects.push({
        projectName,
        quantity: parseInt(quantity),
        reservations: [reservation]
      });
    }

    console.log('Updating counts...');
    // Update counts
    glass.reservedCount = (glass.reservedCount || 0) + parseInt(quantity);
    glass.availableCount = glass.count - glass.reservedCount;

    console.log('Updated glass:', JSON.stringify(glass, null, 2));

    console.log('Writing glasses data...');
    if (await writeGlasses(glasses)) {
      console.log('Successfully saved reservation');
      res.status(201).json(reservation);
    } else {
      res.status(500).json({ error: 'Failed to save reservation' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// Get backlog
app.get('/api/backlog', async (req, res) => {
  try {
    const backlog = await readBacklog();
    res.json(backlog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch backlog data' });
  }
});

// Add to backlog
app.post('/api/backlog', async (req, res) => {
  try {
    const backlog = await readBacklog();
    const newBacklogItem = {
      ...req.body,
      id: uuidv4(),
      backlogDate: new Date().toLocaleDateString()
    };
    
    backlog.push(newBacklogItem);
    
    if (await writeBacklog(backlog)) {
      res.status(201).json(newBacklogItem);
    } else {
      res.status(500).json({ error: 'Failed to save backlog data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to backlog' });
  }
});

// Update backlog item
app.put('/api/backlog/:id', async (req, res) => {
  try {
    const backlog = await readBacklog();
    const itemIndex = backlog.findIndex(item => item.id === req.params.id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Backlog item not found' });
    }
    
    backlog[itemIndex] = { ...backlog[itemIndex], ...req.body };
    
    if (await writeBacklog(backlog)) {
      res.json(backlog[itemIndex]);
    } else {
      res.status(500).json({ error: 'Failed to update backlog data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update backlog item' });
  }
});

// Delete from backlog
app.delete('/api/backlog/:id', async (req, res) => {
  try {
    const backlog = await readBacklog();
    const itemIndex = backlog.findIndex(item => item.id === req.params.id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Backlog item not found' });
    }
    
    backlog.splice(itemIndex, 1);
    
    if (await writeBacklog(backlog)) {
      res.json({ message: 'Backlog item deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete backlog data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete backlog item' });
  }
});

// Get pending orders
app.get('/api/pending-orders', async (req, res) => {
  try {
    const orders = await readPendingOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending orders' });
  }
});

// Add pending order
app.post('/api/pending-orders', async (req, res) => {
  try {
    const orders = await readPendingOrders();
    const newOrder = {
      ...req.body,
      id: uuidv4(),
      dateCreated: new Date().toLocaleDateString()
    };
    
    orders.push(newOrder);
    
    if (await writePendingOrders(orders)) {
      res.status(201).json(newOrder);
    } else {
      res.status(500).json({ error: 'Failed to save pending order' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add pending order' });
  }
});

// Update pending order
app.put('/api/pending-orders/:id', async (req, res) => {
  try {
    const orders = await readPendingOrders();
    const orderIndex = orders.findIndex(order => order.id === req.params.id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Pending order not found' });
    }
    
    orders[orderIndex] = { ...orders[orderIndex], ...req.body };
    
    if (await writePendingOrders(orders)) {
      res.json(orders[orderIndex]);
    } else {
      res.status(500).json({ error: 'Failed to update pending order' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pending order' });
  }
});

// Delete pending order
app.delete('/api/pending-orders/:id', async (req, res) => {
  try {
    const orders = await readPendingOrders();
    const orderIndex = orders.findIndex(order => order.id === req.params.id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Pending order not found' });
    }
    
    orders.splice(orderIndex, 1);
    
    if (await writePendingOrders(orders)) {
      res.json({ message: 'Pending order deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete pending order' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pending order' });
  }
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize data files and start server
initializeDataFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`Katena 3 server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Data directory: ${DATA_DIR}`);
  });
}).catch(error => {
  console.error('Failed to initialize data files:', error);
  process.exit(1);
});