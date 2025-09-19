import React from 'react'
import './Projects.css'

function Projects({ glasses }) {
  // Get all unique projects from reserved glasses
  const projects = glasses
    ? glasses
        .filter(glass => glass.reservedProject)
        .reduce((acc, glass) => {
          const existingProject = acc.find(p => p.name === glass.reservedProject)
          if (existingProject) {
            existingProject.totalGlass += glass.count
            existingProject.glassItems.push(glass)
          } else {
            acc.push({
              name: glass.reservedProject,
              totalGlass: glass.count,
              glassItems: [glass],
              dateCreated: glass.dateAdded,
              status: 'Active'
            })
          }
          return acc
        }, [])
    : []

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h2>🏗️ Projects Management</h2>
        <p className="coming-soon">Coming in the next iteration</p>
      </div>

      <div className="projects-preview">
        <div className="feature-list">
          <h3>📋 Planned Features:</h3>
          <ul>
            <li>✨ Project creation and management</li>
            <li>📊 Project progress tracking</li>
            <li>📦 Glass allocation by project</li>
            <li>📈 Project analytics and reporting</li>
            <li>⏰ Timeline and milestone tracking</li>
            <li>💰 Cost estimation and budgeting</li>
            <li>📋 Project status updates</li>
            <li>🔄 Glass transfer between projects</li>
          </ul>
        </div>

        {projects.length > 0 && (
          <div className="current-projects">
            <h3>📂 Current Active Projects ({projects.length}):</h3>
            <div className="projects-grid">
              {projects.map((project, index) => (
                <div key={index} className="project-card preview">
                  <div className="project-header">
                    <h4>{project.name}</h4>
                    <span className="status-badge active">{project.status}</span>
                  </div>
                  <div className="project-stats">
                    <div className="stat">
                      <span className="stat-label">Total Glass:</span>
                      <span className="stat-value">{project.totalGlass} pieces</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Glass Types:</span>
                      <span className="stat-value">{project.glassItems.length}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Started:</span>
                      <span className="stat-value">{project.dateCreated}</span>
                    </div>
                  </div>
                  <div className="project-glass-summary">
                    <h5>Glass Breakdown:</h5>
                    <div className="glass-list">
                      {project.glassItems.slice(0, 3).map((glass, idx) => (
                        <div key={idx} className="glass-item">
                          {glass.width}" × {glass.height}" {glass.color} 
                          {glass.heatSoaked && ' 🔥'} 
                          ({glass.count} pcs)
                        </div>
                      ))}
                      {project.glassItems.length > 3 && (
                        <div className="more-items">
                          +{project.glassItems.length - 3} more types...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="development-notice">
          <div className="notice-icon">🚧</div>
          <div className="notice-content">
            <h3>Under Development</h3>
            <p>
              The Projects management feature is currently under development and will be available in the next iteration. 
              This preview shows the planned functionality and current project data from your reservations.
            </p>
            <div className="timeline">
              <span className="timeline-item">🔄 Current: Basic project preview</span>
              <span className="timeline-item">🎯 Next: Full project management</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Projects