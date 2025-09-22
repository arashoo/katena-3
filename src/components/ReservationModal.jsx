import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './ReservationModal.css'

function ReservationModal({ isOpen, onClose, glass, onReserve }) {
  const [quantity, setQuantity] = useState('')
  const [projectName, setProjectName] = useState('')
  const [error, setError] = useState('')
  const quantityInputRef = useRef(null)

  useEffect(() => {
    if (isOpen && glass) {
      setQuantity(Math.min(glass.availableCount, 10).toString())
      setProjectName('')
      setError('')
    }
  }, [isOpen, glass])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const qty = parseInt(quantity)
    
    // Validation
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity greater than 0')
      return
    }
    
    if (qty > glass.availableCount) {
      setError(`Cannot reserve ${qty} pieces. We only have ${glass.availableCount} available.\nTotal inventory: ${glass.count}, Already reserved: ${glass.count - glass.availableCount}`)
      return
    }
    
    if (!projectName.trim()) {
      setError('Project name is required for reservation')
      return
    }
    
    // Success - call the reservation function with correct format
    const reservationData = {
      quantity: qty,
      projectName: projectName.trim()
    }
    onReserve(glass.id, reservationData)
    onClose()
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  if (!isOpen || !glass) return null

  const modalContent = (
    <div 
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '2147483647',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 28px 16px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '16px 16px 0 0'
        }}>
          <h3 style={{margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b'}}>
            Reserve Glass Inventory
          </h3>
          <button 
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#64748b',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px'
            }}
          >×</button>
        </div>
        
        <div style={{padding: '24px 28px'}}>
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#334155'}}>
              Glass Specifications
            </h4>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '13px', color: '#64748b', fontWeight: '500'}}>Size:</span>
                <span style={{fontSize: '13px', color: '#1e293b', fontWeight: '600'}}>{glass.width}" × {glass.height}"</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '13px', color: '#64748b', fontWeight: '500'}}>Color:</span>
                <span style={{fontSize: '13px', color: '#1e293b', fontWeight: '600'}}>{glass.color}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '13px', color: '#64748b', fontWeight: '500'}}>Rack:</span>
                <span style={{fontSize: '13px', color: '#1e293b', fontWeight: '600'}}>{glass.racks && glass.racks.length > 0 ? glass.racks.join(', ') : 'No rack'}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '13px', color: '#64748b', fontWeight: '500'}}>Heat Soaked:</span>
                <span style={{fontSize: '13px', color: '#1e293b', fontWeight: '600'}}>{glass.heatSoaked ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <span style={{fontSize: '14px', color: '#64748b', fontWeight: '500'}}>Available:</span>
              <span style={{color: '#059669', fontWeight: '700', fontSize: '16px'}}>{glass.availableCount} pieces</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <span style={{fontSize: '14px', color: '#64748b', fontWeight: '500'}}>Total Inventory:</span>
              <span style={{color: '#334155', fontWeight: '600'}}>{glass.count} pieces</span>
            </div>
            {glass.count - glass.availableCount > 0 && (
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '14px', color: '#64748b', fontWeight: '500'}}>Already Reserved:</span>
                <span style={{color: '#dc2626', fontWeight: '600'}}>{glass.count - glass.availableCount} pieces</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{marginTop: '24px'}}>
            <div style={{marginBottom: '20px'}}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Quantity to Reserve
              </label>
              <input
                type="number"
                min="1"
                max={glass.availableCount}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                ref={quantityInputRef}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#1e293b',
                  background: 'white',
                  boxSizing: 'border-box'
                }}
              />
              <small style={{display: 'block', marginTop: '4px', fontSize: '12px', color: '#64748b'}}>
                Maximum: {glass.availableCount} pieces
              </small>
            </div>

            <div style={{marginBottom: '20px'}}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#1e293b',
                  background: 'white',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <span style={{fontSize: '16px', marginTop: '1px'}}>⚠️</span>
                <span style={{
                  fontSize: '13px',
                  color: '#dc2626',
                  fontWeight: '500',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-line'
                }}>
                  {error}
                </span>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button 
                type="button" 
                onClick={handleClose}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '100px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  color: '#64748b'
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '100px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                Reserve Glass
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default ReservationModal
