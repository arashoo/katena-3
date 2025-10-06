import React from 'react';
import './StatusConfirmationModal.css';

const StatusConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  details, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning" // warning, danger, info
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '⚠️';
    }
  };

  return (
    <div className="status-confirmation-overlay" onClick={handleOverlayClick}>
      <div className="status-confirmation-modal">
        <div className={`status-confirmation-header ${type}`}>
          <span className="status-confirmation-icon">{getIcon()}</span>
          <h3 className="status-confirmation-title">{title}</h3>
        </div>
        
        <div className="status-confirmation-content">
          <p className="status-confirmation-message">{message}</p>
          
          {details && details.length > 0 && (
            <div className="status-confirmation-details">
              <p><strong>This will:</strong></p>
              <ul>
                {details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="status-confirmation-footer">
            <button 
              className="status-confirmation-btn cancel"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button 
              className={`status-confirmation-btn confirm ${type}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusConfirmationModal;