import { useState, useEffect } from 'react'
import GlassTable from './components/GlassTable'
import AddGlassForm from './components/AddGlassForm'
import EmailOrder from './components/EmailOrder'
import SearchBar from './components/SearchBar'
import AdvancedFilters from './components/AdvancedFilters'
import ExportControls from './components/ExportControls'
import Dashboard from './components/Dashboard'
import ConfirmationModal from './components/ConfirmationModal'
import './App.css'

function App() {
  const [glasses, setGlasses] = useState([])
  const [filteredGlasses, setFilteredGlasses] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEmailOrder, setShowEmailOrder] = useState(false)
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

  // Load data from localStorage or use sample data
  useEffect(() => {
    const savedData = localStorage.getItem('glassInventory')
    
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      setGlasses(parsedData)
      applyFiltersAndSearch(parsedData, '', filters, sortConfig)
    } else {
      // Initialize with sample data only if no saved data exists
      initializeSampleData()
    }
  }, [])

  // Save to localStorage whenever glasses data changes
  useEffect(() => {
    if (glasses.length > 0) {
      localStorage.setItem('glassInventory', JSON.stringify(glasses))
    }
  }, [glasses])

  const initializeSampleData = () => {
    const colors = ['Clear', 'Blue', 'Gray', 'DIV', 'Acid_DIV', 'Bronze', 'Brown'];
    const projects = ['Office Building A', 'Residential Complex B', 'Shopping Mall C', 'Hospital D', 'School E', 'Hotel F', 'Warehouse G'];
    const racks = ['R-001', 'R-002', 'R-003', 'R-004', 'R-005', 'R-006', 'R-007', 'R-008', 'R-009', 'R-010'];
    
    const sampleGlasses = [
      { id: 1, width: 84, height: 60, color: 'Clear', count: 25, heatSoaked: true, reservedProject: '', rackNumber: 'R-001', dateAdded: '9/1/2025' },
      { id: 2, width: 48, height: 36, color: 'Blue', count: 30, heatSoaked: false, reservedProject: '', rackNumber: 'R-002', dateAdded: '9/1/2025' },
      { id: 3, width: 72, height: 48, color: 'Gray', count: 20, heatSoaked: true, reservedProject: '', rackNumber: 'R-003', dateAdded: '9/1/2025' },
      { id: 4, width: 60, height: 42, color: 'Clear', count: 15, heatSoaked: false, reservedProject: '', rackNumber: 'R-004', dateAdded: '9/2/2025' },
      { id: 5, width: 84, height: 60, color: 'DIV', count: 10, heatSoaked: true, reservedProject: '', rackNumber: 'R-005', dateAdded: '9/2/2025' },
      { id: 6, width: 30, height: 18, color: 'Acid_DIV', count: 100, heatSoaked: false, reservedProject: '', rackNumber: 'R-006', dateAdded: '9/2/2025' },
      { id: 7, width: 96, height: 72, color: 'Brown', count: 15, heatSoaked: true, reservedProject: '', rackNumber: 'R-007', dateAdded: '9/3/2025' },
      
      // More reservations
      { id: 106, width: 84, height: 60, color: 'DIV', count: 18, heatSoaked: true, reservedProject: 'Office Building A', rackNumber: 'R-005', dateAdded: '9/8/2025' },
      { id: 107, width: 30, height: 18, color: 'Acid_DIV', count: 35, heatSoaked: false, reservedProject: 'School E', rackNumber: 'R-006', dateAdded: '9/9/2025' },
      { id: 108, width: 30, height: 18, color: 'Acid_DIV', count: 20, heatSoaked: false, reservedProject: 'Warehouse G', rackNumber: 'R-006', dateAdded: '9/9/2025' },
    ];

    // Add more random entries to reach 50+ total
    const additionalEntries = Array.from({ length: 40 }, (_, index) => {
      const widths = [24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96];
      const heights = [18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84];
      
      return {
        id: 200 + index,
        width: widths[Math.floor(Math.random() * widths.length)] + (Math.random() > 0.7 ? 0.125 * Math.floor(Math.random() * 8) : 0),
        height: heights[Math.floor(Math.random() * heights.length)] + (Math.random() > 0.7 ? 0.125 * Math.floor(Math.random() * 8) : 0),
        color: colors[Math.floor(Math.random() * colors.length)],
        count: Math.floor(Math.random() * 20) + 1,
        heatSoaked: Math.random() > 0.5,
        reservedProject: Math.random() > 0.8 ? projects[Math.floor(Math.random() * projects.length)] : '',
        rackNumber: racks[Math.floor(Math.random() * racks.length)],
        dateAdded: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toLocaleDateString()
      };
    });

    const allGlasses = [...sampleGlasses, ...additionalEntries];
    setGlasses(allGlasses);
    applyFiltersAndSearch(allGlasses, '', filters, sortConfig);
  }

  const addGlass = (glassData) => {
    const newGlass = {
      ...glassData,
      id: Date.now(),
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

  const deleteGlass = (id) => {
    const updatedGlasses = glasses.filter(glass => glass.id !== id)
    setGlasses(updatedGlasses)
    applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
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
      id: Date.now(),
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
    const updatedGlasses = glasses.map(glass => {
      if (glass.id === reservationId) {
        return { ...glass, ...updatedData }
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
      deleteGlass(glassToDelete.id)
      setGlassToDelete(null)
      setShowConfirmation(false)
    }
  }

  const cancelDelete = () => {
    setGlassToDelete(null)
    setShowConfirmation(false)
  }

  const totalCount = glasses.reduce((sum, glass) => sum + glass.count, 0)
  const reservedCount = glasses.filter(glass => glass.reservedProject).reduce((sum, glass) => sum + glass.count, 0)
  const availableCount = totalCount - reservedCount

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
              onCancel={() => setShowEmailOrder(false)}
              glasses={glasses}
            />
          </div>
        </div>
      )}

      <main className="app-main">
        <Dashboard glasses={glasses} />
        
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
          onSort={handleSort}
          sortConfig={sortConfig}
          onReserveGlass={reserveGlass}
          onUpdateReservation={updateReservation}
        />
      </main>

      {showConfirmation && (
        <ConfirmationModal
          glass={glassToDelete}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  )
}

export default App
