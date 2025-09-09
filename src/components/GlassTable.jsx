import React, { useState } from 'react'
import ReservationModal from './ReservationModal'
import ReservationEditModal from './ReservationEditModal'
import './GlassTable.css'

function GlassTable({ glasses, onUpdateGlass, onDeleteGlass, onSort, sortConfig, onReserveGlass, onUpdateReservation }) {
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [exitingEdit, setExitingEdit] = useState(false)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedGlass, setSelectedGlass] = useState(null)
  const [showReservationEditModal, setShowReservationEditModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)

  // Group glasses by their specifications (width, height, color, heatSoaked, rackNumber)
  const groupedGlasses = glasses.reduce((groups, glass) => {
    const key = `${glass.width}-${glass.height}-${glass.color}-${glass.heatSoaked}-${glass.rackNumber}`
    if (!groups[key]) {
      groups[key] = {
        main: null,
        reservations: [],
        totalCount: 0,
        reservedCount: 0
      }
    }
    
    if (glass.reservedProject) {
      groups[key].reservations.push(glass)
      groups[key].reservedCount += glass.count
    } else {
      // If there's already a main glass, combine quantities
      if (groups[key].main) {
        groups[key].main.count += glass.count
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
      group.main.availableCount = group.totalCount - group.reservedCount
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
          {Object.values(groupedGlasses).map((group, groupIndex) => {
            const mainGlass = group.main
            if (!mainGlass) return null

            return (
              <React.Fragment key={`group-${groupIndex}`}>
                {/* Main row - Available glass */}
                <tr key={mainGlass.id} className={`glass-group-main ${group.reservations.length > 0 ? 'has-reservations' : ''} ${editingId === mainGlass.id ? 'editing' : ''} ${exitingEdit && editingId === mainGlass.id ? 'exiting' : ''}`}>
                  {editingId === mainGlass.id ? (
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
                        <span className="available">Available</span>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editData.rackNumber}
                          onChange={(e) => handleInputChange('rackNumber', e.target.value)}
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
                      <td>{mainGlass.width}</td>
                      <td>{mainGlass.height}</td>
                      <td>{mainGlass.color}</td>
                      <td>
                        <span className="available-count">{mainGlass.availableCount}</span>
                        {group.reservedCount > 0 && (
                          <span className="total-count-info"> (of {mainGlass.count})</span>
                        )}
                      </td>
                      <td>
                        <span className={`heat-soaked ${mainGlass.heatSoaked ? 'yes' : 'no'}`}>
                          {mainGlass.heatSoaked ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <span className="available">Available</span>
                      </td>
                      <td>{mainGlass.rackNumber}</td>
                      <td>{mainGlass.dateAdded}</td>
                      <td>
                        <button onClick={() => startEdit(mainGlass)} className="edit-btn">✎</button>
                        <button onClick={() => onDeleteGlass(mainGlass.id)} className="delete-btn">🗑</button>
                        {mainGlass.availableCount > 0 && (
                          <button onClick={() => handleReserve(mainGlass)} className="reserve-btn">📋</button>
                        )}
                      </td>
                    </>
                  )}
                </tr>

                {/* Reservation sub-rows */}
                {group.reservations.map((reservation) => (
                  <tr key={reservation.id} className="reservation-row">
                    <td className="reservation-cell">
                      <span className="lock-icon">🔒</span>
                    </td>
                    <td></td>
                    <td></td>
                    <td className="reserved-count">{reservation.count}</td>
                    <td></td>
                    <td className="reserved-project">
                      <strong>{reservation.reservedProject}</strong>
                    </td>
                    <td></td>
                    <td>{reservation.dateAdded}</td>
                    <td>
                      <button onClick={() => startReservationEdit(reservation)} className="edit-btn">✎</button>
                      <button onClick={() => onDeleteGlass(reservation.id)} className="delete-btn">🗑</button>
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
