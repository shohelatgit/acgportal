import { auth } from './auth.js';
import { apiClient } from './api-client.js';

class PortalDashboard {
  constructor() {
    this.currentPage = 'dashboard';
    this.charts = {};
    this.init();
  }

  async init() {
    if (!auth.isAuthenticated()) {
      auth.redirectToLogin();
      return;
    }

    if (!(await auth.verifySession())) {
      return;
    }

    this.initLucideIcons();
    this.initUserInterface();
    this.initNavigation();
    this.initEventListeners();

    await this.loadDashboard();
  }

  initLucideIcons() {
    lucide.createIcons();
  }

  initUserInterface() {
    const user = auth.getUser();
    if (user) {
      document.getElementById('clientName').textContent = user.name;
      document.getElementById('clientEmail').textContent = user.email;
      document.getElementById('clientAvatar').textContent = user.name.charAt(0).toUpperCase();
    }
  }

  initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        this.navigateTo(page);
      });
    });
  }

  initEventListeners() {
    document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      auth.logout();
    });

    document.getElementById('refreshBtn')?.addEventListener('click', () => {
      this.refreshData();
    });
  }

  async navigateTo(page) {
    this.currentPage = page;

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === page) {
        item.classList.add('active');
      }
    });

    await this.loadPage(page);
  }

  async loadPage(page) {
    const content = document.getElementById('dashboardContent');

    switch (page) {
      case 'dashboard':
        await this.loadDashboard();
        break;
      case 'keywords':
        await this.loadKeywordsPage();
        break;
      case 'tasks':
        await this.loadTasksPage();
        break;
      case 'overview':
        await this.loadOverviewPage();
        break;
      case 'trends':
        await this.loadTrendsPage();
        break;
      case 'settings':
        await this.loadSettingsPage();
        break;
      default:
        await this.loadDashboard();
    }
  }

  async loadDashboard() {
    const content = document.getElementById('dashboardContent');

    try {
      const [stats, tasks] = await Promise.all([
        apiClient.getStats(),
        apiClient.getTasks()
      ]);

      content.innerHTML = `
        <div class="content-header fade-in">
          <h1 class="content-title">Project Dashboard</h1>
          <p class="content-subtitle">Local Dominator SEO Package Performance</p>
        </div>

        ${this.renderStatsGrid(stats)}
        ${this.renderChartsSection()}
        ${this.renderTasksSection(tasks)}
      `;

      this.initCharts();
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      content.innerHTML = `
        <div class="content-header">
          <h1 class="content-title">Dashboard Error</h1>
          <p class="content-subtitle text-red-600">Failed to load dashboard data. Please try refreshing.</p>
        </div>
      `;
    }
  }

  renderStatsGrid(stats) {
    return `
      <div class="stats-grid fade-in">
        ${this.renderStatCard({
          title: 'Visibility Score',
          value: `${stats.visibilityScore}%`,
          change: '+12%',
          changeLabel: 'this month',
          positive: true,
          icon: 'eye',
          iconColor: 'blue'
        })}
        ${this.renderStatCard({
          title: 'Local Pack Rankings',
          value: stats.localPackRankings,
          change: '+2',
          changeLabel: 'positions',
          positive: true,
          icon: 'map-pin',
          iconColor: 'green'
        })}
        ${this.renderStatCard({
          title: 'Keywords Tracked',
          value: stats.keywordsTracked,
          change: '+15',
          changeLabel: 'new keywords',
          positive: true,
          icon: 'search',
          iconColor: 'yellow'
        })}
        ${this.renderStatCard({
          title: 'Review Rating',
          value: stats.reviewRating,
          change: '+0.2',
          changeLabel: 'this month',
          positive: true,
          icon: 'star',
          iconColor: 'purple'
        })}
        ${this.renderStatCard({
          title: 'Citations Built',
          value: stats.citationsBuilt,
          change: '+8',
          changeLabel: 'this week',
          positive: true,
          icon: 'link',
          iconColor: 'blue'
        })}
        ${this.renderStatCard({
          title: 'Tasks Pending',
          value: stats.tasksPending,
          change: '-3',
          changeLabel: 'completed',
          positive: true,
          icon: 'check-square',
          iconColor: 'green'
        })}
      </div>
    `;
  }

  renderStatCard(stat) {
    const iconMap = {
      'eye': 'eye',
      'map-pin': 'map-pin',
      'search': 'search',
      'star': 'star',
      'link': 'link',
      'check-square': 'check-square'
    };

    return `
      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-info">
            <h3>${stat.title}</h3>
            <div class="stat-value">${stat.value}</div>
            <div class="stat-change ${stat.positive ? 'positive' : 'negative'}">
              <svg data-lucide="${stat.positive ? 'arrow-up-right' : 'arrow-down-right'}" class="w-3 h-3"></svg>
              ${stat.change} ${stat.changeLabel}
            </div>
          </div>
          <div class="stat-icon ${stat.iconColor}">
            <svg data-lucide="${iconMap[stat.icon]}" class="w-6 h-6"></svg>
          </div>
        </div>
      </div>
    `;
  }

  renderChartsSection() {
    return `
      <div class="charts-grid fade-in">
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Keyword Rankings Trend</h3>
            <div class="chart-actions">
              <button class="chart-btn active">Last 30 Days</button>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="rankingsChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Visibility Progress</h3>
            <div class="chart-actions">
              <button class="chart-btn active">Weekly</button>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="visibilityChart"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  renderTasksSection(tasks) {
    const recentTasks = tasks.tasks.slice(0, 5);

    return `
      <div class="data-section fade-in">
        <div class="section-header">
          <h2 class="section-title">Recent Tasks</h2>
          <button class="btn btn-secondary" onclick="portal.navigateTo('tasks')">
            <svg data-lucide="arrow-right" class="w-4 h-4"></svg>
            View All
          </button>
        </div>
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${recentTasks.map(task => `
                <tr>
                  <td class="font-medium">${task.title}</td>
                  <td>
                    <span class="status-badge ${task.status.replace(' ', '-')}">
                      ${task.status === 'complete' ? '✓' : task.status === 'in-progress' ? '◐' : '○'}
                      ${task.status === 'complete' ? 'Complete' : task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                    </span>
                  </td>
                  <td><span class="priority-badge ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span></td>
                  <td>${new Date(task.dueDate).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  async loadKeywordsPage() {
    const content = document.getElementById('dashboardContent');

    try {
      const keywords = await apiClient.getKeywords();

      content.innerHTML = `
        <div class="content-header fade-in">
          <h1 class="content-title">Keyword Rankings</h1>
          <p class="content-subtitle">Track your local SEO keyword performance</p>
        </div>

        <div class="data-section fade-in">
          <div class="section-header">
            <h2 class="section-title">Local Keywords</h2>
            <div class="section-actions">
              <div class="search-input">
                <svg data-lucide="search" class="w-4 h-4 text-muted"></svg>
                <input type="text" placeholder="Search keywords..." id="keywordSearch">
              </div>
            </div>
          </div>
          <div class="data-table-container">
            <table class="data-table" id="keywordsTable">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Position</th>
                  <th>Change</th>
                  <th>Volume</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${keywords.keywords.map(keyword => `
                  <tr>
                    <td class="font-medium">${keyword.term}</td>
                    <td>${keyword.position}</td>
                    <td class="${keyword.change > 0 ? 'text-green-600' : keyword.change < 0 ? 'text-red-600' : ''}">
                      ${keyword.change > 0 ? '+' : ''}${keyword.change}
                    </td>
                    <td>${keyword.volume.toLocaleString()}</td>
                    <td>
                      <span class="status-badge ${keyword.position <= 10 ? 'complete' : keyword.position <= 20 ? 'in-progress' : 'pending'}">
                        ${keyword.position <= 10 ? 'Top 10' : keyword.position <= 20 ? 'Top 20' : 'Needs Work'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      this.initLucideIcons();

      const searchInput = document.getElementById('keywordSearch');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.filterKeywords(e.target.value);
        });
      }
    } catch (error) {
      console.error('Failed to load keywords:', error);
      content.innerHTML = `
        <div class="content-header">
          <h1 class="content-title">Keywords Error</h1>
          <p class="content-subtitle text-red-600">Failed to load keyword data.</p>
        </div>
      `;
    }
  }

  async loadTasksPage() {
    const content = document.getElementById('dashboardContent');

    try {
      const tasks = await apiClient.getTasks();

      content.innerHTML = `
        <div class="content-header fade-in">
          <h1 class="content-title">Task Manager</h1>
          <p class="content-subtitle">Track your SEO optimization tasks</p>
        </div>

        <div class="data-section fade-in">
          <div class="section-header">
            <h2 class="section-title">All Tasks</h2>
            <div class="section-actions">
              <div class="search-input">
                <svg data-lucide="search" class="w-4 h-4 text-muted"></svg>
                <input type="text" placeholder="Search tasks..." id="taskSearch">
              </div>
              <select class="btn btn-secondary" id="taskFilter">
                <option value="all">All Status</option>
                <option value="complete">Complete</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <div class="data-table-container">
            <table class="data-table" id="tasksTable">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                ${tasks.tasks.map(task => `
                  <tr>
                    <td class="font-medium">${task.title}</td>
                    <td>
                      <span class="status-badge ${task.status.replace(' ', '-')}">
                        ${task.status === 'complete' ? '✓' : task.status === 'in-progress' ? '◐' : '○'}
                        ${task.status === 'complete' ? 'Complete' : task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </td>
                    <td><span class="priority-badge ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span></td>
                    <td>${new Date(task.dueDate).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      this.initLucideIcons();

      const searchInput = document.getElementById('taskSearch');
      const filterSelect = document.getElementById('taskFilter');

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.filterTasks(e.target.value, filterSelect.value);
        });
      }

      if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
          this.filterTasks(searchInput.value, e.target.value);
        });
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      content.innerHTML = `
        <div class="content-header">
          <h1 class="content-title">Tasks Error</h1>
          <p class="content-subtitle text-red-600">Failed to load task data.</p>
        </div>
      `;
    }
  }

  async loadOverviewPage() {
    const content = document.getElementById('dashboardContent');

    content.innerHTML = `
      <div class="content-header fade-in">
        <h1 class="content-title">Project Overview</h1>
        <p class="content-subtitle">Local Dominator SEO Package Summary</p>
      </div>

      <div class="stats-grid fade-in">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-info">
              <h3>Project Start</h3>
              <div class="stat-value">Jan 2024</div>
            </div>
            <div class="stat-icon blue">
              <svg data-lucide="calendar" class="w-6 h-6"></svg>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-info">
              <h3>Keywords Optimized</h3>
              <div class="stat-value">24</div>
            </div>
            <div class="stat-icon green">
              <svg data-lucide="search" class="w-6 h-6"></svg>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-info">
              <h3>Citations Built</h3>
              <div class="stat-value">45</div>
            </div>
            <div class="stat-icon yellow">
              <svg data-lucide="link" class="w-6 h-6"></svg>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-info">
              <h3>Reviews Managed</h3>
              <div class="stat-value">127</div>
            </div>
            <div class="stat-icon purple">
              <svg data-lucide="star" class="w-6 h-6"></svg>
            </div>
          </div>
        </div>
      </div>

      <div class="data-section fade-in">
        <div class="section-header">
          <h2 class="section-title">Package Includes</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-2">Local SEO Optimization</h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Google Business Profile optimization</li>
              <li>• Local keyword research & optimization</li>
              <li>• Citation building & management</li>
              <li>• Local pack ranking improvement</li>
            </ul>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-2">Review Management</h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Review request campaigns</li>
              <li>• Response management</li>
              <li>• Reputation monitoring</li>
              <li>• Rating improvement strategies</li>
            </ul>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-2">Content & Links</h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Local content creation</li>
              <li>• Blog post optimization</li>
              <li>• Local link building</li>
              <li>• NAP consistency</li>
            </ul>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-2">Reporting & Analytics</h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Monthly performance reports</li>
              <li>• Keyword ranking tracking</li>
              <li>• Competitor analysis</li>
              <li>• ROI measurement</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    this.initLucideIcons();
  }

  async loadTrendsPage() {
    const content = document.getElementById('dashboardContent');

    try {
      const trends = await apiClient.getTrends();

      content.innerHTML = `
        <div class="content-header fade-in">
          <h1 class="content-title">Trends & Analytics</h1>
          <p class="content-subtitle">Track your SEO performance over time</p>
        </div>

        <div class="charts-grid fade-in">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Visibility Score Trend</h3>
            </div>
            <div class="chart-container">
              <canvas id="visibilityTrendChart"></canvas>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Ranking Performance</h3>
            </div>
            <div class="chart-container">
              <canvas id="rankingTrendChart"></canvas>
            </div>
          </div>
        </div>
      `;

      this.initTrendCharts(trends);
    } catch (error) {
      console.error('Failed to load trends:', error);
      content.innerHTML = `
        <div class="content-header">
          <h1 class="content-title">Trends Error</h1>
          <p class="content-subtitle text-red-600">Failed to load trend data.</p>
        </div>
      `;
    }
  }

  async loadSettingsPage() {
    const content = document.getElementById('dashboardContent');

    content.innerHTML = `
      <div class="content-header fade-in">
        <h1 class="content-title">Settings</h1>
        <p class="content-subtitle">Configure your SEO API connection</p>
      </div>

      <div class="data-section fade-in">
        <div class="section-header">
          <h2 class="section-title">API Configuration</h2>
        </div>
        <div class="p-6">
          <p class="text-gray-600 mb-4">
            Connect your SEO platform to get real-time data. Currently using mock data for demonstration.
          </p>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="font-semibold text-blue-900 mb-2">Coming Soon</h3>
            <p class="text-blue-800 text-sm">
              API integration setup will be available once you provide your platform credentials.
              Currently showing sample data to demonstrate the dashboard functionality.
            </p>
          </div>
        </div>
      </div>
    `;

    this.initLucideIcons();
  }

  initCharts() {
    this.initRankingsChart();
    this.initVisibilityChart();
  }

  initRankingsChart() {
    const ctx = document.getElementById('rankingsChart');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [{
          label: 'Average Position',
          data: [28, 24, 20, 16, 12, 8],
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#0ea5e9',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            reverse: true,
            title: {
              display: true,
              text: 'Position (lower is better)'
            }
          }
        }
      }
    });
  }

  initVisibilityChart() {
    const ctx = document.getElementById('visibilityChart');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [{
          label: 'Visibility Score',
          data: [45, 52, 58, 65, 72, 78],
          backgroundColor: '#10b981',
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Score (%)'
            }
          }
        }
      }
    });
  }

  initTrendCharts(trends) {
    this.initVisibilityTrendChart(trends);
    this.initRankingTrendChart(trends);
  }

  initVisibilityTrendChart(trends) {
    const ctx = document.getElementById('visibilityTrendChart');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: trends.labels,
        datasets: [{
          label: 'Visibility Score',
          data: trends.visibility,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: true,
          tension: 0.3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          }
        }
      }
    });
  }

  initRankingTrendChart(trends) {
    const ctx = document.getElementById('rankingTrendChart');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: trends.labels,
        datasets: [{
          label: 'Average Rankings',
          data: trends.rankings,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            reverse: true,
          }
        }
      }
    });
  }

  filterKeywords(searchTerm) {
    const rows = document.querySelectorAll('#keywordsTable tbody tr');
    const term = searchTerm.toLowerCase();

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(term) ? '' : 'none';
    });
  }

  filterTasks(searchTerm = '', statusFilter = 'all') {
    const rows = document.querySelectorAll('#tasksTable tbody tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const statusText = row.querySelector('.status-badge').textContent.toLowerCase().replace(/\s/g, '-');

      const matchesSearch = text.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || statusText.includes(statusFilter);

      row.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
  }

  async refreshData() {
    const refreshBtn = document.getElementById('refreshBtn');
    const originalText = refreshBtn.innerHTML;

    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<svg data-lucide="refresh-cw" class="w-4 h-4 animate-spin"></svg><span>Refreshing...</span>';

    try {
      await apiClient.refreshData();
      await this.loadPage(this.currentPage);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = originalText;
      this.initLucideIcons();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.portal = new PortalDashboard();
});
