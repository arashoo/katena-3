import React, { useState, useEffect } from 'react'
import GlassTable from './components/GlassTable'
import AddGlassForm from './components/AddGlassForm'
import EmailOrder from './components/EmailOrder'
import ExportControls from './components/ExportControls'
import Dashboard from './components/Dashboard'
import BacklogManager from './components/BacklogManager'
import PendingOrders from './components/PendingOrders'
import Projects from './components/Projects'
import ConfirmationModal from './components/ConfirmationModal'
import ChangelogButton from './components/ChangelogButton'
import Login from './components/Login'
import apiService from './services/apiService'
import './App.css'

// Deficiency Form Component
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [glasses, setGlasses] = useState([])
  const [backlogReservations, setBacklogReservations] = useState([]) // New backlog state
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEmailOrder, setShowEmailOrder] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard') // New state for tab management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // Mobile dropdown state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [glassToDelete, setGlassToDelete] = useState(null)
  const [showBacklogConfirmation, setShowBacklogConfirmation] = useState(false)
  const [glassToBacklog, setGlassToBacklog] = useState(null)
  const [orderInitialData, setOrderInitialData] = useState(null)
  const [deficiencies, setDeficiencies] = useState([])
  const [showDeficiencyModal, setShowDeficiencyModal] = useState(false)
  const [showDeficiencyView, setShowDeficiencyView] = useState(false)
  const [showDeficiencyEdit, setShowDeficiencyEdit] = useState(false)
  const [selectedDeficiency, setSelectedDeficiency] = useState(null)
  const [showCompleteConfirmation, setShowCompleteConfirmation] = useState(false)
  const [deficiencyToComplete, setDeficiencyToComplete] = useState(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deficiencyToDelete, setDeficiencyToDelete] = useState(null)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-dropdown-container')) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  // Check authentication on app load
  useEffect(() => {
    const checkAuthentication = () => {
      const loginTimestamp = localStorage.getItem('katenaLoginTime')
      if (loginTimestamp) {
        const loginTime = parseInt(loginTimestamp)
        const currentTime = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        
        if (currentTime - loginTime < twentyFourHours) {
          setIsAuthenticated(true)
        } else {
          // Login expired, remove from localStorage
          localStorage.removeItem('katenaLoginTime')
        }
      }
    }
    
    checkAuthentication()
  }, [])

  // Load data from backend on startup
  useEffect(() => {
    loadDataFromBackend()
  }, [])

  const loadDataFromBackend = async () => {
    try {
      // Load glasses from backend
      const glassesData = await apiService.getGlasses()
      const sanitizedGlasses = sanitizeGlassData(glassesData)
      
      // Validate data integrity
      const validationResults = sanitizedGlasses.map(validateGlassIntegrity)
      const invalidGlasses = validationResults.filter(result => !result.isValid)
      
      if (invalidGlasses.length > 0) {
        console.warn('⚠️ Data integrity issues found:', invalidGlasses)
        invalidGlasses.forEach(result => {
          console.warn(`Glass ${result.glass.id}:`, result.errors)
        })
      }
      
      setGlasses(sanitizedGlasses)

      // Load backlog from backend
      const backlogData = await apiService.getBacklog()
      setBacklogReservations(backlogData)

      // Load deficiencies from backend
      const deficienciesData = await apiService.getDeficiencies()
      setDeficiencies(deficienciesData)
    } catch (error) {
      console.error('Failed to load data from backend:', error)
      // Fallback to localStorage if backend is not available
      const savedGlasses = localStorage.getItem('glassInventory')
      const savedBacklog = localStorage.getItem('backlogReservations')
      
      if (savedGlasses) {
        const parsedGlasses = JSON.parse(savedGlasses)
        setGlasses(parsedGlasses)
      }
      
      if (savedBacklog) {
        setBacklogReservations(JSON.parse(savedBacklog))
      }
    }
  }

  // Function to validate and sanitize glass data
  const sanitizeGlassData = (glassArray) => {
    return glassArray.map(glass => {
      let sanitizedGlass = {
        ...glass,
        count: Math.max(0, Math.floor(glass.count || 0)),
        availableCount: Math.max(0, Math.floor(glass.availableCount || 0)),
        reservedCount: Math.max(0, Math.floor(glass.reservedCount || 0)),
        reservedProjects: (glass.reservedProjects || []).map(project => ({
          ...project,
          quantity: Math.max(0, Math.floor(project.quantity || 0))
        }))
      }
      
      // Calculate actual reserved count from projects
      const actualReservedCount = sanitizedGlass.reservedProjects.reduce((sum, project) => sum + project.quantity, 0)
      
      // Enforce validation rules:
      // 1. Reserved count cannot exceed total count
      // 2. Available count cannot exceed total count  
      // 3. Available + Reserved should equal Total
      
      const totalCount = sanitizedGlass.count
      const proposedReserved = Math.min(actualReservedCount, totalCount) // Cannot exceed total
      const proposedAvailable = totalCount - proposedReserved // Available = Total - Reserved
      
      // Ensure available count doesn't exceed what's mathematically possible
      sanitizedGlass.reservedCount = proposedReserved
      sanitizedGlass.availableCount = Math.max(0, proposedAvailable)
      
      // If reserved projects total more than total count, we need to adjust the total upward
      if (actualReservedCount > totalCount) {
        console.warn(`Glass ${sanitizedGlass.id}: Reserved count (${actualReservedCount}) exceeds total count (${totalCount}). Adjusting total count.`)
        sanitizedGlass.count = actualReservedCount
        sanitizedGlass.availableCount = 0
        sanitizedGlass.reservedCount = actualReservedCount
      }
      
      // Final validation: ensure available + reserved = total
      const finalTotal = sanitizedGlass.availableCount + sanitizedGlass.reservedCount
      if (finalTotal !== sanitizedGlass.count) {
        sanitizedGlass.count = finalTotal
      }
      
      return sanitizedGlass
    })
  }

  // Function to validate glass data integrity
  const validateGlassIntegrity = (glass) => {
    const errors = []
    const totalCount = Math.floor(glass.count || 0)
    const availableCount = Math.floor(glass.availableCount || 0)
    const reservedCount = Math.floor(glass.reservedCount || 0)
    
    // Rule 1: Available count cannot exceed total count
    if (availableCount > totalCount) {
      errors.push(`Available count (${availableCount}) exceeds total count (${totalCount})`)
    }
    
    // Rule 2: Reserved count cannot exceed total count
    if (reservedCount > totalCount) {
      errors.push(`Reserved count (${reservedCount}) exceeds total count (${totalCount})`)
    }
    
    // Rule 3: Available count cannot be negative
    if (availableCount < 0) {
      errors.push(`Available count is negative (${availableCount})`)
    }
    
    // Rule 4: Reserved count cannot be negative
    if (reservedCount < 0) {
      errors.push(`Reserved count is negative (${reservedCount})`)
    }
    
    // Rule 5: Available + Reserved should equal Total
    const sum = availableCount + reservedCount
    if (sum !== totalCount) {
      errors.push(`Available (${availableCount}) + Reserved (${reservedCount}) = ${sum}, but Total is ${totalCount}`)
    }
    
    // Rule 6: Reserved projects total should match reserved count
    const projectsTotal = (glass.reservedProjects || []).reduce((sum, project) => 
      sum + Math.floor(project.quantity || 0), 0)
    if (projectsTotal !== reservedCount) {
      errors.push(`Reserved projects total (${projectsTotal}) doesn't match reserved count (${reservedCount})`)
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      glass: glass
    }
  }

  // Function to validate and fix inventory data consistency
  const validateAndFixInventoryData = (data) => {
    // This function ensures that inventory counts are consistent
    // For any glass with the same specs, the total available + reserved should match
    const groupedData = data.reduce((groups, glass) => {
      const key = `${glass.width}-${glass.height}-${glass.color}-${glass.heatSoaked}`
      if (!groups[key]) {
        groups[key] = { available: [], reserved: [] }
      }
      
      if (glass.reservedProject) {
        groups[key].reserved.push(glass)
      } else {
        groups[key].available.push(glass)
      }
      
      return groups
    }, {})

    // For now, just return the data as-is
    // In the future, we could add validation logic here
    return data
  }

  // Load backlog from localStorage on startup
  useEffect(() => {
    const savedBacklog = localStorage.getItem('backlogReservations')
    if (savedBacklog) {
      setBacklogReservations(JSON.parse(savedBacklog))
    }
  }, [])

  const addGlass = async (glassData) => {
    try {
      const newGlass = await apiService.addGlass(glassData)
      const updatedGlasses = [...glasses, newGlass]
      setGlasses(updatedGlasses)
      // Keep localStorage as backup
      localStorage.setItem('glassInventory', JSON.stringify(updatedGlasses))
    } catch (error) {
      console.error('Failed to add glass:', error)
      // Fallback to local-only add with proper availableCount/reservedCount logic
      
      // Determine availableCount and reservedCount based on project assignment
      let availableCount, reservedCount, reservedProjects, reservedProject;
      
      if (glassData.reservedProject && glassData.reservedProject.trim() !== '') {
        // Glass is assigned to a project - all pieces are reserved
        availableCount = 0;
        reservedCount = glassData.count;
        reservedProjects = [glassData.reservedProject.trim()];
        reservedProject = glassData.reservedProject.trim();
      } else {
        // Glass has no project - all pieces are available
        availableCount = glassData.count;
        reservedCount = 0;
        reservedProjects = [];
        reservedProject = null;
      }
      
      const newGlass = {
        id: Date.now() + Math.random(),
        width: glassData.width,
        height: glassData.height,
        color: glassData.color,
        heatSoaked: glassData.heatSoaked || false,
        racks: Array.isArray(glassData.racks) ? glassData.racks : (glassData.rack ? [glassData.rack] : []),
        count: glassData.count,
        availableCount,
        reservedCount,
        reservedProjects,
        reservedProject,
        dateAdded: new Date().toLocaleDateString()
      }
      const updatedGlasses = [...glasses, newGlass]
      setGlasses(updatedGlasses)
      localStorage.setItem('glassInventory', JSON.stringify(updatedGlasses))
    }
  }

  const updateGlass = async (id, updatedData) => {
    try {
      // Pre-validation: Ensure updated data maintains integrity
      const currentGlass = glasses.find(g => g.id === id)
      const mergedGlass = { ...currentGlass, ...updatedData }
      const validation = validateGlassIntegrity(mergedGlass)
      
      if (!validation.isValid) {
        console.error(`❌ Update would violate data integrity for glass ${id}:`, validation.errors)
        alert(`Cannot update glass: ${validation.errors.join(', ')}`)
        return
      }

      await apiService.updateGlass(id, updatedData)
      const updatedGlasses = glasses.map(glass => 
        glass.id === id ? { ...glass, ...updatedData } : glass
      )
      
      // Post-validation: Ensure the update was successful
      const updatedGlass = updatedGlasses.find(g => g.id === id)
      const postValidation = validateGlassIntegrity(updatedGlass)
      
      if (!postValidation.isValid) {
        console.error(`❌ Update resulted in invalid data for glass ${id}:`, postValidation.errors)
        alert(`Update failed validation: ${postValidation.errors.join(', ')}`)
        return
      }
      
      setGlasses(updatedGlasses)
      // Keep localStorage as backup
      localStorage.setItem('glassInventory', JSON.stringify(updatedGlasses))
    } catch (error) {
      console.error('Failed to update glass:', error)
      alert(`Failed to update glass: ${error.message}`)
    }
  }

  const moveReservationToBacklog = (reservationId) => {
    const reservation = glasses.find(glass => glass.id === reservationId)
    if (!reservation || !reservation.reservedProject) return
    
    // Add to backlog with timestamp
    const backlogItem = {
      ...reservation,
      backlogDate: new Date().toLocaleDateString(),
      originalProject: reservation.reservedProject,
      status: 'unallocated'
    }
    
    setBacklogReservations(prev => [...prev, backlogItem])
    
    // Remove from active reservations and restore inventory
    let updatedGlasses = glasses.filter(glass => glass.id !== reservationId)
    
    // Restore the count to the original glass
    const originalGlass = updatedGlasses.find(glass => 
      !glass.reservedProject &&
      glass.width === reservation.width &&
      glass.height === reservation.height &&
      glass.color === reservation.color &&
      glass.heatSoaked === reservation.heatSoaked
    )
    
    if (originalGlass) {
      updatedGlasses = updatedGlasses.map(glass =>
        glass.id === originalGlass.id 
          ? { ...glass, count: glass.count + reservation.count }
          : glass
      )
    } else {
      // If no original glass exists, create one to restore the inventory
      const restoredGlass = {
        ...reservation,
        id: Date.now() + Math.random(),
        reservedProject: '',
        dateAdded: new Date().toLocaleDateString()
      }
      updatedGlasses.push(restoredGlass)
    }
    
    setGlasses(updatedGlasses)
  }

  const deleteGlass = async (id) => {
    const glassToDelete = glasses.find(glass => glass.id === id)
    if (!glassToDelete) return
    
    try {
      console.log('🗑️ Attempting to delete glass with ID:', id)
      await apiService.deleteGlass(id)
      console.log('✅ Delete API call successful')
      
      let updatedGlasses = glasses.filter(glass => glass.id !== id)
      
      // If deleting a reservation, restore the count to the original glass
      if (glassToDelete.reservedProject) {
        const originalGlass = updatedGlasses.find(glass => 
          !glass.reservedProject &&
          glass.width === glassToDelete.width &&
          glass.height === glassToDelete.height &&
          glass.color === glassToDelete.color &&
          glass.heatSoaked === glassToDelete.heatSoaked
        )
        
        if (originalGlass) {
          updatedGlasses = updatedGlasses.map(glass =>
            glass.id === originalGlass.id 
              ? { ...glass, count: glass.count + glassToDelete.count }
              : glass
          )
        } else {
          // If no original glass exists, create one to restore the inventory
          const restoredGlass = {
            ...glassToDelete,
            id: Date.now() + Math.random(),
            reservedProject: '',
            dateAdded: new Date().toLocaleDateString()
          }
          updatedGlasses.push(restoredGlass)
        }
      }
      
      setGlasses(updatedGlasses)

      // Keep localStorage as backup
      localStorage.setItem('glassInventory', JSON.stringify(updatedGlasses))
      console.log('🎉 Delete operation completed successfully')
    } catch (error) {
      console.error('❌ Error deleting glass:', error)
      alert('Failed to delete glass: ' + error.message)
      // Continue with local delete as fallback
      let updatedGlasses = glasses.filter(glass => glass.id !== id)
      
      // If deleting a reservation, restore the count to the original glass
      if (glassToDelete.reservedProject) {
        const originalGlass = updatedGlasses.find(glass => 
          !glass.reservedProject &&
          glass.width === glassToDelete.width &&
          glass.height === glassToDelete.height &&
          glass.color === glassToDelete.color &&
          glass.heatSoaked === glassToDelete.heatSoaked
        )
        
        if (originalGlass) {
          updatedGlasses = updatedGlasses.map(glass =>
            glass.id === originalGlass.id 
              ? { ...glass, count: glass.count + glassToDelete.count }
              : glass
          )
        } else {
          // If no original glass exists, create one to restore the inventory
          const restoredGlass = {
            ...glassToDelete,
            id: Date.now() + Math.random(),
            reservedProject: '',
            dateAdded: new Date().toLocaleDateString()
          }
          updatedGlasses.push(restoredGlass)
        }
      }
      
      setGlasses(updatedGlasses)

      localStorage.setItem('glassInventory', JSON.stringify(updatedGlasses))
    }
  }

  const deleteGlassGroup = async (groupSpecs) => {
    // Delete all glass entries (available and reserved) that match the group specifications
    const groupKey = `${groupSpecs.width}-${groupSpecs.height}-${groupSpecs.color}-${groupSpecs.heatSoaked}`
    
    // Find all glasses that match the group specifications
    const glassesToDelete = glasses.filter(glass => {
      const glassKey = `${glass.width}-${glass.height}-${glass.color}-${glass.heatSoaked}`
      return glassKey === groupKey
    })
    
    console.log(`🗂️ Deleting group: ${glassesToDelete.length} glasses found for deletion`, groupSpecs)
    
    // Delete each glass via API
    const deletePromises = glassesToDelete.map(glass => {
      console.log(`🔥 Deleting individual glass via API:`, glass.id)
      return apiService.deleteGlass(glass.id)
    })
    
    try {
      await Promise.all(deletePromises)
      console.log(`✅ Successfully deleted all ${glassesToDelete.length} glasses in group`)
      
      // Update local state after successful API calls
      const updatedGlasses = glasses.filter(glass => {
        const glassKey = `${glass.width}-${glass.height}-${glass.color}-${glass.heatSoaked}`
        return glassKey !== groupKey
      })
      
      setGlasses(updatedGlasses)

    } catch (error) {
      console.error('❌ Error deleting group:', error)
      // You might want to show an error message to the user here
    }
  }

  const smartReallocateFromBacklog = (backlogItemId, projectName = null) => {
    const backlogItem = backlogReservations.find(item => item.id === backlogItemId)
    if (!backlogItem) return

    // Check if there's sufficient inventory available
    const availableGlass = glasses.find(glass => 
      !glass.reservedProject &&
      glass.width === backlogItem.width &&
      glass.height === backlogItem.height &&
      glass.color === backlogItem.color &&
      glass.heatSoaked === backlogItem.heatSoaked &&
      glass.count >= backlogItem.count
    )

    if (availableGlass) {
      // Sufficient inventory available - proceed with automatic reallocation
      const finalProjectName = projectName || backlogItem.originalProject || 'Restored Reservation'
      reallocateFromBacklog(backlogItemId, finalProjectName)
      return { success: true, message: 'Automatically reallocated to inventory' }
    } else {
      // Insufficient inventory - check if we should order or just show modal
      if (projectName) {
        // User confirmed ordering - add the needed glass to inventory first
        const neededAmount = backlogItem.count - (availableGlass?.count || 0)
        const newGlass = {
          id: Date.now() + Math.random(),
          width: backlogItem.width,
          height: backlogItem.height,
          color: backlogItem.color,
          count: neededAmount,
          heatSoaked: backlogItem.heatSoaked,
          reservedProject: '',
          rackNumber: 'NEW-ORDER',
          dateAdded: new Date().toLocaleDateString()
        }
        
        // Add new glass to inventory
        const updatedGlasses = [...glasses, newGlass]
        setGlasses(updatedGlasses)
        
        // Now reallocate with sufficient inventory
        setTimeout(() => {
          reallocateFromBacklog(backlogItemId, projectName)
        }, 100) // Small delay to ensure state is updated
        
        return { success: true, message: 'Glass ordered and allocated' }
      } else {
        // Just checking availability - return info for ordering decision
        return { 
          success: false, 
          needsOrder: true,
          backlogItem,
          message: 'Insufficient inventory available. Order more glass?' 
        }
      }
    }
  }

  const reallocateFromBacklog = (backlogItemId, newProjectName) => {
    const backlogItem = backlogReservations.find(item => item.id === backlogItemId)
    if (!backlogItem) return
    
    // Remove from backlog
    setBacklogReservations(prev => prev.filter(item => item.id !== backlogItemId))
    
    // Create new reservation
    const newReservation = {
      ...backlogItem,
      reservedProject: newProjectName,
      dateAdded: new Date().toLocaleDateString(),
      id: Date.now() + Math.random() // New ID for the new reservation
    }
    
    // Reduce available inventory and add reservation
    let updatedGlasses = [...glasses]
    
    const originalGlass = updatedGlasses.find(glass => 
      !glass.reservedProject &&
      glass.width === backlogItem.width &&
      glass.height === backlogItem.height &&
      glass.color === backlogItem.color &&
      glass.heatSoaked === backlogItem.heatSoaked
    )
    
    if (originalGlass && originalGlass.count >= backlogItem.count) {
      // Reduce available inventory
      updatedGlasses = updatedGlasses.map(glass =>
        glass.id === originalGlass.id 
          ? { ...glass, count: glass.count - backlogItem.count }
          : glass
      )
      
      // Add new reservation
      updatedGlasses.push(newReservation)
      
      setGlasses(updatedGlasses)

    } else {
      alert('Insufficient inventory available for this allocation.')
      // Put back in backlog if allocation failed
      setBacklogReservations(prev => [...prev, backlogItem])
    }
  }

  const deleteFromBacklog = async (backlogItemId) => {
    try {
      // Delete from backend first
      await apiService.deleteFromBacklog(backlogItemId)
      
      // Update local state only if backend deletion succeeds
      setBacklogReservations(prev => prev.filter(item => item.id !== backlogItemId))
      
      console.log('Backlog item deleted successfully:', backlogItemId)
    } catch (error) {
      console.error('Failed to delete backlog item:', error)
      alert('Failed to delete item from backlog. Please try again.')
    }
  }

  const allocateFromBacklog = async (backlogItemId) => {
    const backlogItem = backlogReservations.find(item => item.id === backlogItemId)
    if (!backlogItem) return

    try {
      // Find matching glass in consolidated inventory
      const matchingGlass = glasses.find(glass => 
        glass.width === backlogItem.width &&
        glass.height === backlogItem.height &&
        glass.color === backlogItem.color &&
        glass.heatSoaked === backlogItem.heatSoaked
      )

      if (!matchingGlass) {
        alert('No matching glass found in inventory.')
        return
      }

      // Check available count (ensure non-negative whole number)
      const availableCount = Math.max(0, Math.floor(matchingGlass.availableCount || 0))
      
      if (availableCount === 0) {
        alert('No stock available for allocation. Please use the Order button instead.')
        return
      }

      // Remove from backlog first (API call)
      await apiService.deleteFromBacklog(backlogItemId)
      setBacklogReservations(prev => prev.filter(item => item.id !== backlogItemId))

      // Create new project entry
      const newProject = {
        projectName: backlogItem.originalProject,
        quantity: Math.floor(backlogItem.count), // Ensure whole number
        dateAdded: new Date().toISOString(),
        notes: `Allocated from backlog on ${new Date().toLocaleDateString()}`
      }

      // Update the glass entry with new reservation
      const updatedGlasses = glasses.map(glass => {
        if (glass.id === matchingGlass.id) {
          const currentReserved = glass.reservedProjects || []
          const currentReservedCount = Math.max(0, Math.floor(glass.reservedCount || 0))
          const currentAvailableCount = Math.max(0, Math.floor(glass.availableCount || 0))
          const currentTotalCount = Math.max(0, Math.floor(glass.count || 0))
          
          const allocationQuantity = Math.floor(backlogItem.count)
          
          // Validate allocation doesn't violate constraints
          const newReservedCount = currentReservedCount + allocationQuantity
          const newAvailableCount = currentAvailableCount - allocationQuantity
          
          // Ensure available count cannot go negative
          if (newAvailableCount < 0) {
            throw new Error(`Cannot allocate ${allocationQuantity} pieces. Only ${currentAvailableCount} available.`)
          }
          
          // Ensure reserved count doesn't exceed total
          if (newReservedCount > currentTotalCount) {
            throw new Error(`Cannot reserve ${newReservedCount} pieces. Total inventory is only ${currentTotalCount}.`)
          }
          
          // Validate: available + reserved = total
          const expectedTotal = newAvailableCount + newReservedCount
          if (expectedTotal !== currentTotalCount) {
            console.warn(`Glass ${glass.id}: Count mismatch after allocation. Adjusting total from ${currentTotalCount} to ${expectedTotal}`)
          }

          return {
            ...glass,
            reservedProjects: [...currentReserved, newProject],
            reservedCount: newReservedCount,
            availableCount: newAvailableCount,
            count: Math.max(currentTotalCount, expectedTotal) // Ensure total is never less than available + reserved
          }
        }
        return glass
      })

      // Update glasses via API
      const glassToUpdate = updatedGlasses.find(g => g.id === matchingGlass.id)
      await apiService.updateGlass(matchingGlass.id, glassToUpdate)
      
      setGlasses(updatedGlasses)

      // Success message
      if (availableCount >= backlogItem.count) {
        alert(`✅ Successfully allocated ${Math.floor(backlogItem.count)} pieces of ${backlogItem.width}" × ${backlogItem.height}" ${backlogItem.color} to ${backlogItem.originalProject}`)
      } else {
        const shortage = Math.floor(backlogItem.count) - availableCount
        alert(`⚠️ Allocated ${Math.floor(backlogItem.count)} pieces to ${backlogItem.originalProject}.\n${availableCount} from inventory, ${shortage} pieces short.\nYou may need to order additional glass.`)
      }

    } catch (error) {
      console.error('Failed to allocate from backlog:', error)
      alert('Failed to allocate from backlog. Please try again.')
    }
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    const newSortConfig = { key, direction }
    setSortConfig(newSortConfig)
  }

  // Function to refresh backlog and inventory data
  const refreshBacklogData = async () => {
    try {
      // Reload both glasses and backlog data to get latest state
      const [glassesData, backlogData] = await Promise.all([
        apiService.getGlasses(),
        apiService.getBacklog()
      ])
      
      const sanitizedGlasses = sanitizeGlassData(glassesData)
      setGlasses(sanitizedGlasses)
      setBacklogReservations(backlogData)
      
      console.log('Backlog data refreshed with latest inventory')
    } catch (error) {
      console.error('Failed to refresh backlog data:', error)
    }
  }

  // Function to handle tab changes with data refresh for backlog
  const handleTabChange = (tabName) => {
    setActiveTab(tabName)
    setIsMobileMenuOpen(false) // Close mobile menu when tab is selected
    
    // Refresh data when switching to backlog tab
    if (tabName === 'backlog') {
      refreshBacklogData()
    }
  }

  // Tab configuration for easy management
  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'inventory', label: 'Inventory', icon: '📋' },
    { key: 'backlog', label: `Backlog (${backlogReservations.length})`, icon: '📝' },
    { key: 'pending', label: 'Pending Orders', icon: '🚚' },
    { key: 'projects', label: 'Projects', icon: '🏗️' },
    { key: 'deficiencies', label: 'Deficiencies', icon: '⚠️' }
  ]

  const getCurrentTabLabel = () => {
    const currentTab = tabs.find(tab => tab.key === activeTab)
    return currentTab ? `${currentTab.icon} ${currentTab.label}` : 'Select Tab'
  }

  // Generate unique ID for deficiencies
  const generateDeficiencyId = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `DEF-${timestamp}-${random}`
  }

  // Handle adding new deficiency
  const handleAddDeficiency = async (deficiencyData) => {
    const newDeficiency = {
      id: generateDeficiencyId(),
      projectName: deficiencyData.projectName,
      description: deficiencyData.description,
      status: deficiencyData.status,
      priority: deficiencyData.priority,
      dateOpened: new Date().toLocaleDateString(),
      dateClosed: null
    }
    
    try {
      // Save to backend
      await apiService.saveDeficiency(newDeficiency)
      setDeficiencies(prev => [...prev, newDeficiency])
      setShowDeficiencyModal(false)
    } catch (error) {
      console.error('Failed to save deficiency:', error)
      // Still add to local state as fallback
      setDeficiencies(prev => [...prev, newDeficiency])
      setShowDeficiencyModal(false)
    }
  }

  // Handle viewing deficiency details
  const handleViewDeficiency = (deficiency) => {
    setSelectedDeficiency(deficiency)
    setShowDeficiencyView(true)
  }

  // Handle editing deficiency
  const handleEditDeficiency = (deficiency) => {
    setSelectedDeficiency(deficiency)
    setShowDeficiencyEdit(true)
  }

  // Handle completing deficiency - show confirmation
  const handleCompleteDeficiency = (deficiencyId) => {
    const deficiency = deficiencies.find(def => def.id === deficiencyId)
    setDeficiencyToComplete(deficiency)
    setShowCompleteConfirmation(true)
  }

  // Confirm complete deficiency
  const confirmCompleteDeficiency = async () => {
    if (!deficiencyToComplete) return
    
    try {
      const updatedDeficiencies = deficiencies.map(def => 
        def.id === deficiencyToComplete.id 
          ? { ...def, status: 'Completed', dateClosed: new Date().toLocaleDateString() }
          : def
      )
      
      // Save to backend
      const updatedDeficiency = updatedDeficiencies.find(def => def.id === deficiencyToComplete.id)
      await apiService.updateDeficiency(updatedDeficiency)
      
      setDeficiencies(updatedDeficiencies)
      setShowCompleteConfirmation(false)
      setDeficiencyToComplete(null)
    } catch (error) {
      console.error('Failed to complete deficiency:', error)
      // Still update local state as fallback
      const updatedDeficiencies = deficiencies.map(def => 
        def.id === deficiencyToComplete.id 
          ? { ...def, status: 'Completed', dateClosed: new Date().toLocaleDateString() }
          : def
      )
      setDeficiencies(updatedDeficiencies)
      setShowCompleteConfirmation(false)
      setDeficiencyToComplete(null)
    }
  }

  // Cancel complete deficiency
  const cancelCompleteDeficiency = () => {
    setShowCompleteConfirmation(false)
    setDeficiencyToComplete(null)
  }

  // Handle delete deficiency - show confirmation
  const handleDeleteDeficiency = (deficiency) => {
    setDeficiencyToDelete(deficiency)
    setShowDeleteConfirmation(true)
  }

  // Confirm delete deficiency
  const confirmDeleteDeficiency = async () => {
    if (!deficiencyToDelete) return
    
    try {
      // Delete from backend
      await apiService.deleteDeficiency(deficiencyToDelete.id)
      
      // Remove from frontend state
      setDeficiencies(prev => prev.filter(def => def.id !== deficiencyToDelete.id))
      setShowDeleteConfirmation(false)
      setDeficiencyToDelete(null)
    } catch (error) {
      console.error('Failed to delete deficiency:', error)
      // Still remove from local state as fallback
      setDeficiencies(prev => prev.filter(def => def.id !== deficiencyToDelete.id))
      setShowDeleteConfirmation(false)
      setDeficiencyToDelete(null)
    }
  }

  // Cancel delete deficiency
  const cancelDeleteDeficiency = () => {
    setShowDeleteConfirmation(false)
    setDeficiencyToDelete(null)
  }

  // Handle updating deficiency
  const handleUpdateDeficiency = async (updatedData) => {
    try {
      const updatedDeficiencies = deficiencies.map(def => 
        def.id === selectedDeficiency.id 
          ? { ...def, ...updatedData }
          : def
      )
      
      // Save to backend
      await apiService.updateDeficiency({ ...selectedDeficiency, ...updatedData })
      
      setDeficiencies(updatedDeficiencies)
      setShowDeficiencyEdit(false)
      setSelectedDeficiency(null)
    } catch (error) {
      console.error('Failed to update deficiency:', error)
      // Still update local state as fallback
      const updatedDeficiencies = deficiencies.map(def => 
        def.id === selectedDeficiency.id 
          ? { ...def, ...updatedData }
          : def
      )
      setDeficiencies(updatedDeficiencies)
      setShowDeficiencyEdit(false)
      setSelectedDeficiency(null)
    }
  }

  const reserveGlass = async (glassId, reservationData) => {
    try {
      // Pre-validation: Check if reservation would violate rules
      const glass = glasses.find(g => g.id === glassId)
      if (!glass) {
        throw new Error('Glass not found')
      }
      
      const reservationQuantity = Math.floor(reservationData.quantity || 0)
      const currentAvailable = Math.floor(glass.availableCount || 0)
      const currentReserved = Math.floor(glass.reservedCount || 0)
      const totalGlass = Math.floor(glass.count || 0)
      
      // Validate reservation quantity
      if (reservationQuantity <= 0) {
        throw new Error('Reservation quantity must be positive')
      }
      
      if (reservationQuantity > currentAvailable) {
        throw new Error(`Cannot reserve ${reservationQuantity} pieces. Only ${currentAvailable} available.`)
      }
      
      if ((currentReserved + reservationQuantity) > totalGlass) {
        throw new Error(`Reservation would exceed total inventory. Total: ${totalGlass}, Current Reserved: ${currentReserved}, Requested: ${reservationQuantity}`)
      }

      // Call the new reservation API
      const response = await apiService.reserveGlass(glassId, reservationData)
      
      // Validate the response data integrity
      const updatedGlass = response.updatedGlass
      const validation = validateGlassIntegrity(updatedGlass)
      
      if (!validation.isValid) {
        console.error('❌ Server returned invalid glass data:', validation.errors)
        throw new Error('Server returned invalid data: ' + validation.errors.join(', '))
      }
      
      // Update the glasses array with the validated glass from the server
      const updatedGlasses = glasses.map(glass =>
        glass.id === glassId ? updatedGlass : glass
      )
      
      setGlasses(updatedGlasses)
      
      
    } catch (error) {
      console.error('Error creating reservation:', error)
      alert(`Failed to reserve glass: ${error.message}`)
    }
  }

  const updateReservation = (reservationId, updatedData) => {
    const reservation = glasses.find(glass => glass.id === reservationId)
    if (!reservation || !reservation.reservedProject) return

    const oldCount = reservation.count
    const newCount = updatedData.count || oldCount
    const countDifference = newCount - oldCount

    // Find the corresponding original glass entry that was reduced when this reservation was made
    // Look for glass with same specs but no reservedProject
    const originalGlass = glasses.find(glass =>
      !glass.reservedProject &&
      glass.width === reservation.width &&
      glass.height === reservation.height &&
      glass.color === reservation.color &&
      glass.heatSoaked === reservation.heatSoaked
    )

    const updatedGlasses = glasses.map(glass => {
      if (glass.id === reservationId) {
        // Update the reservation
        return { ...glass, ...updatedData }
      } else if (originalGlass && glass.id === originalGlass.id) {
        // Adjust the original glass count (subtract the difference)
        return { ...glass, count: Math.max(0, glass.count - countDifference) }
      }
      return glass
    })

    // Clear all filters and search so the updated row is visible
    setGlasses(updatedGlasses)
  }

  const handleDeleteConfirm = (glass) => {
    setGlassToDelete(glass)
    setShowConfirmation(true)
  }

  const confirmDelete = async () => {
    console.log('🎯 Confirm delete called with:', glassToDelete)
    if (glassToDelete) {
      if (glassToDelete.isGroupDelete) {
        // Delete entire group
        console.log('🗂️ Deleting group:', glassToDelete)
        await deleteGlassGroup(glassToDelete)
      } else {
        // Delete individual glass
        console.log('🔍 Deleting individual glass ID:', glassToDelete.id)
        deleteGlass(glassToDelete.id)
      }
      setGlassToDelete(null)
      setShowConfirmation(false)
    } else {
      console.log('⚠️ No glass to delete found')
    }
  }

  const cancelDelete = () => {
    setGlassToDelete(null)
    setShowConfirmation(false)
  }

  const handleMoveToBacklogConfirm = async (backlogData) => {
    try {
      // Create proper backlog entry format
      const backlogEntry = {
        width: backlogData.width,
        height: backlogData.height,
        color: backlogData.color,
        heatSoaked: backlogData.heatSoaked,
        count: backlogData.quantity,
        originalProject: backlogData.projectName,
        notes: `Moved from reservation - ${backlogData.projectName}`,
        reservedDate: backlogData.reservedDate
      }

      // Add to backend backlog
      const newBacklogItem = await apiService.addToBacklog(backlogEntry)
      
      // Update local backlog state
      setBacklogReservations(prev => [...prev, newBacklogItem])
      
      console.log('Successfully moved project to backlog:', newBacklogItem)
    } catch (error) {
      console.error('Failed to move project to backlog:', error)
      alert('Failed to move project to backlog. Please try again.')
    }
  }

  const confirmMoveToBacklog = () => {
    if (glassToBacklog) {
      moveReservationToBacklog(glassToBacklog.id)
      setGlassToBacklog(null)
      setShowBacklogConfirmation(false)
    }
  }

  const cancelMoveToBacklog = () => {
    setGlassToBacklog(null)
    setShowBacklogConfirmation(false)
  }

  const handleOpenOrderFromBacklog = (backlogItem) => {
    // Calculate the shortage amount
    const availableGlass = glasses.find(g => 
      !g.reservedProject &&
      g.width === backlogItem.width &&
      g.height === backlogItem.height &&
      g.color === backlogItem.color &&
      g.heatSoaked === backlogItem.heatSoaked
    )
    const availableCount = availableGlass?.count || 0
    const shortageAmount = backlogItem.count - availableCount
    
    // Prepare initial data for the order form
    const initialData = {
      width: backlogItem.width,
      height: backlogItem.height,
      color: backlogItem.color,
      quantity: shortageAmount, // Only order what's missing
      heatSoaked: backlogItem.heatSoaked,
      project: backlogItem.originalProject,
      notes: `Backlog order for ${backlogItem.originalProject}\n` +
             `Required: ${backlogItem.count} pieces\n` +
             `Available: ${availableCount} pieces\n` +
             `Ordering: ${shortageAmount} pieces\n` +
             `Original backlog date: ${backlogItem.backlogDate}`
    }
    
    // Store the initial data and open order window
    setOrderInitialData(initialData)
    setShowEmailOrder(true)
  }

  // Debug function to reset data (can be called from browser console)
  window.resetInventoryData = () => {
    localStorage.removeItem('glassInventory')
    window.location.reload()
  }

  // Calculate proper inventory totals
  const availableGlasses = glasses.filter(glass => glass && !glass.reservedProject)
  const reservedGlasses = glasses.filter(glass => glass && glass.reservedProject)
  
  const availableCount = availableGlasses.reduce((sum, glass) => sum + glass.count, 0)
  const reservedCount = reservedGlasses.reduce((sum, glass) => sum + glass.count, 0)
  const totalCount = availableCount + reservedCount

  // Handle login
  const handleLogin = () => {
    const currentTime = Date.now()
    localStorage.setItem('katenaLoginTime', currentTime.toString())
    setIsAuthenticated(true)
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('katenaLoginTime')
    setIsAuthenticated(false)
  }

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app">
      {/* Updates button - hidden on mobile/tablet */}
      <div className="updates-button-container">
        <ChangelogButton />
      </div>
      
      {/* Desktop Tab Navigation */}
      <nav className="app-tabs desktop-nav">
        <div className="tab-navigation-vertical">
          {tabs.map(tab => (
            <button 
              key={tab.key}
              className={`tab-btn-vertical ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile/Tablet Dropdown Navigation */}
      <nav className="app-tabs mobile-nav">
        <div className="mobile-dropdown-container">
          <button 
            className="mobile-dropdown-trigger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {getCurrentTabLabel()}
            <span className={`dropdown-arrow ${isMobileMenuOpen ? 'open' : ''}`}>▼</span>
          </button>
          
          {isMobileMenuOpen && (
            <div className="mobile-dropdown-menu">
              {tabs.map(tab => (
                <button 
                  key={tab.key}
                  className={`mobile-dropdown-item ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.key)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
      
      <header className="app-header">
        <h1>Glass Inventory Management System</h1>
        <div className="stats">
          <span>Total: {totalCount}</span>
          <span>Available: {availableCount}</span>
          <span>Reserved: {reservedCount}</span>
        </div>
        <div className="header-controls">
          <button 
            className="add-glass-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add New Glass'}
          </button>
          <button 
            className="order-glass-btn"
            onClick={() => setShowEmailOrder(!showEmailOrder)}
          >
            📧 Order Glass
          </button>
          <ExportControls glasses={glasses} />
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999999
        }}>
          <div style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            position: 'relative',
            zIndex: 1000000000
          }}>
            <AddGlassForm 
              onAddGlass={addGlass}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {showEmailOrder && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999999
        }}>
          <div style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            zIndex: 1000000000
          }}>
            <EmailOrder 
              onCancel={() => {
                setShowEmailOrder(false)
                setOrderInitialData(null) // Clear initial data when closing
              }}
              glasses={glasses}
              initialData={orderInitialData}
            />
          </div>
        </div>
      )}

      <main className="app-main">
        {/* Tab Content */}

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <Dashboard glasses={glasses} />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="tab-content">
            <GlassTable 
              glasses={glasses}
              onUpdateGlass={updateGlass}
              onDeleteGlass={handleDeleteConfirm}
              onMoveToBacklog={handleMoveToBacklogConfirm}
              onSort={handleSort}
              sortConfig={sortConfig}
              onReserveGlass={reserveGlass}
              onUpdateReservation={updateReservation}
              onSwitchToBacklog={() => handleTabChange('backlog')}
            />
          </div>
        )}

        {activeTab === 'backlog' && (
          <div className="tab-content">
            <BacklogManager
              backlogReservations={backlogReservations}
              onSmartReallocate={smartReallocateFromBacklog}
              onAllocate={allocateFromBacklog}
              onDelete={deleteFromBacklog}
              availableGlasses={glasses}
              onOpenOrderGlass={handleOpenOrderFromBacklog}
            />
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="tab-content">
            <PendingOrders />
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="tab-content">
            <Projects glasses={glasses} />
          </div>
        )}

        {activeTab === 'deficiencies' && (
          <div className="tab-content">
            <div className="deficiencies-container">
              <div className="deficiencies-header">
                <div className="deficiencies-title-section">
                  <div></div>
                  <button className="add-request-btn" onClick={() => setShowDeficiencyModal(true)}>
                    ➕ Add Request
                  </button>
                </div>
              </div>
              
              <div className="deficiencies-content">
                <div className="deficiencies-table-container">
                  <table className="deficiencies-table">
                    <thead>
                      <tr>
                        <th className="actions-column">Actions</th>
                        <th>Record ID</th>
                        <th>Project Name</th>
                        <th className="description-column">Description</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Date Opened</th>
                        <th>Date Closed</th>
                        <th className="complete-column">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deficiencies.length === 0 ? (
                        <tr className="empty-row">
                          <td colSpan="9" className="empty-message">
                            <div className="empty-state-inline">
                              <div className="empty-icon">📋</div>
                              <div className="empty-text">
                                <h4>No Deficiencies Recorded</h4>
                                <p>Use the "Add Request" button to create your first deficiency record.</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        deficiencies.map((deficiency) => (
                          <tr key={deficiency.id} className="deficiency-row">
                            <td className="actions-column">
                              <button 
                                className="view-btn" 
                                title="View Details"
                                onClick={() => handleViewDeficiency(deficiency)}
                              >
                                👁️
                              </button>
                              <button 
                                className="edit-btn" 
                                title="Edit"
                                onClick={() => handleEditDeficiency(deficiency)}
                              >
                                ✏️
                              </button>
                              <button 
                                className="delete-btn" 
                                title="Delete"
                                onClick={() => handleDeleteDeficiency(deficiency)}
                              >
                                🗑️
                              </button>
                            </td>
                            <td>{deficiency.id}</td>
                            <td>{deficiency.projectName}</td>
                            <td className="description-cell">{deficiency.description}</td>
                            <td>
                              <span className={`status-badge status-${deficiency.status.toLowerCase().replace(' ', '-')}`}>
                                {deficiency.status}
                              </span>
                            </td>
                            <td>
                              <span className={`priority-badge priority-${deficiency.priority.toLowerCase()}`}>
                                {deficiency.priority}
                              </span>
                            </td>
                            <td>{deficiency.dateOpened}</td>
                            <td>{deficiency.dateClosed || '-'}</td>
                            <td className="complete-action">
                              {deficiency.status !== 'Completed' && (
                                <button 
                                  className="complete-btn"
                                  title="Mark as Completed"
                                  onClick={() => handleCompleteDeficiency(deficiency.id)}
                                >
                                  ✓ Complete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showConfirmation && (
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title={glassToDelete?.isGroupDelete ? "Delete Glass Group" : "Delete Glass"}
          message={
            glassToDelete?.isGroupDelete 
              ? `Are you sure you want to delete all ${glassToDelete.affectedItems} glass entries for ${glassToDelete.width}" × ${glassToDelete.height}" ${glassToDelete.color}? This will delete ${glassToDelete.totalCount} total pieces including reservations.`
              : `Are you sure you want to delete this glass entry: ${glassToDelete?.width}" × ${glassToDelete?.height}" ${glassToDelete?.color}?`
          }
          confirmText="Delete"
          type="danger"
        />
      )}

      {showBacklogConfirmation && (
        <ConfirmationModal
          isOpen={showBacklogConfirmation}
          onClose={cancelMoveToBacklog}
          onConfirm={confirmMoveToBacklog}
          title="Move Reservation to Backlog"
          message={
            glassToBacklog 
              ? `Are you sure you want to move this reservation to backlog?\n\nGlass: ${glassToBacklog.width}" × ${glassToBacklog.height}" ${glassToBacklog.color}\nProject: ${glassToBacklog.reservedProject}\nQuantity: ${glassToBacklog.count}\n\nThis will make the glass available again and store the reservation in backlog for future reallocation.`
              : ''
          }
          confirmText="Move to Backlog"
          type="warning"
        />
      )}

      {/* Deficiency Modal */}
      {showDeficiencyModal && (
        <div className="modal-overlay" onClick={() => setShowDeficiencyModal(false)}>
          <div className="deficiency-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Deficiency Request</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowDeficiencyModal(false)}
              >
                ×
              </button>
            </div>
            
            <DeficiencyFormContent onSubmit={handleAddDeficiency} onClose={() => setShowDeficiencyModal(false)} />
          </div>
        </div>
      )}

      {/* Deficiency View Modal */}
      {showDeficiencyView && selectedDeficiency && (
        <div className="modal-overlay" onClick={() => setShowDeficiencyView(false)}>
          <div className="deficiency-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Deficiency Details</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowDeficiencyView(false)}
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
                            onClick={() => {
                              // Open image in new window for full view
                              const newWindow = window.open('', '_blank')
                              newWindow.document.write(`
                                <html>
                                  <head><title>${image.name}</title></head>
                                  <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;">
                                    <img src="${image.data}" style="max-width:100%;max-height:100vh;object-fit:contain;" alt="${image.name}">
                                  </body>
                                </html>
                              `)
                            }}
                          />
                          <div className="deficiency-image-overlay">
                            <button
                              className="image-action-btn download-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                const link = document.createElement('a')
                                link.href = image.data
                                link.download = image.name
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                              }}
                              title="Download image"
                            >
                              💾
                            </button>
                            <button
                              className="image-action-btn view-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                const newWindow = window.open('', '_blank')
                                newWindow.document.write(`
                                  <html>
                                    <head><title>${image.name}</title></head>
                                    <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;">
                                      <img src="${image.data}" style="max-width:100%;max-height:100vh;object-fit:contain;" alt="${image.name}">
                                    </body>
                                  </html>
                                `)
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
      )}

      {/* Deficiency Edit Modal */}
      {showDeficiencyEdit && selectedDeficiency && (
        <div className="modal-overlay" onClick={() => setShowDeficiencyEdit(false)}>
          <div className="deficiency-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Deficiency</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowDeficiencyEdit(false)}
              >
                ×
              </button>
            </div>
            
            <DeficiencyFormContent 
              onSubmit={handleUpdateDeficiency} 
              onClose={() => setShowDeficiencyEdit(false)}
              initialData={selectedDeficiency}
              isEdit={true}
            />
          </div>
        </div>
      )}

      {/* Complete Deficiency Confirmation Modal */}
      {showCompleteConfirmation && deficiencyToComplete && (
        <ConfirmationModal
          isOpen={showCompleteConfirmation}
          onClose={cancelCompleteDeficiency}
          onConfirm={confirmCompleteDeficiency}
          title="Complete Deficiency"
          message={
            `Are you sure you want to mark this deficiency as completed?\n\nProject: ${deficiencyToComplete.projectName}\nID: ${deficiencyToComplete.id}\n\nThis action will set the status to "Completed" and record today's date as the completion date.`
          }
          confirmText="Mark Complete"
          type="success"
        />
      )}

      {/* Delete Deficiency Confirmation Modal */}
      {showDeleteConfirmation && deficiencyToDelete && (
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={cancelDeleteDeficiency}
          onConfirm={confirmDeleteDeficiency}
          title="Delete Deficiency"
          message={
            `Are you sure you want to delete this deficiency?\n\nProject: ${deficiencyToDelete.projectName}\nID: ${deficiencyToDelete.id}\n\nThis action cannot be undone.`
          }
          confirmText="Delete"
          type="danger"
        />
      )}
    </div>
  )
}

export default App
