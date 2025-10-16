import React, { useState } from 'react';
import './AddProjectModal.css';

function AddProjectModal({ isOpen, onClose, onSave }) {
  const [projectData, setProjectData] = useState({
    name: '',
    contact: '',
    address: '',
    status: 'planning'
  });

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleInputChange = (field, value) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateUniqueId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!projectData.name.trim()) {
      alert('Please enter a project name');
      return;
    }

    // Create project object with unique ID
    const newProject = {
      id: generateUniqueId(),
      name: projectData.name.trim(),
      client: projectData.contact.trim(),
      address: projectData.address.trim(),
      status: projectData.status
    };

    try {
      // Send to backend to save in projects.json
      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject)
      });

      if (response.ok) {
        if (onSave) {
          onSave(newProject);
        }
        // Reset form
        setProjectData({
          name: '',
          contact: '',
          address: '',
          status: 'planning'
        });
        onClose();
      } else {
        alert('Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project');
    }
  };

  return (
    <div className="add-project-modal-overlay" onClick={handleOverlayClick}>
      <div className="add-project-modal-content">
        <div className="add-project-modal-header">
          <h3>Add New Project</h3>
          <button className="add-project-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="add-project-modal-body">
          <div className="form-field">
            <label>Project Name:</label>
            <input 
              type="text" 
              placeholder="Enter project name" 
              value={projectData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          
          <div className="form-field">
            <label>Client Contact:</label>
            <input 
              type="text" 
              placeholder="Enter client contact info" 
              value={projectData.contact}
              onChange={(e) => handleInputChange('contact', e.target.value)}
            />
          </div>
          
          <div className="form-field">
            <label>Address:</label>
            <textarea 
              placeholder="Enter project address" 
              value={projectData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>
          
          <div className="form-field">
            <label>Status:</label>
            <select 
              value={projectData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="add-project-modal-footer">
          <button className="add-project-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="add-project-save-btn" onClick={handleSave}>
            Save Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddProjectModal;