import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './ExportControls.css'

function ExportControls({ glasses = [], filteredGlasses = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      // Calculate position relative to viewport
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 280 // 280px is min-width of dropdown
      })
    }
    setIsOpen(!isOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on the button or inside the dropdown content
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        return // Don't close if clicking the button
      }
      
      // Check if click is inside the dropdown content (which is portaled)
      const dropdownContent = document.querySelector('.export-dropdown-content')
      if (dropdownContent && dropdownContent.contains(event.target)) {
        return // Don't close if clicking inside dropdown
      }
      
      // Close dropdown if clicking outside
      setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  const exportToCSV = (data, filename) => {
    // Convert grouped glass data to flat structure for export
    const flatData = []
    
    data.forEach(glass => {
      if (glass.reservedProject) {
        // Reserved glass
        flatData.push({
          'Width (inches)': glass.width,
          'Height (inches)': glass.height,
          'Color': glass.color,
          'Count': glass.count,
          'Heat Soaked': glass.heatSoaked ? 'Yes' : 'No',
          'Status': 'Reserved',
          'Project': glass.reservedProject,
          'Rack Number': glass.rack,
          'Date Added': glass.dateAdded
        })
      } else {
        // Available glass
        flatData.push({
          'Width (inches)': glass.width,
          'Height (inches)': glass.height,
          'Color': glass.color,
          'Count': glass.count,
          'Heat Soaked': glass.heatSoaked ? 'Yes' : 'No',
          'Status': 'Available',
          'Project': '',
          'Rack Number': glass.rack,
          'Date Added': glass.dateAdded
        })
      }
    })

    const csvContent = convertToCSV(flatData)
    downloadCSV(csvContent, filename)
  }

  const convertToCSV = (data) => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      }).join(',')
    )
    
    return [csvHeaders, ...csvRows].join('\n')
  }

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const exportAll = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    exportToCSV(glasses, `glass_inventory_complete_${timestamp}.csv`)
  }

  const exportFiltered = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    exportToCSV(filteredGlasses, `glass_inventory_filtered_${timestamp}.csv`)
  }

  const exportSummary = () => {
    // Create summary report
    const summary = generateSummaryReport(glasses)
    const timestamp = new Date().toISOString().split('T')[0]
    downloadCSV(summary, `glass_inventory_summary_${timestamp}.csv`)
  }

  const generateSummaryReport = (data) => {
    const summary = {}
    
    data.forEach(glass => {
      const key = `${glass.width}x${glass.height} ${glass.color} ${glass.heatSoaked ? 'Heat Soaked' : 'Regular'}`
      
      if (!summary[key]) {
        summary[key] = {
          'Glass Type': key,
          'Total Count': 0,
          'Available': 0,
          'Reserved': 0,
          'Racks': new Set()
        }
      }
      
      summary[key]['Total Count'] += glass.count
      summary[key]['Racks'].add(glass.rack)
      
      if (glass.reservedProject) {
        summary[key]['Reserved'] += glass.count
      } else {
        summary[key]['Available'] += glass.count
      }
    })
    
    // Convert to array and format
    const summaryArray = Object.values(summary).map(item => ({
      'Glass Type': item['Glass Type'],
      'Total Count': item['Total Count'],
      'Available': item['Available'],
      'Reserved': item['Reserved'],
      'Utilization %': ((item['Reserved'] / item['Total Count']) * 100).toFixed(1),
      'Racks': Array.from(item['Racks']).join('; ')
    }))
    
    return convertToCSV(summaryArray)
  }

  const printInventory = () => {
    const printWindow = window.open('', '_blank')
    const timestamp = new Date().toLocaleString()
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Glass Inventory Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .summary { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .available { background-color: #d4edda; }
          .reserved { background-color: #f8d7da; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Glass Inventory Report</h1>
          <p>Generated on: ${timestamp}</p>
          <p>Total Items: ${filteredGlasses.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Size</th>
              <th>Color</th>
              <th>Count</th>
              <th>Heat Soaked</th>
              <th>Status</th>
              <th>Project</th>
              <th>Rack</th>
              <th>Date Added</th>
            </tr>
          </thead>
          <tbody>
            ${filteredGlasses.map(glass => `
              <tr class="${glass.reservedProject ? 'reserved' : 'available'}">
                <td>${glass.width}" × ${glass.height}"</td>
                <td>${glass.color}</td>
                <td>${glass.count}</td>
                <td>${glass.heatSoaked ? 'Yes' : 'No'}</td>
                <td>${glass.reservedProject ? 'Reserved' : 'Available'}</td>
                <td>${glass.reservedProject || '-'}</td>
                <td>${glass.rack}</td>
                <td>${glass.dateAdded}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="export-controls" ref={dropdownRef}>
      <div className="export-dropdown">
        <button 
          ref={buttonRef}
          className="export-dropdown-btn"
          onClick={toggleDropdown}
        >
          📊 Export Data
          <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </button>
      </div>
      
      {isOpen && createPortal(
        <div 
          className="export-dropdown-content open"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <button onClick={() => { exportAll(); setIsOpen(false); }} className="export-option primary">
            <span className="option-icon">📄</span>
            <div className="option-text">
              <div className="option-title">Export All</div>
              <div className="option-subtitle">{glasses.length} total items</div>
            </div>
          </button>
          
          <button onClick={() => { exportFiltered(); setIsOpen(false); }} className="export-option secondary">
            <span className="option-icon">🔍</span>
            <div className="option-text">
              <div className="option-title">Export Filtered</div>
              <div className="option-subtitle">{filteredGlasses.length} filtered items</div>
            </div>
          </button>
          
          <button onClick={() => { exportSummary(); setIsOpen(false); }} className="export-option accent">
            <span className="option-icon">📈</span>
            <div className="option-text">
              <div className="option-title">Export Summary</div>
              <div className="option-subtitle">Grouped by glass type</div>
            </div>
          </button>
          
          <button onClick={() => { printInventory(); setIsOpen(false); }} className="export-option print">
            <span className="option-icon">🖨️</span>
            <div className="option-text">
              <div className="option-title">Print Report</div>
              <div className="option-subtitle">Printer-friendly format</div>
            </div>
          </button>
        </div>,
        document.body
      )}
    </div>
  )
}

export default ExportControls
