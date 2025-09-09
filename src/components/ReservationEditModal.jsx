import React, { useState, useEffect } from 'react'
import './ReservationEditModal.css'

function ReservationEditModal({ isOpen, onClose, reservation, glasses, groupedGlasses, onSave }) {
  const [projectName, setProjectName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && reservation) {
      setProjectName(reservation.reservedProject)
      setQuantity(reservation.count.toString())
      setError('')
    }
  }, [isOpen, reservation])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newCount = parseInt(quantity)
    const oldCount = reservation.count
    
    // Validation
    if (isNaN(newCount) || newCount <= 0) {
      setError('Please enter a valid quantity greater than 0')
      return
    }
    
    if (!projectName.trim()) {
      setError('Project name is required')
      return
    }
    
    // Find the group for this reservation to check available inventory
    const key = `${reservation.width}-${reservation.height}-${reservation.color}-${reservation.heatSoaked}-${reservation.rackNumber}`
    const group = Object.values(groupedGlasses).find(g => 
      g.main && `${g.main.width}-${g.main.height}-${g.main.color}-${g.main.heatSoaked}-${g.main.rackNumber}` === key
    )
    
    if (group) {
      // Calculate how much available inventory we'd have after this change
      const changeInReservation = newCount - oldCount
      const newAvailableCount = group.main.availableCount - changeInReservation
      
      if (newAvailableCount < 0) {
        const maxAllowable = group.main.availableCount + oldCount
        setError(`Cannot reserve ${newCount} pieces. This would exceed available inventory.\n\nAvailable: ${group.main.availableCount}\nCurrently reserved: ${oldCount}\nMaximum you can reserve: ${maxAllowable}`)
        return
      }
    }
    
    // Success - call the save function
    onSave({
      ...reservation,
      reservedProject: projectName.trim(),
      count: newCount
    })
    onClose()
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  if (!isOpen || !reservation) return null

  // Find the group to get inventory information
  const key = `${reservation.width}-${reservation.height}-${reservation.color}-${reservation.heatSoaked}-${reservation.rackNumber}`
  const group = Object.values(groupedGlasses).find(g => 
    g.main && `${g.main.width}-${g.main.height}-${g.main.color}-${g.main.heatSoaked}-${g.main.rackNumber}` === key
  )

  const currentAvailable = group ? group.main.availableCount : 0
  const totalInventory = group ? group.main.count : 0
  const currentlyReserved = reservation.count
  const maxAllowable = currentAvailable + currentlyReserved

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Glass Reservation</h3>
          <button className="modal-close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="glass-info">
            <h4>Glass Specifications</h4>
            <div className="spec-grid">
              <div className="spec-item">
                <span className="spec-label">Size:</span>
                <span className="spec-value">{reservation.width}" × {reservation.height}"</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Color:</span>
                <span className="spec-value">{reservation.color}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Rack:</span>
                <span className="spec-value">{reservation.rackNumber}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Heat Soaked:</span>
                <span className="spec-value">{reservation.heatSoaked ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div className="inventory-status">
            <div className="status-item current-reservation">
              <span className="status-label">Current Reservation:</span>
              <span className="status-value">{currentlyReserved} pieces</span>
            </div>
            <div className="status-item available">
              <span className="status-label">Available for Additional Reservation:</span>
              <span className="status-value">{currentAvailable} pieces</span>
            </div>
            <div className="status-item max-allowable">
              <span className="status-label">Maximum You Can Reserve:</span>
              <span className="status-value">{maxAllowable} pieces</span>
            </div>
            <div className="status-item total">
              <span className="status-label">Total Inventory:</span>
              <span className="status-value">{totalInventory} pieces</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="reservation-form">
            <div className="form-group">
              <label htmlFor="projectName">Project Name</label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="form-input"
                autoFocus
                placeholder="Enter project name..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity to Reserve</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={maxAllowable}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="form-input"
              />
              <small className="form-hint">Maximum: {maxAllowable} pieces</small>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" onClick={handleClose} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" className="btn-save">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReservationEditModal
