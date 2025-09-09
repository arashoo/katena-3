import { useState } from 'react'
import './EmailOrder.css'

function EmailOrder({ onCancel, glasses }) {
  const [orderData, setOrderData] = useState({
    width: '',
    height: '',
    color: 'Clear',
    quantity: 1,
    heatSoaked: false,
    project: '',
    isForProject: false,
    urgency: 'normal',
    notes: '',
    company: 'chronoglass'
  })

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

  const companies = getAllCompanies()

  // Get CC recipients for selected company
  const getCurrentCCRecipients = () => {
    const company = companies[orderData.company]
    return company ? company.ccList : ['arash.mvp@gmail.com', 'arash@katena.ca']
  }

  // Get unique colors from existing glasses
  const uniqueColors = [...new Set(glasses.map(glass => glass.color))].sort()
  
  // Get unique projects from existing glasses
  const uniqueProjects = [...new Set(glasses
    .filter(glass => glass.reservedProject)
    .map(glass => glass.reservedProject)
  )].sort()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setOrderData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
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
      setEditingCompany({ ...company })
      setShowManageCompanies(true)
      setShowAddCompany(false)
    }
  }

  const handleUpdateCompany = () => {
    if (editingCompany && editingCompany.name && editingCompany.contact && editingCompany.email) {
      if (editingCompany.isDefault) {
        // For default companies, add them to custom companies as modified defaults
        const modifiedDefault = {
          ...editingCompany,
          isModifiedDefault: true
        }
        setCustomCompanies(prev => {
          // Remove any existing modified version of this default company
          const filtered = prev.filter(c => c.id !== editingCompany.id)
          return [...filtered, modifiedDefault]
        })
      } else {
        // For custom companies, just update them normally
        setCustomCompanies(prev => prev.map(company => 
          company.id === editingCompany.id ? editingCompany : company
        ))
      }
      setEditingCompany(null)
      // Keep showing manage companies view
    }
  }

  const handleRestoreDefault = (companyId) => {
    if (confirm(`Are you sure you want to restore ${companies[companyId].name} to default settings?`)) {
      // Remove the modified version from custom companies
      setCustomCompanies(prev => prev.filter(c => c.id !== companyId))
    }
  }

  const handleDeleteCompany = (companyId) => {
    const company = companies[companyId]
    if (company) {
      const companyName = company.name
      if (confirm(`Are you sure you want to delete ${companyName}?`)) {
        if (company.isDefault) {
          // For default companies, add a "deleted" marker to custom companies
          const deletedMarker = {
            id: companyId,
            isDeleted: true,
            isDefault: true
          }
          setCustomCompanies(prev => {
            const filtered = prev.filter(c => c.id !== companyId)
            return [...filtered, deletedMarker]
          })
        } else {
          // For custom companies, just remove them
          setCustomCompanies(prev => prev.filter(c => c.id !== companyId))
        }
        
        // If this was the selected company, switch to chronoglass
        if (orderData.company === companyId) {
          setOrderData(prev => ({ ...prev, company: 'chronoglass' }))
        }
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
    } else if (value === 'manage') {
      setShowManageCompanies(true)
    } else {
      setOrderData(prev => ({ ...prev, company: value }))
    }
  }

  const generateEmailBody = () => {
    const selectedCompany = companies[orderData.company]
    const subject = orderData.isForProject 
      ? `Glass Order Request - ${orderData.project} - ${selectedCompany.name}`
      : `Glass Order Request - Inventory Stock - ${selectedCompany.name}`

    const body = `
Dear ${selectedCompany.contact},

I hope this email finds you well. We would like to place a glass order with ${selectedCompany.name}.

ORDER DETAILS:
- Dimensions: ${orderData.width}" × ${orderData.height}"
- Color: ${orderData.color}
- Quantity: ${orderData.quantity} pieces
- Heat Soaked: ${orderData.heatSoaked ? 'Yes - Required' : 'No'}
- Priority: ${orderData.urgency.charAt(0).toUpperCase() + orderData.urgency.slice(1)}

PURPOSE:
${orderData.isForProject 
  ? `Project Assignment: ${orderData.project}` 
  : 'General inventory restocking'}

${orderData.notes ? `ADDITIONAL REQUIREMENTS:\n${orderData.notes}` : ''}

Please confirm:
1. Availability of the requested glass
2. Lead time for delivery
3. Pricing information
4. Delivery schedule

We would appreciate a prompt response to coordinate our project timeline.

Thank you for your continued partnership.

Best regards,
Glass Inventory Management Team
    `.trim()

    return { subject, body, selectedCompany }
  }

  const handleSendEmail = () => {
    const { subject, body, selectedCompany } = generateEmailBody()
    
    // Create mailto link with TO, CC, subject, and body
    const toEmail = selectedCompany.email
    const ccEmails = getCurrentCCRecipients().join(',')
    
    const mailtoLink = `mailto:${toEmail}?cc=${encodeURIComponent(ccEmails)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // Open email client
    window.location.href = mailtoLink
    
    // Close the modal after opening email
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
              value={showAddCompany ? 'add_new' : (showManageCompanies && !editingCompany ? 'manage' : orderData.company)}
              onChange={handleCompanySelectChange}
              required
            >
              <option value="chronoglass">Chronoglass - Contact: Alex</option>
              <option value="venus">Venus Glass - Contact: {defaultCompanies.venus.contact}</option>
              {customCompanies.map(company => (
                <option key={company.id} value={company.id}>
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
                      {company.isModifiedDefault && (
                        <button 
                          onClick={() => handleRestoreDefault(id)}
                          className="restore-default-btn"
                          type="button"
                        >
                          🔄 Restore Default
                        </button>
                      )}
                      {company.isDefault && !company.isModifiedDefault && (
                        <span className="default-label">Default</span>
                      )}
                      {company.isModifiedDefault && (
                        <span className="modified-label">Modified Default</span>
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
                <strong>📧 TO:</strong> {companies[orderData.company].email} ({companies[orderData.company].contact})
              </div>
              <div className="recipient-section">
                <strong>📋 CC:</strong> {getCurrentCCRecipients().join(', ')}
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Glass Specifications</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Width (inches)</label>
              <input
                type="number"
                name="width"
                value={orderData.width}
                onChange={handleInputChange}
                step="0.125"
                min="0"
                required
                placeholder="e.g., 84"
              />
            </div>
            <div className="form-group">
              <label>Height (inches)</label>
              <input
                type="number"
                name="height"
                value={orderData.height}
                onChange={handleInputChange}
                step="0.125"
                min="0"
                required
                placeholder="e.g., 60"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Color</label>
              <select
                name="color"
                value={orderData.color}
                onChange={handleInputChange}
                required
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
                value={orderData.quantity}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="heatSoaked"
                checked={orderData.heatSoaked}
                onChange={handleInputChange}
              />
              Heat Soaked Required
            </label>
          </div>
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
              <div><strong>TO:</strong> {companies[orderData.company].email} ({companies[orderData.company].contact})</div>
              <div><strong>CC:</strong> {getCurrentCCRecipients().join(', ')}</div>
              <div><strong>SUBJECT:</strong> {generateEmailBody().subject}</div>
            </div>
            <hr style={{margin: '12px 0', border: '1px solid #e2e8f0'}} />
            <pre>{generateEmailBody().body}</pre>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleSendEmail} className="send-email-btn">
            📧 Open Email Client
          </button>
          <button type="button" onClick={handleCopyToClipboard} className="copy-btn">
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
