const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const GLASSES_FILE = path.join(DATA_DIR, 'glasses.json');
const BACKLOG_FILE = path.join(DATA_DIR, 'backlog.json');

// Ensure data directory and files exist
async function initializeData() {
  try {
    await fs.ensureDir(DATA_DIR);
    
    // Initialize glasses.json if it doesn't exist
    if (!(await fs.pathExists(GLASSES_FILE))) {
      await fs.writeJson(GLASSES_FILE, [], { spaces: 2 });
    }
    
    // Initialize backlog.json if it doesn't exist
    if (!(await fs.pathExists(BACKLOG_FILE))) {
      await fs.writeJson(BACKLOG_FILE, [], { spaces: 2 });
    }
    
    console.log('Data files initialized successfully');
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

// Helper functions for reading/writing data
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

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Katena Backend API is running' });
});

// Get all glasses
app.get('/api/glasses', async (req, res) => {
  try {
    const glasses = await readGlasses();
    res.json(glasses);
  } catch (error) {
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
      dateAdded: new Date().toLocaleDateString()
    };
    
    glasses.push(newGlass);
    
    if (await writeGlasses(glasses)) {
      res.status(201).json(newGlass);
    } else {
      res.status(500).json({ error: 'Failed to save glass data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add glass' });
  }
});

// Update glass
app.put('/api/glasses/:id', async (req, res) => {
  try {
    const glasses = await readGlasses();
    const glassIndex = glasses.findIndex(glass => glass.id === req.params.id);
    
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
    res.status(500).json({ error: 'Failed to update glass' });
  }
});

// Delete glass
app.delete('/api/glasses/:id', async (req, res) => {
  try {
    const glasses = await readGlasses();
    const filteredGlasses = glasses.filter(glass => glass.id !== req.params.id);
    
    if (filteredGlasses.length === glasses.length) {
      return res.status(404).json({ error: 'Glass not found' });
    }
    
    if (await writeGlasses(filteredGlasses)) {
      res.json({ message: 'Glass deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete glass data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete glass' });
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
    const filteredBacklog = backlog.filter(item => item.id !== req.params.id);
    
    if (filteredBacklog.length === backlog.length) {
      return res.status(404).json({ error: 'Backlog item not found' });
    }
    
    if (await writeBacklog(filteredBacklog)) {
      res.json({ message: 'Backlog item deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete backlog data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete backlog item' });
  }
});

// Bulk operations for glasses
app.post('/api/glasses/bulk', async (req, res) => {
  try {
    const { glasses: newGlasses } = req.body;
    
    if (!Array.isArray(newGlasses)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const glasses = await readGlasses();
    const processedGlasses = newGlasses.map(glass => ({
      ...glass,
      id: glass.id || uuidv4(),
      dateAdded: glass.dateAdded || new Date().toLocaleDateString()
    }));
    
    glasses.push(...processedGlasses);
    
    if (await writeGlasses(glasses)) {
      res.status(201).json(processedGlasses);
    } else {
      res.status(500).json({ error: 'Failed to save glasses data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process bulk operation' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize data and start server
async function startServer() {
  await initializeData();
  
  app.listen(PORT, () => {
    console.log(`Katena Backend API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Data directory: ${DATA_DIR}`);
  });
}

startServer();

module.exports = app;