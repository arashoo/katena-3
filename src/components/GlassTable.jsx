import React, { useState, useMemo, useCallback, useRef } from 'react'
import ReservationModal from './ReservationModal'
import ReservationEditModal from './ReservationEditModal'
import './GlassTable.css'

function GlassTable({ glasses, onUpdateGlass, onDeleteGlass, onMoveToBacklog, onSort, sortConfig, onReserveGlass, onUpdateReservation, onSwitchToBacklog }) {
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [exitingEdit, setExitingEdit] = useState(false)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedGlass, setSelectedGlass] = useState(null)
  const [showReservationEditModal, setShowReservationEditModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [editingProject, setEditingProject] = useState(null) // { glassId, projectIndex }
  const [editingProjectData, setEditingProjectData] = useState({})
  
  // State for search input values
  const [widthSearchValue, setWidthSearchValue] = useState('')
  const [heightSearchValue, setHeightSearchValue] = useState('')
  const [colorSearchValue, setColorSearchValue] = useState('')
  const [thicknessSearchValue, setThicknessSearchValue] = useState('')
  const [projectSearchValue, setProjectSearchValue] = useState('')
  
  // Debounced search values for actual filtering
  const [debouncedWidthSearch, setDebouncedWidthSearch] = useState('')
  const [debouncedHeightSearch, setDebouncedHeightSearch] = useState('')
  const [debouncedColorSearch, setDebouncedColorSearch] = useState('')
  const [debouncedThicknessSearch, setDebouncedThicknessSearch] = useState('')
  const [debouncedProjectSearch, setDebouncedProjectSearch] = useState('')
  
  // Loading state for search operations
  const [isFiltering, setIsFiltering] = useState(false)
  
  // Refs for debounce timers
  const widthTimeoutRef = useRef(null)
  const heightTimeoutRef = useRef(null)
  const colorTimeoutRef = useRef(null)
  const thicknessTimeoutRef = useRef(null)
  const projectTimeoutRef = useRef(null)

  // Debounced search handlers
  const handleWidthSearch = useCallback((value) => {
    setWidthSearchValue(value)
    setIsFiltering(!!value)
    if (widthTimeoutRef.current) clearTimeout(widthTimeoutRef.current)
    widthTimeoutRef.current = setTimeout(() => {
      setDebouncedWidthSearch(value)
      setIsFiltering(false)
    }, 300)
  }, [])

  const handleHeightSearch = useCallback((value) => {
    setHeightSearchValue(value)
    setIsFiltering(!!value)
    if (heightTimeoutRef.current) clearTimeout(heightTimeoutRef.current)
    heightTimeoutRef.current = setTimeout(() => {
      setDebouncedHeightSearch(value)
      setIsFiltering(false)
    }, 300)
  }, [])

  const handleColorSearch = useCallback((value) => {
    setColorSearchValue(value)
    setIsFiltering(!!value)
    if (colorTimeoutRef.current) clearTimeout(colorTimeoutRef.current)
    colorTimeoutRef.current = setTimeout(() => {
      setDebouncedColorSearch(value)
      setIsFiltering(false)
    }, 300)
  }, [])

  const handleThicknessSearch = useCallback((value) => {
    setThicknessSearchValue(value)
    setIsFiltering(!!value)
    if (thicknessTimeoutRef.current) clearTimeout(thicknessTimeoutRef.current)
    thicknessTimeoutRef.current = setTimeout(() => {
      setDebouncedThicknessSearch(value)
      setIsFiltering(false)
    }, 300)
  }, [])

  const handleProjectSearch = useCallback((value) => {
    setProjectSearchValue(value)
    setIsFiltering(!!value)
    if (projectTimeoutRef.current) clearTimeout(projectTimeoutRef.current)
    projectTimeoutRef.current = setTimeout(() => {
      setDebouncedProjectSearch(value)
      setIsFiltering(false)
    }, 300)
  }, [])

  // Apply search filtering and sorting
  const filteredGlasses = useMemo(() => {
    let filtered = glasses
    
    // Apply width search
    if (debouncedWidthSearch.trim()) {
      filtered = filtered.filter(glass => 
        String(glass.width || '').toLowerCase().includes(debouncedWidthSearch.toLowerCase())
      )
    }
    
    // Apply height search  
    if (debouncedHeightSearch.trim()) {
      filtered = filtered.filter(glass => 
        String(glass.height || '').toLowerCase().includes(debouncedHeightSearch.toLowerCase())
      )
    }
    
    // Apply color search
    if (debouncedColorSearch.trim()) {
      filtered = filtered.filter(glass => 
        String(glass.color || '').toLowerCase().includes(debouncedColorSearch.toLowerCase())
      )
    }
    
    // Apply thickness search
    if (debouncedThicknessSearch.trim()) {
      filtered = filtered.filter(glass => 
        String(glass.thickness || '6mm').toLowerCase().includes(debouncedThicknessSearch.toLowerCase())
      )
    }

    // Apply project search
    if (debouncedProjectSearch.trim()) {
      filtered = filtered.filter(glass => {
        if (!glass.reservedProjects || glass.reservedProjects.length === 0) {
          // If searching and glass has no projects, check if searching for "none" or similar
          return 'none'.includes(debouncedProjectSearch.toLowerCase())
        }
        
        // Search in project names
        return glass.reservedProjects.some(project => {
          if (!project) return false
          
          const projectName = typeof project === 'string' 
            ? project 
            : project.projectName || ''
          
          return projectName.toLowerCase().includes(debouncedProjectSearch.toLowerCase())
        })
      })
    }
    
    // Apply sorting if sortConfig is provided
    if (sortConfig && sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        // Handle numeric sorting for numeric fields
        if (['width', 'height', 'count', 'availableCount', 'reservedCount'].includes(sortConfig.key)) {
          const aNum = parseFloat(aValue) || 0
          const bNum = parseFloat(bValue) || 0
          if (sortConfig.direction === 'asc') {
            return aNum - bNum
          } else {
            return bNum - aNum
          }
        }
        
        // Handle boolean sorting for heatSoaked
        if (sortConfig.key === 'heatSoaked') {
          const aBool = Boolean(aValue)
          const bBool = Boolean(bValue)
          if (sortConfig.direction === 'asc') {
            return aBool === bBool ? 0 : (aBool ? 1 : -1)
          } else {
            return aBool === bBool ? 0 : (aBool ? -1 : 1)
          }
        }
        
        // Handle string sorting for other fields (color, thickness, etc.)
        const aStr = String(aValue || '').toLowerCase()
        const bStr = String(bValue || '').toLowerCase()
        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr)
        } else {
          return bStr.localeCompare(aStr)
        }
      })
    }
    
    return filtered
  }, [glasses, debouncedWidthSearch, debouncedHeightSearch, debouncedColorSearch, debouncedThicknessSearch, debouncedProjectSearch, sortConfig])

  // Helper function to format reserved projects display
  const formatReservedProjects = (reservedProjects) => {
    if (!reservedProjects || reservedProjects.length === 0) {
      return 'None'
    }
    
    // Handle both old format (array of strings) and new format (array of objects)
    const projectNames = reservedProjects
      .filter(project => project != null) // Filter out null/undefined values
      .map(project => {
        if (typeof project === 'string') {
          return project
        } else if (project && project.projectName) {
          return `${project.projectName} (${project.quantity})`
        }
        return 'Unknown'
      })
    
    return projectNames.length > 0 ? projectNames.join(', ') : 'None'
  }

  // Helper function to get project tooltip
  const getProjectTooltip = (reservedProjects) => {
    if (!reservedProjects || reservedProjects.length === 0) {
      return 'No reservations'
    }
    
    const projectDetails = reservedProjects
      .filter(project => project != null) // Filter out null/undefined values
      .map(project => {
        if (typeof project === 'string') {
          return project
        } else if (project && project.projectName) {
          return `${project.projectName}: ${project.quantity} pieces`
        }
        return 'Unknown project'
      })
    
    return projectDetails.length > 0 ? projectDetails.join('\n') : 'No valid reservations'
  }

  const handleReserveClick = useCallback((glass) => {
    if (glass.availableCount <= 0) {
      alert('No available pieces to reserve')
      return
    }
    setSelectedGlass(glass)
    setShowReservationModal(true)
  }, [])

  const handleReservationSubmit = (reservationData) => {
    if (selectedGlass) {
      onReserveGlass(selectedGlass.id, reservationData)
    }
    setShowReservationModal(false)
    setSelectedGlass(null)
  }

  const handleReservationCancel = () => {
    setShowReservationModal(false)
    setSelectedGlass(null)
  }

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return '↕️'
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const startEdit = (glass) => {
    setEditingId(glass.id)
    setEditData({ ...glass })
  }

  const cancelEdit = () => {
    setExitingEdit(true)
    setTimeout(() => {
      setEditingId(null)
      setEditData({})
      setExitingEdit(false)
    }, 200)
  }

  const saveEdit = () => {
    setExitingEdit(true)
    setTimeout(() => {
      onUpdateGlass(editingId, editData)
      setEditingId(null)
      setEditData({})
      setExitingEdit(false)
    }, 200)
  }

  const handleInputChange = (field, value) => {
    setEditData({ ...editData, [field]: value })
  }

  const formatRacks = (racks) => {
    if (!racks || racks.length === 0) return 'No rack'
    if (racks.length === 1) return racks[0]
    if (racks.length <= 3) return racks.join(', ')
    return `${racks.slice(0, 2).join(', ')} +${racks.length - 2} more`
  }

  // Helper function to get reservation status class
  const getReservationStatusClass = (glass) => {
    const totalCount = glass.count || 0
    const reservedCount = glass.reservedCount || 0
    
    if (reservedCount === 0) {
      return '' // No reservation
    } else if (reservedCount >= totalCount) {
      return 'fully-reserved' // Deep yellow
    } else {
      return 'partially-reserved' // Light yellow
    }
  }

  // Handle row click for reserved glasses
  const handleRowClick = useCallback((glass, event) => {
    // Don't expand if clicking on buttons or input fields
    if (event.target.tagName === 'BUTTON' || 
        event.target.tagName === 'INPUT' || 
        event.target.tagName === 'SELECT' ||
        event.target.closest('.action-buttons')) {
      return
    }

    // Only expand if glass has reservations
    if (glass.reservedCount > 0 && glass.reservedProjects && glass.reservedProjects.length > 0) {
      setExpandedRows(prev => {
        const newExpandedRows = new Set(prev)
        if (prev.has(glass.id)) {
          newExpandedRows.delete(glass.id)
        } else {
          newExpandedRows.add(glass.id)
        }
        return newExpandedRows
      })
    }
  }, [])

  // Check if a row is expanded
  const isRowExpanded = (glassId) => {
    return expandedRows.has(glassId)
  }

  // Project editing functions
  const startProjectEdit = (glassId, projectIndex, project) => {
    setEditingProject({ glassId, projectIndex })
    setEditingProjectData({
      projectName: typeof project === 'string' ? project : project.projectName,
      quantity: typeof project === 'string' ? 0 : project.quantity
    })
  }

  const cancelProjectEdit = () => {
    setEditingProject(null)
    setEditingProjectData({})
  }

  const saveProjectEdit = () => {
    if (!editingProject) return

    const { glassId, projectIndex } = editingProject
    const glass = glasses.find(g => g.id === glassId)
    if (!glass) return

    // Validate input data
    const newQuantity = Math.max(0, Math.floor(editingProjectData.quantity || 0))
    const projectName = (editingProjectData.projectName || '').trim()

    if (newQuantity <= 0) {
      alert('Project quantity must be a positive whole number.')
      return
    }

    if (!projectName) {
      alert('Project name cannot be empty.')
      return
    }

    // Calculate quantity difference
    const oldProject = (glass.reservedProjects || [])[projectIndex]
    const oldQuantity = typeof oldProject === 'string' ? 0 : (oldProject?.quantity || 0)
    const quantityDiff = newQuantity - oldQuantity

    // Calculate what the new total reserved count would be
    const currentReservedCount = Math.max(0, Math.floor(glass.reservedCount || 0))
    const newTotalReservedCount = currentReservedCount + quantityDiff
    const totalGlassCount = Math.max(0, Math.floor(glass.count || 0))

    // Validation Rule 1: Reserved count cannot exceed total count
    if (newTotalReservedCount > totalGlassCount) {
      const availableCount = totalGlassCount - currentReservedCount + oldQuantity
      alert(
        `❌ Insufficient inventory!\n\n` +
        `RULE VIOLATION: Reserved count cannot exceed total inventory.\n\n` +
        `You're trying to reserve ${newQuantity} pieces, but only ${availableCount} pieces are available.\n\n` +
        `Current inventory breakdown:\n` +
        `• Total glass: ${totalGlassCount} pieces\n` +
        `• Currently reserved: ${currentReservedCount} pieces\n` +
        `• Available for this edit: ${availableCount} pieces\n\n` +
        `Please reduce the quantity to ${availableCount} or less.`
      )
      return
    }
    
    // Validation Rule 2: Available count cannot exceed total count
    const newAvailableCount = totalGlassCount - newTotalReservedCount
    if (newAvailableCount > totalGlassCount) {
      alert(
        `❌ Data integrity error!\n\n` +
        `RULE VIOLATION: Available count cannot exceed total inventory.\n\n` +
        `This should not happen. Please refresh the page and try again.`
      )
      return
    }
    
    // Validation Rule 3: Available count cannot be negative
    if (newAvailableCount < 0) {
      alert(
        `❌ Invalid allocation!\n\n` +
        `RULE VIOLATION: Available count cannot be negative.\n\n` +
        `This allocation would result in ${Math.abs(newAvailableCount)} pieces in deficit.`
      )
      return
    }

    // Create updated glass object
    const updatedGlass = { ...glass }
    const updatedProjects = [...(updatedGlass.reservedProjects || [])]

    // Update the project
    updatedProjects[projectIndex] = {
      projectName: projectName,
      quantity: newQuantity,
      reservations: typeof oldProject === 'string' ? [] : oldProject.reservations || [],
      dateAdded: oldProject.dateAdded || new Date().toISOString(),
      notes: oldProject.notes || ''
    }

    // Update glass counts with validated numbers
    updatedGlass.reservedProjects = updatedProjects
    updatedGlass.reservedCount = Math.max(0, currentReservedCount + quantityDiff)
    updatedGlass.availableCount = totalGlassCount - updatedGlass.reservedCount
    
    // Final validation: Ensure all rules are satisfied
    if (updatedGlass.availableCount < 0) {
      alert('❌ Critical Error: Available count became negative. Operation cancelled.')
      return
    }
    
    if (updatedGlass.reservedCount > totalGlassCount) {
      alert('❌ Critical Error: Reserved count exceeds total. Operation cancelled.')
      return
    }
    
    if (updatedGlass.availableCount > totalGlassCount) {
      alert('❌ Critical Error: Available count exceeds total. Operation cancelled.')
      return
    }
    
    // Ensure total consistency: available + reserved should equal total
    const calculatedTotal = updatedGlass.availableCount + updatedGlass.reservedCount
    if (calculatedTotal !== totalGlassCount) {
      console.warn(`Glass ${glassId}: Adjusting total count from ${totalGlassCount} to ${calculatedTotal} to maintain consistency`)
      updatedGlass.count = calculatedTotal
    }

    // Call the update function
    onUpdateGlass(glassId, updatedGlass)

    // Clear editing state
    setEditingProject(null)
    setEditingProjectData({})
  }

  const handleProjectInputChange = (field, value) => {
    setEditingProjectData({ ...editingProjectData, [field]: value })
  }

  // Function to get the maximum quantity that can be reserved for the current project edit
  const getMaxEditableQuantity = (glassId, projectIndex) => {
    const glass = glasses.find(g => g.id === glassId)
    if (!glass) return 0

    const totalGlassCount = Math.max(0, Math.floor(glass.count || 0))
    const currentReservedCount = Math.max(0, Math.floor(glass.reservedCount || 0))
    const currentProject = (glass.reservedProjects || [])[projectIndex]
    const currentProjectQuantity = typeof currentProject === 'string' ? 0 : (currentProject?.quantity || 0)

    // Available = total - (current reserved - current project quantity)
    return totalGlassCount - currentReservedCount + currentProjectQuantity
  }

  // Function to validate quantity input in real-time
  const validateQuantityInput = (glassId, projectIndex, quantity) => {
    const maxQuantity = getMaxEditableQuantity(glassId, projectIndex)
    const numQuantity = Math.max(0, Math.floor(quantity || 0))
    
    if (numQuantity > maxQuantity) {
      return {
        isValid: false,
        message: `Maximum available: ${maxQuantity} pieces`,
        maxQuantity: maxQuantity
      }
    }
    
    if (numQuantity <= 0) {
      return {
        isValid: false,
        message: 'Must be at least 1 piece',
        maxQuantity: maxQuantity
      }
    }
    
    return {
      isValid: true,
      message: `${maxQuantity} pieces available`,
      maxQuantity: maxQuantity
    }
  }

  const deleteProject = (glassId, projectIndex) => {
    if (!confirm('Are you sure you want to delete this project reservation?')) return

    const glass = glasses.find(g => g.id === glassId)
    if (!glass) return

    const updatedGlass = { ...glass }
    const updatedProjects = [...(updatedGlass.reservedProjects || [])]
    const projectToDelete = updatedProjects[projectIndex]
    
    // Calculate quantity to remove
    const quantityToRemove = typeof projectToDelete === 'string' ? 0 : projectToDelete.quantity

    // Remove the project
    updatedProjects.splice(projectIndex, 1)

    // Update glass counts
    updatedGlass.reservedProjects = updatedProjects
    updatedGlass.reservedCount = (updatedGlass.reservedCount || 0) - quantityToRemove
    updatedGlass.availableCount = updatedGlass.count - updatedGlass.reservedCount

    // Call the update function
    onUpdateGlass(glassId, updatedGlass)

    // If no more projects, collapse the row
    if (updatedProjects.length === 0) {
      const newExpandedRows = new Set(expandedRows)
      newExpandedRows.delete(glassId)
      setExpandedRows(newExpandedRows)
    }
  }

  const allocateAvailableGlass = (glassId) => {
    const glass = glasses.find(g => g.id === glassId)
    if (!glass || !glass.reservedProjects || glass.reservedProjects.length === 0 || glass.availableCount <= 0) {
      return
    }

    const updatedGlass = { ...glass }
    const projects = [...(updatedGlass.reservedProjects || [])]
    const availableToAllocate = updatedGlass.availableCount
    const projectCount = projects.filter(p => p != null).length

    if (projectCount === 0) return

    // Calculate equal allocation per project
    const baseAllocation = Math.floor(availableToAllocate / projectCount)
    const remainder = availableToAllocate % projectCount

    // Convert string projects to objects with quantities and allocate glass
    const updatedProjects = projects.map((project, index) => {
      if (project == null) return project

      // Calculate allocation for this project (give remainder to first projects)
      const allocation = baseAllocation + (index < remainder ? 1 : 0)

      if (typeof project === 'string') {
        // Convert string to object with allocated quantity
        return {
          projectName: project,
          quantity: allocation,
          reservations: [{
            id: `auto-${Date.now()}-${index}`,
            reservedDate: new Date().toISOString()
          }]
        }
      } else {
        // Update existing project object
        return {
          ...project,
          quantity: (project.quantity || 0) + allocation
        }
      }
    })

    // Update glass counts
    updatedGlass.reservedProjects = updatedProjects
    updatedGlass.reservedCount = availableToAllocate
    updatedGlass.availableCount = 0

    // Call the update function
    onUpdateGlass(glassId, updatedGlass)
  }

  const moveProjectToBacklog = (glassId, projectIndex, project) => {
    if (!confirm('Are you sure you want to move this project reservation to backlog?')) return

    const glass = glasses.find(g => g.id === glassId)
    if (!glass) return

    // Create backlog entry with the correct format
    const backlogEntry = {
      width: glass.width,
      height: glass.height,
      color: glass.color,
      heatSoaked: glass.heatSoaked,
      quantity: typeof project === 'string' ? 0 : project.quantity,
      projectName: typeof project === 'string' ? project : project.projectName,
      reservedDate: project.reservations && project.reservations.length > 0 
        ? project.reservations[0].reservedDate 
        : new Date().toISOString()
    }

    // Move to backlog via API
    onMoveToBacklog(backlogEntry)

    // Remove from current reservations (same logic as delete)
    const updatedGlass = { ...glass }
    const updatedProjects = [...(updatedGlass.reservedProjects || [])]
    const quantityToRemove = typeof project === 'string' ? 0 : project.quantity

    // Remove the project
    updatedProjects.splice(projectIndex, 1)

    // Update glass counts
    updatedGlass.reservedProjects = updatedProjects
    updatedGlass.reservedCount = (updatedGlass.reservedCount || 0) - quantityToRemove
    updatedGlass.availableCount = updatedGlass.count - updatedGlass.reservedCount

    // Call the update function
    onUpdateGlass(glassId, updatedGlass)

    // If no more projects, collapse the row
    if (updatedProjects.length === 0) {
      const newExpandedRows = new Set(expandedRows)
      newExpandedRows.delete(glassId)
      setExpandedRows(newExpandedRows)
    }

    // Switch to backlog tab to show the moved item
    if (onSwitchToBacklog) {
      setTimeout(() => {
        onSwitchToBacklog()
      }, 500) // Small delay to allow the move operation to complete
    }
  }

  return (
    <div className="glass-table-container">
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {/* Search input fields - always visible above corresponding columns */}
      <table className="search-inputs-table">
        <tbody>
          <tr>
            <td className="search-input-cell">
              <input
                type="text"
                value={widthSearchValue}
                onChange={(e) => handleWidthSearch(e.target.value)}
                placeholder="Search width..."
                className="column-search-input"
              />
            </td>
            <td className="search-input-cell">
              <input
                type="text"
                value={heightSearchValue}
                onChange={(e) => handleHeightSearch(e.target.value)}
                placeholder="Search height..."
                className="column-search-input"
              />
            </td>
            <td className="search-input-cell">
              <input
                type="text"
                value={colorSearchValue}
                onChange={(e) => handleColorSearch(e.target.value)}
                placeholder="Search color..."
                className="column-search-input"
              />
            </td>
            <td className="search-input-cell">
              <input
                type="text"
                value={thicknessSearchValue}
                onChange={(e) => handleThicknessSearch(e.target.value)}
                placeholder="Search thickness..."
                className="column-search-input"
              />
            </td>
            <td className="search-input-cell"></td>
            <td className="search-input-cell">
              <input
                type="text"
                value={projectSearchValue}
                onChange={(e) => handleProjectSearch(e.target.value)}
                placeholder="Search projects..."
                className="column-search-input"
              />
            </td>
            <td className="search-input-cell"></td>
          </tr>
        </tbody>
      </table>
      
      <table className="glass-table">
        <thead>
          <tr>
            <th onClick={() => onSort('width')} className="sortable">
              Width {getSortIcon('width')}
            </th>
            <th onClick={() => onSort('height')} className="sortable">
              Height {getSortIcon('height')}
            </th>
            <th onClick={() => onSort('color')} className="sortable">
              Color {getSortIcon('color')}
            </th>
            <th onClick={() => onSort('thickness')} className="sortable">
              Thickness {getSortIcon('thickness')}
            </th>
            <th onClick={() => onSort('heatSoaked')} className="sortable">
              Heat Soaked {getSortIcon('heatSoaked')}
            </th>
            <th onClick={() => onSort('count')} className="sortable">
              Total Count {getSortIcon('count')}
            </th>
            <th onClick={() => onSort('availableCount')} className="sortable">
              Available {getSortIcon('availableCount')}
            </th>
            <th onClick={() => onSort('reservedCount')} className="sortable">
              Reserved {getSortIcon('reservedCount')}
            </th>
            <th>
              Rack
            </th>
            <th>Res Projects</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isFiltering ? (
            <tr>
              <td colSpan="11" className="no-results">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span>Filtering...</span>
                  <div style={{ width: '20px', height: '20px', border: '2px solid #f3f3f3', borderTop: '2px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              </td>
            </tr>
          ) : filteredGlasses.length === 0 ? (
            <tr>
              <td colSpan="11" className="no-results">
                {glasses.length === 0 ? 'No glass inventory found' : 'No glasses match the current filters'}
              </td>
            </tr>
          ) : (
            filteredGlasses.filter(glass => glass).map((glass, glassIndex) => (
            <React.Fragment key={`${glass.id}-${glassIndex}`}>
              <tr 
                className={`${editingId === glass.id ? 'editing' : ''} ${exitingEdit && editingId === glass.id ? 'exiting' : ''} ${getReservationStatusClass(glass)} ${glass.reservedCount > 0 ? 'clickable-row' : ''} ${isRowExpanded(glass.id) ? 'expanded' : ''} ${glass.reservedProjects && glass.reservedProjects.length > 0 ? 'has-projects' : 'no-projects'}`}
                onClick={(e) => handleRowClick(glass, e)}
                style={{ cursor: glass.reservedCount > 0 ? 'pointer' : 'default' }}
              >
              {editingId === glass.id ? (
                // Edit mode
                <>
                  <td>
                    <input
                      type="number"
                      step="0.125"
                      value={editData.width}
                      onChange={(e) => handleInputChange('width', parseFloat(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.125"
                      value={editData.height}
                      onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                    />
                  </td>
                  <td>
                    <select
                      value={editData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                    >
                      <option value="Clear">Clear</option>
                      <option value="Bronze">Bronze</option>
                      <option value="Grey">Grey</option>
                      <option value="Blue">Blue</option>
                      <option value="Green">Green</option>
                      <option value="Acid Etched">Acid Etched</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={editData.thickness || '6mm'}
                      onChange={(e) => handleInputChange('thickness', e.target.value)}
                    >
                      <option value="6mm">6mm</option>
                      <option value="8mm">8mm</option>
                      <option value="10mm">10mm</option>
                      <option value="12mm">12mm</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={editData.heatSoaked}
                      onChange={(e) => handleInputChange('heatSoaked', e.target.value === 'true')}
                    >
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={editData.count}
                      onChange={(e) => handleInputChange('count', parseInt(e.target.value) || 0)}
                    />
                  </td>
                  <td>{editData.availableCount}</td>
                  <td>{editData.reservedCount}</td>
                  <td>
                    <input
                      type="text"
                      value={Array.isArray(editData.racks) ? editData.racks.join(', ') : editData.racks || ''}
                      onChange={(e) => handleInputChange('racks', e.target.value.split(',').map(r => r.trim()).filter(r => r))}
                      placeholder="Rack numbers separated by commas"
                    />
                  </td>
                  <td>{formatReservedProjects(glass.reservedProjects)}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={saveEdit} className="save-btn" title="Save changes">✅</button>
                      <button onClick={cancelEdit} className="cancel-btn" title="Cancel editing">❌</button>
                    </div>
                  </td>
                </>
              ) : (
                // View mode
                <>
                  <td>{glass.width}"</td>
                  <td>{glass.height}"</td>
                  <td>
                    <span className={`color-indicator ${glass.color.toLowerCase().replace(/\s+/g, '-')}`}></span>
                    {glass.color}
                  </td>
                  <td>{glass.thickness || '6mm'}</td>
                  <td>{glass.heatSoaked ? 'Yes' : 'No'}</td>
                  <td className="count-cell">
                    <span className="total-count">{glass.count}</span>
                  </td>
                  <td className="count-cell">
                    <span className={`available-count ${glass.availableCount === 0 ? 'zero' : ''}`}>
                      {glass.availableCount}
                    </span>
                  </td>
                  <td className="count-cell">
                    <span className={`reserved-count ${glass.reservedCount > 0 ? 'has-reserved' : ''}`}>
                      {glass.reservedCount}
                    </span>
                  </td>
                  <td className="rack-cell">
                    <span title={glass.racks ? glass.racks.join(', ') : 'No rack'}>
                      {formatRacks(glass.racks)}
                    </span>
                  </td>
                  <td className="projects-cell">
                    {glass.reservedProjects && glass.reservedProjects.filter(p => p != null).length > 0 ? (
                      <span className="has-projects-badge" title={getProjectTooltip(glass.reservedProjects)}>
                        {glass.reservedProjects.filter(p => p != null).length === 1 
                          ? (typeof glass.reservedProjects.find(p => p != null) === 'string' 
                              ? glass.reservedProjects.find(p => p != null) 
                              : glass.reservedProjects.find(p => p != null)?.projectName || 'Unknown')
                          : `${glass.reservedProjects.filter(p => p != null).length} projects`
                        }
                      </span>
                    ) : (
                      <span className="no-projects-badge">None</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleReserveClick(glass)} 
                        className="reserve-btn"
                        disabled={glass.availableCount <= 0}
                        title={glass.availableCount <= 0 ? 'No available pieces' : `Reserve pieces (${glass.availableCount} available)`}
                      >
                        📋
                      </button>
                      <button onClick={() => startEdit(glass)} className="edit-btn" title="Edit glass">✏️</button>
                      <button onClick={() => onDeleteGlass(glass)} className="delete-btn" title="Delete glass">🗑️</button>
                    </div>
                  </td>
                </>
              )}
            </tr>
            
            {/* Reservation Details Dropdown */}
            {isRowExpanded(glass.id) && glass.reservedProjects && glass.reservedProjects.length > 0 && (
              <tr className="reservation-details-row">
                <td colSpan="10" className="reservation-details-cell">
                  <div className="reservation-details-content">
                    <h4 className="reservation-details-title">Reservation Details</h4>
                    <div className="reservation-projects-list">
                      {glass.reservedProjects.filter(p => p != null).map((project, index) => (
                        <div key={`${glass.id}-project-${index}`} className="reservation-project-item">
                          {editingProject && editingProject.glassId === glass.id && editingProject.projectIndex === index ? (
                            // Edit mode for project
                            <div className="project-edit-form">
                              <div className="project-edit-row">
                                <label>Project Name:</label>
                                <input
                                  type="text"
                                  value={editingProjectData.projectName}
                                  onChange={(e) => handleProjectInputChange('projectName', e.target.value)}
                                  className="project-edit-input"
                                />
                              </div>
                              <div className="project-edit-row">
                                <label>Quantity:</label>
                                {(() => {
                                  const validation = validateQuantityInput(glass.id, index, editingProjectData.quantity)
                                  return (
                                    <div className="quantity-input-container">
                                      <input
                                        type="number"
                                        min="1"
                                        max={validation.maxQuantity}
                                        value={editingProjectData.quantity}
                                        onChange={(e) => handleProjectInputChange('quantity', parseInt(e.target.value) || 0)}
                                        className={`project-edit-input ${!validation.isValid ? 'invalid' : 'valid'}`}
                                      />
                                      <div className={`quantity-feedback ${!validation.isValid ? 'error' : 'info'}`}>
                                        {validation.message}
                                      </div>
                                    </div>
                                  )
                                })()}
                              </div>
                              <div className="project-edit-actions">
                                {(() => {
                                  const validation = validateQuantityInput(glass.id, index, editingProjectData.quantity)
                                  return (
                                    <button 
                                      onClick={saveProjectEdit} 
                                      className={`project-save-btn ${!validation.isValid ? 'disabled' : ''}`}
                                      disabled={!validation.isValid}
                                      title={validation.isValid ? "Save changes" : "Please fix quantity before saving"}
                                    >
                                      ✅
                                    </button>
                                  )
                                })()}
                                <button onClick={cancelProjectEdit} className="project-cancel-btn" title="Cancel editing">❌</button>
                              </div>
                            </div>
                          ) : (
                            // View mode for project
                            <>
                              <div className="project-header">
                                <div className="project-name">
                                  📋 {typeof project === 'string' ? project : project.projectName}
                                </div>
                                <div className="project-actions">
                                  <button 
                                    onClick={() => startProjectEdit(glass.id, index, project)} 
                                    className="project-edit-btn" 
                                    title="Edit project"
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    onClick={() => moveProjectToBacklog(glass.id, index, project)} 
                                    className="project-backlog-btn" 
                                    title="Move project to backlog"
                                  >
                                    📦
                                  </button>
                                  <button 
                                    onClick={() => deleteProject(glass.id, index)} 
                                    className="project-delete-btn" 
                                    title="Delete project"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                              <div className="project-quantity">
                                {typeof project === 'string' ? 'Unknown quantity' : `${project.quantity} pieces`}
                              </div>
                              {project.reservations && project.reservations.length > 0 && (
                                <div className="project-reservations">
                                  {project.reservations.map((reservation, resIndex) => (
                                    <div key={`${glass.id}-project-${index}-reservation-${resIndex}`} className="reservation-item">
                                      <span className="reservation-date">
                                        📅 {new Date(reservation.reservedDate).toLocaleDateString()}
                                      </span>
                                      <span className="reservation-id">
                                        ID: {reservation.id.substring(0, 8)}...
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            )}
            </React.Fragment>
            ))
          )}
        </tbody>
      </table>

      {showReservationModal && (
        <ReservationModal
          isOpen={showReservationModal}
          glass={selectedGlass}
          onReserve={handleReservationSubmit}
          onClose={handleReservationCancel}
        />
      )}
      
      {/* Debug info */}
      {showReservationModal && (
        <div style={{position: 'fixed', top: '10px', left: '10px', background: 'white', padding: '10px', zIndex: 99999999999, border: '2px solid black'}}>
          <div>Modal State: {showReservationModal ? 'TRUE' : 'FALSE'}</div>
          <div>Selected Glass: {selectedGlass ? selectedGlass.id : 'NULL'}</div>
          <div>Glass Available: {selectedGlass ? selectedGlass.availableCount : 'N/A'}</div>
        </div>
      )}

      {showReservationEditModal && (
        <ReservationEditModal
          isOpen={showReservationEditModal}
          onClose={() => setShowReservationEditModal(false)}
          reservation={selectedReservation}
          glasses={glasses}
          groupedGlasses={glasses.reduce((groups, glass) => {
            const key = `${glass.width}-${glass.height}-${glass.color}-${glass.heatSoaked}`;
            groups[key] = {
              main: glass,
              available: [],
              reserved: []
            };
            return groups;
          }, {})}
          onSave={onUpdateReservation}
        />
      )}
    </div>
  )
}

export default GlassTable