import React, { useState, useMemo } from 'react'
import ReservationModal from './ReservationModal'
import ReservationEditModal from './ReservationEditModal'
import './GlassTable.css'

function GlassTable({ glasses, onUpdateGlass, onDeleteGlass, onMoveToBacklog, onSort, sortConfig, onReserveGlass, onUpdateReservation }) {
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [exitingEdit, setExitingEdit] = useState(false)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedGlass, setSelectedGlass] = useState(null)
  const [showReservationEditModal, setShowReservationEditModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  
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
            filteredGlasses.map((glass) => (
            <tr 
              key={glass.id} 
              className={`${editingId === glass.id ? 'editing' : ''} ${exitingEdit && editingId === glass.id ? 'exiting' : ''}`}
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
                  <td>{glass.reservedProjects ? glass.reservedProjects.join(', ') : 'None'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={saveEdit} className="save-btn">✓</button>
                      <button onClick={cancelEdit} className="cancel-btn">✗</button>
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
                    {glass.reservedProjects && glass.reservedProjects.length > 0 ? (
                      <span title={glass.reservedProjects.join(', ')}>
                        {glass.reservedProjects.length === 1 
                          ? glass.reservedProjects[0] 
                          : `${glass.reservedProjects.length} projects`
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
                        title={glass.availableCount <= 0 ? 'No available pieces' : 'Reserve pieces'}
                      >
                        Reserve ({glass.availableCount})
                      </button>
                      <button onClick={() => startEdit(glass)} className="edit-btn">Edit</button>
                      <button onClick={() => onDeleteGlass(glass)} className="delete-btn">Delete</button>
                      <button onClick={() => onMoveToBacklog(glass)} className="backlog-btn">Backlog</button>
                    </div>
                  </td>
                </>
              )}
            </tr>
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