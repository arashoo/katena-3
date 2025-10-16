import React from 'react'
import DeficiencyFormContent from './DeficiencyFormContent'
import './DeficiencyEditModal.css'

function DeficiencyEditModal({ selectedDeficiency, onClose, onSubmit }) {
  if (!selectedDeficiency) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="deficiency-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Deficiency</h3>
          <button 
            className="close-btn" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <DeficiencyFormContent 
          onSubmit={onSubmit} 
          onClose={onClose}
          initialData={selectedDeficiency}
          isEdit={true}
        />
      </div>
    </div>
  );
}

export default DeficiencyEditModal