import { auth } from './auth.js';

class ApiClient {
  constructor() {
    this.baseUrl = window.location.origin;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api${endpoint}`;
    const token = auth.getToken();

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const config = { ...defaultOptions, ...options };
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getStats() {
    return this.request('/portal/stats');
  }

  async getKeywords() {
    return this.request('/portal/keywords');
  }

  async getTasks() {
    return this.request('/portal/tasks');
  }

  async getTrends() {
    return this.request('/portal/trends');
  }

  async getProjects() {
    return this.request('/portal/projects');
  }

  async refreshData() {
    return Promise.all([
      this.getStats(),
      this.getKeywords(),
      this.getTasks(),
      this.getTrends()
    ]);
  }
}

export const apiClient = new ApiClient();
