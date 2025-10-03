import React, { useState, useEffect } from 'react'
import './Projects.css'

function Projects() {
  const [projects, setProjects] = useState([])
  const [glasses, setGlasses] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    balcons: [{ id: 'g1', name: 'G1', totalFeet: 0, assembledFeet: 0, remainingFeet: 0 }],
    type: 'top mount',
    status: 'in queue',
    glassRequirements: [],
    notes: ''
  })

  // Load projects and glasses data
  useEffect(() => {
    loadProjects()
    loadGlasses()
  }, [])

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  const loadGlasses = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/glasses')
      if (response.ok) {
        const data = await response.json()
        setGlasses(data)
      }
    } catch (error) {
      console.error('Error loading glasses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        await loadProjects()
        setShowCreateForm(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        await loadProjects()
        if (newStatus === 'production') {
          await loadGlasses() // Reload glasses after inventory change
        }
      }
    } catch (error) {
      console.error('Error updating project status:', error)
    }
  }

  const addBalcon = () => {
    const newBalcons = [...formData.balcons]
    const nextNumber = newBalcons.length + 1
    const isDiv = newBalcons.some(b => b.name.toLowerCase().includes('div'))
    
    newBalcons.push({
      id: isDiv ? `div${nextNumber}` : `g${nextNumber}`,
      name: isDiv ? `Diviseur ${nextNumber}` : `G${nextNumber}`,
      totalFeet: 0,
      assembledFeet: 0,
      remainingFeet: 0
    })
    
    setFormData({ ...formData, balcons: newBalcons })
  }

  const removeBalcon = (index) => {
    const newBalcons = formData.balcons.filter((_, i) => i !== index)
    setFormData({ ...formData, balcons: newBalcons })
  }

  const updateBalcon = (index, field, value) => {
    const newBalcons = [...formData.balcons]
    newBalcons[index][field] = value
    
    if (field === 'totalFeet' || field === 'assembledFeet') {
      newBalcons[index].remainingFeet = newBalcons[index].totalFeet - newBalcons[index].assembledFeet
    }
    
    setFormData({ ...formData, balcons: newBalcons })
  }

  const addGlassRequirement = () => {
    const newRequirements = [...formData.glassRequirements]
    newRequirements.push({
      glassId: '',
      width: 0,
      height: 0,
      color: 'clear',
      thickness: 6,
      heatSoaked: false,
      quantityNeeded: 0,
      quantityAvailable: 0,
      quantityMissing: 0,
      status: 'unavailable'
    })
    setFormData({ ...formData, glassRequirements: newRequirements })
  }

  const removeGlassRequirement = (index) => {
    const newRequirements = formData.glassRequirements.filter((_, i) => i !== index)
    setFormData({ ...formData, glassRequirements: newRequirements })
  }

  const updateGlassRequirement = (index, field, value) => {
    const newRequirements = [...formData.glassRequirements]
    newRequirements[index][field] = value
    
    // Check availability when glass specs change
    if (['width', 'height', 'color', 'thickness', 'heatSoaked'].includes(field)) {
      const matchingGlass = glasses.find(g => 
        g.width === newRequirements[index].width &&
        g.height === newRequirements[index].height &&
        g.color.toLowerCase() === newRequirements[index].color.toLowerCase() &&
        g.thickness === newRequirements[index].thickness &&
        g.heatSoaked === newRequirements[index].heatSoaked
      )
      
      if (matchingGlass) {
        newRequirements[index].glassId = matchingGlass.id
        newRequirements[index].quantityAvailable = matchingGlass.availableCount || 0
        newRequirements[index].quantityMissing = Math.max(0, newRequirements[index].quantityNeeded - newRequirements[index].quantityAvailable)
        newRequirements[index].status = newRequirements[index].quantityMissing === 0 ? 'available' : 
                                       newRequirements[index].quantityAvailable > 0 ? 'partially_available' : 'unavailable'
      } else {
        newRequirements[index].glassId = ''
        newRequirements[index].quantityAvailable = 0
        newRequirements[index].quantityMissing = newRequirements[index].quantityNeeded
        newRequirements[index].status = 'unavailable'
      }
    }
    
    if (field === 'quantityNeeded') {
      newRequirements[index].quantityMissing = Math.max(0, value - newRequirements[index].quantityAvailable)
      newRequirements[index].status = newRequirements[index].quantityMissing === 0 ? 'available' : 
                                     newRequirements[index].quantityAvailable > 0 ? 'partially_available' : 'unavailable'
    }
    
    setFormData({ ...formData, glassRequirements: newRequirements })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      balcons: [{ id: 'g1', name: 'G1', totalFeet: 0, assembledFeet: 0, remainingFeet: 0 }],
      type: 'top mount',
      status: 'in queue',
      glassRequirements: [],
      notes: ''
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'in queue': { class: 'queue', icon: '⏳', text: 'In Queue' },
      'production': { class: 'production', icon: '🏭', text: 'Production' },
      'shipped': { class: 'shipped', icon: '🚚', text: 'Shipped' },
      'installed': { class: 'installed', icon: '✅', text: 'Installed' }
    }
    const config = statusConfig[status] || { class: 'unknown', icon: '❓', text: status }
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.text}
      </span>
    )
  }

  const getAvailabilityBadge = (requirement) => {
    const { status, quantityAvailable, quantityMissing } = requirement
    
    if (status === 'available') {
      return <span className="availability-badge available">✅ Available</span>
    } else if (status === 'partially_available') {
      return <span className="availability-badge partial">⚠️ {quantityAvailable} Available, {quantityMissing} Missing</span>
    } else {
      return <span className="availability-badge unavailable">❌ {quantityMissing} Missing</span>
    }
  }

  if (loading) {
    return (
      <div className="projects-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h2>🏗️ Projects Management</h2>
        <p>Manage projects, balcons, glass requirements, and production status</p>
        <button 
          className="create-project-btn"
          onClick={() => setShowCreateForm(true)}
        >
          ➕ Create New Project
        </button>
      </div>

      <div className="projects-content">
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏗️</div>
            <h3>No Projects Yet</h3>
            <p>Create your first project to start managing balcons and glass requirements.</p>
          </div>
        ) : (
          <div className="projects-list">
            {projects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <div className="project-info">
                    <h3>{project.name}</h3>
                    <div className="project-meta">
                      <span className="project-type">🔧 {project.type}</span>
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                  <div className="project-actions">
                    <select 
                      value={project.status}
                      onChange={(e) => handleUpdateStatus(project.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="in queue">In Queue</option>
                      <option value="production">Production</option>
                      <option value="shipped">Shipped</option>
                      <option value="installed">Installed</option>
                    </select>
                  </div>
                </div>

                <div className="balcons-section">
                  <h4>📐 Balcons/Divisions</h4>
                  <div className="balcons-grid">
                    {project.balcons?.map((balcon, idx) => (
                      <div key={idx} className="balcon-card">
                        <div className="balcon-name">{balcon.name}</div>
                        <div className="balcon-progress">
                          <div className="feet-info">
                            <span>Total: {balcon.totalFeet} ft</span>
                            <span>Assembled: {balcon.assembledFeet} ft</span>
                            <span className="remaining">Remaining: {balcon.remainingFeet} ft</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${balcon.totalFeet > 0 ? (balcon.assembledFeet / balcon.totalFeet) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-requirements-section">
                  <h4>🪟 Glass Requirements</h4>
                  <div className="glass-requirements-list">
                    {project.glassRequirements?.map((req, idx) => (
                      <div key={idx} className="glass-requirement-card">
                        <div className="glass-specs">
                          <strong>{req.width}" × {req.height}" {req.color}</strong>
                          <span className="thickness">{req.thickness}mm</span>
                          {req.heatSoaked && <span className="heat-soaked">🔥</span>}
                        </div>
                        <div className="quantity-info">
                          <span>Needed: {req.quantityNeeded}</span>
                          {getAvailabilityBadge(req)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {project.notes && (
                  <div className="project-notes">
                    <strong>Notes:</strong> {project.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Project Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="create-project-modal">
            <div className="modal-header">
              <h3>{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
              <button className="close-btn" onClick={() => { setShowCreateForm(false); resetForm() }}>✕</button>
            </div>

            <form onSubmit={handleCreateProject} className="project-form">
              <div className="form-section">
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., FINICH Building"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="top mount">Top Mount</option>
                      <option value="bypass">Bypass</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="in queue">In Queue</option>
                      <option value="production">Production</option>
                      <option value="shipped">Shipped</option>
                      <option value="installed">Installed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <h4>📐 Balcons/Divisions</h4>
                  <button type="button" onClick={addBalcon} className="add-btn">➕ Add Balcon</button>
                </div>
                {formData.balcons.map((balcon, idx) => (
                  <div key={idx} className="balcon-form">
                    <div className="balcon-form-header">
                      <input
                        type="text"
                        value={balcon.name}
                        onChange={(e) => updateBalcon(idx, 'name', e.target.value)}
                        placeholder="Balcon name"
                      />
                      {formData.balcons.length > 1 && (
                        <button type="button" onClick={() => removeBalcon(idx)} className="remove-btn">🗑️</button>
                      )}
                    </div>
                    <div className="balcon-form-row">
                      <div className="form-group">
                        <label>Total Feet</label>
                        <input
                          type="number"
                          value={balcon.totalFeet}
                          onChange={(e) => updateBalcon(idx, 'totalFeet', parseFloat(e.target.value) || 0)}
                          step="0.1"
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Assembled Feet</label>
                        <input
                          type="number"
                          value={balcon.assembledFeet}
                          onChange={(e) => updateBalcon(idx, 'assembledFeet', parseFloat(e.target.value) || 0)}
                          step="0.1"
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Remaining Feet</label>
                        <input
                          type="number"
                          value={balcon.remainingFeet}
                          readOnly
                          className="readonly"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-section">
                <div className="section-header">
                  <h4>🪟 Glass Requirements</h4>
                  <button type="button" onClick={addGlassRequirement} className="add-btn">➕ Add Glass</button>
                </div>
                {formData.glassRequirements.map((req, idx) => (
                  <div key={idx} className="glass-requirement-form">
                    <div className="glass-form-header">
                      <span>Glass Requirement {idx + 1}</span>
                      <button type="button" onClick={() => removeGlassRequirement(idx)} className="remove-btn">🗑️</button>
                    </div>
                    <div className="glass-form-grid">
                      <div className="form-group">
                        <label>Width (inches)</label>
                        <input
                          type="number"
                          value={req.width}
                          onChange={(e) => updateGlassRequirement(idx, 'width', parseInt(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Height (inches)</label>
                        <input
                          type="number"
                          value={req.height}
                          onChange={(e) => updateGlassRequirement(idx, 'height', parseInt(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Color</label>
                        <select
                          value={req.color}
                          onChange={(e) => updateGlassRequirement(idx, 'color', e.target.value)}
                        >
                          <option value="clear">Clear</option>
                          <option value="bronze">Bronze</option>
                          <option value="gray">Gray</option>
                          <option value="green">Green</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Thickness (mm)</label>
                        <select
                          value={req.thickness}
                          onChange={(e) => updateGlassRequirement(idx, 'thickness', parseInt(e.target.value))}
                        >
                          <option value={6}>6mm</option>
                          <option value={8}>8mm</option>
                          <option value={10}>10mm</option>
                          <option value={12}>12mm</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Heat Soaked</label>
                        <input
                          type="checkbox"
                          checked={req.heatSoaked}
                          onChange={(e) => updateGlassRequirement(idx, 'heatSoaked', e.target.checked)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Quantity Needed</label>
                        <input
                          type="number"
                          value={req.quantityNeeded}
                          onChange={(e) => updateGlassRequirement(idx, 'quantityNeeded', parseInt(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="availability-info">
                      {getAvailabilityBadge(req)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional project notes..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => { setShowCreateForm(false); resetForm() }} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects