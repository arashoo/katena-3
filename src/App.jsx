import { useState, useEffect } from 'react'
import GlassTable from './components/GlassTable'
import AddGlassForm from './components/AddGlassForm'
import EmailOrder from './components/EmailOrder'
import SearchBar from './components/SearchBar'
import AdvancedFilters from './components/AdvancedFilters'
import ExportControls from './components/ExportControls'
import Dashboard from './components/Dashboard'
import BacklogManager from './components/BacklogManager'
import Projects from './components/Projects'
import ConfirmationModal from './components/ConfirmationModal'
import apiService from './services/apiService'
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

  // Load data from backend on startup
  useEffect(() => {
    loadDataFromBackend()
  }, [])

  const loadDataFromBackend = async () => {
    try {
      // Load glasses from backend
      const glassesData = await apiService.getGlasses()
      setGlasses(glassesData)
      applyFiltersAndSearch(glassesData, '', filters, sortConfig)

      // Load backlog from backend
      const backlogData = await apiService.getBacklog()
      setBacklogReservations(backlogData)
    } catch (error) {
      console.error('Failed to load data from backend:', error)
      // Fallback to localStorage if backend is not available
      const savedGlasses = localStorage.getItem('glassInventory')
      const savedBacklog = localStorage.getItem('backlogReservations')
      
      if (savedGlasses) {
        const parsedGlasses = JSON.parse(savedGlasses)
        setGlasses(parsedGlasses)
        applyFiltersAndSearch(parsedGlasses, '', filters, sortConfig)
      }
      
      if (savedBacklog) {
        setBacklogReservations(JSON.parse(savedBacklog))
      }
    }
  }

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

  // Load backlog from localStorage on startup
  useEffect(() => {
    const savedBacklog = localStorage.getItem('backlogReservations')
    if (savedBacklog) {
      setBacklogReservations(JSON.parse(savedBacklog))
    }
  }, [])

  const addGlass = async (glassData) => {
    try {
      const newGlass = await apiService.addGlass(glassData)
      const updatedGlasses = [...glasses, newGlass]
      setGlasses(updatedGlasses)
      applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
      // Keep localStorage as backup
      localStorage.setItem('glassInventory', JSON.stringify(updatedGlasses))
    } catch (error) {
      console.error('Failed to add glass:', error)
      // Fallback to local-only add
      const newGlass = {
        ...glassData,
        id: Date.now() + Math.random(),
        dateAdded: new Date().toLocaleDateString()
      }
      const updatedGlasses = [...glasses, newGlass]
      setGlasses(updatedGlasses)
      applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
      localStorage.setItem('glassInventory', JSON.stringify(updatedGlasses))
    }
  }

  const updateGlass = async (id, updatedData) => {
    try {
      await apiService.updateGlass(id, updatedData)
      const updatedGlasses = glasses.map(glass => 
        glass.id === id ? { ...glass, ...updatedData } : glass
      )
      setGlasses(updatedGlasses)
      applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
      // Keep localStorage as backup
      localStorage.setItem('glassInventory', JSON.stringify(updatedGlasses))
    } catch (error) {
      console.error('Failed to update glass:', error)
      // Fallback to local-only update
      const updatedGlasses = glasses.map(glass => 
        glass.id === id ? { ...glass, ...updatedData } : glass
      )
      setGlasses(updatedGlasses)
      applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
      localStorage.setItem('glassInventory', JSON.stringify(updatedGlasses))
    }
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

  const deleteGlass = async (id) => {
    const glassToDelete = glasses.find(glass => glass.id === id)
    if (!glassToDelete) return
    
    try {
      await apiService.deleteGlass(id)
      
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
      // Keep localStorage as backup
      localStorage.setItem('glassInventory', JSON.stringify(updatedGlasses))
    } catch (error) {
      console.error('Failed to delete glass:', error)
      // Continue with local delete as fallback
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
      localStorage.setItem('glassInventory', JSON.stringify(updatedGlasses))
    }
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

  const allocateFromBacklog = (backlogItemId) => {
    const backlogItem = backlogReservations.find(item => item.id === backlogItemId)
    if (!backlogItem) return

    // Check available inventory
    const availableGlass = glasses.find(glass => 
      !glass.reservedProject &&
      glass.width === backlogItem.width &&
      glass.height === backlogItem.height &&
      glass.color === backlogItem.color &&
      glass.heatSoaked === backlogItem.heatSoaked
    )

    // Remove from backlog first
    setBacklogReservations(prev => prev.filter(item => item.id !== backlogItemId))
    
    // Create new reservation with original project name
    const newReservation = {
      ...backlogItem,
      reservedProject: backlogItem.originalProject,
      dateAdded: new Date().toLocaleDateString(),
      id: Date.now() + Math.random() // New ID for the new reservation
    }
    
    let updatedGlasses = [...glasses]
    
    if (availableGlass && availableGlass.count >= backlogItem.count) {
      // Sufficient inventory - normal allocation
      updatedGlasses = updatedGlasses.map(glass =>
        glass.id === availableGlass.id 
          ? { ...glass, count: glass.count - backlogItem.count }
          : glass
      )
      
      // Add new reservation
      updatedGlasses.push(newReservation)
      
      setGlasses(updatedGlasses)
      applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
      
      // Show success message
      alert(`Successfully allocated ${backlogItem.count} pieces of ${backlogItem.width}" × ${backlogItem.height}" ${backlogItem.color} to ${backlogItem.originalProject}`)
      
    } else if (availableGlass) {
      // Partial inventory - allocate what's available and create negative balance
      const availableCount = availableGlass.count
      const shortage = backlogItem.count - availableCount
      
      // Reduce available inventory to 0
      updatedGlasses = updatedGlasses.map(glass =>
        glass.id === availableGlass.id 
          ? { ...glass, count: 0 }
          : glass
      )
      
      // Add new reservation for full amount
      updatedGlasses.push(newReservation)
      
      setGlasses(updatedGlasses)
      applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
      
      // Show warning message
      alert(`Allocated ${backlogItem.count} pieces (${availableCount} from inventory, ${shortage} short) to ${backlogItem.originalProject}. You need to order ${shortage} more pieces.`)
      
    } else {
      // No inventory available - create reservation anyway
      updatedGlasses.push(newReservation)
      
      setGlasses(updatedGlasses)
      applyFiltersAndSearch(updatedGlasses, searchTerm, filters, sortConfig)
      
      // Show warning message
      alert(`Allocated ${backlogItem.count} pieces to ${backlogItem.originalProject} with no inventory available. You need to order ${backlogItem.count} pieces.`)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    applyFiltersAndSearch(glasses, searchTerm, newFilters, sortConfig)
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
          <button 
            className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            🏗️ Projects
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
                onFilterChange={handleFilterChange}
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
              onAllocate={allocateFromBacklog}
              onDelete={deleteFromBacklog}
              availableGlasses={glasses.filter(glass => !glass.reservedProject)}
              onOpenOrderGlass={handleOpenOrderFromBacklog}
            />
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="tab-content">
            <Projects glasses={glasses} />
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
