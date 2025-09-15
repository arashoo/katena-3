// API service for communicating with the backend
const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  // Generic fetch wrapper with error handling
  async fetch(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Glass Inventory API methods
  async getGlasses() {
    return await this.fetch('/glasses');
  }

  async addGlass(glassData) {
    return await this.fetch('/glasses', {
      method: 'POST',
      body: JSON.stringify(glassData),
    });
  }

  async updateGlass(id, glassData) {
    return await this.fetch(`/glasses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(glassData),
    });
  }

  async deleteGlass(id) {
    return await this.fetch(`/glasses/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkAddGlasses(glassArray) {
    return await this.fetch('/glasses/bulk', {
      method: 'POST',
      body: JSON.stringify({ glasses: glassArray }),
    });
  }

  // Backlog API methods
  async getBacklog() {
    return await this.fetch('/backlog');
  }

  async addToBacklog(backlogData) {
    return await this.fetch('/backlog', {
      method: 'POST',
      body: JSON.stringify(backlogData),
    });
  }

  async updateBacklogItem(id, backlogData) {
    return await this.fetch(`/backlog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backlogData),
    });
  }

  async deleteFromBacklog(id) {
    return await this.fetch(`/backlog/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return await this.fetch('/health');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;