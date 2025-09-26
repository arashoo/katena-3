import React from 'react';
import { CURRENT_VERSION } from '../constants/changelog';
import './ChangelogButton.css';

const ChangelogButton = ({ onOpenModal }) => {
  const handleButtonClick = (e) => {
    console.log('ChangelogButton clicked!');
    e.preventDefault();
    e.stopPropagation();
    if (onOpenModal) {
      onOpenModal();
    }
  };

  return (
    <>
      <button 
        className="changelog-button"
        onClick={handleButtonClick}
        title="View Updates & Changelog"
      >
        <div className="changelog-button-content">
          <div className="changelog-text">
            <span className="changelog-label">Updates</span>
            <span className="changelog-version">v{CURRENT_VERSION}</span>
          </div>
        </div>
      </button>

    </>
  );
};

export default ChangelogButton;