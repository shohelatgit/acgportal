export const mockProjectData = {
  project: {
    id: 'PRJ-2026-001',
    name: 'Modern Backyard Oasis',
    client: {
      name: 'Johnson Family',
      email: 'johnson@example.com',
      phone: '(555) 123-4567',
      address: '1234 Maple Drive, Arlington, VA 22209',
    },
    details: {
      startDate: '2026-01-06',
      estimatedCompletion: '2026-03-01',
      totalBudget: 68000,
      spentAmount: 45200,
      squareFootage: 2400,
      projectType: 'Full Landscape Renovation',
    },
  },
  
  phases: [
    { id: 1, name: 'Site Preparation', progress: 100, status: 'complete' },
    { id: 2, name: 'Foundation', progress: 100, status: 'complete' },
    { id: 3, name: 'Framing', progress: 75, status: 'in-progress' },
    { id: 4, name: 'Electrical', progress: 40, status: 'in-progress' },
    { id: 5, name: 'Plumbing', progress: 30, status: 'in-progress' },
    { id: 6, name: 'Finishing', progress: 10, status: 'in-progress' },
  ],
  
  budget: {
    total: 68000,
    allocated: {
      materials: 35000,
      labor: 22000,
      equipment: 5000,
      permits: 2000,
      contingency: 4000,
    },
    spent: {
      materials: 24500,
      labor: 16500,
      equipment: 3500,
      permits: 2000,
      contingency: 0,
    },
    transactions: [
      { date: '2026-01-06', description: 'Initial Deposit - Team Alpha', amount: -8500, category: 'labor' },
      { date: '2026-01-08', description: 'Premium Teak Decking Deposit', amount: -6400, category: 'materials' },
      { date: '2026-01-10', description: 'Foundation Materials', amount: -4200, category: 'materials' },
      { date: '2026-01-12', description: 'Permit Fees - Arlington County', amount: -2000, category: 'permits' },
      { date: '2026-01-15', description: 'Equipment Rental - Week 1-2', amount: -1800, category: 'equipment' },
      { date: '2026-01-20', description: 'Framing Labor - Week 2', amount: -5500, category: 'labor' },
    ],
  },
  
  materials: [
    { id: 1, item: 'Premium Teak Decking', quantity: '450 sq ft', unitPrice: 28.50, total: 12825, status: 'delivered', supplier: 'Virginia Deck Co', orderDate: '2026-01-05', deliveryDate: '2026-01-08' },
    { id: 2, item: 'LED Landscape Lighting Kit', quantity: '12 units', unitPrice: 245.00, total: 2940, status: 'in-transit', supplier: 'Lighting Direct', orderDate: '2026-01-10', deliveryDate: '2026-01-18' },
    { id: 3, item: 'Natural Stone Pavers', quantity: '800 sq ft', unitPrice: 12.75, total: 10200, status: 'ordered', supplier: 'Stone Mart', orderDate: '2026-01-12', deliveryDate: '2026-01-25' },
    { id: 4, item: 'Ipe Wood Pergola Materials', quantity: '1 unit', unitPrice: 4200.00, total: 4200, status: 'design', supplier: 'Custom Woodworks', orderDate: null, deliveryDate: '2026-02-10' },
    { id: 5, item: 'Fire Pit Assembly Kit', quantity: '1 unit', unitPrice: 3200.00, total: 3200, status: 'pending', supplier: 'Outdoor Living Inc', orderDate: null, deliveryDate: '2026-02-01' },
    { id: 6, item: 'Outdoor Kitchen Countertop', quantity: '1 unit', unitPrice: 1850.00, total: 1850, status: 'pending', supplier: 'Stone World', orderDate: null, deliveryDate: '2026-02-08' },
    { id: 7, item: 'Drip Irrigation System', quantity: '1 kit', unitPrice: 890.00, total: 890, status: 'delivered', supplier: 'Irrigation Pro', orderDate: '2026-01-08', deliveryDate: '2026-01-15' },
    { id: 8, item: 'Native Plants Package', quantity: '45 units', unitPrice: 65.00, total: 2925, status: 'ordered', supplier: 'Green Thumb Nursery', orderDate: '2026-01-18', deliveryDate: '2026-02-01' },
  ],
  
  tasks: [
    { id: 1, name: 'Site Survey & Staking', category: 'Site Work', status: 'complete', priority: 'high', assignee: 'Team Alpha', dueDate: '2026-01-06', progress: 100 },
    { id: 2, name: 'Excavation', category: 'Site Work', status: 'complete', priority: 'high', assignee: 'Team Alpha', dueDate: '2026-01-08', progress: 100 },
    { id: 3, name: 'Foundation Pour', category: 'Site Work', status: 'complete', priority: 'high', assignee: 'Team Beta', dueDate: '2026-01-15', progress: 100 },
    { id: 4, name: 'Deck Frame Installation', category: 'Construction', status: 'in-progress', priority: 'high', assignee: 'Team Alpha', dueDate: '2026-01-25', progress: 65 },
    { id: 5, name: 'Electrical Rough-In', category: 'Electrical', status: 'in-progress', priority: 'high', assignee: 'Team Gamma', dueDate: '2026-01-28', progress: 40 },
    { id: 6, name: 'Plumbing for Outdoor Kitchen', category: 'Plumbing', status: 'in-progress', priority: 'medium', assignee: 'Team Beta', dueDate: '2026-02-01', progress: 30 },
    { id: 7, name: 'Paver Installation', category: 'Construction', status: 'pending', priority: 'medium', assignee: 'Team Alpha', dueDate: '2026-02-10', progress: 0 },
    { id: 8, name: 'Lighting Installation', category: 'Electrical', status: 'pending', priority: 'medium', assignee: 'Team Gamma', dueDate: '2026-02-15', progress: 0 },
    { id: 9, name: 'Pergola Assembly', category: 'Construction', status: 'pending', priority: 'low', assignee: 'Team Alpha', dueDate: '2026-02-20', progress: 0 },
    { id: 10, name: 'Final Inspection', category: 'General', status: 'pending', priority: 'high', assignee: 'Project Manager', dueDate: '2026-02-28', progress: 0 },
  ],
  
  timeline: [
    { week: 'Week 1', planned: 5, actual: 5, milestone: 'Site Prep Complete' },
    { week: 'Week 2', planned: 12, actual: 14, milestone: null },
    { week: 'Week 3', planned: 20, actual: 22, milestone: 'Foundation Complete' },
    { week: 'Week 4', planned: 30, actual: 28, milestone: null },
    { week: 'Week 5', planned: 42, actual: 38, milestone: null },
    { week: 'Week 6', planned: 55, actual: null, milestone: 'Framing Complete' },
    { week: 'Week 7', planned: 68, actual: null, milestone: null },
    { week: 'Week 8', planned: 80, actual: null, milestone: null },
  ],
  
  documents: [
    { id: 1, name: 'Project Contract', type: 'contract', uploadedAt: '2026-01-01', size: '2.4 MB' },
    { id: 2, name: 'Site Survey', type: 'document', uploadedAt: '2026-01-05', size: '8.1 MB' },
    { id: 3, name: 'Design Plans v2', type: 'blueprint', uploadedAt: '2026-01-10', size: '15.2 MB' },
    { id: 4, name: 'Material Specifications', type: 'document', uploadedAt: '2026-01-12', size: '1.8 MB' },
    { id: 5, name: 'Permit Approval', type: 'permit', uploadedAt: '2026-01-14', size: '520 KB' },
  ],
};

export function getProjectData() {
  return mockProjectData;
}

export function getClientName() {
  return mockProjectData.project.client.name;
}

export function getProjectProgress() {
  const totalPhases = mockProjectData.phases.length;
  const completedPhases = mockProjectData.phases.filter(p => p.status === 'complete').length;
  const inProgressPhases = mockProjectData.phases.filter(p => p.status === 'in-progress');
  
  const avgProgress = inProgressPhases.length > 0
    ? inProgressPhases.reduce((sum, p) => sum + p.progress, 0) / inProgressPhases.length
    : 0;
  
  return Math.round(((completedPhases * 100) + avgProgress) / totalPhases);
}

export function getBudgetStats() {
  const data = mockProjectData;
  const totalSpent = Object.values(data.budget.spent).reduce((sum, val) => sum + val, 0);
  const totalBudget = data.project.details.totalBudget;
  const percentUsed = Math.round((totalSpent / totalBudget) * 100);
  
  return {
    totalBudget,
    totalSpent,
    percentUsed,
    remaining: totalBudget - totalSpent
  };
}

export function getTaskStats() {
  const tasks = mockProjectData.tasks;
  const completed = tasks.filter(t => t.status === 'complete').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const total = tasks.length;
  
  const today = new Date();
  const thisWeek = tasks.filter(t => {
    const dueDate = new Date(t.dueDate);
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= today && dueDate <= weekFromNow && t.status !== 'complete';
  }).length;
  
  return { completed, inProgress, pending, total, thisWeek };
}
