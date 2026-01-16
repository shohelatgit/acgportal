class AdminAPI {
  static async request(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/auth/login.html';
      return;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login.html';
      return;
    }

    return response;
  }

  static async getProjects() {
    const response = await this.request('/api/admin/projects');
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  }

  static async updateProgress(projectId, progress) {
    const response = await this.request(`/api/admin/projects/${projectId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ progress })
    });
    if (!response.ok) throw new Error('Failed to update progress');
    return response.json();
  }

  static async addNote(projectId, note) {
    const response = await this.request(`/api/admin/projects/${projectId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note })
    });
    if (!response.ok) throw new Error('Failed to add note');
    return response.json();
  }
}

class AdminApp {
  constructor() {
    this.projects = [];
    this.init();
  }

  async init() {
    try {
      await this.checkAuth();
      await this.loadProjects();
      this.setupEventListeners();
    } catch (error) {
      console.error('Admin init error:', error);
      alert('Access denied or error loading admin panel');
      window.location.href = '/auth/login.html';
    }
  }

  async checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/auth/login.html';
      return;
    }

    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login.html';
      return;
    }

    const data = await response.json();
    document.getElementById('adminUser').textContent = `Logged in as: ${data.user.email}`;
  }

  async loadProjects() {
    try {
      const data = await AdminAPI.getProjects();
      this.projects = data.projects;
      this.renderProjects();
    } catch (error) {
      console.error('Error loading projects:', error);
      alert('Failed to load projects');
    }
  }

  renderProjects() {
    const container = document.getElementById('projectsList');
    container.innerHTML = this.projects.map(project => this.renderProjectCard(project)).join('');
  }

  renderProjectCard(project) {
    const hasProgress = ['Market Research', 'GTM Strategy', 'Fundraising Deck'].includes(project.type);

    return `
      <div class="border border-gray-200 rounded-lg p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-medium text-gray-900">${project.name}</h3>
            <p class="text-sm text-gray-600">${project.type}</p>
            <p class="text-sm text-gray-500 mt-1">Status: ${project.status}</p>
            ${project.description ? `<p class="text-sm text-gray-700 mt-2">${project.description}</p>` : ''}
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">Assigned to:</p>
            <p class="text-sm font-medium">${project.assignedUsers.join(', ') || 'None'}</p>
          </div>
        </div>

        ${hasProgress ? `
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Progress: ${project.progress}%</label>
            <div class="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="100"
                value="${project.progress}"
                class="flex-1"
                onchange="adminApp.updateProjectProgress(${project.id}, this.value)"
              >
              <input
                type="number"
                min="0"
                max="100"
                value="${project.progress}"
                class="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                onchange="adminApp.updateProjectProgress(${project.id}, this.value)"
              >
            </div>
          </div>
        ` : ''}

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Add Weekly Update</label>
          <div class="flex space-x-2">
            <input
              type="text"
              placeholder="Enter update note..."
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              id="noteInput-${project.id}"
            >
            <button
              onclick="adminApp.addProjectNote(${project.id})"
              class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Add Note
            </button>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">Recent Updates</h4>
          <div class="space-y-2 max-h-32 overflow-y-auto">
            ${project.notes.slice(-3).reverse().map(note => `
              <div class="bg-gray-50 p-3 rounded text-sm">
                <p class="text-gray-800">${note.note}</p>
                <p class="text-gray-500 text-xs mt-1">${new Date(note.date).toLocaleDateString()}</p>
              </div>
            `).join('') || '<p class="text-gray-500 text-sm">No updates yet</p>'}
          </div>
        </div>
      </div>
    `;
  }

  async updateProjectProgress(projectId, progress) {
    try {
      await AdminAPI.updateProgress(projectId, parseInt(progress));
      await this.loadProjects(); // Refresh
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Failed to update progress');
    }
  }

  async addProjectNote(projectId) {
    const input = document.getElementById(`noteInput-${projectId}`);
    const note = input.value.trim();
    if (!note) return;

    try {
      await AdminAPI.addNote(projectId, note);
      input.value = '';
      await this.loadProjects(); // Refresh
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    }
  }

  setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login.html';
    });
  }
}

const adminApp = new AdminApp();