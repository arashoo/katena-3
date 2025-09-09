import React, { useState } from 'react'
import './AdvancedFilters.css'

function AdvancedFilters({ onFilterChange, onClearFilters }) {
  const [filters, setFilters] = useState({
    status: 'all', // all, available, reserved
    color: 'all',
    heatSoaked: 'all',
    rack: 'all',
    project: 'all',
    dateRange: 'all' // all, today, week, month
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const colors = ['Clear', 'Blue', 'Gray', 'DIV', 'Acid_DIV', 'Bronze', 'Brown']
  const racks = ['R-001', 'R-002', 'R-003', 'R-004', 'R-005', 'R-006', 'R-007', 'R-008', 'R-009', 'R-010']

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      status: 'all',
      color: 'all',
      heatSoaked: 'all',
      rack: 'all',
      project: 'all',
      dateRange: 'all'
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
    onClearFilters()
  }

  const activeFilterCount = Object.values(filters).filter(value => value !== 'all').length

  return (
    <div className="advanced-filters">
      <div className="filter-header">
        <div className="quick-filters">
          <button 
            className={`filter-btn ${filters.status === 'available' ? 'active' : ''}`}
            onClick={() => handleFilterChange('status', filters.status === 'available' ? 'all' : 'available')}
          >
            📦 Available Only
          </button>
          <button 
            className={`filter-btn ${filters.status === 'reserved' ? 'active' : ''}`}
            onClick={() => handleFilterChange('status', filters.status === 'reserved' ? 'all' : 'reserved')}
          >
            🔒 Reserved Only
          </button>
          <button 
            className={`filter-btn ${filters.heatSoaked === 'true' ? 'active' : ''}`}
            onClick={() => handleFilterChange('heatSoaked', filters.heatSoaked === 'true' ? 'all' : 'true')}
          >
            🔥 Heat Soaked
          </button>
        </div>
        
        <div className="filter-controls">
          {activeFilterCount > 0 && (
            <span className="active-count">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
          )}
          <button 
            className="toggle-advanced"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▲' : '▼'} Advanced
          </button>
          {activeFilterCount > 0 && (
            <button className="clear-filters" onClick={clearAllFilters}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="advanced-panel">
          <div className="filter-grid">
            <div className="filter-group">
              <label>Color</label>
              <select 
                value={filters.color} 
                onChange={(e) => handleFilterChange('color', e.target.value)}
              >
                <option value="all">All Colors</option>
                {colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Rack</label>
              <select 
                value={filters.rack} 
                onChange={(e) => handleFilterChange('rack', e.target.value)}
              >
                <option value="all">All Racks</option>
                {racks.map(rack => (
                  <option key={rack} value={rack}>{rack}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Date Added</label>
              <select 
                value={filters.dateRange} 
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Heat Soaked</label>
              <select 
                value={filters.heatSoaked} 
                onChange={(e) => handleFilterChange('heatSoaked', e.target.value)}
              >
                <option value="all">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedFilters
