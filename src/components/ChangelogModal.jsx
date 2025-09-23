import React from 'react';
import { getAllChanges, CURRENT_VERSION } from '../constants/changelog';
import './ChangelogModal.css';

const ChangelogModal = ({ onClose }) => {
  const changelog = getAllChanges();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getVersionBadgeClass = (type) => {
    switch (type) {
      case 'major': return 'version-badge-major';
      case 'minor': return 'version-badge-minor';
      case 'patch': return 'version-badge-patch';
      default: return 'version-badge-minor';
    }
  };

  return (
    <div className="changelog-modal-overlay" onClick={onClose}>
      <div className="changelog-modal" onClick={(e) => e.stopPropagation()}>
        <div className="changelog-modal-header">
          <h2>Katena 3 Updates & Changelog</h2>
          <div className="changelog-current-version">
            Current Version: <span className="current-version-highlight">v{CURRENT_VERSION}</span>
          </div>
          <button className="changelog-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="changelog-modal-content">
          {changelog.map((entry, index) => (
            <div key={entry.version} className="changelog-entry">
              <div className="changelog-entry-header">
                <div className="changelog-entry-version">
                  <span className={`version-badge ${getVersionBadgeClass(entry.type)}`}>
                    v{entry.version}
                  </span>
                  <span className="changelog-entry-date">
                    {formatDate(entry.date)}
                  </span>
                </div>
                <h3 className="changelog-entry-title">{entry.title}</h3>
              </div>

              <div className="changelog-entry-changes">
                <ul>
                  {entry.changes.map((change, changeIndex) => (
                    <li key={changeIndex}>{change}</li>
                  ))}
                </ul>
              </div>

              {index < changelog.length - 1 && <hr className="changelog-divider" />}
            </div>
          ))}
        </div>

        <div className="changelog-modal-footer">
          <p>Thank you for using Katena 3 Glass Inventory Management System!</p>
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;