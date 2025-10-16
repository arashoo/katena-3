# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-10-16

### Added
- **Complete Project Management System**
  - New AddProjectModal component for creating projects with name, client, address, and status
  - Independent PreliminaryModal component for managing Gs and Divs data
  - Project cards display showing project overview with real-time preliminary counts
  - Backend API endpoints for full CRUD operations on preliminary data
  - Preliminary.json file for dedicated storage of Gs and Divs data
  - Space-separated input parsing for Gs and Divs (e.g., "G1 G2 G3 G11 G23")
  - Real-time count updates showing number of Gs and Divs per project
  - Proper error handling and data validation throughout the system

### Changed
- Projects component completely rebuilt with clean architecture
- Removed old project-related components and replaced with modular system
- Improved component organization with separate files for each modal
- Enhanced state management for better data synchronization

### Fixed
- React hooks violations in modal components resolved
- Proper hook order maintained to prevent rendering errors
- Consistent API error handling across all components

### Removed
- Old project reservation modals and related components
- Unused export controls and backup CSS files
- Deprecated reservation edit modal functionality

### Technical Improvements
- Modular component architecture with independent CSS files
- Parallel API calls for efficient preliminary data loading
- Automatic data refresh when modal interactions occur
- Clean separation of concerns between project and preliminary data
- Improved TypeScript-like prop validation and error boundaries

---

## [1.0.4] - 2025-09-25

### Added
- Search functionality for reserved projects column
- Automatic allocation system for glasses with reserved projects
- Project search with debounced input and real-time filtering

### Changed
- Project row colors changed from yellow to blue (personal preference)
- Projects allocated to recently updated glasses automatically
- Improved visual distinction between glasses with and without projects

### Fixed
- Sorting functionality now works for all table columns consistently
- Column headers now properly display sort indicators

### Technical Improvements
- Enhanced project data structure with quantities and reservation metadata
- Debounced search inputs for better performance
- Consistent table column sorting implementation

---

## Previous Versions
- Initial development and feature implementations