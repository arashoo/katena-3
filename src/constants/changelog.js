// Katena 3 Changelog and Version Information
export const CURRENT_VERSION = "1.01";

export const CHANGELOG = [
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