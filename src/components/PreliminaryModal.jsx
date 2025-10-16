import React, { useState, useEffect } from 'react';
import './PreliminaryModal.css';

function PreliminaryModal({ isOpen, onClose, project }) {
  const [gsInput, setGsInput] = useState('');
  const [divsInput, setDivsInput] = useState('');

  // Load existing data when modal opens - MUST be before early return
  useEffect(() => {
    if (isOpen && project) {
      loadPreliminaryData();
    }
  }, [isOpen, project]);

  // Early return AFTER all hooks
  if (!isOpen || !project) return null;

  const loadPreliminaryData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/preliminary/${project.id}`);
      if (response.ok) {
        const data = await response.json();
        setGsInput(data.Gs ? data.Gs.join(' ') : '');
        setDivsInput(data.Divs ? data.Divs.join(' ') : '');
      }
    } catch (error) {
      console.error('Error loading preliminary data:', error);
    }
  };

  const handleSave = async () => {
    // Parse Gs and Divs from space-separated strings
    const gsArray = gsInput.trim() ? gsInput.trim().split(/\s+/) : [];
    const divsArray = divsInput.trim() ? divsInput.trim().split(/\s+/) : [];

    const preliminaryData = {
      projectId: project.id,
      projectName: project.name,
      Gs: gsArray,
      Divs: divsArray,
      lastUpdated: new Date().toISOString()
    };

    try {
      const response = await fetch('http://localhost:3001/api/preliminary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preliminaryData)
      });

      if (response.ok) {
        console.log('Preliminary data saved successfully');
        onClose();
      } else {
        alert('Failed to save preliminary data');
      }
    } catch (error) {
      console.error('Error saving preliminary data:', error);
      alert('Error saving preliminary data');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="preliminary-modal-overlay" onClick={handleOverlayClick}>
      <div className="preliminary-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="preliminary-modal-header">
          <h3>Preliminary - {project.name}</h3>
          <button className="preliminary-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="preliminary-modal-body">
          <div className="preliminary-content">
            <h4>Preliminary Details</h4>
            <p>Project: {project.name}</p>
            <p>Client: {project.client}</p>
            <p>Status: {project.status}</p>
            
            <div className="preliminary-fields">
              <div className="preliminary-field">
                <label htmlFor="add-gs">Add Gs:</label>
                <input 
                  type="text" 
                  id="add-gs"
                  value={gsInput}
                  onChange={(e) => setGsInput(e.target.value)}
                  placeholder="Enter Gs separated by spaces (e.g., G1 G2 G3 G11 G23)" 
                />
              </div>
              
              <div className="preliminary-field">
                <label htmlFor="add-divs">Add Divs:</label>
                <input 
                  type="text" 
                  id="add-divs"
                  value={divsInput}
                  onChange={(e) => setDivsInput(e.target.value)}
                  placeholder="Enter Divs separated by spaces (e.g., D1 D2 D3)" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="preliminary-modal-footer">
          <button className="preliminary-save-btn" onClick={handleSave}>
            Save
          </button>
          <button className="preliminary-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreliminaryModal;