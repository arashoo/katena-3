import React, { useState, useEffect } from 'react'
import './Dashboard.css'
import apiService from '../services/apiService'

function Dashboard({ 
  glasses, 
  backlogReservations, 
  deficiencies, 
  onTabChange, 
  onUpdateGlass, 
  onDeleteGlass, 
  onMoveToBacklog, 
  onReserveGlass,
  onAllocateFromBacklog,
  onDeleteFromBacklog
}) {
  const [pendingOrders, setPendingOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingOrders()
  }, [])

  const fetchPendingOrders = async () => {
    try {
      const orders = await apiService.getPendingOrders()
      setPendingOrders(orders)
    } catch (error) {
      console.error('Error fetching pending orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics
  const totalGlasses = glasses.reduce((sum, glass) => sum + glass.count, 0)
  const availableGlasses = glasses.reduce((sum, glass) => sum + glass.availableCount, 0)
  const reservedGlasses = glasses.reduce((sum, glass) => sum + glass.reservedCount, 0)
  const backlogCount = backlogReservations.length
  const pendingOrdersCount = pendingOrders.length
  const deficienciesCount = deficiencies.filter(d => d.status !== 'Closed').length

  // Get recent glasses (last 5)
  const recentGlasses = glasses.slice(-5)

  // Get low stock items (available count <= 2)
  const lowStockItems = glasses.filter(glass => glass.availableCount > 0 && glass.availableCount <= 2)

  // Get color breakdown
  const colorStats = glasses.reduce((acc, glass) => {
    const color = glass.color
    if (!acc[color]) {
      acc[color] = { total: 0, available: 0, reserved: 0 }
    }
    acc[color].total += glass.count
    acc[color].available += glass.availableCount
    acc[color].reserved += glass.reservedCount
    return acc
  }, {})

  // Get active projects
  const activeProjects = glasses.reduce((acc, glass) => {
    if (glass.reservedProjects && glass.reservedProjects.length > 0) {
      glass.reservedProjects.forEach(project => {
        if (!acc[project.projectName]) {
          acc[project.projectName] = { count: 0, types: [] }
        }
        acc[project.projectName].count += project.quantity
        const glassType = `${glass.width}"×${glass.height}" ${glass.color}`
        if (!acc[project.projectName].types.includes(glassType)) {
          acc[project.projectName].types.push(glassType)
        }
      })
    }
    return acc
  }, {})

  // Recent deficiencies (last 3)
  const recentDeficiencies = deficiencies.slice(-3)

  // Recent pending orders (last 3)
  const recentPendingOrders = pendingOrders.slice(-3)

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Dashboard</h2>
        <p>Overview of your glass inventory management system</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary" onClick={() => onTabChange('inventory')}>
          <div className="metric-icon">📋</div>
          <div className="metric-content">
            <h3>{totalGlasses}</h3>
            <p>Total Glass Pieces</p>
          </div>
        </div>
        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>{availableGlasses}</h3>
            <p>Available for Use</p>
          </div>
        </div>
        <div className="metric-card warning">
          <div className="metric-icon">🔒</div>
          <div className="metric-content">
            <h3>{reservedGlasses}</h3>
            <p>Reserved for Projects</p>
          </div>
        </div>
        <div className="metric-card accent" onClick={() => onTabChange('backlog')}>
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <h3>{backlogCount}</h3>
            <p>Backlog Items</p>
          </div>
        </div>
      </div>

      {/* Dashboard Sections Grid */}
      <div className="dashboard-sections">
        
        {/* Deficiencies Tracker */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>📋 Deficiencies</h3>
            <button className="view-all-btn" onClick={() => onTabChange('deficiencies')}>View All</button>
          </div>
          <div className="section-content">
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-number">{deficienciesCount}</span>
                <span className="stat-label">Open Issues</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{deficiencies.filter(d => d.status === 'Closed').length}</span>
                <span className="stat-label">Resolved</span>
              </div>
            </div>
            {recentDeficiencies.length > 0 ? (
              <div className="mini-table">
                {recentDeficiencies.map(deficiency => (
                  <div key={deficiency.id} className="mini-table-row">
                    <div className="deficiency-project">{deficiency.projectName}</div>
                    <div className={`deficiency-status status-${deficiency.status?.toLowerCase()}`}>
                      {deficiency.status}
                    </div>
                    <div className="deficiency-priority priority-${deficiency.priority?.toLowerCase()}">
                      {deficiency.priority}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No deficiencies recorded</div>
            )}
          </div>
        </div>

        {/* Backlog Management */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>📦 Backlog Management</h3>
            <button className="view-all-btn" onClick={() => onTabChange('backlog')}>View All</button>
          </div>
          <div className="section-content">
            {backlogReservations.length > 0 ? (
              <div className="mini-table">
                {backlogReservations.slice(0, 3).map(item => (
                  <div key={item.id} className="mini-table-row">
                    <div className="backlog-spec">{item.width}"×{item.height}" {item.color}</div>
                    <div className="backlog-project">{item.originalProject}</div>
                    <div className="backlog-count">{item.count}</div>
                  </div>
                ))}
                {backlogReservations.length > 3 && (
                  <div className="more-items">+{backlogReservations.length - 3} more items</div>
                )}
              </div>
            ) : (
              <div className="empty-state">No items in backlog</div>
            )}
          </div>
        </div>

        {/* Pending Orders */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>🚚 Pending Orders</h3>
            <button className="view-all-btn" onClick={() => onTabChange('pending')}>View All</button>
          </div>
          <div className="section-content">
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-number">{pendingOrdersCount}</span>
                <span className="stat-label">Total Orders</span>
              </div>
            </div>
            {recentPendingOrders.length > 0 ? (
              <div className="mini-table">
                {recentPendingOrders.map(order => (
                  <div key={order.id} className="mini-table-row">
                    <div className="order-spec">{order.width}"×{order.height}" {order.color}</div>
                    <div className="order-qty">{order.count} pcs</div>
                    <div className="order-status">{order.status || 'Pending'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No pending orders</div>
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>🎯 Active Projects</h3>
            <button className="view-all-btn" onClick={() => onTabChange('projects')}>View All</button>
          </div>
          <div className="section-content">
            {Object.keys(activeProjects).length > 0 ? (
              <div className="project-list">
                {Object.entries(activeProjects).slice(0, 3).map(([projectName, data]) => (
                  <div key={projectName} className="project-item">
                    <div className="project-name">{projectName}</div>
                    <div className="project-details">
                      <span className="project-count">{data.count} pieces</span>
                      <span className="project-types">{data.types.length} types</span>
                    </div>
                  </div>
                ))}
                {Object.keys(activeProjects).length > 3 && (
                  <div className="more-items">+{Object.keys(activeProjects).length - 3} more projects</div>
                )}
              </div>
            ) : (
              <div className="empty-state">No active projects</div>
            )}
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>📋 Inventory Summary</h3>
            <button className="view-all-btn" onClick={() => onTabChange('inventory')}>View All</button>
          </div>
          <div className="section-content">
            <div className="mini-table">
              <div className="mini-table-header">
                <span>Recent Additions</span>
              </div>
              {recentGlasses.map(glass => (
                <div key={glass.id} className="mini-table-row">
                  <div className="glass-spec">{glass.width}"×{glass.height}" {glass.color}</div>
                  <div className="glass-count">{glass.count} pcs</div>
                </div>
              ))}
            </div>
            {lowStockItems.length > 0 && (
              <div className="alert-section">
                <h4>⚠️ Low Stock Alert</h4>
                {lowStockItems.slice(0, 3).map(glass => (
                  <div key={glass.id} className="alert-item">
                    {glass.width}"×{glass.height}" {glass.color} - {glass.availableCount} left
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Color Analysis */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>🎨 Glass Colors</h3>
          </div>
          <div className="section-content">
            <div className="color-grid">
              {Object.entries(colorStats).slice(0, 4).map(([color, stats]) => (
                <div key={color} className="color-card">
                  <div className="color-name">{color}</div>
                  <div className="color-stats">
                    <div className="color-total">{stats.total} total</div>
                    <div className="color-available">{stats.available} available</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
