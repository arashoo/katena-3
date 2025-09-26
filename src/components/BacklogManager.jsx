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
    
    if (availableCount === 0) {
      // No inventory - should not reach here due to disabled button
      alert('No inventory available. Please use the Order button instead.')
      return
    }
    
    if (availableCount >= item.count) {
      // Sufficient inventory - allocate directly
      onAllocate(item.id)
    } else {
      // Partial inventory - show confirmation
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

  const handleDelete = (item) => {
    const itemCount = Math.max(1, Math.floor(item.count || 1))
    if (window.confirm(`Are you sure you want to permanently delete this backlog item?\n\nGlass: ${item.width}" × ${item.height}" ${item.color}\nOriginal Project: ${item.originalProject}\nCount: ${itemCount} pieces`)) {
      onDelete(item.id)
    }
  }

  const getAvailableCount = (item) => {
    // Find matching glass in inventory by specifications
    const matchingGlass = availableGlasses?.find(glass => 
      glass.width === item.width &&
      glass.height === item.height &&
      glass.color === item.color &&
      glass.heatSoaked === item.heatSoaked
    )
    
    // Return available count (ensure non-negative whole number)
    if (matchingGlass) {
      return Math.max(0, Math.floor(matchingGlass.availableCount || 0))
    }
    return 0
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
                const itemCount = Math.max(1, Math.floor(item.count || 1)) // Ensure positive whole number, minimum 1
                const hasExactAmount = availableCount >= itemCount
                const hasPartialAmount = availableCount > 0 && availableCount < itemCount
                const hasNoAmount = availableCount === 0
                
                // Button state logic
                let buttonClass = 'allocate-btn'
                let buttonText = '✅ Allocate'
                let buttonTitle = 'Allocate from available inventory'
                let canAllocate = true
                
                if (hasExactAmount) {
                  buttonClass += ' exact-amount' // Green
                  buttonText = '✅ Allocate'
                  buttonTitle = `Allocate ${itemCount} pieces from inventory`
                } else if (hasPartialAmount) {
                  buttonClass += ' partial-amount' // Yellow
                  buttonText = '⚠️ Allocate'
                  buttonTitle = `Allocate ${itemCount} pieces (${availableCount} available, ${itemCount - availableCount} short)`
                } else if (hasNoAmount) {
                  buttonClass += ' no-amount' // Gray
                  buttonText = '❌ No Stock'
                  buttonTitle = 'No inventory available - use Order button instead'
                  canAllocate = false
                }
                
                return (
                  <tr key={item.id} className="backlog-row">
                    <td>
                      <div className="glass-specs">
                        <strong>{item.width}" × {item.height}"</strong>
                        <br />
                        <span className="color-heat">{item.color} • {item.heatSoaked ? 'Heat Soaked' : 'Not Heat Soaked'}</span>
                      </div>
                    </td>
                    <td className="count-cell">{itemCount}</td>
                    <td className={`available-cell ${hasExactAmount ? 'sufficient' : hasPartialAmount ? 'partial' : 'insufficient'}`}>
                      {availableCount}
                      {hasPartialAmount && <span className="shortage"> (need {itemCount - availableCount} more)</span>}
                      {hasNoAmount && <span className="shortage"> (no stock available)</span>}
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
                          onClick={() => canAllocate ? handleDirectAllocate(item) : null} 
                          className={buttonClass}
                          title={buttonTitle}
                          disabled={!canAllocate}
                        >
                          {buttonText}
                        </button>
                        <button 
                          onClick={() => handleDelete(item)} 
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
                <p><strong>Required:</strong> {Math.max(1, Math.floor(selectedItem.count || 1))} pieces</p>
                <p><strong>Available:</strong> {getAvailableCount(selectedItem)} pieces</p>
                <p><strong>Shortage:</strong> {Math.max(1, Math.floor(selectedItem.count || 1)) - getAvailableCount(selectedItem)} pieces</p>
                <p><strong>For Project:</strong> {selectedItem.originalProject}</p>
              </div>
              
              <div className="confirmation-message">
                <p>There is insufficient glass in inventory. You have {getAvailableCount(selectedItem)} pieces available but need {Math.max(1, Math.floor(selectedItem.count || 1))} pieces. Allocating anyway will result in a shortage of {Math.max(1, Math.floor(selectedItem.count || 1)) - getAvailableCount(selectedItem)} pieces. Would you like to proceed?</p>
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
