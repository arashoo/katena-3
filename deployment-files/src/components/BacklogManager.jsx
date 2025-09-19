import React, { useState } from 'react'
import './BacklogManager.css'

function BacklogManager({ backlogReservations, onSmartReallocate, onAllocate, onDelete, availableGlasses, onOpenOrderGlass }) {
  const [showAllocateConfirm, setShowAllocateConfirm] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const handleDirectOrder = (item) => {
    // Directly open the order glass modal with pre-filled data
    onOpenOrderGlass(item)
  }

  const handleDirectAllocate = (item) => {
    const availableCount = getAvailableCount(item)
    
    if (availableCount >= item.count) {
      // Sufficient inventory - allocate directly
      onAllocate(item.id)
    } else {
      // Insufficient inventory - show confirmation
      setSelectedItem(item)
      setShowAllocateConfirm(true)
    }
  }

  const handleConfirmAllocate = () => {
    if (selectedItem) {
      // User confirmed allocation despite insufficient inventory
      onAllocate(selectedItem.id)
      setShowAllocateConfirm(false)
      setSelectedItem(null)
    }
  }

  const handleCancelAllocate = () => {
    setShowAllocateConfirm(false)
    setSelectedItem(null)
  }

  const getAvailableCount = (item) => {
    const availableGlass = availableGlasses?.find(glass => 
      !glass.reservedProject &&
      glass.width === item.width &&
      glass.height === item.height &&
      glass.color === item.color &&
      glass.heatSoaked === item.heatSoaked
    )
    return availableGlass ? availableGlass.count : 0
  }

  return (
    <div className="backlog-container">
      <div className="backlog-header">
        <h2>Reservation Backlog</h2>
        <p>Unallocated reservations that can be reassigned to new projects</p>
      </div>

      {backlogReservations.length === 0 ? (
        <div className="no-backlog">
          <p>No items in backlog</p>
        </div>
      ) : (
        <div className="backlog-table-container">
          <table className="backlog-table">
            <thead>
              <tr>
                <th>Specifications</th>
                <th>Count Needed</th>
                <th>Available</th>
                <th>Original Project</th>
                <th>Date Removed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {backlogReservations.map((item) => {
                const availableCount = getAvailableCount(item)
                const canReallocate = availableCount >= item.count
                
                return (
                  <tr key={item.id} className="backlog-row">
                    <td>
                      <div className="glass-specs">
                        <strong>{item.width}" × {item.height}"</strong>
                        <br />
                        <span className="color-heat">{item.color} • {item.heatSoaked ? 'Heat Soaked' : 'Not Heat Soaked'}</span>
                      </div>
                    </td>
                    <td className="count-cell">{item.count}</td>
                    <td className={`available-cell ${canReallocate ? 'sufficient' : 'insufficient'}`}>
                      {availableCount}
                      {!canReallocate && <span className="shortage"> (need {item.count - availableCount} more)</span>}
                    </td>
                    <td className="project-cell">{item.originalProject}</td>
                    <td className="date-cell">{item.backlogDate}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleDirectOrder(item)} 
                          className="order-btn"
                          title="Order glass for this requirement"
                        >
                          📦 Order
                        </button>
                        <button 
                          onClick={() => handleDirectAllocate(item)} 
                          className={`allocate-btn ${canReallocate ? 'available' : 'insufficient'}`}
                          title={canReallocate ? "Allocate from available inventory" : "Allocate anyway (may need more glass)"}
                        >
                          {canReallocate ? '✅ Allocate' : '⚠️ Allocate'}
                        </button>
                        <button 
                          onClick={() => onDelete(item.id)} 
                          className="delete-backlog-btn"
                          title="Permanently delete"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Allocate Confirmation Modal */}
      {showAllocateConfirm && selectedItem && (
        <div className="modal-overlay">
          <div className="allocate-confirm-modal">
            <h3>Insufficient Inventory</h3>
            <div className="modal-content">
              <div className="glass-info">
                <p><strong>Glass Needed:</strong> {selectedItem.width}" × {selectedItem.height}" {selectedItem.color}</p>
                <p><strong>Required:</strong> {selectedItem.count} pieces</p>
                <p><strong>Available:</strong> {getAvailableCount(selectedItem)} pieces</p>
                <p><strong>Shortage:</strong> {selectedItem.count - getAvailableCount(selectedItem)} pieces</p>
                <p><strong>For Project:</strong> {selectedItem.originalProject}</p>
              </div>
              
              <div className="confirmation-message">
                <p>There is insufficient glass in inventory. Allocating anyway will create a negative balance. Would you like to proceed?</p>
              </div>
              
              <div className="modal-actions">
                <button onClick={handleConfirmAllocate} className="confirm-btn allocate-btn-modal">
                  Yes, Allocate Anyway
                </button>
                <button onClick={handleCancelAllocate} className="cancel-btn">
                  No, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BacklogManager
