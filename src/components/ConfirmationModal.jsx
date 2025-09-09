import React from 'react'
import './ConfirmationModal.css'

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", type = "danger" }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="confirmation-modal" onClick={e => e.stopPropagation()}>
        <div className="confirmation-header">
          <div className={`confirmation-icon ${type}`}>
            {type === 'danger' ? '⚠️' : type === 'warning' ? '🔔' : 'ℹ️'}
          </div>
          <h3>{title}</h3>
        </div>
        
        <div className="confirmation-body">
          <p>{message}</p>
        </div>
        
        <div className="confirmation-actions">
          <button onClick={onClose} className="btn-cancel">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`btn-confirm ${type}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
