import React, { useState } from 'react'
import './BacklogManager.css'

function BacklogManager({ backlogReservations, onSmartReallocate, onDelete, availableGlasses, onOpenOrderGlass }) {
  const [showOrderConfirm, setShowOrderConfirm] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const handleReallocate = (item) => {
    const result = onSmartReallocate(item.id)
    
    if (result.success) {
      // Successfully reallocated automatically
      return
    } else if (result.needsOrder) {
      // Need to ask about ordering
      setSelectedItem(result.backlogItem)
      setShowOrderConfirm(true)
    }
  }

  const handleConfirmOrder = () => {
    if (selectedItem) {
      // Close confirmation and open order glass window with pre-filled data
      setShowOrderConfirm(false)
      onOpenOrderGlass(selectedItem)
      setSelectedItem(null)
    }
  }

  const handleCancelOrder = () => {
    setShowOrderConfirm(false)
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
                      <button 
                        onClick={() => handleReallocate(item)} 
                        className={`reallocate-btn ${canReallocate ? 'available' : 'needs-order'}`}
                        title={canReallocate ? "Reallocate to inventory" : "Order more glass and reallocate"}
                      >
                        {canReallocate ? '🔄 Reallocate' : '📦 Order & Allocate'}
                      </button>
                      <button 
                        onClick={() => onDelete(item.id)} 
                        className="delete-backlog-btn"
                        title="Permanently delete"
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {showOrderConfirm && selectedItem && (
        <div className="modal-overlay">
          <div className="order-confirm-modal">
            <h3>Order Glass Required</h3>
            <div className="modal-content">
              <div className="glass-info">
                <p><strong>Glass Needed:</strong> {selectedItem.width}" × {selectedItem.height}" {selectedItem.color}</p>
                <p><strong>Required:</strong> {selectedItem.count} pieces</p>
                <p><strong>Available:</strong> {getAvailableCount(selectedItem)} pieces</p>
                <p><strong>Need to Order:</strong> {selectedItem.count - getAvailableCount(selectedItem)} pieces</p>
                <p><strong>For Project:</strong> {selectedItem.originalProject}</p>
              </div>
              
              <div className="confirmation-message">
                <p>There is insufficient glass in inventory. Would you like to order more glass?</p>
              </div>
              
              <div className="modal-actions">
                <button onClick={handleConfirmOrder} className="confirm-btn order-btn">
                  Yes, Order Glass
                </button>
                <button onClick={handleCancelOrder} className="cancel-btn">
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
