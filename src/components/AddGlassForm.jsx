import { useState } from 'react'
import './AddGlassForm.css'

function AddGlassForm({ onAddGlass, onCancel }) {
  const [formData, setFormData] = useState({
    width: '',
    height: '',
    color: 'Clear',
    thickness: '6mm',
    count: '',
    heatSoaked: false,
    rack: '',
    reservedProject: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.width || !formData.height || !formData.count || !formData.rack) {
      alert('Please fill in all required fields')
      return
    }

    onAddGlass({
      width: parseFloat(formData.width),
      height: parseFloat(formData.height),
      color: formData.color,
      thickness: formData.thickness,
      count: parseInt(formData.count),
      heatSoaked: formData.heatSoaked,
      reservedProject: formData.reservedProject.trim(),
      rack: formData.rack
    })

    // Reset form
    setFormData({
      width: '',
      height: '',
      color: 'Clear',
      thickness: '6mm',
      count: '',
      heatSoaked: false,
      rack: '',
      reservedProject: ''
    })
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="add-glass-form">
      <h2>Add New Glass</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="width">Width (inches) *</label>
            <input
              type="number"
              id="width"
              step="0.125"
              value={formData.width}
              onChange={(e) => handleInputChange('width', e.target.value)}
              placeholder="e.g., 48"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="height">Height (inches) *</label>
            <input
              type="number"
              id="height"
              step="0.125"
              value={formData.height}
              onChange={(e) => handleInputChange('height', e.target.value)}
              placeholder="e.g., 36"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="color">Color *</label>
            <select
              id="color"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
            >
              <option value="Clear">Clear</option>
              <option value="Blue">Blue</option>
              <option value="Gray">Gray</option>
              <option value="DIV">DIV</option>
              <option value="Acid_DIV">Acid DIV</option>
              <option value="Bronze">Bronze</option>
              <option value="Brown">Brown</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="thickness">Thickness *</label>
            <select
              id="thickness"
              value={formData.thickness}
              onChange={(e) => handleInputChange('thickness', e.target.value)}
            >
              <option value="6mm">6mm</option>
              <option value="10mm">10mm</option>
              <option value="12mm">12mm</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="count">Count *</label>
            <input
              type="number"
              id="count"
              min="1"
              value={formData.count}
              onChange={(e) => handleInputChange('count', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="heatSoaked">Heat Soaked</label>
            <select
              id="heatSoaked"
              value={formData.heatSoaked}
              onChange={(e) => handleInputChange('heatSoaked', e.target.value === 'true')}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="rack">Rack Number *</label>
            <input
              type="text"
              id="rack"
              value={formData.rack}
              onChange={(e) => handleInputChange('rack', e.target.value)}
              placeholder="e.g., R-001"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="reservedProject">Project Name (Optional)</label>
            <input
              type="text"
              id="reservedProject"
              value={formData.reservedProject}
              onChange={(e) => handleInputChange('reservedProject', e.target.value)}
              placeholder="Leave empty if not for a specific project"
            />
            <small className="field-hint">
              If assigned to a project, all pieces will be reserved. Otherwise, all pieces will be available.
            </small>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">Add Glass</button>
          <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default AddGlassForm
