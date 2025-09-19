import React, { useState, useEffect } from 'react'
import './ReservationModal.css'

function ReservationModal({ isOpen, onClose, glass, onReserve }) {
  const [quantity, setQuantity] = useState('')
  const [projectName, setProjectName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && glass) {
      setQuantity(Math.min(glass.availableCount, 10).toString())
      setProjectName('')
      setError('')
    }
  }, [isOpen, glass])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const qty = parseInt(quantity)
    
    // Validation
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity greater than 0')
      return
    }
    
    if (qty > glass.availableCount) {
      setError(`Cannot reserve ${qty} pieces. We only have ${glass.availableCount} available.\nTotal inventory: ${glass.count}, Already reserved: ${glass.count - glass.availableCount}`)
      return
    }
    
    if (!projectName.trim()) {
      setError('Project name is required for reservation')
      return
    }
    
    // Success - call the reservation function
    onReserve(glass, qty, projectName.trim())
    onClose()
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  if (!isOpen || !glass) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Reserve Glass Inventory</h3>
          <button className="modal-close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="glass-info">
            <h4>Glass Specifications</h4>
            <div className="spec-grid">
              <div className="spec-item">
                <span className="spec-label">Size:</span>
                <span className="spec-value">{glass.width}" × {glass.height}"</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Color:</span>
                <span className="spec-value">{glass.color}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Rack:</span>
                <span className="spec-value">{glass.rackNumber}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Heat Soaked:</span>
                <span className="spec-value">{glass.heatSoaked ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div className="inventory-status">
            <div className="status-item available">
              <span className="status-label">Available:</span>
              <span className="status-value">{glass.availableCount} pieces</span>
            </div>
            <div className="status-item total">
              <span className="status-label">Total Inventory:</span>
              <span className="status-value">{glass.count} pieces</span>
            </div>
            {glass.count - glass.availableCount > 0 && (
              <div className="status-item reserved">
                <span className="status-label">Already Reserved:</span>
                <span className="status-value">{glass.count - glass.availableCount} pieces</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="reservation-form">
            <div className="form-group">
              <label htmlFor="quantity">Quantity to Reserve</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={glass.availableCount}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="form-input"
                autoFocus
              />
              <small className="form-hint">Maximum: {glass.availableCount} pieces</small>
            </div>

            <div className="form-group">
              <label htmlFor="projectName">Project Name</label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="form-input"
                placeholder="Enter project name..."
              />
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
              <button type="submit" className="btn-reserve">
                Reserve Glass
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReservationModal
