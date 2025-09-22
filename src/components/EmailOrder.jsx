import { useState, useEffect, useMemo } from 'react'
import './EmailOrder.css'
import apiService from '../services/apiService'

function EmailOrder({ onCancel, glasses, initialData = null }) {
  const [orderItems, setOrderItems] = useState([])
  const [currentItem, setCurrentItem] = useState({
    width: '',
    height: '',
    color: 'Clear',
    quantity: 1,
    heatSoaked: false,
    notes: ''
  })
  const [orderData, setOrderData] = useState({
    project: '',
    isForProject: false,
    urgency: 'normal',
    notes: '',
    company: 'chronoglass'
  })

  // Pre-fill form with initial data when provided
  useEffect(() => {
    if (initialData) {
      const newItem = {
        width: initialData.width || '',
        height: initialData.height || '',
        color: initialData.color || 'Clear',
        quantity: initialData.quantity || 1,
        heatSoaked: initialData.heatSoaked || false,
        notes: initialData.notes || `For project "${initialData.project}"`
      }
      setOrderItems([newItem])
      setOrderData(prev => ({
        ...prev,
        project: initialData.project || '',
        isForProject: initialData.project ? true : false,
        urgency: 'urgent', // Set as urgent for backlog orders
        notes: initialData.orderNotes || `Order for backlog item(s)`
      }))
    }
  }, [initialData])

  const [showAddCompany, setShowAddCompany] = useState(false)
  const [showManageCompanies, setShowManageCompanies] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [newCompany, setNewCompany] = useState({
    id: '',
    name: '',
    contact: '',
    email: '',
    ccList: []
  })
  const [customCompanies, setCustomCompanies] = useState([])

  // Default company contacts configuration
  const defaultCompanies = {
    chronoglass: {
      name: 'Chronoglass',
      contact: 'Alex',
      email: 'arash@katena.ca', // Testing: your email
      ccList: ['arash.mvp@gmail.com', 'arash@katena.ca'],
      isDefault: true
    },
    venus: {
      name: 'Venus Glass',
      contact: 'Contact Name',
      email: 'arash@katena.ca', // Testing: your email
      ccList: ['arash.mvp@gmail.com', 'arash@katena.ca'],
      isDefault: true
    }
  }

  // Combine default and custom companies
  const getAllCompanies = () => {
    const combined = { ...defaultCompanies }
    
    // Process custom companies
    customCompanies.forEach(company => {
      if (company.isDeleted) {
        // Remove deleted default companies
        delete combined[company.id]
      } else {
        // Add or override with custom/modified companies
        combined[company.id] = company
      }
    })
    
    return combined
  }

  const companies = useMemo(() => getAllCompanies(), [customCompanies])

  // Effect to handle invalid company selection
  useEffect(() => {
    const availableCompanyIds = Object.keys(companies)
    
    if (availableCompanyIds.length === 0) {
      return
    }
    
    const currentCompany = companies[orderData.company]
    if (!currentCompany) {
      // If current company doesn't exist, switch to chronoglass or first available
      const fallbackId = companies['chronoglass'] ? 'chronoglass' : 
                         companies['venus'] ? 'venus' : 
                         availableCompanyIds[0]
      
      if (fallbackId && fallbackId !== orderData.company) {
        setOrderData(prev => ({ ...prev, company: fallbackId }))
      }
    }
  }, [orderData.company, companies])

  // Get current company safely with fallback
  const getCurrentCompany = () => {
    const company = companies[orderData.company]
    if (!company) {
      // Try chronoglass first
      if (companies['chronoglass']) {
        return companies['chronoglass']
      }
      // Try venus next
      if (companies['venus']) {
        return companies['venus']
      }
      // Try any available company
      const availableCompanies = Object.values(companies)
      if (availableCompanies.length > 0) {
        return availableCompanies[0]
      }
      // Return a safe default
      return { id: 'none', name: 'No Company', contact: 'Unknown', email: '', ccList: [] }
    }
    return company
  }

  // Get CC recipients for selected company
  const getCurrentCCRecipients = () => {
    const company = getCurrentCompany()
    return company.ccList && company.ccList.length > 0 ? company.ccList : ['arash.mvp@gmail.com', 'arash@katena.ca']
  }

  // Get unique colors from existing glasses
  const uniqueColors = [...new Set(glasses.filter(glass => glass).map(glass => glass.color))].sort()
  
  // Get unique projects from existing glasses
  const uniqueProjects = [...new Set(glasses
    .filter(glass => glass && glass.reservedProject)
    .map(glass => glass.reservedProject)
  )].sort()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setOrderData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCurrentItemChange = (e) => {
    const { name, value, type, checked } = e.target
    setCurrentItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const addItemToOrder = () => {
    if (currentItem.width && currentItem.height && currentItem.quantity > 0) {
      const newItem = {
        ...currentItem,
        id: Date.now() + Math.random()
      }
      setOrderItems(prev => [...prev, newItem])
      
      // Reset current item form
      setCurrentItem({
        width: '',
        height: '',
        color: 'Clear',
        quantity: 1,
        heatSoaked: false,
        notes: ''
      })
    }
  }

  const removeItemFromOrder = (itemId) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateOrderItem = (itemId, updatedData) => {
    setOrderItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updatedData } : item
    ))
  }

  const handleNewCompanyChange = (e) => {
    const { name, value } = e.target
    setNewCompany(prev => ({
      ...prev,
      [name]: value,
      id: name === 'name' ? value.toLowerCase().replace(/\s+/g, '') : prev.id
    }))
  }

  const handleCCChange = (e, isEditing = false) => {
    const ccEmails = e.target.value.split(',').map(email => email.trim()).filter(email => email)
    if (isEditing && editingCompany) {
      setEditingCompany(prev => ({ ...prev, ccList: ccEmails }))
    } else {
      setNewCompany(prev => ({ ...prev, ccList: ccEmails }))
    }
  }

  const handleAddCompany = () => {
    if (newCompany.name && newCompany.contact && newCompany.email) {
      const companyToAdd = {
        id: newCompany.name.toLowerCase().replace(/\s+/g, ''),
        name: newCompany.name,
        contact: newCompany.contact,
        email: newCompany.email,
        ccList: newCompany.ccList.length > 0 ? newCompany.ccList : ['arash.mvp@gmail.com', 'arash@katena.ca'],
        isDefault: false
      }
      
      setCustomCompanies(prev => [...prev, companyToAdd])
      setOrderData(prev => ({ ...prev, company: companyToAdd.id }))
      setShowAddCompany(false)
      setNewCompany({ id: '', name: '', contact: '', email: '', ccList: [] })
    }
  }

  const handleEditCompany = (companyId) => {
    const company = companies[companyId]
    if (company) {
      setEditingCompany({ ...company, id: companyId })
      setShowManageCompanies(true)
      setShowAddCompany(false)
    }
  }

  const handleUpdateCompany = () => {
    if (editingCompany && editingCompany.name && editingCompany.contact && editingCompany.email) {
      // For all companies (default or custom), just update them in the custom companies array
      // This will override the default ones or update existing custom ones
      const updatedCompany = {
        ...editingCompany,
        // Don't add isModifiedDefault flag - just keep the original company structure
      }
      
      setCustomCompanies(prev => {
        // Remove any existing version of this company (whether it was modified before or not)
        const filtered = prev.filter(c => c.id !== editingCompany.id)
        return [...filtered, updatedCompany]
      })
      
      setEditingCompany(null)
      // Keep showing manage companies view
    }
  }

  const handleDeleteCompany = (companyId) => {
    const company = companies[companyId]
    if (company) {
      const companyName = company.name
      if (confirm(`Are you sure you want to delete ${companyName}?`)) {
        if (company.isDefault || company.isModifiedDefault) {
          // For default companies, add a "deleted" marker to custom companies
          const deletedMarker = {
            id: companyId,
            isDeleted: true,
            isDefault: true
          }
          setCustomCompanies(prev => {
            const filtered = prev.filter(c => c.id !== companyId)
            const newList = [...filtered, deletedMarker]
            return newList
          })
        } else {
          // For custom companies, just remove them
          setCustomCompanies(prev => prev.filter(c => c.id !== companyId))
        }
        
        // If this was the selected company, the useEffect will handle switching to fallback
        
        // Ensure we stay in manage companies mode
        setShowManageCompanies(true)
        setShowAddCompany(false)
        setEditingCompany(null)
      }
    }
  }

  const handleEditingCompanyChange = (e) => {
    const { name, value } = e.target
    setEditingCompany(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCompanySelectChange = (e) => {
    const value = e.target.value
    if (value === 'add_new') {
      setShowAddCompany(true)
      setShowManageCompanies(false)
      setEditingCompany(null)
    } else if (value === 'manage') {
      setShowManageCompanies(true)
      setShowAddCompany(false)
      setEditingCompany(null)
    } else {
      setOrderData(prev => ({ ...prev, company: value }))
      setShowManageCompanies(false)
      setShowAddCompany(false)
      setEditingCompany(null)
    }
  }

  const generateEmailBody = () => {
    const selectedCompany = getCurrentCompany()
    
    const subject = orderData.isForProject 
      ? `Glass Order Request - ${orderData.project} - ${selectedCompany.name}`
      : `Glass Order Request - Inventory Stock - ${selectedCompany.name}`

    const totalQuantity = orderItems.reduce((sum, item) => sum + parseInt(item.quantity), 0)
    
    let orderItemsText = ''
    if (orderItems.length > 0) {
      orderItemsText = orderItems.map((item, index) => {
        return `${index + 1}. ${item.width}" × ${item.height}" ${item.color}
   Quantity: ${item.quantity} pieces
   Heat Soaked: ${item.heatSoaked ? 'Yes - Required' : 'No'}${item.notes ? `
   Notes: ${item.notes}` : ''}`
      }).join('\n\n')
    }

    const body = `
Dear ${selectedCompany.contact},

I hope this email finds you well. We would like to place a glass order with ${selectedCompany.name}.

ORDER DETAILS:
${orderItems.length > 0 ? orderItemsText : 'No items added to order yet'}

TOTAL QUANTITY: ${totalQuantity} pieces
PRIORITY: ${orderData.urgency.charAt(0).toUpperCase() + orderData.urgency.slice(1)}

PURPOSE:
${orderData.isForProject 
  ? `Project Assignment: ${orderData.project}` 
  : 'General inventory restocking'}

${orderData.notes ? `ADDITIONAL REQUIREMENTS:\n${orderData.notes}` : ''}

Please confirm:
1. Availability of the requested glass items
2. Lead time for delivery
3. Pricing information for each item
4. Delivery schedule

We would appreciate a prompt response to coordinate our project timeline.

Thank you for your continued partnership.

Best regards,
Glass Inventory Management Team
    `.trim()

    return { subject, body, selectedCompany }
  }

  const handleSendEmail = async () => {
    const { subject, body, selectedCompany } = generateEmailBody()
    
    // Create mailto link with TO, CC, subject, and body
    const toEmail = selectedCompany.email
    const ccEmails = getCurrentCCRecipients().join(',')
    
    const mailtoLink = `mailto:${toEmail}?cc=${encodeURIComponent(ccEmails)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // Open email client
    window.location.href = mailtoLink
    
    // Add ordered items to pending orders
    try {
      for (const item of orderItems) {
        const pendingOrder = {
          width: parseInt(item.width),
          height: parseInt(item.height),
          color: item.color,
          count: parseInt(item.quantity),
          heatSoaked: item.heatSoaked,
          supplierInfo: selectedCompany.name,
          supplierEmail: selectedCompany.email,
          emailSubject: subject,
          orderNotes: item.notes || '',
          status: 'Ordered',
          dateOrdered: new Date().toLocaleDateString(),
          estimatedArrival: '', // Can be updated later
          orderReference: `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        }
        
        await apiService.addPendingOrder(pendingOrder)
      }
      
      // Show success message
      alert(`Email sent successfully! ${orderItems.length} item(s) have been added to pending orders for tracking.`)
    } catch (error) {
      console.error('Error adding to pending orders:', error)
      
      // Check if it's a connection error
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        alert('Email sent, but could not connect to server to add items to pending orders. Please ensure the backend server is running and add the orders manually if needed.')
      } else {
        alert(`Email sent, but there was an issue adding items to pending orders: ${error.message}. Please add them manually if needed.`)
      }
    }
    
    // Close the modal after processing
    setTimeout(() => {
      onCancel()
    }, 1000)
  }

  const handleCopyToClipboard = async () => {
    const { subject, body, selectedCompany } = generateEmailBody()
    const ccEmails = getCurrentCCRecipients().join('; ')
    
    const fullText = `TO: ${selectedCompany.email}
CC: ${ccEmails}
SUBJECT: ${subject}

${body}`
    
    try {
      await navigator.clipboard.writeText(fullText)
      alert('Email content with recipients copied to clipboard!')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = fullText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Email content with recipients copied to clipboard!')
    }
  }

  return (
    <div className="email-order-form">
      <div className="form-header">
        <h2>📧 Order Glass by Email</h2>
        <button className="close-btn" onClick={onCancel}>×</button>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-section">
          <h3>🏢 Glass Supplier</h3>
          <div className="form-group">
            <label>Select Company</label>
            <select
              name="company"
              value={showAddCompany ? 'add_new' : (showManageCompanies ? 'manage' : orderData.company)}
              onChange={handleCompanySelectChange}
              required
            >
              {Object.entries(companies).map(([id, company]) => (
                <option key={id} value={id}>
                  {company.name} - Contact: {company.contact}
                </option>
              ))}
              <option value="add_new">➕ Add New Company</option>
              <option value="manage">⚙️ Manage Companies</option>
            </select>
          </div>

          {showManageCompanies && (
            <div className="manage-companies-section">
              <h4>⚙️ Manage Companies</h4>
              <div className="companies-list">
                {Object.entries(companies).map(([id, company]) => (
                  <div key={id} className="company-item">
                    <div className="company-info">
                      <strong>{company.name}</strong>
                      <div className="company-details">
                        Contact: {company.contact} | Email: {company.email}
                      </div>
                      <div className="company-cc">
                        CC: {company.ccList?.join(', ') || 'No CC recipients'}
                      </div>
                    </div>
                    <div className="company-actions">
                      <button 
                        onClick={() => handleEditCompany(id)}
                        className="edit-company-btn"
                        type="button"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCompany(id)}
                        className="delete-company-btn"
                        type="button"
                      >
                        🗑️ Delete
                      </button>
                      {company.isDefault && (
                        <span className="default-label">Default</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setShowManageCompanies(false)
                  setEditingCompany(null)
                }} 
                className="close-manage-btn"
              >
                ✅ Done Managing
              </button>
            </div>
          )}

          {editingCompany && showManageCompanies && (
            <div className="edit-company-form">
              <h4>✏️ Edit Company: {editingCompany.name}</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editingCompany.name}
                    onChange={handleEditingCompanyChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    name="contact"
                    value={editingCompany.contact}
                    onChange={handleEditingCompanyChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={editingCompany.email}
                  onChange={handleEditingCompanyChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>CC Recipients (comma-separated)</label>
                <input
                  type="text"
                  value={editingCompany.ccList?.join(', ') || ''}
                  onChange={(e) => handleCCChange(e, true)}
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>
              <div className="edit-company-actions">
                <button type="button" onClick={handleUpdateCompany} className="update-company-btn">
                  ✅ Update Company
                </button>
                <button type="button" onClick={() => {
                  setEditingCompany(null)
                  setShowManageCompanies(true)
                }} className="cancel-edit-btn">
                  ❌ Cancel
                </button>
              </div>
            </div>
          )}

          {showAddCompany && (
            <div className="add-company-form">
              <h4>➕ Add New Company</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newCompany.name}
                    onChange={handleNewCompanyChange}
                    placeholder="e.g., ABC Glass Co."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    name="contact"
                    value={newCompany.contact}
                    onChange={handleNewCompanyChange}
                    placeholder="e.g., John Smith"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={newCompany.email}
                  onChange={handleNewCompanyChange}
                  placeholder="e.g., john@abcglass.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>CC Recipients (comma-separated)</label>
                <input
                  type="text"
                  value={newCompany.ccList.join(', ')}
                  onChange={handleCCChange}
                  placeholder="email1@example.com, email2@example.com"
                />
                <small>Leave empty to use default CC list</small>
              </div>
              <div className="add-company-actions">
                <button type="button" onClick={handleAddCompany} className="add-company-btn">
                  ✅ Add Company
                </button>
                <button type="button" onClick={() => setShowAddCompany(false)} className="cancel-add-btn">
                  ❌ Cancel
                </button>
              </div>
            </div>
          )}
          
          {!showAddCompany && !showManageCompanies && (
            <div className="recipient-info">
              <div className="recipient-section">
                <strong>📧 TO:</strong> {getCurrentCompany().email} ({getCurrentCompany().contact})
              </div>
              <div className="recipient-section">
                <strong>📋 CC:</strong> {getCurrentCCRecipients().join(', ')}
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>📦 Order Items ({orderItems.length})</h3>
          
          {/* Display current order items */}
          {orderItems.length > 0 && (
            <div className="order-items-list">
              <h4>Items in Order:</h4>
              {orderItems.map((item, index) => (
                <div key={item.id} className="order-item">
                  <div className="item-details">
                    <strong>#{index + 1}</strong>
                    <span>{item.width}" × {item.height}" {item.color}</span>
                    <span>Qty: {item.quantity}</span>
                    <span>{item.heatSoaked ? 'Heat Soaked' : 'Standard'}</span>
                    {item.notes && <span className="item-notes">Note: {item.notes}</span>}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeItemFromOrder(item.id)}
                    className="remove-item-btn"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <div className="order-summary">
                <strong>Total Items: {orderItems.length} | Total Quantity: {orderItems.reduce((sum, item) => sum + parseInt(item.quantity), 0)} pieces</strong>
              </div>
              <hr style={{margin: '16px 0'}} />
            </div>
          )}

          {/* Add new item form */}
          <h4>➕ Add Glass Item</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Width (inches)</label>
              <input
                type="number"
                name="width"
                value={currentItem.width}
                onChange={handleCurrentItemChange}
                step="0.125"
                min="0"
                placeholder="e.g., 84"
              />
            </div>
            <div className="form-group">
              <label>Height (inches)</label>
              <input
                type="number"
                name="height"
                value={currentItem.height}
                onChange={handleCurrentItemChange}
                step="0.125"
                min="0"
                placeholder="e.g., 60"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Color</label>
              <select
                name="color"
                value={currentItem.color}
                onChange={handleCurrentItemChange}
              >
                {uniqueColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
                <option value="Other">Other (specify in notes)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={currentItem.quantity}
                onChange={handleCurrentItemChange}
                min="1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="heatSoaked"
                  checked={currentItem.heatSoaked}
                  onChange={handleCurrentItemChange}
                />
                Heat Soaked Required
              </label>
            </div>
            <div className="form-group">
              <label>Item Notes (optional)</label>
              <input
                type="text"
                name="notes"
                value={currentItem.notes}
                onChange={handleCurrentItemChange}
                placeholder="Special requirements for this item..."
              />
            </div>
          </div>

          <button 
            type="button" 
            onClick={addItemToOrder}
            className="add-item-btn"
            disabled={!currentItem.width || !currentItem.height || currentItem.quantity < 1}
          >
            ➕ Add to Order
          </button>
        </div>

        <div className="form-section">
          <h3>Order Purpose</h3>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isForProject"
                checked={orderData.isForProject}
                onChange={handleInputChange}
              />
              This order is for a specific project
            </label>
          </div>

          {orderData.isForProject && (
            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                name="project"
                value={orderData.project}
                onChange={handleInputChange}
                placeholder="Enter project name or select existing"
                list="existing-projects"
              />
              <datalist id="existing-projects">
                {uniqueProjects.map(project => (
                  <option key={project} value={project} />
                ))}
              </datalist>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Order Details</h3>
          <div className="form-group">
            <label>Urgency</label>
            <select
              name="urgency"
              value={orderData.urgency}
              onChange={handleInputChange}
            >
              <option value="low">Low Priority</option>
              <option value="normal">Normal</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={orderData.notes}
              onChange={handleInputChange}
              rows="4"
              placeholder="Any special requirements, delivery instructions, or other details..."
            />
          </div>
        </div>

        <div className="email-preview">
          <h3>📧 Email Preview</h3>
          <div className="preview-content">
            <div className="email-headers">
              <div><strong>TO:</strong> {getCurrentCompany().email} ({getCurrentCompany().contact})</div>
              <div><strong>CC:</strong> {getCurrentCCRecipients().join(', ')}</div>
              <div><strong>SUBJECT:</strong> {generateEmailBody().subject}</div>
            </div>
            <hr style={{margin: '12px 0', border: '1px solid #e2e8f0'}} />
            <pre>{generateEmailBody().body}</pre>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleSendEmail} 
            className="send-email-btn"
            disabled={orderItems.length === 0}
            title={orderItems.length === 0 ? "Add at least one item to the order" : ""}
          >
            📧 Open Email Client {orderItems.length > 0 && `(${orderItems.length} items)`}
          </button>
          <button 
            type="button" 
            onClick={handleCopyToClipboard} 
            className="copy-btn"
            disabled={orderItems.length === 0}
            title={orderItems.length === 0 ? "Add at least one item to the order" : ""}
          >
            📋 Copy to Clipboard
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EmailOrder
