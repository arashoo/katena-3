import React, { useState } from 'react';
import { CURRENT_VERSION } from '../constants/changelog';
import ChangelogModal from './ChangelogModal';
import './ChangelogButton.css';

const ChangelogButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button 
        className="changelog-button"
        onClick={handleButtonClick}
        title="View Updates & Changelog"
      >
        <div className="changelog-button-content">
          <span className="changelog-icon">📋</span>
          <div className="changelog-text">
            <span className="changelog-label">Updates</span>
            <span className="changelog-version">v{CURRENT_VERSION}</span>
          </div>
        </div>
      </button>

      {isModalOpen && (
        <ChangelogModal onClose={handleCloseModal} />
      )}
    </>
  );
};

export default ChangelogButton;