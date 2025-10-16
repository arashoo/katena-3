import React from 'react'
import './DeficiencyViewModal.css'

function DeficiencyViewModal({ selectedDeficiency, onClose }) {
  if (!selectedDeficiency) return null;

  const handleImageView = (image) => {
    const newWindow = window.open('', '_blank')
    newWindow.document.write(`
      <html>
        <head><title>${image.name}</title></head>
        <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;">
          <img src="${image.data}" style="max-width:100%;max-height:100vh;object-fit:contain;" alt="${image.name}">
        </body>
      </html>
    `)
  }

  const handleImageDownload = (image) => {
    const link = document.createElement('a')
    link.href = image.data
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="deficiency-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Deficiency Details</h3>
          <button 
            className="close-btn" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="deficiency-details">
          <div className="detail-row">
            <strong>Record ID:</strong> {selectedDeficiency.id}
          </div>
          <div className="detail-row">
            <strong>Project Name:</strong> {selectedDeficiency.projectName}
          </div>
          <div className="detail-row">
            <strong>Description:</strong> 
            <div className="detail-description">{selectedDeficiency.description}</div>
          </div>
          <div className="detail-row">
            <strong>Status:</strong> 
            <span className={`status-badge status-${selectedDeficiency.status.toLowerCase().replace(' ', '-')}`}>
              {selectedDeficiency.status}
            </span>
          </div>
          <div className="detail-row">
            <strong>Priority:</strong> 
            <span className={`priority-badge priority-${selectedDeficiency.priority.toLowerCase()}`}>
              {selectedDeficiency.priority}
            </span>
          </div>
          <div className="detail-row">
            <strong>Date Opened:</strong> {selectedDeficiency.dateOpened}
          </div>
          <div className="detail-row">
            <strong>Date Closed:</strong> {selectedDeficiency.dateClosed || 'Not closed'}
          </div>
          
          {/* Images Section */}
          {selectedDeficiency.images && selectedDeficiency.images.length > 0 && (
            <div className="detail-row">
              <strong>Images ({selectedDeficiency.images.length}):</strong>
              <div className="deficiency-image-gallery">
                {selectedDeficiency.images.map(image => (
                  <div key={image.id} className="deficiency-image-item">
                    <div className="deficiency-image-container">
                      <img 
                        src={image.data} 
                        alt={image.name}
                        className="deficiency-image"
                        onClick={() => handleImageView(image)}
                      />
                      <div className="deficiency-image-overlay">
                        <button
                          className="image-action-btn download-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageDownload(image)
                          }}
                          title="Download image"
                        >
                          💾
                        </button>
                        <button
                          className="image-action-btn view-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageView(image)
                          }}
                          title="View full size"
                        >
                          🔍
                        </button>
                      </div>
                    </div>
                    <div className="deficiency-image-info">
                      <span className="deficiency-image-name" title={image.name}>
                        {image.name.length > 20 ? `${image.name.substring(0, 20)}...` : image.name}
                      </span>
                      <span className="deficiency-image-size">
                        {(image.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeficiencyViewModal