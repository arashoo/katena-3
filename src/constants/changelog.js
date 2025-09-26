// Katena 3 Changelog and Version Information
export const CURRENT_VERSION = "1.1.0";

export const CHANGELOG = [
  {
    version: "1.1.0",
    date: "2025-09-25",
    title: "Mobile Navigation, Image Upload & Responsive Design",
    changes: [
      "🎯 Key Features Added:",
      "📱 Mobile dropdown navigation for tablets/phones (≤1024px)",
      "📸 Image upload system for deficiencies (drag & drop, multiple files)",
      "🖼️ Image gallery with view/download capabilities", 
      "📱 Comprehensive responsive design (4 breakpoints)",
      "🗑️ File cleanup (removed unused AdvancedFilters & SearchBar)",
      "",
      "🔧 Technical Improvements:",
      "Enhanced API endpoints with image support (50MB limit)",
      "Base64 image storage in JSON database",
      "Touch-friendly mobile interactions",
      "Smooth animations and transitions",
      "Auto-close mobile menu functionality",
      "",
      "🎨 UI/UX Enhancements:",
      "Updates button hidden on small devices for cleaner mobile UI",
      "Responsive image grids adapting to screen size",
      "Full-screen image viewer with download options",
      "Visual feedback for all user interactions",
      "Optimized layouts for all device sizes",
      "",
      "📊 Backend Updates:",
      "Deficiency management system with CRUD operations",
      "Image handling with validation and compression",
      "Enhanced data structure for multimedia support"
    ],
    type: "major"
  },
  {
    version: "1.0.4",
    date: "2025-09-26",
    title: "small tweaks",
    changes: [
      " "    
    ],
    type: "minor"
  },
  {
    version: "1.0.3",
    date: "2025-09-24",
    title: "UI & Server Improvement",
    changes: [
      "Inventory:",
      "Table resized for better readability",
      "Inventory is now all synced with the excel sheet",
      "Server:",
      "The website is now hosted on Virtual Private Server (VPS)",     
    ],
    type: "minor"
  },
  {
    version: "1.0.2",
    date: "2025-09-23",
    title: "Glass Thickness & Authentication",
    changes: [
      "Added thickness column to inventory system with search and filter capabilities",
      "Implemented password protection with 24-hour session persistence (passkey: 9220katena)",
      "Added logout functionality with secure session management",
      "Imported 2,330 glass pieces from JOYO shipment JOYO-KR-250001/0002",
      "Added support for 10mm thickness glass panels",
      "Enhanced inventory with proper thickness tracking and display"
    ],
    type: "minor"
  },
  {
    version: "1.0.1",
    date: "2025-09-23",
    title: "Minor bug fixes",
    changes: [
      "Fixed glass row not showing after reserve for project, now auto-refreshes after each reservation",
      "Added changelog and version tracking system"
    ],
    type: "minor" // major, minor, patch
  },
  {
    version: "1.0.0",
    date: "2025-09-20",
    title: "Initial Release",
    changes: [
      "Complete glass inventory management system",
      "Advanced filtering and search capabilities",
      "Project reservation and tracking",
      "Backlog management for glass orders",
      "Email order generation and export features",
      "Responsive dashboard with real-time updates",
      "Data import/export functionality"
    ],
    type: "major"
  }
];

export const getLatestVersion = () => CURRENT_VERSION;

export const getLatestChanges = (limit = 3) => {
  return CHANGELOG.slice(0, limit);
};

export const getAllChanges = () => CHANGELOG;