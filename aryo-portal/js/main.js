import { 
  getProjectData, 
  getProjectProgress, 
  getBudgetStats, 
  getTaskStats 
} from './data/mock-project-data.js';

class AryoPortal {
  constructor() {
    this.projectData = getProjectData();
    this.charts = {};
    this.currentPage = 'dashboard';
    
    this.init();
  }
  
  async init() {
    this.initLucideIcons();
    this.initNavigation();
    this.initSidebarToggle();
    await this.renderDashboard();
  }
  
  initLucideIcons() {
    lucide.createIcons();
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
  
  initSidebarToggle() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (toggle && sidebar) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }
  }
  
  navigateTo(page) {
    this.currentPage = page;
    
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === page) {
        item.classList.add('active');
      }
    });
    
    this.renderDashboard();
  }
  
  async renderDashboard() {
    const content = document.getElementById('dashboard-content');
    
    content.innerHTML = `
      <div class="content-header fade-in">
        <h1 class="content-title">Project Dashboard</h1>
        <p class="content-subtitle">Overview of your landscape renovation project</p>
      </div>
      
      ${this.renderStatsGrid()}
      ${this.renderChartsSection()}
      ${this.renderMaterialsSection()}
      ${this.renderTasksSection()}
    `;
    
    this.initCharts();
    this.initMaterialsGrid();
    this.initTasksTable();
    this.initLucideIcons();
  }
  
  renderStatsGrid() {
    const progress = getProjectProgress();
    const budget = getBudgetStats();
    const tasks = getTaskStats();
    
    const daysRemaining = Math.ceil((new Date('2026-03-01') - new Date()) / (1000 * 60 * 60 * 24));
    
    return `
      <div class="stats-grid fade-in">
        ${this.renderStatCard({
          title: 'Project Progress',
          value: `${progress}%`,
          change: '+12%',
          changeLabel: 'this week',
          positive: true,
          icon: 'trending-up',
          iconColor: 'blue',
          progress: progress,
          progressColor: 'blue'
        })}
        
        ${this.renderStatCard({
          title: 'Budget Used',
          value: `$${(budget.totalSpent / 1000).toFixed(1)}K`,
          change: `$${((budget.totalBudget - budget.remaining) / 1000).toFixed(1)}K`,
          changeLabel: `of $${(budget.totalBudget / 1000).toFixed(0)}K budget`,
          positive: true,
          icon: 'dollar-sign',
          iconColor: 'green',
          progress: budget.percentUsed,
          progressColor: 'green'
        })}
        
        ${this.renderStatCard({
          title: 'Tasks Remaining',
          value: `${tasks.pending}`,
          change: `${tasks.thisWeek}`,
          changeLabel: 'due this week',
          positive: false,
          icon: 'check-square',
          iconColor: 'yellow',
          progress: Math.round((tasks.completed / tasks.total) * 100),
          progressColor: 'yellow'
        })}
        
        ${this.renderStatCard({
          title: 'Days Remaining',
          value: daysRemaining,
          change: 'Est. Mar 1',
          changeLabel: 'completion date',
          positive: true,
          icon: 'calendar',
          iconColor: 'purple',
          progress: Math.round((1 - (daysRemaining / 60)) * 100),
          progressColor: 'purple'
        })}
      </div>
    `;
  }
  
  renderStatCard(stat) {
    const iconMap = {
      'trending-up': 'trending-up',
      'dollar-sign': 'dollar-sign',
      'check-square': 'check-square',
      'calendar': 'calendar'
    };
    
    return `
      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-info">
            <h3>${stat.title}</h3>
            <div class="stat-value">${stat.value}</div>
            <div class="stat-change ${stat.positive ? 'positive' : 'negative'}">
              <i data-lucide="${stat.positive ? 'arrow-up-right' : 'arrow-down-right'}" class="w-3 h-3"></i>
              ${stat.change} ${stat.changeLabel}
            </div>
          </div>
          <div class="stat-icon ${stat.iconColor}">
            <i data-lucide="${iconMap[stat.icon]}" class="w-6 h-6"></i>
          </div>
        </div>
        <div class="stat-progress">
          <div class="stat-progress-bar">
            <div class="stat-progress-fill ${stat.progressColor}" style="width: ${stat.progress}%"></div>
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
            <h3 class="chart-title">Project Phases</h3>
            <div class="chart-actions">
              <button class="chart-btn active">Progress</button>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="progressChart"></canvas>
          </div>
        </div>
        
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Timeline Overview</h3>
            <div class="chart-actions">
              <button class="chart-btn active">8 Weeks</button>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="timelineChart"></canvas>
          </div>
        </div>
      </div>
    `;
  }
  
  renderMaterialsSection() {
    return `
      <div class="data-section fade-in">
        <div class="section-header">
          <h2 class="section-title">Materials & Deliveries</h2>
          <div class="section-actions">
            <div class="search-input">
              <i data-lucide="search" class="w-4 h-4 text-muted"></i>
              <input type="text" placeholder="Search materials..." id="materials-search">
            </div>
            <button class="btn btn-secondary" id="export-materials">
              <i data-lucide="download" class="w-4 h-4"></i>
              Export
            </button>
          </div>
        </div>
        <div class="data-table-container">
          <div id="materials-grid"></div>
        </div>
      </div>
    `;
  }
  
  renderTasksSection() {
    return `
      <div class="data-section fade-in">
        <div class="section-header">
          <h2 class="section-title">Task Tracker</h2>
          <div class="section-actions">
            <div class="search-input">
              <i data-lucide="search" class="w-4 h-4 text-muted"></i>
              <input type="text" placeholder="Search tasks..." id="tasks-search">
            </div>
            <select class="btn btn-secondary" id="task-filter">
              <option value="all">All Status</option>
              <option value="complete">Complete</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        <div class="data-table-container">
          <table class="data-table" id="tasks-table">
            <thead>
              <tr>
                <th data-sort="name">Task Name</th>
                <th data-sort="category">Category</th>
                <th data-sort="status">Status</th>
                <th data-sort="priority">Priority</th>
                <th data-sort="assignee">Assignee</th>
                <th data-sort="dueDate">Due Date</th>
                <th data-sort="progress">Progress</th>
              </tr>
            </thead>
            <tbody id="tasks-tbody">
              <!-- Tasks will be rendered here -->
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
  
  initCharts() {
    this.initProgressChart();
    this.initTimelineChart();
  }
  
  initProgressChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    const phases = this.projectData.phases;
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: phases.map(p => p.name),
        datasets: [{
          label: 'Completed',
          data: phases.map(p => p.status === 'complete' ? 100 : p.progress),
          backgroundColor: '#10b981',
          borderRadius: 4,
          borderSkipped: false,
        }, {
          label: 'Remaining',
          data: phases.map(p => p.status === 'complete' ? 0 : 100 - p.progress),
          backgroundColor: '#e2e8f0',
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const phase = phases[context.dataIndex];
                return `${context.dataset.label}: ${phase.progress}%`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            max: 100,
            grid: { display: false },
            ticks: {
              callback: (value) => `${value}%`,
              font: { size: 11 }
            }
          },
          y: {
            stacked: true,
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }
  
  initTimelineChart() {
    const ctx = document.getElementById('timelineChart');
    if (!ctx) return;
    
    const timeline = this.projectData.timeline;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: timeline.map(t => t.week),
        datasets: [{
          label: 'Planned',
          data: timeline.map(t => t.planned),
          borderColor: '#94a3b8',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#94a3b8',
        }, {
          label: 'Actual',
          data: timeline.map(t => t.actual),
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: true,
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
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              afterBody: (context) => {
                const week = timeline[context[0].dataIndex];
                return week.milestone ? `\nMilestone: ${week.milestone}` : '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: (value) => `${value}%`,
              font: { size: 11 }
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }
  
  initMaterialsGrid() {
    const materials = this.projectData.materials;
    
    const grid = new GridJS({
      element: document.getElementById('materials-grid'),
      columns: [
        { id: 'item', name: 'Item / Material', width: '28%' },
        { id: 'quantity', name: 'Quantity', width: '12%' },
        { 
          id: 'unitPrice', 
          name: 'Unit Price', 
          width: '12%',
          formatter: (cell) => `$${cell.toFixed(2)}`
        },
        { 
          id: 'total', 
          name: 'Total', 
          width: '12%',
          formatter: (cell) => `$${cell.toLocaleString()}`
        },
        { 
          id: 'status', 
          name: 'Status', 
          width: '15%',
          formatter: (cell) => {
            const statusColors = {
              'delivered': 'bg-green-100 text-green-800',
              'in-transit': 'bg-blue-100 text-blue-800',
              'ordered': 'bg-yellow-100 text-yellow-800',
              'pending': 'bg-gray-100 text-gray-800',
              'design': 'bg-purple-100 text-purple-800',
            };
            const classes = statusColors[cell] || 'bg-gray-100 text-gray-800';
            const labels = {
              'delivered': 'Delivered',
              'in-transit': 'In Transit',
              'ordered': 'Ordered',
              'pending': 'Pending',
              'design': 'Design'
            };
            return `<span class="px-2 py-1 rounded-full text-xs font-medium ${classes}">${labels[cell] || cell}</span>`;
          }
        },
        { id: 'deliveryDate', name: 'Expected Delivery', width: '15%' },
      ],
      data: materials.map(m => ({
        ...m,
        deliveryDate: m.deliveryDate ? new Date(m.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'
      })),
      search: {
        enabled: true,
        placeholder: 'Search materials...',
      },
      sort: {
        enabled: true,
      },
      pagination: {
        enabled: true,
        limit: 10,
      },
      style: {
        table: {
          'border-collapse': 'collapse',
          'width': '100%',
        },
        th: {
          'text-align': 'left',
          'padding': '12px 16px',
          'border-bottom': '2px solid #e2e8f0',
          'font-weight': '600',
          'color': '#1e293b',
          'font-size': '0.75rem',
          'text-transform': 'uppercase',
          'letter-spacing': '0.05em',
          'background': '#f8fafc',
        },
        td: {
          'padding': '12px 16px',
          'border-bottom': '1px solid #e2e8f0',
          'color': '#475569',
          'font-size': '0.875rem',
        },
        container: {
          'border': 'none',
          'border-radius': '0',
        }
      }
    });
    
    grid.render(document.getElementById('materials-grid'));
    
    document.getElementById('export-materials')?.addEventListener('click', () => {
      this.exportMaterialsCSV();
    });
  }
  
  initTasksTable() {
    const tasks = this.projectData.tasks;
    const tbody = document.getElementById('tasks-tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = tasks.map(task => `
      <tr>
        <td class="font-medium">${task.name}</td>
        <td><span class="status-badge" style="background: #f1f5f9; color: #475569;">${task.category}</span></td>
        <td>
          <span class="status-badge ${task.status}">
            ${task.status === 'complete' ? '✓' : task.status === 'in-progress' ? '◐' : '○'}
            ${task.status === 'complete' ? 'Complete' : task.status === 'in-progress' ? 'In Progress' : 'Pending'}
          </span>
        </td>
        <td><span class="priority-badge ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span></td>
        <td>${task.assignee}</td>
        <td class="${this.isOverdue(task.dueDate) ? 'text-red-500 font-medium' : this.isDueThisWeek(task.dueDate) ? 'text-amber-500 font-medium' : ''}">
          ${new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </td>
        <td>
          <div class="task-progress">
            <div class="task-progress-bar">
              <div class="task-progress-fill" style="width: ${task.progress}%"></div>
            </div>
            <span class="task-progress-text">${task.progress}%</span>
          </div>
        </td>
      </tr>
    `).join('');
    
    document.getElementById('tasks-search')?.addEventListener('input', (e) => {
      this.filterTasks(e.target.value);
    });
    
    document.getElementById('task-filter')?.addEventListener('change', (e) => {
      this.filterTasksByStatus(e.target.value);
    });
  }
  
  isOverdue(dateStr) {
    const due = new Date(dateStr);
    const today = new Date();
    return due < today && this.projectData.tasks.find(t => t.dueDate === dateStr)?.status !== 'complete';
  }
  
  isDueThisWeek(dateStr) {
    const due = new Date(dateStr);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return due >= today && due <= weekFromNow;
  }
  
  filterTasks(searchTerm) {
    const rows = document.querySelectorAll('#tasks-tbody tr');
    const term = searchTerm.toLowerCase();
    
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(term) ? '' : 'none';
    });
  }
  
  filterTasksByStatus(status) {
    const rows = document.querySelectorAll('#tasks-tbody tr');
    
    rows.forEach(row => {
      if (status === 'all') {
        row.style.display = '';
      } else {
        const statusText = row.querySelector('.status-badge').textContent.toLowerCase().replace(/\s/g, '-');
        row.style.display = statusText.includes(status) ? '' : 'none';
      }
    });
  }
  
  exportMaterialsCSV() {
    const materials = this.projectData.materials;
    const headers = ['Item', 'Quantity', 'Unit Price', 'Total', 'Status', 'Delivery Date'];
    const rows = materials.map(m => [
      m.item,
      m.quantity,
      `$${m.unitPrice.toFixed(2)}`,
      `$${m.total.toLocaleString()}`,
      m.status,
      m.deliveryDate || 'TBD'
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-materials.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AryoPortal();
});
