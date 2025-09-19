import React, { useState, useEffect } from 'react'
import './PendingOrders.css'
import apiService from '../services/apiService'

function PendingOrders() {
  const [pendingOrders, setPendingOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [receiveFormData, setReceiveFormData] = useState({
    rack: '',
    notes: ''
  })

  useEffect(() => {
    // Test connection first, then load data
    const initializeData = async () => {
      const connectionTest = await apiService.testConnection();
      if (connectionTest.success) {
        loadPendingOrders();
      } else {
        setError(connectionTest.message + '. ' + connectionTest.suggestion);
        setLoading(false);
      }
    };
    
    initializeData();
  }, [])

  const loadPendingOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Add a small delay to ensure server is ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const orders = await apiService.getPendingOrders()
      setPendingOrders(orders)
    } catch (error) {
      console.error('Error loading pending orders:', error)
      
      // Check if it's a connection error
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        setError('Unable to connect to server. Please ensure the backend server is running on port 3001.')
      } else {
        setError(`Failed to load pending orders: ${error.message}`)
      }
      
      // Set empty array as fallback
      setPendingOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleReceiveOrder = (order) => {
    setSelectedOrder(order)
    setReceiveFormData({
      rack: 'R-NEW',
      notes: ''
    })
    setShowReceiveModal(true)
  }

  const confirmReceiveOrder = async () => {
    if (!selectedOrder) return

    try {
      await apiService.receiveOrder(selectedOrder.id, receiveFormData)
      
      // Remove from pending orders list
      setPendingOrders(prev => prev.filter(order => order.id !== selectedOrder.id))
      
      // Close modal
      setShowReceiveModal(false)
      setSelectedOrder(null)
      
      alert(`Order received and added to inventory at rack ${receiveFormData.rackNumber}`)
    } catch (error) {
      console.error('Error receiving order:', error)
      alert('Failed to receive order. Please try again.')
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this pending order?')) return

    try {
      await apiService.deletePendingOrder(orderId)
      setPendingOrders(prev => prev.filter(order => order.id !== orderId))
      alert('Pending order deleted successfully')
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Failed to delete order. Please try again.')
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updatedOrder = await apiService.updatePendingOrder(orderId, { status: newStatus })
      setPendingOrders(prev => 
        prev.map(order => order.id === orderId ? updatedOrder : order)
      )
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'ordered': return '#3b82f6'
      case 'shipped': return '#f59e0b'
      case 'delivered': return '#10b981'
      case 'delayed': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getTotalValue = () => {
    return pendingOrders.reduce((total, order) => total + (order.count || 0), 0)
  }

  if (loading) {
    return (
      <div className="pending-orders-container">
        <div className="loading-state">
          <p>Loading pending orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pending-orders-container">
        <div className="error-state">
          <h3>⚠️ Connection Error</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={loadPendingOrders} className="retry-btn">
              🔄 Retry
            </button>
            <p className="error-help">
              <strong>Troubleshooting:</strong><br />
              1. Make sure the backend server is running: <code>cd backend && npm start</code><br />
              2. Check that port 3001 is available<br />
              3. Refresh the page after starting the server
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pending-orders-container">
      <div className="pending-orders-header">
        <h2>Pending Orders</h2>
        <p>Track glass orders from suppliers until they arrive and are added to inventory</p>
        
        <div className="orders-summary">
          <div className="summary-card">
            <span className="summary-number">{pendingOrders.length}</span>
            <span className="summary-label">Orders Pending</span>
          </div>
          <div className="summary-card">
            <span className="summary-number">{getTotalValue()}</span>
            <span className="summary-label">Total Pieces</span>
          </div>
        </div>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="no-orders">
          <p>No pending orders</p>
          <p className="sub-text">Orders placed through the email system will appear here for tracking</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Glass Specifications</th>
                <th>Quantity</th>
                <th>Supplier</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr key={order.id} className="order-row">
                  <td>
                    <div className="glass-specs">
                      <strong>{order.width}" × {order.height}"</strong>
                      <br />
                      <span className="color-heat">
                        {order.color} • {order.heatSoaked ? 'Heat Soaked' : 'Not Heat Soaked'}
                      </span>
                      {order.orderNotes && (
                        <div className="order-notes">{order.orderNotes}</div>
                      )}
                    </div>
                  </td>
                  <td className="quantity-cell">{order.count}</td>
                  <td className="supplier-cell">
                    <div className="supplier-info">
                      <strong>{order.supplierInfo}</strong>
                      {order.supplierEmail && (
                        <div className="supplier-email">{order.supplierEmail}</div>
                      )}
                    </div>
                  </td>
                  <td className="date-cell">{order.dateOrdered}</td>
                  <td className="status-cell">
                    <select 
                      value={order.status || 'Ordered'} 
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="status-select"
                      style={{ borderColor: getStatusColor(order.status) }}
                    >
                      <option value="Ordered">Ordered</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Delayed">Delayed</option>
                    </select>
                  </td>
                  <td className="reference-cell">
                    <code>{order.orderReference}</code>
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleReceiveOrder(order)}
                        className="receive-btn"
                        title="Mark as received and add to inventory"
                      >
                        📦 Receive
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="delete-order-btn"
                        title="Delete pending order"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Receive Order Modal */}
      {showReceiveModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="receive-modal">
            <h3>Receive Order</h3>
            <div className="modal-content">
              <div className="order-info">
                <p><strong>Glass:</strong> {selectedOrder.width}" × {selectedOrder.height}" {selectedOrder.color}</p>
                <p><strong>Quantity:</strong> {selectedOrder.count} pieces</p>
                <p><strong>Heat Soaked:</strong> {selectedOrder.heatSoaked ? 'Yes' : 'No'}</p>
                <p><strong>Supplier:</strong> {selectedOrder.supplierInfo}</p>
                <p><strong>Order Reference:</strong> {selectedOrder.orderReference}</p>
              </div>
              
              <div className="receive-form">
                <div className="form-group">
                  <label htmlFor="rackNumber">Rack Number:</label>
                  <input
                    type="text"
                    id="rackNumber"
                    value={receiveFormData.rackNumber}
                    onChange={(e) => setReceiveFormData(prev => ({ ...prev, rackNumber: e.target.value }))}
                    placeholder="e.g., R-001, A-15, etc."
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Notes (optional):</label>
                  <textarea
                    id="notes"
                    value={receiveFormData.notes}
                    onChange={(e) => setReceiveFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes about the received glass..."
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button onClick={confirmReceiveOrder} className="confirm-btn receive-confirm-btn">
                  Receive & Add to Inventory
                </button>
                <button 
                  onClick={() => setShowReceiveModal(false)} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingOrders