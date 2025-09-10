import React, { useState } from 'react'
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
  const [expandedGroups, setExpandedGroups] = useState(new Set())

  // Group glasses by their specifications (width, height, color, heatSoaked)
  // Note: rackNumber is NOT included in grouping key since glasses with same specs should be grouped together
  const groupedGlasses = glasses.reduce((groups, glass) => {
    const key = `${glass.width}-${glass.height}-${glass.color}-${glass.heatSoaked}`
    if (!groups[key]) {
      groups[key] = {
        main: null,
        reservations: [],
        totalCount: 0,
        reservedCount: 0,
        rackNumbers: new Set() // Track all rack numbers for this group
      }
    }
    
    // Add rack number to the set
    if (glass.rackNumber) {
      groups[key].rackNumbers.add(glass.rackNumber)
    }
    
    if (glass.reservedProject) {
      groups[key].reservations.push(glass)
      groups[key].reservedCount += glass.count
    } else {
      // Include all non-reserved glasses as potential main glasses (even if count is 0)
      // If there's already a main glass, combine quantities
      if (groups[key].main) {
        groups[key].main.count += glass.count
        // Update rack number to show multiple locations
        if (glass.rackNumber && glass.rackNumber !== groups[key].main.rackNumber) {
          groups[key].main.rackNumber = Array.from(groups[key].rackNumbers).join(', ')
        }
      } else {
        groups[key].main = { ...glass }
      }
      groups[key].totalCount += glass.count
    }
    
    return groups
  }, {})

  // Calculate available count for each group
  Object.values(groupedGlasses).forEach(group => {
    if (group.main) {
      // The main glass count already reflects available inventory after reservations
      group.main.availableCount = group.main.count
    }
  })

  const handleReserve = (glass) => {
    if (glass.availableCount <= 0) {
      alert('No available inventory to reserve. All pieces are already reserved.')
      return
    }
    
    setSelectedGlass(glass)
    setShowReservationModal(true)
  }

  const handleReservationSubmit = (glass, quantity, projectName) => {
    onReserveGlass(glass, quantity, projectName)
    setShowReservationModal(false)
    setSelectedGlass(null)
  }

  const handleCloseModal = () => {
    setShowReservationModal(false)
    setSelectedGlass(null)
  }

  const toggleGroupExpansion = (groupKey) => {
    const newExpandedGroups = new Set(expandedGroups)
    if (newExpandedGroups.has(groupKey)) {
      newExpandedGroups.delete(groupKey)
    } else {
      newExpandedGroups.add(groupKey)
    }
    setExpandedGroups(newExpandedGroups)
  }

  const handleDeleteGroup = (group) => {
    // For grouped glass, we need to delete all individual entries that make up this group
    const groupKey = `${group.main.width}-${group.main.height}-${group.main.color}-${group.main.heatSoaked}`
    
    // Find all glass entries (available and reserved) that belong to this group
    const glassesToDelete = glasses.filter(glass => {
      const glassKey = `${glass.width}-${glass.height}-${glass.color}-${glass.heatSoaked}`
      return glassKey === groupKey
    })
    
    if (glassesToDelete.length > 0) {
      // For confirmation, we'll use the main glass object but add a special property
      const confirmationObject = {
        ...group.main,
        isGroupDelete: true,
        affectedItems: glassesToDelete.length,
        totalCount: group.totalCount + group.reservedCount
      }
      onDeleteGlass(confirmationObject)
    }
  }

  const handleRowClick = (groupKey, hasReservations, event) => {
    // Don't expand if clicking on action buttons or in edit mode
    if (event.target.closest('button') || event.target.closest('input') || event.target.closest('select')) {
      return
    }
    
    // Only expand if the row has reservations
    if (hasReservations) {
      toggleGroupExpansion(groupKey)
    }
  }

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return '↕️'
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const startEdit = (glass) => {
    setEditingId(glass.id)
    // For editing, we need to work with the actual total count, not available count
    setEditData({ ...glass, count: glass.count })
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

  // Functions for editing reservation rows
  const startReservationEdit = (reservation) => {
    setSelectedReservation(reservation)
    setShowReservationEditModal(true)
  }

  const handleReservationEditSave = (updatedReservation) => {
    onUpdateReservation(updatedReservation.id, updatedReservation)
    setShowReservationEditModal(false)
    setSelectedReservation(null)
  }

  const handleCloseReservationEditModal = () => {
    setShowReservationEditModal(false)
    setSelectedReservation(null)
  }

  return (
    <div className="glass-table-container">
      <table className="glass-table">
        <thead>
          <tr>
            <th onClick={() => onSort('width')} className="sortable">
              Width (in) {getSortIcon('width')}
            </th>
            <th onClick={() => onSort('height')} className="sortable">
              Height (in) {getSortIcon('height')}
            </th>
            <th onClick={() => onSort('color')} className="sortable">
              Color {getSortIcon('color')}
            </th>
            <th onClick={() => onSort('count')} className="sortable">
              Count {getSortIcon('count')}
            </th>
            <th onClick={() => onSort('heatSoaked')} className="sortable">
              Heat Soaked {getSortIcon('heatSoaked')}
            </th>
            <th onClick={() => onSort('reservedProject')} className="sortable">
              Reserved Project {getSortIcon('reservedProject')}
            </th>
            <th onClick={() => onSort('rackNumber')} className="sortable">
              Rack Number {getSortIcon('rackNumber')}
            </th>
            <th onClick={() => onSort('dateAdded')} className="sortable">
              Date Added {getSortIcon('dateAdded')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedGlasses).map(([groupKey, group]) => {
            const mainGlass = group.main
            const isExpanded = expandedGroups.has(groupKey)
            const hasReservations = group.reservations.length > 0
            
            return (
              <React.Fragment key={groupKey}>
                {/* Main row - Available glass (only show if there's available inventory) */}
                {mainGlass && (
                  <tr 
                    key={mainGlass.id} 
                    className={`glass-group-main ${hasReservations ? 'has-reservations clickable-row' : ''} ${editingId === mainGlass.id ? 'editing' : ''} ${exitingEdit && editingId === mainGlass.id ? 'exiting' : ''}`}
                    onClick={(e) => handleRowClick(groupKey, hasReservations, e)}
                    title={hasReservations ? 'Click to expand/collapse reservations' : ''}
                  >
                    {editingId === mainGlass.id ? (
                      // Edit mode
                      <>
                        <td>
                          {hasReservations && (
                            <span className="expand-indicator">
                              {isExpanded ? '▼' : '▶'}
                            </span>
                          )}
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
                            <option value="Blue">Blue</option>
                            <option value="Gray">Gray</option>
                            <option value="DIV">DIV</option>
                            <option value="Acid_DIV">Acid DIV</option>
                            <option value="Bronze">Bronze</option>
                            <option value="Brown">Brown</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={editData.count}
                            onChange={(e) => handleInputChange('count', parseInt(e.target.value))}
                          />
                        </td>
                        <td>
                          <select
                            value={editData.heatSoaked}
                            onChange={(e) => handleInputChange('heatSoaked', e.target.value === 'true')}
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </td>
                        <td>
                          {mainGlass.availableCount === 0 ? (
                            <span className="fully-reserved">Fully Reserved</span>
                          ) : group.reservedCount > 0 ? (
                            <span className="partially-reserved">Partially Reserved</span>
                          ) : (
                            <span className="available">Available</span>
                          )}
                        </td>
                        <td>
                          <input
                            type="text"
                            value={editData.rackNumber}
                            onChange={(e) => handleInputChange('rackNumber', e.target.value)}
                            placeholder="Multiple racks: R-001, R-002"
                          />
                        </td>
                        <td>{mainGlass.dateAdded}</td>
                        <td>
                          <button onClick={saveEdit} className="save-btn">✓</button>
                          <button onClick={cancelEdit} className="cancel-btn">✕</button>
                        </td>
                      </>
                    ) : (
                      // View mode
                      <>
                        <td>
                          {hasReservations && (
                            <button 
                              className="expand-btn"
                              onClick={() => toggleGroupExpansion(groupKey)}
                              title={isExpanded ? 'Collapse reservations' : 'Show reservations'}
                            >
                              {isExpanded ? '▼' : '▶'}
                            </button>
                          )}
                          <span className="glass-dimension">{mainGlass.width}</span>
                        </td>
                        <td>{mainGlass.height}</td>
                        <td>{mainGlass.color}</td>
                        <td>
                          <span className="available-count">{mainGlass.availableCount}</span>
                          {group.reservedCount > 0 && (
                            <span className="total-count-info"> (of {mainGlass.count + group.reservedCount})</span>
                          )}
                          {hasReservations && (
                            <span className="reservation-indicator" title={`${group.reservations.length} reservation${group.reservations.length > 1 ? 's' : ''}`}>
                              📋 {group.reservations.length}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`heat-soaked ${mainGlass.heatSoaked ? 'yes' : 'no'}`}>
                            {mainGlass.heatSoaked ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          {mainGlass.availableCount === 0 ? (
                            <span className="fully-reserved">Fully Reserved</span>
                          ) : group.reservedCount > 0 ? (
                            <span className="partially-reserved">Partially Reserved</span>
                          ) : (
                            <span className="available">Available</span>
                          )}
                        </td>
                        <td>
                          <span className="rack-numbers">
                            {Array.from(group.rackNumbers).join(', ') || mainGlass.rackNumber}
                          </span>
                        </td>
                        <td>{mainGlass.dateAdded}</td>
                        <td>
                          <button onClick={() => startEdit(mainGlass)} className="edit-btn">✎</button>
                          <button onClick={() => handleDeleteGroup(group)} className="delete-btn">🗑</button>
                          {mainGlass.availableCount > 0 && (
                            <button onClick={() => handleReserve(mainGlass)} className="reserve-btn">📋</button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                )}

                {/* If no main glass but reservations exist, show a placeholder row with glass info */}
                {!mainGlass && hasReservations && (
                  <tr 
                    className="glass-group-header fully-reserved clickable-row"
                    onClick={(e) => handleRowClick(groupKey, hasReservations, e)}
                    title="Click to expand/collapse reservations"
                  >
                    <td>
                      <button 
                        className="expand-btn"
                        onClick={() => toggleGroupExpansion(groupKey)}
                        title={isExpanded ? 'Collapse reservations' : 'Show reservations'}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                      <span className="glass-dimension">{group.reservations[0].width}</span>
                    </td>
                    <td>{group.reservations[0].height}</td>
                    <td>{group.reservations[0].color}</td>
                    <td>
                      <span className="available-count">0</span>
                      <span className="total-count-info"> (all reserved)</span>
                      <span className="reservation-indicator" title={`${group.reservations.length} reservation${group.reservations.length > 1 ? 's' : ''}`}>
                        📋 {group.reservations.length}
                      </span>
                    </td>
                    <td>
                      <span className={`heat-soaked ${group.reservations[0].heatSoaked ? 'yes' : 'no'}`}>
                        {group.reservations[0].heatSoaked ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className="fully-reserved-status">Fully Reserved</span>
                    </td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                )}

                {/* Reservation sub-rows - only show when expanded */}
                {isExpanded && group.reservations.map((reservation) => (
                  <tr key={reservation.id} className="reservation-row">
                    <td className="reservation-cell">
                    </td>
                    <td></td>
                    <td></td>
                    <td className="reserved-count">{reservation.count}</td>
                    <td></td>
                    <td className="reserved-project">
                      <strong>{reservation.reservedProject}</strong>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                      <button onClick={() => startReservationEdit(reservation)} className="edit-btn">✎</button>
                      <button 
                        onClick={() => onMoveToBacklog(reservation)} 
                        className="backlog-btn"
                        title="Move to backlog (can be reallocated later)"
                      >
                        📋
                      </button>
                      <button 
                        onClick={() => onDeleteGlass(reservation)} 
                        className="delete-btn"
                        title="Permanently delete reservation"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
      {glasses.length === 0 && (
        <div className="no-data">No glass inventory found</div>
      )}
      
      <ReservationModal
        isOpen={showReservationModal}
        onClose={handleCloseModal}
        glass={selectedGlass}
        onReserve={handleReservationSubmit}
      />
      
      <ReservationEditModal
        isOpen={showReservationEditModal}
        onClose={handleCloseReservationEditModal}
        reservation={selectedReservation}
        glasses={glasses}
        groupedGlasses={groupedGlasses}
        onSave={handleReservationEditSave}
      />
    </div>
  )
}

export default GlassTable
