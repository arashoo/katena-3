import React, { useState, useEffect } from 'react'
import './ProjectMonitoring.css'

function ProjectMonitoring() {
  const [productionData, setProductionData] = useState([])
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    project: '',
    panel: '',
    panelQuantity: 0,
    totalFeet: 0,
    assembledFeet: 0,
    comments: '',
    supplyChain: 'TOPMONT',
    shipping: 'EN STOCK'
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterProject, setFilterProject] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Sample data based on the Excel structure
  useEffect(() => {
    const sampleData = [
      {
        id: 1,
        date: '2025-04-30',
        project: 'FINICH',
        panel: 'G14',
        panelQuantity: 15,
        totalFeet: 300,
        assembledFeet: 146,
        totalAssembledFeet: 146,
        comments: '',
        supplyChain: 'TOPMONT',
        shipping: 'DELIVERED'
      },
      {
        id: 2,
        date: '2025-05-01',
        project: 'FINICH',
        panel: 'G16',
        panelQuantity: 5,
        totalFeet: 95,
        assembledFeet: 9,
        totalAssembledFeet: 179,
        comments: '',
        supplyChain: 'TOPMONT',
        shipping: 'DELIVERED'
      },
      {
        id: 3,
        date: '2025-05-01',
        project: 'FINICH',
        panel: 'G18',
        panelQuantity: 5,
        totalFeet: 95,
        assembledFeet: 9.2,
        totalAssembledFeet: 179,
        comments: '',
        supplyChain: 'TOPMONT',
        shipping: 'DELIVERED'
      },
      {
        id: 4,
        date: '2025-05-02',
        project: 'YOO',
        panel: 'G1',
        panelQuantity: 1,
        totalFeet: 91,
        assembledFeet: 91,
        totalAssembledFeet: 140.6,
        comments: 'OK5',
        supplyChain: 'TOPMONT',
        shipping: 'DELIVERED'
      },
      {
        id: 5,
        date: '2025-05-02',
        project: 'PARKLAND',
        panel: 'G3-G2',
        panelQuantity: 2,
        totalFeet: 113,
        assembledFeet: 49.6,
        totalAssembledFeet: 140.6,
        comments: '',
        supplyChain: 'BYPASS',
        shipping: 'IN_STOCK'
      }
    ]
    setProductionData(sampleData)
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setNewEntry(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleAddEntry = (e) => {
    e.preventDefault()
    const entry = {
      ...newEntry,
      id: Date.now(),
      totalAssembledFeet: newEntry.assembledFeet // Simple calculation for demo
    }
    setProductionData(prev => [...prev, entry])
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      project: '',
      panel: '',
      panelQuantity: 0,
      totalFeet: 0,
      assembledFeet: 0,
      comments: '',
      supplyChain: 'TOPMONT',
      shipping: 'EN_STOCK'
    })
    setShowAddForm(false)
  }

  const uniqueProjects = [...new Set(productionData.map(item => item.project))]
  
  const filteredData = productionData.filter(item => {
    const projectMatch = !filterProject || item.project.toLowerCase().includes(filterProject.toLowerCase())
    const statusMatch = !filterStatus || item.shipping === filterStatus
    return projectMatch && statusMatch
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      'DELIVERED': { class: 'delivered', text: 'Delivered', icon: '✅' },
      'IN_STOCK': { class: 'in-stock', text: 'In Stock', icon: '📦' },
      'EN_STOCK': { class: 'in-stock', text: 'In Stock', icon: '📦' },
      'LIVREE': { class: 'delivered', text: 'Delivered', icon: '✅' }
    }
    const config = statusConfig[status] || { class: 'unknown', text: status, icon: '❓' }
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.text}
      </span>
    )
  }

  const getSupplyChainBadge = (chain) => {
    const chainConfig = {
      'TOPMONT': { class: 'topmont', icon: '🏔️' },
      'BYPASS': { class: 'bypass', icon: '🔄' },
      'WELLMONT': { class: 'wellmont', icon: '🏢' },
      'DIVISEUR': { class: 'diviseur', icon: '📐' }
    }
    const config = chainConfig[chain] || { class: 'default', icon: '🏭' }
    return (
      <span className={`supply-chain-badge ${config.class}`}>
        {config.icon} {chain}
      </span>
    )
  }

  const totalProjects = uniqueProjects.length
  const totalEntries = productionData.length
  const totalFeetProduced = productionData.reduce((sum, item) => sum + item.assembledFeet, 0)
  const deliveredCount = productionData.filter(item => item.shipping === 'DELIVERED' || item.shipping === 'LIVREE').length

  return (
    <div className="production-tracking-container">
      <div className="production-header">
        <h2>🏭 Production Tracking</h2>
        <p>Monitor glass panel production workflow and supply chain status</p>
      </div>

      {/* Summary Cards */}
      <div className="production-summary">
        <div className="summary-card">
          <div className="summary-icon">🏗️</div>
          <div className="summary-content">
            <span className="summary-number">{totalProjects}</span>
            <span className="summary-label">Active Projects</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">�</div>
          <div className="summary-content">
            <span className="summary-number">{totalEntries}</span>
            <span className="summary-label">Production Entries</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📏</div>
          <div className="summary-content">
            <span className="summary-number">{totalFeetProduced.toFixed(1)}</span>
            <span className="summary-label">Feet Assembled</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🚚</div>
          <div className="summary-content">
            <span className="summary-number">{deliveredCount}</span>
            <span className="summary-label">Delivered</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="production-controls">
        <div className="filters">
          <input
            type="text"
            placeholder="Filter by project..."
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="filter-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="DELIVERED">Delivered</option>
            <option value="LIVREE">Delivered</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="EN_STOCK">In Stock</option>
          </select>
        </div>
        <button 
          className="add-entry-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '❌ Cancel' : '➕ Add Entry'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="add-form-container">
          <form onSubmit={handleAddEntry} className="production-form">
            <h3>Add Production Entry</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={newEntry.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Project</label>
                <input
                  type="text"
                  name="project"
                  value={newEntry.project}
                  onChange={handleInputChange}
                  placeholder="e.g., FINICH, PARKLAND"
                  required
                />
              </div>
              <div className="form-group">
                <label>Panel/Balcony</label>
                <input
                  type="text"
                  name="panel"
                  value={newEntry.panel}
                  onChange={handleInputChange}
                  placeholder="e.g., G14, G16"
                  required
                />
              </div>
              <div className="form-group">
                <label>Panel Quantity</label>
                <input
                  type="number"
                  name="panelQuantity"
                  value={newEntry.panelQuantity}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Total Feet</label>
                <input
                  type="number"
                  name="totalFeet"
                  value={newEntry.totalFeet}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Assembled Feet</label>
                <input
                  type="number"
                  name="assembledFeet"
                  value={newEntry.assembledFeet}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Supply Chain</label>
                <select
                  name="supplyChain"
                  value={newEntry.supplyChain}
                  onChange={handleInputChange}
                >
                  <option value="TOPMONT">TOPMONT</option>
                  <option value="BYPASS">BYPASS</option>
                  <option value="WELLMONT">WELLMONT</option>
                  <option value="DIVISEUR">DIVISEUR</option>
                </select>
              </div>
              <div className="form-group">
                <label>Shipping Status</label>
                <select
                  name="shipping"
                  value={newEntry.shipping}
                  onChange={handleInputChange}
                >
                  <option value="EN_STOCK">In Stock</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="IN_TRANSIT">In Transit</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Comments</label>
                <input
                  type="text"
                  name="comments"
                  value={newEntry.comments}
                  onChange={handleInputChange}
                  placeholder="Optional comments..."
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">Add Entry</button>
            </div>
          </form>
        </div>
      )}

      {/* Production Table */}
      <div className="production-table-container">
        <table className="production-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Project</th>
              <th>Panel</th>
              <th>Qty</th>
              <th>Total Feet</th>
              <th>Assembled</th>
              <th>Running Total</th>
              <th>Comments</th>
              <th>Supply Chain</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">
                  No production entries found
                </td>
              </tr>
            ) : (
              filteredData.map((entry) => (
                <tr key={entry.id} className="production-row">
                  <td className="date-cell">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="project-cell">
                    <strong>{entry.project}</strong>
                  </td>
                  <td className="panel-cell">{entry.panel}</td>
                  <td className="quantity-cell">{entry.panelQuantity}</td>
                  <td className="feet-cell">{entry.totalFeet}</td>
                  <td className="assembled-cell">
                    <strong>{entry.assembledFeet}</strong>
                  </td>
                  <td className="total-cell">{entry.totalAssembledFeet}</td>
                  <td className="comments-cell">{entry.comments}</td>
                  <td className="supply-cell">
                    {getSupplyChainBadge(entry.supplyChain)}
                  </td>
                  <td className="status-cell">
                    {getStatusBadge(entry.shipping)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProjectMonitoring