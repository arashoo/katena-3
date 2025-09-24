// Katena 3 Changelog and Version Information
export const CURRENT_VERSION = "1.03";

export const CHANGELOG = [
  {
    version: "1.03",
    date: "2025-09-24",
    title: "UI Optimization & Data Sync",
    changes: [
      "Optimized table layout: narrowed width/height columns (60px) for better space utilization",
      "Expanded Reserved Projects column (250px) for improved project name visibility",
      "Reduced font size for dimensions (12px) and rack info (11px) for compact display",
      "Aligned search input widths to match respective column widths perfectly",
      "The website is now hosted on Virtual Private Server (VPS) for improved reliability and performance",
      "Updated inventory with 551 current glass entries from Excel sync",
    ],
    type: "minor"
  },
  {
    version: "1.02",
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
    version: "1.01",
    date: "2025-09-23",
    title: "Minor bug fixes",
    changes: [
      "Fixed glass row not showing after reserve for project, now auto-refreshes after each reservation",
      "Added changelog and version tracking system"
    ],
    type: "minor" // major, minor, patch
  },
  {
    version: "1.00",
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