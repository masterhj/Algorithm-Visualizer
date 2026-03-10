// Backend API Client for Algorithm Visualizer

class APIClient {
    constructor(baseURL = 'http://localhost:3001') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Sorting visualization endpoints
    async saveSortingVisualization(data) {
        return this.request('/api/visualizations/sorting', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Pathfinding visualization endpoints
    async savePathfindingResult(data) {
        return this.request('/api/visualizations/pathfinding', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Get all visualizations
    async getVisualizations() {
        return this.request('/api/visualizations');
    }

    // Get visualizations by type
    async getVisualizationsByType(type) {
        return this.request(`/api/visualizations/type/${type}`);
    }

    // Get algorithm statistics
    async getAlgorithmStats(algorithmName) {
        return this.request(`/api/algorithms/stats/${algorithmName}`);
    }

    // Get statistics summary
    async getStatisticsSummary() {
        return this.request('/api/visualizations/stats/summary');
    }

    // Health check
    async healthCheck() {
        return this.request('/api/health');
    }
}

// Create global API client instance
const apiClient = new APIClient();
