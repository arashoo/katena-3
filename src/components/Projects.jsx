import React, { useState, useEffect } from 'react';
import './Projects.css';
import AddProjectModal from './AddProjectModal';
import PreliminaryModal from './PreliminaryModal';

function Projects() {
  const [showModal, setShowModal] = useState(false);
  const [showPreliminaryModal, setShowPreliminaryModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [preliminaryData, setPreliminaryData] = useState({});
  const [loading, setLoading] = useState(true);

  // Load projects from backend
  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/projects');
      if (response.ok) {
        const projectsData = await response.json();
        setProjects(projectsData);
        // Load preliminary data for all projects
        await loadPreliminaryData(projectsData);
      } else {
        console.error('Failed to load projects');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load preliminary data for all projects
  const loadPreliminaryData = async (projectsData) => {
    try {
      const preliminaryPromises = projectsData.map(async (project) => {
        const response = await fetch(`http://localhost:3001/api/preliminary/${project.id}`);
        if (response.ok) {
          const data = await response.json();
          return { [project.id]: data };
        }
        return { [project.id]: { Gs: [], Divs: [] } };
      });

      const preliminaryResults = await Promise.all(preliminaryPromises);
      const preliminaryMap = preliminaryResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setPreliminaryData(preliminaryMap);
    } catch (error) {
      console.error('Error loading preliminary data:', error);
    }
  };

  // Load projects when component mounts
  useEffect(() => {
    loadProjects();
  }, []);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSave = (newProject) => {
    // Refresh the projects list after adding a new project
    loadProjects();
    closeModal();
  };

  const openPreliminaryModal = (project) => {
    setSelectedProject(project);
    setShowPreliminaryModal(true);
  };

  const closePreliminaryModal = () => {
    setShowPreliminaryModal(false);
    setSelectedProject(null);
    // Refresh preliminary data after modal closes (in case data was updated)
    if (projects.length > 0) {
      loadPreliminaryData(projects);
    }
  };

  return (
    <div className="projects-container">
      <div className="project-header">
        <h2>PROJECTS</h2>
        <button className="top-right-button" onClick={openModal}>
          + Add Project
        </button>
      </div>
      
      <div className="project-content">
        {loading ? (
          <div className="loading-state">
            <p>Loading projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="projects-list">
            <h3>Current Projects</h3>
            <div className="projects-grid">
              {projects.map((project) => {
                const projectPreliminary = preliminaryData[project.id] || { Gs: [], Divs: [] };
                const gsCount = projectPreliminary.Gs ? projectPreliminary.Gs.length : 0;
                const divsCount = projectPreliminary.Divs ? projectPreliminary.Divs.length : 0;
                
                return (
                  <div key={project.id} className="project-card">
                    <div className="project-card-header">
                      <h4 className="project-name">{project.name}</h4>
                      <span className={`project-status status-${project.status}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="project-details">
                      <p><strong>Client:</strong> {project.client}</p>
                      <p><strong>Address:</strong> {project.address}</p>
                    </div>
                    <div className="project-preliminary-counts">
                      <div className="preliminary-count-item">
                        <span className="count-label">Gs:</span>
                        <span className="count-value">{gsCount}</span>
                      </div>
                      <div className="preliminary-count-item">
                        <span className="count-label">Divs:</span>
                        <span className="count-value">{divsCount}</span>
                      </div>
                    </div>
                    <div className="project-actions">
                      <button 
                        className="preliminary-btn"
                        onClick={() => openPreliminaryModal(project)}
                      >
                        Preliminary
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Projects Yet</h3>
            <p>Click "Add Project" to create your first project</p>
          </div>
        )}
      </div>

      <AddProjectModal 
        isOpen={showModal}
        onClose={closeModal}
        onSave={handleSave}
      />

      <PreliminaryModal
        isOpen={showPreliminaryModal}
        onClose={closePreliminaryModal}
        project={selectedProject}
      />
    </div>
  );
}

export default Projects;
