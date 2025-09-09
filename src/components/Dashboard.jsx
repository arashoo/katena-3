import React from 'react'
import './Dashboard.css'

function Dashboard({ glasses }) {
  // Calculate statistics
  const totalGlass = glasses.reduce((sum, glass) => sum + glass.count, 0)
  const reservedGlass = glasses.filter(glass => glass.reservedProject).reduce((sum, glass) => sum + glass.count, 0)
  const availableGlass = totalGlass - reservedGlass
  const utilizationRate = totalGlass > 0 ? ((reservedGlass / totalGlass) * 100).toFixed(1) : 0

  // Group by color
  const colorStats = glasses.reduce((acc, glass) => {
    if (!acc[glass.color]) {
      acc[glass.color] = { total: 0, available: 0, reserved: 0 }
    }
    acc[glass.color].total += glass.count
    if (glass.reservedProject) {
      acc[glass.color].reserved += glass.count
    } else {
      acc[glass.color].available += glass.count
    }
    return acc
  }, {})

  // Group by projects
  const projectStats = glasses
    .filter(glass => glass.reservedProject)
    .reduce((acc, glass) => {
      if (!acc[glass.reservedProject]) {
        acc[glass.reservedProject] = { count: 0, pieces: [] }
      }
      acc[glass.reservedProject].count += glass.count
      acc[glass.reservedProject].pieces.push(`${glass.width}"×${glass.height}" ${glass.color}`)
      return acc
    }, {})

  // Low stock analysis (available < 10)
  const lowStockItems = Object.entries(colorStats)
    .filter(([color, stats]) => stats.available < 10 && stats.available > 0)
    .map(([color, stats]) => ({ color, available: stats.available }))

  // Heat soaked statistics
  const heatSoakedStats = glasses.reduce((acc, glass) => {
    const key = glass.heatSoaked ? 'heatSoaked' : 'regular'
    acc[key] += glass.count
    return acc
  }, { heatSoaked: 0, regular: 0 })

  // Recent additions (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const recentAdditions = glasses.filter(glass => {
    const glassDate = new Date(glass.dateAdded)
    return glassDate >= sevenDaysAgo
  }).reduce((sum, glass) => sum + glass.count, 0)

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Inventory Dashboard</h2>
        <p>Real-time overview of your glass inventory</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <h3>{totalGlass.toLocaleString()}</h3>
            <p>Total Glass Pieces</p>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>{availableGlass.toLocaleString()}</h3>
            <p>Available</p>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">🔒</div>
          <div className="metric-content">
            <h3>{reservedGlass.toLocaleString()}</h3>
            <p>Reserved</p>
          </div>
        </div>

        <div className="metric-card accent">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <h3>{utilizationRate}%</h3>
            <p>Utilization Rate</p>
          </div>
        </div>
      </div>

      {/* Color Breakdown */}
      <div className="analysis-grid">
        <div className="analysis-card">
          <h4>🎨 Inventory by Color</h4>
          <div className="color-stats">
            {Object.entries(colorStats).map(([color, stats]) => (
              <div key={color} className="color-stat-row">
                <div className="color-info">
                  <span className="color-name">{color}</span>
                  <span className="color-total">{stats.total} total</span>
                </div>
                <div className="color-breakdown">
                  <span className="available-count">✅ {stats.available}</span>
                  <span className="reserved-count">🔒 {stats.reserved}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-card">
          <h4>🚨 Low Stock Alert</h4>
          {lowStockItems.length > 0 ? (
            <div className="low-stock-list">
              {lowStockItems.map(item => (
                <div key={item.color} className="low-stock-item">
                  <span className="alert-icon">⚠️</span>
                  <span className="color-name">{item.color}</span>
                  <span className="stock-count">{item.available} available</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-alerts">🎉 All colors have adequate stock!</p>
          )}
        </div>
      </div>

      {/* Project Overview */}
      <div className="analysis-grid">
        <div className="analysis-card">
          <h4>🏗️ Active Projects</h4>
          {Object.keys(projectStats).length > 0 ? (
            <div className="project-stats">
              {Object.entries(projectStats).map(([project, stats]) => (
                <div key={project} className="project-stat-row">
                  <div className="project-info">
                    <span className="project-name">{project}</span>
                    <span className="project-count">{stats.count} pieces</span>
                  </div>
                  <div className="project-types">
                    {[...new Set(stats.pieces)].slice(0, 3).map((type, index) => (
                      <span key={index} className="glass-type">{type}</span>
                    ))}
                    {[...new Set(stats.pieces)].length > 3 && (
                      <span className="more-types">+{[...new Set(stats.pieces)].length - 3} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-projects">No active project reservations</p>
          )}
        </div>

        <div className="analysis-card">
          <h4>🔥 Heat Treatment Stats</h4>
          <div className="heat-stats">
            <div className="heat-stat-item">
              <span className="heat-icon">🔥</span>
              <span className="heat-label">Heat Soaked</span>
              <span className="heat-count">{heatSoakedStats.heatSoaked}</span>
            </div>
            <div className="heat-stat-item">
              <span className="heat-icon">❄️</span>
              <span className="heat-label">Regular</span>
              <span className="heat-count">{heatSoakedStats.regular}</span>
            </div>
          </div>
          
          {recentAdditions > 0 && (
            <div className="recent-additions">
              <h5>📅 Recent Activity</h5>
              <p>{recentAdditions} pieces added in the last 7 days</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
