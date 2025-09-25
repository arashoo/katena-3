// API service for communicating with the backend
const API_BASE_URL = 'http://localhost:3001/api'; // Local development API URL

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

  async reserveGlass(id, reservationData) {
    return await this.fetch(`/glasses/${id}/reserve`, {
      method: 'POST',
      body: JSON.stringify(reservationData),
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

  // Pending Orders API methods
  async getPendingOrders() {
    return await this.fetch('/pending-orders');
  }

  async addPendingOrder(orderData) {
    return await this.fetch('/pending-orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updatePendingOrder(id, orderData) {
    return await this.fetch(`/pending-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deletePendingOrder(id) {
    return await this.fetch(`/pending-orders/${id}`, {
      method: 'DELETE',
    });
  }

  async receiveOrder(id, receiptData = {}) {
    return await this.fetch(`/pending-orders/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify(receiptData),
    });
  }

  // Health check
  async healthCheck() {
    return await this.fetch('/health');
  }

  // Test connection
  async testConnection() {
    try {
      await this.healthCheck();
      return { success: true, message: 'Server connection successful' };
    } catch (error) {
      return { 
        success: false, 
        message: `Server connection failed: ${error.message}`,
        suggestion: 'Make sure the backend server is running on port 3001'
      };
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;