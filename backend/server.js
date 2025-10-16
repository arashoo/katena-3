const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for image uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const GLASSES_FILE = path.join(DATA_DIR, 'glasses.json');
const BACKLOG_FILE = path.join(DATA_DIR, 'backlog.json');
const PENDING_ORDERS_FILE = path.join(DATA_DIR, 'pendingOrders.json');
const DEFICIENCIES_FILE = path.join(DATA_DIR, 'deficiencies.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const PRELIMINARY_FILE = path.join(DATA_DIR, 'Preliminary.json');

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
    
    // Initialize pendingOrders.json if it doesn't exist
    if (!(await fs.pathExists(PENDING_ORDERS_FILE))) {
      await fs.writeJson(PENDING_ORDERS_FILE, [], { spaces: 2 });
    }
    
    // Initialize deficiencies.json if it doesn't exist
    if (!(await fs.pathExists(DEFICIENCIES_FILE))) {
      await fs.writeJson(DEFICIENCIES_FILE, [], { spaces: 2 });
    }
    
    // Initialize projects.json if it doesn't exist
    if (!(await fs.pathExists(PROJECTS_FILE))) {
      await fs.writeJson(PROJECTS_FILE, [], { spaces: 2 });
    }
    
    // Initialize Preliminary.json if it doesn't exist
    if (!(await fs.pathExists(PRELIMINARY_FILE))) {
      await fs.writeJson(PRELIMINARY_FILE, [], { spaces: 2 });
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

// Helper functions for projects
async function readProjects() {
  try {
    return await fs.readJson(PROJECTS_FILE);
  } catch (error) {
    console.error('Error reading projects data:', error);
    return [];
  }
}

async function writeProjects(projects) {
  try {
    await fs.writeJson(PROJECTS_FILE, projects, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error writing projects data:', error);
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

async function writePendingOrders(pendingOrders) {
  try {
    await fs.writeJson(PENDING_ORDERS_FILE, pendingOrders, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error writing pending orders data:', error);
    return false;
  }
}

async function readDeficiencies() {
  try {
    return await fs.readJson(DEFICIENCIES_FILE);
  } catch (error) {
    console.error('Error reading deficiencies data:', error);
    return [];
  }
}

async function writeDeficiencies(deficiencies) {
  try {
    await fs.writeJson(DEFICIENCIES_FILE, deficiencies, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error writing deficiencies data:', error);
    return false;
  }
}

// Helper functions for preliminary data
async function readPreliminary() {
  try {
    return await fs.readJson(PRELIMINARY_FILE);
  } catch (error) {
    console.error('Error reading preliminary data:', error);
    return [];
  }
}

async function writePreliminary(preliminary) {
  try {
    await fs.writeJson(PRELIMINARY_FILE, preliminary, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error writing preliminary data:', error);
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
    const glassData = req.body;
    
    // Determine stockCount and reservedCount based on project assignment
    let stockCount, reservedCount, reservedProjects, reservedProject;
    
    if (glassData.reservedProject && glassData.reservedProject.trim() !== '') {
      // Glass is assigned to a project - all pieces are reserved
      stockCount = 0;
      reservedCount = glassData.count;
      reservedProjects = [glassData.reservedProject.trim()];
      reservedProject = glassData.reservedProject.trim();
    } else {
      // Glass has no project - all pieces are available
      stockCount = glassData.count;
      reservedCount = 0;
      reservedProjects = [];
      reservedProject = null;
    }
    
    const newGlass = {
      id: uuidv4(),
      width: glassData.width,
      height: glassData.height,
      color: glassData.color,
      thickness: glassData.thickness,
      heatSoaked: glassData.heatSoaked || false,
      racks: Array.isArray(glassData.racks) ? glassData.racks : (glassData.rack ? [glassData.rack] : []),
      count: glassData.count,
      stockCount,
      reservedCount,
      reservedProjects,
      reservedProject,
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
    
    const originalGlass = glasses[glassIndex];
    const updatedGlass = { ...originalGlass, ...req.body };
    
    // Auto-calculate counts based on the new total count
    const totalCount = Math.max(0, Math.floor(updatedGlass.count || 0));
    const reservedCount = Math.max(0, Math.floor(updatedGlass.reservedCount || 0));
    
    // Validation: Reserved count cannot exceed total count
    if (reservedCount > totalCount) {
      return res.status(400).json({ 
        error: `Reserved count (${reservedCount}) cannot exceed total count (${totalCount}). Please reduce reservations first.` 
      });
    }
    
    // Auto-calculate available counts
    const availableCount = Math.max(0, totalCount - reservedCount);
    const stockCount = availableCount; // stockCount is the same as availableCount
    
    // Update the glass with corrected values
    updatedGlass.count = totalCount;
    updatedGlass.reservedCount = reservedCount;
    updatedGlass.availableCount = availableCount;
    updatedGlass.stockCount = stockCount;
    
    console.log(`📊 Glass ${req.params.id} updated: Total=${totalCount}, Reserved=${reservedCount}, Available=${availableCount}`);
    
    glasses[glassIndex] = updatedGlass;
    
    if (await writeGlasses(glasses)) {
      res.json(updatedGlass);
    } else {
      res.status(500).json({ error: 'Failed to update glass data' });
    }
  } catch (error) {
    console.error('Error updating glass:', error);
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

// Reserve glass
app.post('/api/glasses/:id/reserve', async (req, res) => {
  try {
    console.log('=== RESERVATION REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Glass ID:', req.params.id);
    
    const { quantity, projectName } = req.body;
    const glassId = req.params.id;
    
    // Validation
    if (!quantity || !projectName) {
      console.log('Validation failed: missing quantity or projectName');
      return res.status(400).json({ error: 'Quantity and project name are required' });
    }
    
    if (quantity <= 0) {
      console.log('Validation failed: quantity <= 0');
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    
    console.log('Reading glasses data...');
    const glasses = await readGlasses();
    console.log('Total glasses found:', glasses.length);
    
    const glassIndex = glasses.findIndex(g => g.id === glassId);
    console.log('Glass index found:', glassIndex);
    
    if (glassIndex === -1) {
      console.log('Glass not found for ID:', glassId);
      return res.status(404).json({ error: 'Glass not found' });
    }
    
    const glass = glasses[glassIndex];
    console.log('Found glass:', JSON.stringify(glass, null, 2));
    
    // Check if enough pieces are available
    // Check if enough pieces are available (using stockCount)
    if (quantity > glass.stockCount) {
      console.log('Insufficient quantity available:', quantity, '>', glass.stockCount);
      return res.status(400).json({ 
        error: `Cannot reserve ${quantity} pieces. Only ${glass.stockCount} available.` 
      });
    }
    
    console.log('Creating reservation object...');
    // Create reservation object
    const reservation = {
      id: uuidv4(),
      projectName: projectName.trim(),
      quantity: parseInt(quantity),
      reservedDate: new Date().toISOString(),
      glassId: glassId
    };
    console.log('Reservation object:', reservation);
    
    // Update glass data
    const updatedGlass = { ...glass };
    
    // Initialize reservedProjects array if it doesn't exist
    if (!updatedGlass.reservedProjects) {
      console.log('Initializing reservedProjects array');
      updatedGlass.reservedProjects = [];
    }
    
    console.log('Current reservedProjects:', updatedGlass.reservedProjects);
    
    // Add or update project in reservedProjects
    const existingProjectIndex = updatedGlass.reservedProjects.findIndex(
      proj => proj && proj.projectName === projectName.trim()
    );
    
    console.log('Existing project index:', existingProjectIndex);
    
    if (existingProjectIndex >= 0) {
      console.log('Adding to existing project reservation');
      // Add to existing project reservation
      updatedGlass.reservedProjects[existingProjectIndex].quantity += parseInt(quantity);
      if (!updatedGlass.reservedProjects[existingProjectIndex].reservations) {
        updatedGlass.reservedProjects[existingProjectIndex].reservations = [];
      }
      updatedGlass.reservedProjects[existingProjectIndex].reservations.push(reservation);
    } else {
      console.log('Creating new project reservation');
      // Create new project reservation
      updatedGlass.reservedProjects.push({
        projectName: projectName.trim(),
        quantity: parseInt(quantity),
        reservations: [reservation]
      });
    }
    
    // Update counts (using stockCount instead of availableCount)
    console.log('Updating counts...');
    updatedGlass.reservedCount = (updatedGlass.reservedCount || 0) + parseInt(quantity);
    updatedGlass.stockCount = updatedGlass.count - updatedGlass.reservedCount;
    
    console.log('Updated glass:', JSON.stringify(updatedGlass, null, 2));
    
    // Update the glass in the array
    glasses[glassIndex] = updatedGlass;
    
    console.log('Writing glasses data...');
    if (await writeGlasses(glasses)) {
      console.log('Successfully saved reservation');
      res.status(201).json({
        message: 'Glass reserved successfully',
        reservation: reservation,
        updatedGlass: updatedGlass
      });
    } else {
      console.log('Failed to write glasses data');
      res.status(500).json({ error: 'Failed to save reservation' });
    }
  } catch (error) {
    console.error('=== RESERVATION ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to reserve glass' });
  }
});

// Reserve glass by glass details (for project management)
app.post('/api/glasses/reserve', async (req, res) => {
  try {
    const { glassId, projectName, quantity } = req.body;
    
    if (!glassId || !projectName || !quantity) {
      return res.status(400).json({ error: 'Glass ID, project name, and quantity are required' });
    }
    
    const glasses = await readGlasses();
    const glassIndex = glasses.findIndex(g => g.id === glassId);
    
    if (glassIndex === -1) {
      return res.status(404).json({ error: 'Glass not found' });
    }
    
    const glass = glasses[glassIndex];
    
    // Check if enough pieces are available (using stockCount instead of availableCount)
    if (quantity > glass.stockCount) {
      return res.status(400).json({ 
        error: `Cannot reserve ${quantity} pieces. Only ${glass.stockCount} available.` 
      });
    }
    
    // Create reservation object
    const reservation = {
      id: uuidv4(),
      projectName: projectName.trim(),
      quantity: parseInt(quantity),
      reservedDate: new Date().toISOString(),
      glassId: glassId
    };
    
    // Update glass data
    const updatedGlass = { ...glass };
    
    // Initialize reservedProjects array if it doesn't exist
    if (!updatedGlass.reservedProjects) {
      updatedGlass.reservedProjects = [];
    }
    
    // Add or update project in reservedProjects
    const existingProjectIndex = updatedGlass.reservedProjects.findIndex(
      proj => proj && proj.projectName === projectName.trim()
    );
    
    if (existingProjectIndex >= 0) {
      // Add to existing project reservation
      updatedGlass.reservedProjects[existingProjectIndex].quantity += parseInt(quantity);
      if (!updatedGlass.reservedProjects[existingProjectIndex].reservations) {
        updatedGlass.reservedProjects[existingProjectIndex].reservations = [];
      }
      updatedGlass.reservedProjects[existingProjectIndex].reservations.push(reservation);
    } else {
      // Create new project reservation
      updatedGlass.reservedProjects.push({
        projectName: projectName.trim(),
        quantity: parseInt(quantity),
        reservations: [reservation]
      });
    }
    
    // Update counts (using stockCount instead of availableCount)
    updatedGlass.reservedCount = (updatedGlass.reservedCount || 0) + parseInt(quantity);
    updatedGlass.stockCount = updatedGlass.count - updatedGlass.reservedCount;
    
    // Update the glass in the array
    glasses[glassIndex] = updatedGlass;
    
    // Save the updated glasses data
    const success = await writeGlasses(glasses);
    if (success) {
      res.json({ 
        message: 'Glass reserved successfully', 
        glass: updatedGlass,
        reservation: reservation 
      });
    } else {
      res.status(500).json({ error: 'Failed to save reservation' });
    }
  } catch (error) {
    console.error('Error reserving glass:', error);
    res.status(500).json({ error: 'Failed to reserve glass' });
  }
});

// Remove glass from inventory (when shipped)
app.post('/api/glasses/remove', async (req, res) => {
  try {
    const { glassId, projectName, quantity } = req.body;
    
    if (!glassId || !projectName || !quantity) {
      return res.status(400).json({ error: 'Glass ID, project name, and quantity are required' });
    }
    
    const glasses = await readGlasses();
    const glassIndex = glasses.findIndex(g => g.id === glassId);
    
    if (glassIndex === -1) {
      return res.status(404).json({ error: 'Glass not found' });
    }
    
    const glass = glasses[glassIndex];
    const updatedGlass = { ...glass };
    
    // Find and remove the reservation for this project
    if (updatedGlass.reservedProjects && updatedGlass.reservedProjects.length > 0) {
      const projectIndex = updatedGlass.reservedProjects.findIndex(
        proj => proj && proj.projectName === projectName.trim()
      );
      
      if (projectIndex >= 0) {
        const project = updatedGlass.reservedProjects[projectIndex];
        const removeQuantity = Math.min(parseInt(quantity), project.quantity);
        
        // Update project quantity
        project.quantity -= removeQuantity;
        
        // Update reserved count
        updatedGlass.reservedCount = Math.max(0, (updatedGlass.reservedCount || 0) - removeQuantity);
        
        // Update total count (remove from inventory)
        updatedGlass.count = Math.max(0, updatedGlass.count - removeQuantity);
        
        // Update stock count
        updatedGlass.stockCount = updatedGlass.count - updatedGlass.reservedCount;
        
        // If project has no more reservations, remove it
        if (project.quantity <= 0) {
          updatedGlass.reservedProjects.splice(projectIndex, 1);
        }
        
        // Update the glass in the array
        glasses[glassIndex] = updatedGlass;
        
        // Save the updated glasses data
        const success = await writeGlasses(glasses);
        if (success) {
          res.json({ 
            message: 'Glass removed from inventory successfully', 
            glass: updatedGlass,
            removedQuantity: removeQuantity
          });
        } else {
          res.status(500).json({ error: 'Failed to save changes' });
        }
      } else {
        res.status(404).json({ error: 'No reservation found for this project' });
      }
    } else {
      res.status(404).json({ error: 'No reservations found for this glass' });
    }
  } catch (error) {
    console.error('Error removing glass:', error);
    res.status(500).json({ error: 'Failed to remove glass' });
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
    const processedGlasses = newGlasses.map(glassData => {
      // Determine stockCount and reservedCount based on project assignment
      let stockCount, reservedCount, reservedProjects, reservedProject;
      
      if (glassData.reservedProject && glassData.reservedProject.trim() !== '') {
        // Glass is assigned to a project - all pieces are reserved
        stockCount = 0;
        reservedCount = glassData.count;
        reservedProjects = [glassData.reservedProject.trim()];
        reservedProject = glassData.reservedProject.trim();
      } else {
        // Glass has no project - all pieces are available
        stockCount = glassData.count;
        reservedCount = 0;
        reservedProjects = [];
        reservedProject = null;
      }
      
      return {
        id: glassData.id || uuidv4(),
        width: glassData.width,
        height: glassData.height,
        color: glassData.color,
        thickness: glassData.thickness,
        heatSoaked: glassData.heatSoaked || false,
        racks: Array.isArray(glassData.racks) ? glassData.racks : (glassData.rack ? [glassData.rack] : []),
        count: glassData.count,
        stockCount,
        reservedCount,
        reservedProjects,
        reservedProject,
        dateAdded: glassData.dateAdded || new Date().toLocaleDateString()
      };
    });
    
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

// ============= PENDING ORDERS ROUTES =============

// GET /api/pending-orders - Get all pending orders
app.get('/api/pending-orders', async (req, res) => {
  try {
    const pendingOrders = await readPendingOrders();
    res.json(pendingOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending orders' });
  }
});

// POST /api/pending-orders - Add new pending order
app.post('/api/pending-orders', async (req, res) => {
  try {
    const pendingOrders = await readPendingOrders();
    const newOrder = {
      ...req.body,
      id: req.body.id || uuidv4(),
      dateOrdered: req.body.dateOrdered || new Date().toLocaleDateString(),
      status: req.body.status || 'Ordered'
    };
    
    pendingOrders.push(newOrder);
    
    if (await writePendingOrders(pendingOrders)) {
      res.status(201).json(newOrder);
    } else {
      res.status(500).json({ error: 'Failed to save pending order' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pending order' });
  }
});

// PUT /api/pending-orders/:id - Update pending order
app.put('/api/pending-orders/:id', async (req, res) => {
  try {
    const pendingOrders = await readPendingOrders();
    const orderIndex = pendingOrders.findIndex(order => order.id === req.params.id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Pending order not found' });
    }
    
    pendingOrders[orderIndex] = { ...pendingOrders[orderIndex], ...req.body };
    
    if (await writePendingOrders(pendingOrders)) {
      res.json(pendingOrders[orderIndex]);
    } else {
      res.status(500).json({ error: 'Failed to update pending order' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pending order' });
  }
});

// DELETE /api/pending-orders/:id - Delete pending order
app.delete('/api/pending-orders/:id', async (req, res) => {
  try {
    const pendingOrders = await readPendingOrders();
    const filteredOrders = pendingOrders.filter(order => order.id !== req.params.id);
    
    if (filteredOrders.length === pendingOrders.length) {
      return res.status(404).json({ error: 'Pending order not found' });
    }
    
    if (await writePendingOrders(filteredOrders)) {
      res.json({ message: 'Pending order deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete pending order' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pending order' });
  }
});

// POST /api/pending-orders/:id/receive - Move pending order to inventory
app.post('/api/pending-orders/:id/receive', async (req, res) => {
  try {
    const pendingOrders = await readPendingOrders();
    const glasses = await readGlasses();
    
    const orderIndex = pendingOrders.findIndex(order => order.id === req.params.id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Pending order not found' });
    }
    
    const order = pendingOrders[orderIndex];
    
    // Create new glass entry from pending order
    const newGlass = {
      id: uuidv4(),
      width: order.width,
      height: order.height,
      color: order.color,
      count: order.count,
      heatSoaked: order.heatSoaked,
      reservedProject: '',
      rackNumber: req.body.rackNumber || 'NEW-ARRIVAL',
      dateAdded: new Date().toLocaleDateString(),
      orderReference: order.id,
      supplierInfo: order.supplierInfo || ''
    };
    
    // Add to inventory
    glasses.push(newGlass);
    
    // Remove from pending orders
    pendingOrders.splice(orderIndex, 1);
    
    // Save both files
    const glassesSuccess = await writeGlasses(glasses);
    const ordersSuccess = await writePendingOrders(pendingOrders);
    
    if (glassesSuccess && ordersSuccess) {
      res.json({ 
        message: 'Order received and added to inventory',
        glass: newGlass 
      });
    } else {
      res.status(500).json({ error: 'Failed to process order receipt' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to receive order' });
  }
});

// ===============================
// DEFICIENCIES ROUTES
// ===============================

// GET /api/deficiencies - Get all deficiencies
app.get('/api/deficiencies', async (req, res) => {
  try {
    const deficiencies = await readDeficiencies();
    res.json(deficiencies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve deficiencies' });
  }
});

// POST /api/deficiencies - Add new deficiency
app.post('/api/deficiencies', async (req, res) => {
  try {
    const deficiencies = await readDeficiencies();
    const newDeficiency = {
      id: req.body.id,
      projectName: req.body.projectName,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      dateOpened: req.body.dateOpened,
      dateClosed: req.body.dateClosed || null,
      images: req.body.images || [], // Add images support
      createdAt: new Date().toISOString()
    };
    
    deficiencies.push(newDeficiency);
    const success = await writeDeficiencies(deficiencies);
    
    if (success) {
      res.status(201).json(newDeficiency);
    } else {
      res.status(500).json({ error: 'Failed to save deficiency' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add deficiency' });
  }
});

// PUT /api/deficiencies/:id - Update deficiency
app.put('/api/deficiencies/:id', async (req, res) => {
  try {
    const deficiencies = await readDeficiencies();
    const deficiencyIndex = deficiencies.findIndex(d => d.id === req.params.id);
    
    if (deficiencyIndex === -1) {
      return res.status(404).json({ error: 'Deficiency not found' });
    }
    
    // Update the deficiency
    deficiencies[deficiencyIndex] = {
      ...deficiencies[deficiencyIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const success = await writeDeficiencies(deficiencies);
    
    if (success) {
      res.json(deficiencies[deficiencyIndex]);
    } else {
      res.status(500).json({ error: 'Failed to update deficiency' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update deficiency' });
  }
});

// DELETE /api/deficiencies/:id - Delete deficiency
app.delete('/api/deficiencies/:id', async (req, res) => {
  try {
    const deficiencies = await readDeficiencies();
    const deficiencyIndex = deficiencies.findIndex(d => d.id === req.params.id);
    
    if (deficiencyIndex === -1) {
      return res.status(404).json({ error: 'Deficiency not found' });
    }
    
    deficiencies.splice(deficiencyIndex, 1);
    const success = await writeDeficiencies(deficiencies);
    
    if (success) {
      res.json({ message: 'Deficiency deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete deficiency' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete deficiency' });
  }
});

// =================================
// PROJECT ENDPOINTS
// =================================

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await readProjects();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create a new project
app.post('/api/projects', async (req, res) => {
  try {
    const projectData = req.body;
    
    if (!projectData.name || !projectData.name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const projects = await readProjects();
    
    // Only save the fields we decided on: id, name, client, address, status
    const newProject = {
      id: projectData.id || uuidv4(),
      name: projectData.name.trim(),
      client: projectData.client || '',
      address: projectData.address || '',
      status: projectData.status || 'planning'
    };
    
    projects.push(newProject);
    
    if (await writeProjects(projects)) {
      res.status(201).json(newProject);
    } else {
      res.status(500).json({ error: 'Failed to save project' });
    }
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update an existing project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const updateData = req.body;
    
    const projects = await readProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Calculate summary fields for frontend compatibility
    const sections = updateData.sections || projects[projectIndex].sections || [];
    const totalGSections = sections.filter(s => s.type === 'G').length;
    const totalDivSections = sections.filter(s => s.type === 'Div').length;
    const totalGlasses = sections.reduce((total, section) => {
      const glasses = section.glasses || [];
      return total + glasses.length;
    }, 0);
    
    // Update the project while preserving important fields
    const updatedProject = {
      ...projects[projectIndex],
      ...updateData,
      id: projectId, // Preserve original ID
      dateCreated: projects[projectIndex].dateCreated, // Preserve creation date
      createdAt: projects[projectIndex].createdAt || projects[projectIndex].dateCreated, // For frontend compatibility
      lastModified: new Date().toLocaleDateString(), // Update modification date
      // Add calculated fields for frontend compatibility
      totalGSections,
      totalDivSections,
      totalGlasses
    };
    
    projects[projectIndex] = updatedProject;
    
    if (await writeProjects(projects)) {
      res.json(updatedProject);
    } else {
      res.status(500).json({ error: 'Failed to update project' });
    }
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete a project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    const projects = await readProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const deletedProject = projects.splice(projectIndex, 1)[0];
    
    if (await writeProjects(projects)) {
      res.json({ message: 'Project deleted successfully', project: deletedProject });
    } else {
      res.status(500).json({ error: 'Failed to delete project' });
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Get a specific project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const projects = await readProjects();
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// =================================
// PRELIMINARY ENDPOINTS
// =================================

// Get preliminary data for a specific project
app.get('/api/preliminary/:projectId', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const preliminaryData = await readPreliminary();
    const projectPreliminary = preliminaryData.find(p => p.projectId === projectId);
    
    if (!projectPreliminary) {
      return res.json({ projectId, Gs: [], Divs: [] });
    }
    
    res.json(projectPreliminary);
  } catch (error) {
    console.error('Error fetching preliminary data:', error);
    res.status(500).json({ error: 'Failed to fetch preliminary data' });
  }
});

// Save preliminary data
app.post('/api/preliminary', async (req, res) => {
  try {
    const { projectId, projectName, Gs, Divs } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    const preliminaryData = await readPreliminary();
    const existingIndex = preliminaryData.findIndex(p => p.projectId === projectId);
    
    const newPreliminaryData = {
      projectId,
      projectName,
      Gs: Gs || [],
      Divs: Divs || [],
      lastUpdated: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      // Update existing data
      preliminaryData[existingIndex] = newPreliminaryData;
    } else {
      // Add new data
      preliminaryData.push(newPreliminaryData);
    }
    
    if (await writePreliminary(preliminaryData)) {
      res.status(201).json(newPreliminaryData);
    } else {
      res.status(500).json({ error: 'Failed to save preliminary data' });
    }
  } catch (error) {
    console.error('Error saving preliminary data:', error);
    res.status(500).json({ error: 'Failed to save preliminary data' });
  }
});

// Get all preliminary data
app.get('/api/preliminary', async (req, res) => {
  try {
    const preliminaryData = await readPreliminary();
    res.json(preliminaryData);
  } catch (error) {
    console.error('Error fetching all preliminary data:', error);
    res.status(500).json({ error: 'Failed to fetch preliminary data' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Catch-all handler: send back React's index.html file for client-side routing
// Only for GET requests that don't start with /api
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Initialize data and start server
async function startServer() {
  await initializeData();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Katena Backend API server running on port ${PORT}`);
    console.log(`Local access: http://localhost:${PORT}/api/health`);
    console.log(`Network access: http://192.168.0.39:${PORT}/api/health`);
    console.log(`Data directory: ${DATA_DIR}`);
  });
}

startServer();

module.exports = app;