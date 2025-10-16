// Katena 3 Changelog and Version Information
export const CURRENT_VERSION = "1.3.0";

export const CHANGELOG = [
  {
    version: "1.3.0",
    date: "2025-10-16",
    title: "Complete Project Management System with Preliminary Data",
    changes: [
      "🏗️ Complete project management system with independent modal components",
      "📝 AddProjectModal component for creating projects (name, client, address, status)",
      "📊 PreliminaryModal component for managing Gs and Divs data",
      "🎯 Space-separated input parsing for Gs/Divs (e.g., 'G1 G2 G3 G11 G23')",
      "📋 Project cards display with real-time preliminary counts",
      "🔄 Auto-refresh preliminary data when modals close",
      "💾 Preliminary.json file for dedicated Gs and Divs storage",
      "🌐 Backend API endpoints for full CRUD operations on preliminary data",
      "🔧 Fixed React hooks violations in modal components",
      "🧹 Cleaned up and removed old project-related components",
      "📱 Responsive project cards with status badges and count displays",
      "⚡ Parallel API calls for efficient preliminary data loading",
      "🛡️ Comprehensive error handling and data validation",
      "🏛️ Modular component architecture with separate CSS files",
      "🔄 Real-time synchronization between project and preliminary data"
    ],
    type: "major"
  },
  {
    version: "1.2.0",
    date: "2025-09-26",
    title: "Three-Slide Navigation & Mobile Table Enhancement",
    changes: [
      "🚀 Three-slide navigation system with dark theme design",
      "📱 Horizontal table slider for mobile devices (≤1200px)",
      "🎨 Custom gradient scrollbars with smooth touch scrolling",
      "📊 Enhanced table accessibility across all screen sizes",
      "🔧 Mobile-optimized table layouts for all data tables",
      "⚡ Removed emoji from Updates button for cleaner design",
      "🖱️ Hover expansion effects for slide navigation bars",
      "📱 Centered mobile dropdown navigation functionality",
      "🎯 Fixed modal display architecture for proper full-screen viewing",
      "✨ Visual scroll indicators for better user experience",
      "🔄 Responsive breakpoints: 1200px, 768px, 480px",
      "🎪 Edge-to-edge mobile table layouts for maximum viewing space",
      "🎨 Consistent design language across all table components",
      "⭐ Touch-friendly scrolling optimized for iOS devices",
      "🎭 Z-index hierarchy management for proper modal layering"
    ],
    type: "major"
  },
  {
    version: "1.1.0",
    date: "2025-09-25",
    title: "Mobile Navigation, Image Upload & Responsive Design",
    changes: [
      "📱 Mobile dropdown navigation for tablets/phones (≤1024px)",
      "📸 Image upload system for deficiencies (drag & drop, multiple files)",
      "🖼️ Image gallery with view/download capabilities",
      "📐 Comprehensive responsive design (4 breakpoints)",
      "🔌 Enhanced API endpoints with image support (50MB limit)",
      "💾 Base64 image storage in JSON database",
      "🔄 Auto-close mobile menu functionality",
      "👁️ Updates button hidden on small devices for cleaner mobile UI",
      "🎨 Responsive image grids adapting to screen size",
      "🔍 Full-screen image viewer with download options",
      "⚡ Visual feedback for all user interactions",
      "📱 Optimized layouts for all device sizes",
      "📋 Deficiency management system with CRUD operations",
      "🖼️ Image handling with validation and compression",
      "🗂️ Enhanced data structure for multimedia support"
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