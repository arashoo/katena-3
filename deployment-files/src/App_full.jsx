import { useState, useEffect } from 'react'
import GlassTable from './components/GlassTable'
import AddGlassForm from './components/AddGlassForm'
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
  const [showDashboard, setShowDashboard] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [glassToDelete, setGlassToDelete] = useState(null)

  // Load data from localStorage or use sample data
  useEffect(() => {
    const savedData = localStorage.getItem('glassInventory')
    
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      setGlasses(parsedData)
      setFilteredGlasses(parsedData)
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

    setGlasses(sampleGlasses)
    setFilteredGlasses(sampleGlasses)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Glass Inventory Management System</h1>
        <div className="stats">
          <span>Total: {glasses.reduce((sum, glass) => sum + glass.count, 0)}</span>
          <span>Available: {glasses.filter(glass => !glass.reservedProject).reduce((sum, glass) => sum + glass.count, 0)}</span>
          <span>Reserved: {glasses.filter(glass => glass.reservedProject).reduce((sum, glass) => sum + glass.count, 0)}</span>
        </div>
        <div className="header-controls">
          <button 
            className="add-glass-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add New Glass'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <p>Testing basic rendering...</p>
        <p>Glasses count: {glasses.length}</p>
        <p>Filtered glasses count: {filteredGlasses.length}</p>
      </main>
    </div>
  )
}

export default App
