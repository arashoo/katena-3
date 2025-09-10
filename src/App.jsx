import { useState, useEffect } from 'react'
import GlassTable from './components/GlassTable'
import AddGlassForm from './components/AddGlassForm'
import EmailOrder from './components/EmailOrder'
import SearchBar from './components/SearchBar'
import AdvancedFilters from './components/AdvancedFilters'
import ExportControls from './components/ExportControls'
import Dashboard from './components/Dashboard'
import BacklogManager from './components/BacklogManager'
import ConfirmationModal from './components/ConfirmationModal'
import './App.css'

function App() {
  const [glasses, setGlasses] = useState([])
  const [filteredGlasses, setFilteredGlasses] = useState([])
  const [backlogReservations, setBacklogReservations] = useState([]) // New backlog state
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEmailOrder, setShowEmailOrder] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard') // New state for tab management
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    color: 'all',
    heatSoaked: 'all',
    rack: 'all',
    project: 'all',
    dateRange: 'all'
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [glassToDelete, setGlassToDelete] = useState(null)
  const [showBacklogConfirmation, setShowBacklogConfirmation] = useState(false)
  const [glassToBacklog, setGlassToBacklog] = useState(null)
  const [orderInitialData, setOrderInitialData] = useState(null)

  // Load data from localStorage or use sample data
  useEffect(() => {
    // Clear any existing data and start fresh with sample data
    localStorage.removeItem('glassInventory')
    initializeSampleData()
  }, [])

  // Function to validate and fix inventory data consistency
  const validateAndFixInventoryData = (data) => {
    // This function ensures that inventory counts are consistent
    // For any glass with the same specs, the total available + reserved should match
    const groupedData = data.reduce((groups, glass) => {
      const key = `${glass.width}-${glass.height}-${glass.color}-${glass.heatSoaked}`
      if (!groups[key]) {
        groups[key] = { available: [], reserved: [] }
      }
      
      if (glass.reservedProject) {
        groups[key].reserved.push(glass)
      } else {
        groups[key].available.push(glass)
      }
      
      return groups
    }, {})

    // For now, just return the data as-is
    // In the future, we could add validation logic here
    return data
  }

  // Save to localStorage whenever glasses data changes
  useEffect(() => {
    if (glasses.length > 0) {
      localStorage.setItem('glassInventory', JSON.stringify(glasses))
    }
  }, [glasses])

  // Save backlog to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('backlogReservations', JSON.stringify(backlogReservations))
  }, [backlogReservations])

  // Load backlog from localStorage on startup
  useEffect(() => {
    const savedBacklog = localStorage.getItem('backlogReservations')
    if (savedBacklog) {
      setBacklogReservations(JSON.parse(savedBacklog))
    }
  }, [])

  const initializeSampleData = () => {
    const sampleGlasses = [
      // Fully reserved samples
      { id: 1, width: 84, height: 60, color: 'Clear', count: 25, heatSoaked: true, reservedProject: 'Office Building A', reservedCount: 25, rackNumber: 'R-001', dateAdded: '9/1/2025' },
      { id: 2, width: 48, height: 36, color: 'Blue', count: 30, heatSoaked: false, reservedProject: 'Hospital Renovation', reservedCount: 30, rackNumber: 'R-002', dateAdded: '9/1/2025' },
      
      // Partially reserved samples
      { id: 3, width: 72, height: 48, color: 'Gray', count: 20, heatSoaked: true, reservedProject: 'Mall Expansion', reservedCount: 12, rackNumber: 'R-003', dateAdded: '9/2/2025' },
      { id: 4, width: 60, height: 42, color: 'Clear', count: 15, heatSoaked: false, reservedProject: 'School Project', reservedCount: 8, rackNumber: 'R-004', dateAdded: '9/2/2025' },
      
      // Available samples
      { id: 5, width: 96, height: 72, color: 'Brown', count: 18, heatSoaked: true, reservedProject: '', rackNumber: 'R-005', dateAdded: '9/3/2025' },
      { id: 6, width: 30, height: 18, color: 'DIV', count: 40, heatSoaked: false, reservedProject: '', rackNumber: 'R-006', dateAdded: '9/3/2025' },
      { id: 7, width: 54, height: 36, color: 'Bronze', count: 22, heatSoaked: true, reservedProject: '', rackNumber: 'R-007', dateAdded: '9/4/2025' },
      { id: 8, width: 42, height: 30, color: 'Acid_DIV', count: 12, heatSoaked: false, reservedProject: '', rackNumber: 'R-008', dateAdded: '9/4/2025' },
      { id: 9, width: 78, height: 54, color: 'Gray', count: 28, heatSoaked: true, reservedProject: '', rackNumber: 'R-009', dateAdded: '9/5/2025' },
      { id: 10, width: 66, height: 48, color: 'Blue', count: 16, heatSoaked: false, reservedProject: '', rackNumber: 'R-010', dateAdded: '9/5/2025' }
    ];
    
    setGlasses(sampleGlasses);
    applyFiltersAndSearch(sampleGlasses, '', filters, sortConfig);
  }

  const addGlass = (glassData) => {
    const newGlass = {
      ...glassData,
      id: Date.now() + Math.random(), // Prevent ID collisions
      dateAdded: new Date().toLocaleDateString()
    }
    
    const updatedGlasses = [...glasses, newGlass]
    setGlasses(updatedGlasses)
    applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
  }

  const updateGlass = (id, updatedData) => {
    const updatedGlasses = glasses.map(glass => 
      glass.id === id ? { ...glass, ...updatedData } : glass
    )
    setGlasses(updatedGlasses)
    applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
  }

  const moveReservationToBacklog = (reservationId) => {
    const reservation = glasses.find(glass => glass.id === reservationId)
    if (!reservation || !reservation.reservedProject) return
    
    // Add to backlog with timestamp
    const backlogItem = {
      ...reservation,
      backlogDate: new Date().toLocaleDateString(),
      originalProject: reservation.reservedProject,
      status: 'unallocated'
    }
    
    setBacklogReservations(prev => [...prev, backlogItem])
    
    // Remove from active reservations and restore inventory
    let updatedGlasses = glasses.filter(glass => glass.id !== reservationId)
    
    // Restore the count to the original glass
    const originalGlass = updatedGlasses.find(glass => 
      !glass.reservedProject &&
      glass.width === reservation.width &&
      glass.height === reservation.height &&
      glass.color === reservation.color &&
      glass.heatSoaked === reservation.heatSoaked
    )
    
    if (originalGlass) {
      updatedGlasses = updatedGlasses.map(glass =>
        glass.id === originalGlass.id 
          ? { ...glass, count: glass.count + reservation.count }
          : glass
      )
    } else {
      // If no original glass exists, create one to restore the inventory
      const restoredGlass = {
        ...reservation,
        id: Date.now() + Math.random(),
        reservedProject: '',
        dateAdded: new Date().toLocaleDateString()
      }
      updatedGlasses.push(restoredGlass)
    }
    
    setGlasses(updatedGlasses)
    applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
  }

  const deleteGlass = (id) => {
    const glassToDelete = glasses.find(glass => glass.id === id)
    if (!glassToDelete) return
    
    let updatedGlasses = glasses.filter(glass => glass.id !== id)
    
    // If deleting a reservation, restore the count to the original glass
    if (glassToDelete.reservedProject) {
      const originalGlass = updatedGlasses.find(glass => 
        !glass.reservedProject &&
        glass.width === glassToDelete.width &&
        glass.height === glassToDelete.height &&
        glass.color === glassToDelete.color &&
        glass.heatSoaked === glassToDelete.heatSoaked
      )
      
      if (originalGlass) {
        updatedGlasses = updatedGlasses.map(glass =>
          glass.id === originalGlass.id 
            ? { ...glass, count: glass.count + glassToDelete.count }
            : glass
        )
      } else {
        // If no original glass exists, create one to restore the inventory
        const restoredGlass = {
          ...glassToDelete,
          id: Date.now() + Math.random(),
          reservedProject: '',
          dateAdded: new Date().toLocaleDateString()
        }
        updatedGlasses.push(restoredGlass)
      }
    }
    
    setGlasses(updatedGlasses)
    applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
  }

  const deleteGlassGroup = (groupSpecs) => {
    // Delete all glass entries (available and reserved) that match the group specifications
    const groupKey = `${groupSpecs.width}-${groupSpecs.height}-${groupSpecs.color}-${groupSpecs.heatSoaked}`
    
    const updatedGlasses = glasses.filter(glass => {
      const glassKey = `${glass.width}-${glass.height}-${glass.color}-${glass.heatSoaked}`
      return glassKey !== groupKey
    })
    
    setGlasses(updatedGlasses)
    applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
  }

  const smartReallocateFromBacklog = (backlogItemId, projectName = null) => {
    const backlogItem = backlogReservations.find(item => item.id === backlogItemId)
    if (!backlogItem) return

    // Check if there's sufficient inventory available
    const availableGlass = glasses.find(glass => 
      !glass.reservedProject &&
      glass.width === backlogItem.width &&
      glass.height === backlogItem.height &&
      glass.color === backlogItem.color &&
      glass.heatSoaked === backlogItem.heatSoaked &&
      glass.count >= backlogItem.count
    )

    if (availableGlass) {
      // Sufficient inventory available - proceed with automatic reallocation
      const finalProjectName = projectName || backlogItem.originalProject || 'Restored Reservation'
      reallocateFromBacklog(backlogItemId, finalProjectName)
      return { success: true, message: 'Automatically reallocated to inventory' }
    } else {
      // Insufficient inventory - check if we should order or just show modal
      if (projectName) {
        // User confirmed ordering - add the needed glass to inventory first
        const neededAmount = backlogItem.count - (availableGlass?.count || 0)
        const newGlass = {
          id: Date.now() + Math.random(),
          width: backlogItem.width,
          height: backlogItem.height,
          color: backlogItem.color,
          count: neededAmount,
          heatSoaked: backlogItem.heatSoaked,
          reservedProject: '',
          rackNumber: 'NEW-ORDER',
          dateAdded: new Date().toLocaleDateString()
        }
        
        // Add new glass to inventory
        const updatedGlasses = [...glasses, newGlass]
        setGlasses(updatedGlasses)
        
        // Now reallocate with sufficient inventory
        setTimeout(() => {
          reallocateFromBacklog(backlogItemId, projectName)
        }, 100) // Small delay to ensure state is updated
        
        return { success: true, message: 'Glass ordered and allocated' }
      } else {
        // Just checking availability - return info for ordering decision
        return { 
          success: false, 
          needsOrder: true,
          backlogItem,
          message: 'Insufficient inventory available. Order more glass?' 
        }
      }
    }
  }

  const reallocateFromBacklog = (backlogItemId, newProjectName) => {
    const backlogItem = backlogReservations.find(item => item.id === backlogItemId)
    if (!backlogItem) return
    
    // Remove from backlog
    setBacklogReservations(prev => prev.filter(item => item.id !== backlogItemId))
    
    // Create new reservation
    const newReservation = {
      ...backlogItem,
      reservedProject: newProjectName,
      dateAdded: new Date().toLocaleDateString(),
      id: Date.now() + Math.random() // New ID for the new reservation
    }
    
    // Reduce available inventory and add reservation
    let updatedGlasses = [...glasses]
    
    const originalGlass = updatedGlasses.find(glass => 
      !glass.reservedProject &&
      glass.width === backlogItem.width &&
      glass.height === backlogItem.height &&
      glass.color === backlogItem.color &&
      glass.heatSoaked === backlogItem.heatSoaked
    )
    
    if (originalGlass && originalGlass.count >= backlogItem.count) {
      // Reduce available inventory
      updatedGlasses = updatedGlasses.map(glass =>
        glass.id === originalGlass.id 
          ? { ...glass, count: glass.count - backlogItem.count }
          : glass
      )
      
      // Add new reservation
      updatedGlasses.push(newReservation)
      
      setGlasses(updatedGlasses)
      applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
    } else {
      alert('Insufficient inventory available for this allocation.')
      // Put back in backlog if allocation failed
      setBacklogReservations(prev => [...prev, backlogItem])
    }
  }

  const deleteFromBacklog = (backlogItemId) => {
    setBacklogReservations(prev => prev.filter(item => item.id !== backlogItemId))
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    applyFiltersAndSearch(glasses, term, filters, sortConfig)
  }

  const applyFiltersAndSearch = (currentGlasses, currentSearchTerm, currentFilters, currentSort) => {
    let filtered = [...currentGlasses]

    // Apply search
    if (currentSearchTerm) {
      const term = currentSearchTerm.toLowerCase()
      filtered = filtered.filter(glass =>
        glass.color.toLowerCase().includes(term) ||
        glass.width.toString().includes(term) ||
        glass.height.toString().includes(term) ||
        glass.rackNumber.toLowerCase().includes(term) ||
        (glass.reservedProject && glass.reservedProject.toLowerCase().includes(term))
      )
    }

    // Apply filters
    if (currentFilters.status !== 'all') {
      if (currentFilters.status === 'available') {
        filtered = filtered.filter(glass => !glass.reservedProject)
      } else if (currentFilters.status === 'reserved') {
        filtered = filtered.filter(glass => glass.reservedProject)
      }
    }

    if (currentFilters.color !== 'all') {
      filtered = filtered.filter(glass => glass.color === currentFilters.color)
    }

    if (currentFilters.heatSoaked !== 'all') {
      const isHeatSoaked = currentFilters.heatSoaked === 'yes'
      filtered = filtered.filter(glass => glass.heatSoaked === isHeatSoaked)
    }

    if (currentFilters.rack !== 'all') {
      filtered = filtered.filter(glass => glass.rackNumber === currentFilters.rack)
    }

    if (currentFilters.project !== 'all') {
      filtered = filtered.filter(glass => glass.reservedProject === currentFilters.project)
    }

    if (currentFilters.dateRange !== 'all') {
      const now = new Date()
      filtered = filtered.filter(glass => {
        const glassDate = new Date(glass.dateAdded)
        switch (currentFilters.dateRange) {
          case 'today':
            return glassDate.toDateString() === now.toDateString()
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return glassDate >= weekAgo
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return glassDate >= monthAgo
          default:
            return true
        }
      })
    }

    // Apply sorting
    if (currentSort.key) {
      filtered = sortData(filtered, currentSort.key, currentSort.direction)
    }

    setFilteredGlasses(filtered)
  }

  const sortData = (data, key, direction) => {
    return [...data].sort((a, b) => {
      let aVal = a[key]
      let bVal = b[key]
      
      // Handle different data types
      if (key === 'width' || key === 'height' || key === 'count') {
        aVal = Number(aVal)
        bVal = Number(bVal)
      } else if (key === 'heatSoaked') {
        aVal = aVal ? 1 : 0
        bVal = bVal ? 1 : 0
      } else if (key === 'dateAdded') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      } else {
        aVal = String(aVal).toLowerCase()
        bVal = String(bVal).toLowerCase()
      }
      
      if (direction === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
      }
    })
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    const newSortConfig = { key, direction }
    setSortConfig(newSortConfig)
    applyFiltersAndSearch(glasses, searchTerm, filters, newSortConfig)
  }

  const reserveGlass = (originalGlass, reserveQuantity, projectName) => {
    // Create reserved entry
    const reservedGlass = {
      ...originalGlass,
      id: Date.now() + Math.random(), // Prevent ID collisions
      count: reserveQuantity,
      reservedProject: projectName,
      dateAdded: new Date().toLocaleDateString()
    }

    // Update original entry (reduce quantity)
    const updatedOriginal = {
      ...originalGlass,
      count: originalGlass.count - reserveQuantity
    }

    // Update glasses array
    const updatedGlasses = glasses.map(glass =>
      glass.id === originalGlass.id ? updatedOriginal : glass
    ).concat(reservedGlass)

    setGlasses(updatedGlasses)
    applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
  }

  const updateReservation = (reservationId, updatedData) => {
    const reservation = glasses.find(glass => glass.id === reservationId)
    if (!reservation || !reservation.reservedProject) return
    
    const oldCount = reservation.count
    const newCount = updatedData.count || oldCount
    const countDifference = newCount - oldCount
    
    // Find the corresponding original glass entry that was reduced when this reservation was made
    // Look for glass with same specs but no reservedProject
    const originalGlass = glasses.find(glass => 
      !glass.reservedProject &&
      glass.width === reservation.width &&
      glass.height === reservation.height &&
      glass.color === reservation.color &&
      glass.heatSoaked === reservation.heatSoaked
    )
    
    const updatedGlasses = glasses.map(glass => {
      if (glass.id === reservationId) {
        // Update the reservation
        return { ...glass, ...updatedData }
      } else if (originalGlass && glass.id === originalGlass.id) {
        // Adjust the original glass count (subtract the difference)
        return { ...glass, count: Math.max(0, glass.count - countDifference) }
      }
      return glass
    })
    
    setGlasses(updatedGlasses)
    applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
  }

  const handleDeleteConfirm = (glass) => {
    setGlassToDelete(glass)
    setShowConfirmation(true)
  }

  const confirmDelete = () => {
    if (glassToDelete) {
      if (glassToDelete.isGroupDelete) {
        // Delete entire group
        deleteGlassGroup(glassToDelete)
      } else {
        // Delete individual glass
        deleteGlass(glassToDelete.id)
      }
      setGlassToDelete(null)
      setShowConfirmation(false)
    }
  }

  const cancelDelete = () => {
    setGlassToDelete(null)
    setShowConfirmation(false)
  }

  const handleMoveToBacklogConfirm = (reservation) => {
    setGlassToBacklog(reservation)
    setShowBacklogConfirmation(true)
  }

  const confirmMoveToBacklog = () => {
    if (glassToBacklog) {
      moveReservationToBacklog(glassToBacklog.id)
      setGlassToBacklog(null)
      setShowBacklogConfirmation(false)
    }
  }

  const cancelMoveToBacklog = () => {
    setGlassToBacklog(null)
    setShowBacklogConfirmation(false)
  }

  const handleOpenOrderFromBacklog = (backlogItem) => {
    // Calculate the shortage amount
    const availableGlass = glasses.find(g => 
      !g.reservedProject &&
      g.width === backlogItem.width &&
      g.height === backlogItem.height &&
      g.color === backlogItem.color &&
      g.heatSoaked === backlogItem.heatSoaked
    )
    const availableCount = availableGlass?.count || 0
    const shortageAmount = backlogItem.count - availableCount
    
    // Prepare initial data for the order form
    const initialData = {
      width: backlogItem.width,
      height: backlogItem.height,
      color: backlogItem.color,
      quantity: shortageAmount, // Only order what's missing
      heatSoaked: backlogItem.heatSoaked,
      project: backlogItem.originalProject,
      notes: `Backlog order for ${backlogItem.originalProject}\n` +
             `Required: ${backlogItem.count} pieces\n` +
             `Available: ${availableCount} pieces\n` +
             `Ordering: ${shortageAmount} pieces\n` +
             `Original backlog date: ${backlogItem.backlogDate}`
    }
    
    // Store the initial data and open order window
    setOrderInitialData(initialData)
    setShowEmailOrder(true)
  }

  // Debug function to reset data (can be called from browser console)
  window.resetInventoryData = () => {
    localStorage.removeItem('glassInventory')
    window.location.reload()
  }

  // Calculate proper inventory totals
  const availableGlasses = glasses.filter(glass => !glass.reservedProject)
  const reservedGlasses = glasses.filter(glass => glass.reservedProject)
  
  const availableCount = availableGlasses.reduce((sum, glass) => sum + glass.count, 0)
  const reservedCount = reservedGlasses.reduce((sum, glass) => sum + glass.count, 0)
  const totalCount = availableCount + reservedCount

  return (
    <div className="app">
      <header className="app-header">
        <h1>Glass Inventory Management System</h1>
        <div className="stats">
          <span>Total: {totalCount}</span>
          <span>Available: {availableCount}</span>
          <span>Reserved: {reservedCount}</span>
        </div>
        <div className="header-controls">
          <button 
            className="add-glass-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add New Glass'}
          </button>
          <button 
            className="order-glass-btn"
            onClick={() => setShowEmailOrder(!showEmailOrder)}
          >
            📧 Order Glass
          </button>
          <ExportControls glasses={glasses} filteredGlasses={filteredGlasses} />
        </div>
      </header>

      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999999
        }}>
          <div style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            position: 'relative',
            zIndex: 1000000000
          }}>
            <AddGlassForm 
              onAddGlass={addGlass}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {showEmailOrder && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999999
        }}>
          <div style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            zIndex: 1000000000
          }}>
            <EmailOrder 
              onCancel={() => {
                setShowEmailOrder(false)
                setOrderInitialData(null) // Clear initial data when closing
              }}
              glasses={glasses}
              initialData={orderInitialData}
            />
          </div>
        </div>
      )}

      <main className="app-main">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            📋 Inventory
          </button>
          <button 
            className={`tab-btn ${activeTab === 'backlog' ? 'active' : ''}`}
            onClick={() => setActiveTab('backlog')}
          >
            📝 Backlog ({backlogReservations.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <Dashboard glasses={glasses} />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="tab-content">
            <div className="controls-section">
              <SearchBar onSearch={handleSearch} />
              <AdvancedFilters 
                filters={filters} 
                onFilterChange={setFilters}
                glasses={glasses}
              />
            </div>
            
            <GlassTable 
              glasses={filteredGlasses}
              onUpdateGlass={updateGlass}
              onDeleteGlass={handleDeleteConfirm}
              onMoveToBacklog={handleMoveToBacklogConfirm}
              onSort={handleSort}
              sortConfig={sortConfig}
              onReserveGlass={reserveGlass}
              onUpdateReservation={updateReservation}
            />
          </div>
        )}

        {activeTab === 'backlog' && (
          <div className="tab-content">
            <BacklogManager
              backlogReservations={backlogReservations}
              onSmartReallocate={smartReallocateFromBacklog}
              onDelete={deleteFromBacklog}
              availableGlasses={glasses.filter(glass => !glass.reservedProject)}
              onOpenOrderGlass={handleOpenOrderFromBacklog}
            />
          </div>
        )}
      </main>

      {showConfirmation && (
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title={glassToDelete?.isGroupDelete ? "Delete Glass Group" : "Delete Glass"}
          message={
            glassToDelete?.isGroupDelete 
              ? `Are you sure you want to delete all ${glassToDelete.affectedItems} glass entries for ${glassToDelete.width}" × ${glassToDelete.height}" ${glassToDelete.color}? This will delete ${glassToDelete.totalCount} total pieces including reservations.`
              : `Are you sure you want to delete this glass entry: ${glassToDelete?.width}" × ${glassToDelete?.height}" ${glassToDelete?.color}?`
          }
          confirmText="Delete"
          type="danger"
        />
      )}

      {showBacklogConfirmation && (
        <ConfirmationModal
          isOpen={showBacklogConfirmation}
          onClose={cancelMoveToBacklog}
          onConfirm={confirmMoveToBacklog}
          title="Move Reservation to Backlog"
          message={
            glassToBacklog 
              ? `Are you sure you want to move this reservation to backlog?\n\nGlass: ${glassToBacklog.width}" × ${glassToBacklog.height}" ${glassToBacklog.color}\nProject: ${glassToBacklog.reservedProject}\nQuantity: ${glassToBacklog.count}\n\nThis will make the glass available again and store the reservation in backlog for future reallocation.`
              : ''
          }
          confirmText="Move to Backlog"
          type="warning"
        />
      )}
    </div>
  )
}

export default App
