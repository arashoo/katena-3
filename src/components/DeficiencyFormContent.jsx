import React, { useState } from 'react'
import './DeficiencyFormContent.css'

function DeficiencyFormContent({ onSubmit, onClose, initialData = null, isEdit = false }) {
  const [formData, setFormData] = useState({
    projectName: initialData?.projectName || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'P2',
    images: initialData?.images || []
  })
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = React.useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.projectName.trim() && formData.description.trim()) {
      // Add default status for new requests, preserve status for edits
      const submitData = {
        ...formData,
        status: isEdit ? initialData?.status || 'Open' : 'Open'
      }
      onSubmit(submitData)
      setFormData({
        projectName: '',
        description: '',
        priority: 'P2',
        images: []
      })
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Image handling functions
  const handleImageUpload = (files) => {
    const imageFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      
      if (!isImage) {
        alert(`${file.name} is not an image file`)
        return false
      }
      if (!isValidSize) {
        alert(`${file.name} is too large. Maximum size is 10MB`)
        return false
      }
      return true
    })

    // Convert files to base64 for storage
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          data: e.target.result,
          size: file.size,
          type: file.type,
          uploadDate: new Date().toISOString()
        }
        
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageData]
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleImageUpload(files)
    }
    // Reset file input
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleImageUpload(files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }))
  }

  const downloadImage = (image) => {
    const link = document.createElement('a')
    link.href = image.data
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <form onSubmit={handleSubmit} className="deficiency-form">
      <div className="form-row">
        <div className="form-group">
          <label>Record ID</label>
          <input 
            type="text" 
            value="Auto-generated" 
            disabled 
            className="disabled-input"
          />
        </div>
        <div className="form-group">
          <label>Date Opened</label>
          <input 
            type="text" 
            value={new Date().toLocaleDateString()} 
            disabled 
            className="disabled-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Project Name *</label>
        <input
          type="text"
          name="projectName"
          value={formData.projectName}
          onChange={handleChange}
          required
          placeholder="Enter project name"
        />
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          placeholder="Describe the deficiency in detail..."
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Priority</label>
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="P1">P1 - Most Urgent</option>
            <option value="P2">P2 - Medium</option>
            <option value="P3">P3 - Low</option>
          </select>
        </div>
        {isEdit && (
          <div className="form-group">
            <label>Status</label>
            <input 
              type="text" 
              value={initialData?.status || 'Open'} 
              disabled 
              className="disabled-input"
            />
            <small className="form-note">Status can only be changed to 'Completed' using the Complete button</small>
          </div>
        )}
      </div>

      {/* Image Upload Section */}
      <div className="form-group">
        <label>Images (Optional)</label>
        <div 
          className={`image-upload-area ${dragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-content">
            <span className="upload-icon">📸</span>
            <p className="upload-text">
              Drag & drop images here or <span className="click-text">click to browse</span>
            </p>
            <p className="upload-hint">
              Supports JPG, PNG, GIF up to 10MB each
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Image Preview Section */}
      {formData.images.length > 0 && (
        <div className="form-group">
          <label>Uploaded Images ({formData.images.length})</label>
          <div className="image-preview-grid">
            {formData.images.map(image => (
              <div key={image.id} className="image-preview-item">
                <div className="image-preview-container">
                  <img 
                    src={image.data} 
                    alt={image.name}
                    className="preview-image"
                  />
                  <div className="image-overlay">
                    <button
                      type="button"
                      className="image-action-btn download-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadImage(image)
                      }}
                      title="Download image"
                    >
                      💾
                    </button>
                    <button
                      type="button"
                      className="image-action-btn remove-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(image.id)
                      }}
                      title="Remove image"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="image-info">
                  <span className="image-name" title={image.name}>
                    {image.name.length > 15 ? `${image.name.substring(0, 15)}...` : image.name}
                  </span>
                  <span className="image-size">
                    {(image.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onClose} className="cancel-btn">
          Cancel
        </button>
        <button type="submit" className="submit-btn">
          {isEdit ? 'Update Request' : 'Add Request'}
        </button>
      </div>
    </form>
  )
}

export default DeficiencyFormContent