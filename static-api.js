// Katena3 Static API - Browser-based replacement for Node.js backend
// This eliminates 503 errors by removing server dependencies

class StaticKatenaAPI {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // Initialize localStorage with default data if not exists
        if (!localStorage.getItem('katena_glasses')) {
            localStorage.setItem('katena_glasses', JSON.stringify(window.KATENA_GLASSES_DATA || []));
        }
        if (!localStorage.getItem('katena_backlog')) {
            localStorage.setItem('katena_backlog', JSON.stringify(window.KATENA_BACKLOG_DATA || []));
        }
        if (!localStorage.getItem('katena_pending_orders')) {
            localStorage.setItem('katena_pending_orders', JSON.stringify(window.KATENA_PENDING_ORDERS_DATA || []));
        }
        
        console.log('Katena3 Static API initialized with localStorage');
    }

    // Glass management endpoints
    async getGlasses() {
        try {
            return JSON.parse(localStorage.getItem('katena_glasses') || '[]');
        } catch (error) {
            console.error('Error loading glasses:', error);
            return [];
        }
    }

    async updateGlass(glassData) {
        try {
            const glasses = await this.getGlasses();
            const index = glasses.findIndex(g => g.id === glassData.id);
            
            if (index >= 0) {
                glasses[index] = { ...glasses[index], ...glassData };
            } else {
                glasses.push(glassData);
            }
            
            localStorage.setItem('katena_glasses', JSON.stringify(glasses));
            return glasses[index >= 0 ? index : glasses.length - 1];
        } catch (error) {
            console.error('Error updating glass:', error);
            throw error;
        }
    }

    async deleteGlass(glassId) {
        try {
            const glasses = await this.getGlasses();
            const filteredGlasses = glasses.filter(g => g.id !== glassId);
            localStorage.setItem('katena_glasses', JSON.stringify(filteredGlasses));
            return true;
        } catch (error) {
            console.error('Error deleting glass:', error);
            throw error;
        }
    }

    // Backlog management
    async getBacklog() {
        try {
            return JSON.parse(localStorage.getItem('katena_backlog') || '[]');
        } catch (error) {
            console.error('Error loading backlog:', error);
            return [];
        }
    }

    async updateBacklog(backlogData) {
        try {
            localStorage.setItem('katena_backlog', JSON.stringify(backlogData));
            return backlogData;
        } catch (error) {
            console.error('Error updating backlog:', error);
            throw error;
        }
    }

    // Pending orders management
    async getPendingOrders() {
        try {
            return JSON.parse(localStorage.getItem('katena_pending_orders') || '[]');
        } catch (error) {
            console.error('Error loading pending orders:', error);
            return [];
        }
    }

    async addPendingOrder(orderData) {
        try {
            const orders = await this.getPendingOrders();
            const newOrder = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                ...orderData
            };
            orders.push(newOrder);
            localStorage.setItem('katena_pending_orders', JSON.stringify(orders));
            return newOrder;
        } catch (error) {
            console.error('Error adding pending order:', error);
            throw error;
        }
    }

    async deletePendingOrder(orderId) {
        try {
            const orders = await this.getPendingOrders();
            const filteredOrders = orders.filter(o => o.id !== orderId);
            localStorage.setItem('katena_pending_orders', JSON.stringify(filteredOrders));
            return true;
        } catch (error) {
            console.error('Error deleting pending order:', error);
            throw error;
        }
    }

    // Reservation management
    async addReservation(glassId, reservationData) {
        try {
            const glasses = await this.getGlasses();
            const glass = glasses.find(g => g.id === glassId);
            
            if (glass) {
                if (!glass.reservations) glass.reservations = [];
                
                const newReservation = {
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    ...reservationData
                };
                
                glass.reservations.push(newReservation);
                await this.updateGlass(glass);
                return newReservation;
            }
            
            throw new Error('Glass not found');
        } catch (error) {
            console.error('Error adding reservation:', error);
            throw error;
        }
    }

    async deleteReservation(glassId, reservationId) {
        try {
            const glasses = await this.getGlasses();
            const glass = glasses.find(g => g.id === glassId);
            
            if (glass && glass.reservations) {
                glass.reservations = glass.reservations.filter(r => r.id !== reservationId);
                await this.updateGlass(glass);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error deleting reservation:', error);
            throw error;
        }
    }

    // Export functionality
    exportData(format = 'json') {
        try {
            const data = {
                glasses: JSON.parse(localStorage.getItem('katena_glasses') || '[]'),
                backlog: JSON.parse(localStorage.getItem('katena_backlog') || '[]'),
                pendingOrders: JSON.parse(localStorage.getItem('katena_pending_orders') || '[]'),
                exportTimestamp: new Date().toISOString(),
                version: '1.02'
            };

            if (format === 'json') {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `katena3-export-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }

            return data;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    // Import functionality
    async importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            if (data.glasses) {
                localStorage.setItem('katena_glasses', JSON.stringify(data.glasses));
            }
            if (data.backlog) {
                localStorage.setItem('katena_backlog', JSON.stringify(data.backlog));
            }
            if (data.pendingOrders) {
                localStorage.setItem('katena_pending_orders', JSON.stringify(data.pendingOrders));
            }

            console.log('Data imported successfully');
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }

    // Clear all data (for testing/reset)
    clearAllData() {
        localStorage.removeItem('katena_glasses');
        localStorage.removeItem('katena_backlog');
        localStorage.removeItem('katena_pending_orders');
        this.initializeData();
        console.log('All data cleared and reinitialized');
    }
}

// Initialize the static API
window.katenaAPI = new StaticKatenaAPI();

// Override fetch for API calls to use localStorage instead
const originalFetch = window.fetch;
window.fetch = async function(url, options = {}) {
    // Check if this is a Katena API call
    if (url.includes('/api/') || url.startsWith('/api/')) {
        const method = options.method || 'GET';
        const endpoint = url.split('/api/')[1];

        switch (endpoint) {
            case 'glasses':
                if (method === 'GET') {
                    return {
                        ok: true,
                        json: async () => await window.katenaAPI.getGlasses()
                    };
                }
                break;
            
            case 'backlog':
                if (method === 'GET') {
                    return {
                        ok: true,
                        json: async () => await window.katenaAPI.getBacklog()
                    };
                }
                break;
            
            case 'pending-orders':
                if (method === 'GET') {
                    return {
                        ok: true,
                        json: async () => await window.katenaAPI.getPendingOrders()
                    };
                }
                break;
        }

        // Handle PUT/POST requests
        if (method === 'PUT' || method === 'POST') {
            const body = options.body ? JSON.parse(options.body) : {};
            
            if (endpoint.startsWith('glasses/')) {
                const result = await window.katenaAPI.updateGlass(body);
                return {
                    ok: true,
                    json: async () => result
                };
            }
        }

        // Default success response for unhandled API calls
        return {
            ok: true,
            json: async () => ({ success: true })
        };
    }

    // For non-API calls, use original fetch
    return originalFetch(url, options);
};

console.log('Katena3 Static API loaded - No server required!');