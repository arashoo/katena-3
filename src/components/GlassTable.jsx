import React, { useState, useMemo } from 'react'
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
  
  // Column filter states
  const [showColumnFilters, setShowColumnFilters] = useState({
    width: false,
    height: false,
    color: false
  })
  const [columnFilters, setColumnFilters] = useState({
    width: '',
    height: '',
    color: ''
  })

  // Filter glasses based on column filters
  const filteredGlasses = useMemo(() => {
    return glasses.filter(glass => {
      const widthMatch = columnFilters.width === '' || 
                       glass.width.toString().includes(columnFilters.width)
      const heightMatch = columnFilters.height === '' || 
                         glass.height.toString().includes(columnFilters.height)
      const colorMatch = columnFilters.color === '' || 
                        glass.color.toLowerCase().includes(columnFilters.color.toLowerCase())
      
      return widthMatch && heightMatch && colorMatch
    })
  }, [glasses, columnFilters])

  const toggleColumnFilter = (column) => {
    setShowColumnFilters(prev => ({
      ...prev,
      [column]: !prev[column]
    }))
  }

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }))
  }

  const clearColumnFilter = (column) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: ''
    }))
    setShowColumnFilters(prev => ({
      ...prev,
      [column]: false
    }))
  }

  const clearAllColumnFilters = () => {
    setColumnFilters({
      width: '',
      height: '',
      color: ''
    })
    setShowColumnFilters({
      width: false,
      height: false,
      color: false
    })
  }

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

  const handleReserveClick = (glass) => {
    console.log('Reserve button clicked for glass:', glass)
    if (glass.availableCount <= 0) {
      alert('No available pieces to reserve')
      return
    }
    console.log('Setting selectedGlass to:', glass)
    setSelectedGlass(glass)
    console.log('Setting showReservationModal to true')
    setShowReservationModal(true)
  }

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
  const handleRowClick = (glass, event) => {
    // Don't expand if clicking on buttons or input fields
    if (event.target.tagName === 'BUTTON' || 
        event.target.tagName === 'INPUT' || 
        event.target.tagName === 'SELECT' ||
        event.target.closest('.action-buttons')) {
      return
    }

    // Only expand if glass has reservations
    if (glass.reservedCount > 0 && glass.reservedProjects && glass.reservedProjects.length > 0) {
      const newExpandedRows = new Set(expandedRows)
      if (expandedRows.has(glass.id)) {
        newExpandedRows.delete(glass.id)
      } else {
        newExpandedRows.add(glass.id)
      }
      setExpandedRows(newExpandedRows)
    }
  }

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

    // Create updated glass object
    const updatedGlass = { ...glass }
    const updatedProjects = [...(updatedGlass.reservedProjects || [])]
    
    // Calculate quantity difference
    const oldProject = updatedProjects[projectIndex]
    const oldQuantity = typeof oldProject === 'string' ? 0 : oldProject.quantity
    const newQuantity = editingProjectData.quantity
    const quantityDiff = newQuantity - oldQuantity

    // Update the project
    updatedProjects[projectIndex] = {
      projectName: editingProjectData.projectName,
      quantity: newQuantity,
      reservations: typeof oldProject === 'string' ? [] : oldProject.reservations || []
    }

    // Update glass counts
    updatedGlass.reservedProjects = updatedProjects
    updatedGlass.reservedCount = (updatedGlass.reservedCount || 0) + quantityDiff
    updatedGlass.availableCount = updatedGlass.count - updatedGlass.reservedCount

    // Call the update function
    onUpdateGlass(glassId, updatedGlass)

    // Clear editing state
    setEditingProject(null)
    setEditingProjectData({})
  }

  const handleProjectInputChange = (field, value) => {
    setEditingProjectData({ ...editingProjectData, [field]: value })
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
      {/* Column Filter Controls */}
      {(columnFilters.width || columnFilters.height || columnFilters.color) && (
        <div className="active-filters">
          <span className="filter-label">Active Filters:</span>
          {columnFilters.width && (
            <span className="filter-tag">
              Width: {columnFilters.width}
              <button onClick={() => clearColumnFilter('width')} className="clear-filter">×</button>
            </span>
          )}
          {columnFilters.height && (
            <span className="filter-tag">
              Height: {columnFilters.height}
              <button onClick={() => clearColumnFilter('height')} className="clear-filter">×</button>
            </span>
          )}
          {columnFilters.color && (
            <span className="filter-tag">
              Color: {columnFilters.color}
              <button onClick={() => clearColumnFilter('color')} className="clear-filter">×</button>
            </span>
          )}
          <button onClick={clearAllColumnFilters} className="clear-all-filters">Clear All</button>
        </div>
      )}
      
      <table className="glass-table">
        <thead>
          <tr>
            <th className="filterable-column">
              <div className="column-header">
                <span onClick={() => onSort('width')} className="sortable">
                  Width {getSortIcon('width')}
                </span>
                <button 
                  onClick={() => toggleColumnFilter('width')} 
                  className={`filter-toggle ${showColumnFilters.width ? 'active' : ''}`}
                  title="Filter by width"
                >
                  🔍
                </button>
              </div>
              {showColumnFilters.width && (
                <div className="column-filter">
                  <input
                    type="text"
                    placeholder="Search width..."
                    value={columnFilters.width}
                    onChange={(e) => handleColumnFilterChange('width', e.target.value)}
                    className="filter-input"
                    autoFocus
                  />
                </div>
              )}
            </th>
            <th className="filterable-column">
              <div className="column-header">
                <span onClick={() => onSort('height')} className="sortable">
                  Height {getSortIcon('height')}
                </span>
                <button 
                  onClick={() => toggleColumnFilter('height')} 
                  className={`filter-toggle ${showColumnFilters.height ? 'active' : ''}`}
                  title="Filter by height"
                >
                  🔍
                </button>
              </div>
              {showColumnFilters.height && (
                <div className="column-filter">
                  <input
                    type="text"
                    placeholder="Search height..."
                    value={columnFilters.height}
                    onChange={(e) => handleColumnFilterChange('height', e.target.value)}
                    className="filter-input"
                    data-testid="height-filter"
                  />
                </div>
              )}
            </th>
            <th className="filterable-column">
              <div className="column-header">
                <span onClick={() => onSort('color')} className="sortable">
                  Color {getSortIcon('color')}
                </span>
                <button 
                  onClick={() => toggleColumnFilter('color')} 
                  className={`filter-toggle ${showColumnFilters.color ? 'active' : ''}`}
                  title="Filter by color"
                >
                  🔍
                </button>
              </div>
              {showColumnFilters.color && (
                <div className="column-filter">
                  <input
                    type="text"
                    placeholder="Search color..."
                    value={columnFilters.color}
                    onChange={(e) => handleColumnFilterChange('color', e.target.value)}
                    className="filter-input"
                    data-testid="color-filter"
                  />
                </div>
              )}
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
              Rack Locations
            </th>
            <th>Reserved Projects</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredGlasses.length === 0 ? (
            <tr>
              <td colSpan="10" className="no-results">
                {glasses.length === 0 ? 'No glass inventory found' : 'No glasses match the current filters'}
              </td>
            </tr>
          ) : (
            filteredGlasses.filter(glass => glass).map((glass) => (
            <React.Fragment key={glass.id}>
              <tr 
                className={`${editingId === glass.id ? 'editing' : ''} ${exitingEdit && editingId === glass.id ? 'exiting' : ''} ${getReservationStatusClass(glass)} ${glass.reservedCount > 0 ? 'clickable-row' : ''} ${isRowExpanded(glass.id) ? 'expanded' : ''}`}
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
                      <span title={getProjectTooltip(glass.reservedProjects)}>
                        {glass.reservedProjects.filter(p => p != null).length === 1 
                          ? (typeof glass.reservedProjects.find(p => p != null) === 'string' 
                              ? glass.reservedProjects.find(p => p != null) 
                              : glass.reservedProjects.find(p => p != null)?.projectName || 'Unknown')
                          : `${glass.reservedProjects.filter(p => p != null).length} projects`
                        }
                      </span>
                    ) : (
                      <span className="no-projects">None</span>
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
                        <div key={index} className="reservation-project-item">
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
                                <input
                                  type="number"
                                  min="1"
                                  value={editingProjectData.quantity}
                                  onChange={(e) => handleProjectInputChange('quantity', parseInt(e.target.value) || 0)}
                                  className="project-edit-input"
                                />
                              </div>
                              <div className="project-edit-actions">
                                <button onClick={saveProjectEdit} className="project-save-btn" title="Save changes">✅</button>
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
                                    <div key={resIndex} className="reservation-item">
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
          reservation={selectedReservation}
          onSave={onUpdateReservation}
          onCancel={() => setShowReservationEditModal(false)}
        />
      )}
    </div>
  )
}

export default GlassTable