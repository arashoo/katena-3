import React, { useState, useMemo, useCallback, useRef } from 'react'
import './GlassTable.css'

function GlassTable({ glasses, onUpdateGlass, onDeleteGlass, onMoveToBacklog, onSort, sortConfig }) {
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [exitingEdit, setExitingEdit] = useState(false)
  
  // State for search input values
  const [widthSearchValue, setWidthSearchValue] = useState('')
  const [heightSearchValue, setHeightSearchValue] = useState('')
  const [colorSearchValue, setColorSearchValue] = useState('')
  const [thicknessSearchValue, setThicknessSearchValue] = useState('')
  
  // Debounced search values for actual filtering
  const [debouncedWidthSearch, setDebouncedWidthSearch] = useState('')
  const [debouncedHeightSearch, setDebouncedHeightSearch] = useState('')
  const [debouncedColorSearch, setDebouncedColorSearch] = useState('')
  const [debouncedThicknessSearch, setDebouncedThicknessSearch] = useState('')
  
  // Loading state for search operations
  const [isFiltering, setIsFiltering] = useState(false)
  
  // Refs for debounce timers
  const widthTimeoutRef = useRef(null)
  const heightTimeoutRef = useRef(null)
  const colorTimeoutRef = useRef(null)
  const thicknessTimeoutRef = useRef(null)

  // Debounced search handlers
  const handleWidthSearch = useCallback((value) => {
    setWidthSearchValue(value)
    setIsFiltering(!!value)
    if (widthTimeoutRef.current) clearTimeout(widthTimeoutRef.current)
    widthTimeoutRef.current = setTimeout(() => {
      setDebouncedWidthSearch(value)
      setIsFiltering(false)
    }, 300)
  }, [])

  const handleHeightSearch = useCallback((value) => {
    setHeightSearchValue(value)
    setIsFiltering(!!value)
    if (heightTimeoutRef.current) clearTimeout(heightTimeoutRef.current)
    heightTimeoutRef.current = setTimeout(() => {
      setDebouncedHeightSearch(value)
      setIsFiltering(false)
    }, 300)
  }, [])

  const handleColorSearch = useCallback((value) => {
    setColorSearchValue(value)
    setIsFiltering(!!value)
    if (colorTimeoutRef.current) clearTimeout(colorTimeoutRef.current)
    colorTimeoutRef.current = setTimeout(() => {
      setDebouncedColorSearch(value)
      setIsFiltering(false)
    }, 300)
  }, [])

  const handleThicknessSearch = useCallback((value) => {
    setThicknessSearchValue(value)
    setIsFiltering(!!value)
    if (thicknessTimeoutRef.current) clearTimeout(thicknessTimeoutRef.current)
    thicknessTimeoutRef.current = setTimeout(() => {
      setDebouncedThicknessSearch(value)
      setIsFiltering(false)
    }, 300)
  }, [])



  // Apply search filtering and sorting
  const filteredGlasses = useMemo(() => {
    let filtered = glasses
    
    // Apply width search
    if (debouncedWidthSearch.trim()) {
      filtered = filtered.filter(glass => 
        String(glass.width || '').toLowerCase().includes(debouncedWidthSearch.toLowerCase())
      )
    }
    
    // Apply height search  
    if (debouncedHeightSearch.trim()) {
      filtered = filtered.filter(glass => 
        String(glass.height || '').toLowerCase().includes(debouncedHeightSearch.toLowerCase())
      )
    }
    
    // Apply color search
    if (debouncedColorSearch.trim()) {
      filtered = filtered.filter(glass => 
        String(glass.color || '').toLowerCase().includes(debouncedColorSearch.toLowerCase())
      )
    }
    
    // Apply thickness search
    if (debouncedThicknessSearch.trim()) {
      filtered = filtered.filter(glass => 
        String(glass.thickness || '6mm').toLowerCase().includes(debouncedThicknessSearch.toLowerCase())
      )
    }


    
    // Apply sorting if sortConfig is provided
    if (sortConfig && sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        // Handle numeric sorting for numeric fields
        if (['width', 'height', 'count'].includes(sortConfig.key)) {
          const aNum = parseFloat(aValue) || 0
          const bNum = parseFloat(bValue) || 0
          if (sortConfig.direction === 'asc') {
            return aNum - bNum
          } else {
            return bNum - aNum
          }
        }
        
        // Handle boolean sorting for heatSoaked
        if (sortConfig.key === 'heatSoaked') {
          const aBool = Boolean(aValue)
          const bBool = Boolean(bValue)
          if (sortConfig.direction === 'asc') {
            return aBool === bBool ? 0 : (aBool ? 1 : -1)
          } else {
            return aBool === bBool ? 0 : (aBool ? -1 : 1)
          }
        }
        
        // Handle string sorting for other fields (color, thickness, etc.)
        const aStr = String(aValue || '').toLowerCase()
        const bStr = String(bValue || '').toLowerCase()
        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr)
        } else {
          return bStr.localeCompare(aStr)
        }
      })
    }
    
    return filtered
  }, [glasses, debouncedWidthSearch, debouncedHeightSearch, debouncedColorSearch, debouncedThicknessSearch, sortConfig])





  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return '↕️'
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const startEdit = (glass) => {
    setEditingId(glass.id)
    setEditData({ ...glass })
  }

  const cancelEdit = () => {
    setExitingEdit(true)
    setTimeout(() => {
      setEditingId(null)
      setEditData({})
      setExitingEdit(false)
    }, 200)
  }

  const saveEdit = () => {
    setExitingEdit(true)
    setTimeout(() => {
      onUpdateGlass(editingId, editData)
      setEditingId(null)
      setEditData({})
      setExitingEdit(false)
    }, 200)
  }

  const handleInputChange = (field, value) => {
    setEditData({ ...editData, [field]: value })
  }

  const formatRacks = (racks) => {
    if (!racks || racks.length === 0) return 'No rack'
    if (racks.length === 1) return racks[0]
    if (racks.length <= 3) return racks.join(', ')
    return `${racks.slice(0, 2).join(', ')} +${racks.length - 2} more`
  }





  return (
    <div className="glass-table-container">
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {/* Search input fields - always visible above corresponding columns */}
      <table className="search-inputs-table">
        <tbody>
          <tr>
            <td className="search-input-cell">
              <input
                type="text"
                value={widthSearchValue}
                onChange={(e) => handleWidthSearch(e.target.value)}
                placeholder="Search width..."
                className="column-search-input"
              />
            </td>
            <td className="search-input-cell">
              <input
                type="text"
                value={heightSearchValue}
                onChange={(e) => handleHeightSearch(e.target.value)}
                placeholder="Search height..."
                className="column-search-input"
              />
            </td>
            <td className="search-input-cell">
              <input
                type="text"
                value={colorSearchValue}
                onChange={(e) => handleColorSearch(e.target.value)}
                placeholder="Search color..."
                className="column-search-input"
              />
            </td>
            <td className="search-input-cell">
              <input
                type="text"
                value={thicknessSearchValue}
                onChange={(e) => handleThicknessSearch(e.target.value)}
                placeholder="Search thickness..."
                className="column-search-input"
              />
            </td>
            <td className="search-input-cell"></td>
            <td className="search-input-cell"></td>
            <td className="search-input-cell"></td>
            <td className="search-input-cell"></td>
            <td className="search-input-cell"></td>
          </tr>
        </tbody>
      </table>
      
      <table className="glass-table">
        <thead>
          <tr>
            <th onClick={() => onSort('width')} className="sortable">
              Width {getSortIcon('width')}
            </th>
            <th onClick={() => onSort('height')} className="sortable">
              Height {getSortIcon('height')}
            </th>
            <th onClick={() => onSort('color')} className="sortable">
              Color {getSortIcon('color')}
            </th>
            <th onClick={() => onSort('thickness')} className="sortable">
              Thickness {getSortIcon('thickness')}
            </th>
            <th onClick={() => onSort('heatSoaked')} className="sortable">
              Heat Soaked {getSortIcon('heatSoaked')}
            </th>
            <th onClick={() => onSort('count')} className="sortable">
              Count {getSortIcon('count')}
            </th>
            <th>
              Rack
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isFiltering ? (
            <tr>
              <td colSpan="7" className="no-results">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span>Filtering...</span>
                  <div style={{ width: '20px', height: '20px', border: '2px solid #f3f3f3', borderTop: '2px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              </td>
            </tr>
          ) : filteredGlasses.length === 0 ? (
            <tr>
              <td colSpan="7" className="no-results">
                {glasses.length === 0 ? 'No glass inventory found' : 'No glasses match the current filters'}
              </td>
            </tr>
          ) : (
            filteredGlasses.filter(glass => glass).map((glass, glassIndex) => (
            <React.Fragment key={`${glass.id}-${glassIndex}`}>
              <tr 
                className={`${editingId === glass.id ? 'editing' : ''} ${exitingEdit && editingId === glass.id ? 'exiting' : ''}`}
              >
              {editingId === glass.id ? (
                // Edit mode
                <>
                  <td>
                    <input
                      type="number"
                      step="0.125"
                      value={editData.width}
                      onChange={(e) => handleInputChange('width', parseFloat(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.125"
                      value={editData.height}
                      onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                    />
                  </td>
                  <td>
                    <select
                      value={editData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                    >
                      <option value="Clear">Clear</option>
                      <option value="Bronze">Bronze</option>
                      <option value="Grey">Grey</option>
                      <option value="Blue">Blue</option>
                      <option value="Green">Green</option>
                      <option value="Acid Etched">Acid Etched</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={editData.thickness || '6mm'}
                      onChange={(e) => handleInputChange('thickness', e.target.value)}
                    >
                      <option value="6mm">6mm</option>
                      <option value="8mm">8mm</option>
                      <option value="10mm">10mm</option>
                      <option value="12mm">12mm</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={editData.heatSoaked}
                      onChange={(e) => handleInputChange('heatSoaked', e.target.value === 'true')}
                    >
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={editData.count}
                      onChange={(e) => handleInputChange('count', parseInt(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={Array.isArray(editData.racks) ? editData.racks.join(', ') : editData.racks || ''}
                      onChange={(e) => handleInputChange('racks', e.target.value.split(',').map(r => r.trim()).filter(r => r))}
                      placeholder="Rack numbers separated by commas"
                    />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={saveEdit} className="save-btn" title="Save changes">✅</button>
                      <button onClick={cancelEdit} className="cancel-btn" title="Cancel editing">❌</button>
                    </div>
                  </td>
                </>
              ) : (
                // View mode
                <>
                  <td>{glass.width}"</td>
                  <td>{glass.height}"</td>
                  <td>
                    <span className={`color-indicator ${glass.color.toLowerCase().replace(/\s+/g, '-')}`}></span>
                    {glass.color}
                  </td>
                  <td>{glass.thickness || '6mm'}</td>
                  <td>{glass.heatSoaked ? 'Yes' : 'No'}</td>
                  <td className="count-cell">
                    <span className="total-count">{glass.count}</span>
                  </td>
                  <td className="rack-cell">
                    <span title={glass.racks ? glass.racks.join(', ') : 'No rack'}>
                      {formatRacks(glass.racks)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => startEdit(glass)} className="edit-btn" title="Edit glass">✏️</button>
                      <button onClick={() => onDeleteGlass(glass)} className="delete-btn" title="Delete glass">🗑️</button>
                    </div>
                  </td>
                </>
              )}
            </tr>

            </React.Fragment>
            ))
          )}
        </tbody>
      </table>


    </div>
  )
}

export default GlassTable