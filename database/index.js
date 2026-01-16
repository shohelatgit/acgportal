import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'database', 'portal.sqlite');

let db = null;

export async function initDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      company_name TEXT,
      project_ids TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS api_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      platform_name TEXT NOT NULL,
      api_endpoint TEXT,
      api_key TEXT,
      refresh_interval INTEGER DEFAULT 3600,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      start_date DATETIME,
      end_date DATETIME,
      progress INTEGER DEFAULT 0,
      notes TEXT DEFAULT '[]',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  saveDatabase();

  await seedProjects();

  console.log('Database initialized successfully');
  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export function closeDatabase() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

export function createUser(email, password, name, companyName = null) {
  const db = getDatabase();
  
  const existing = db.exec('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0 && existing[0].values.length > 0) {
    throw new Error('User with this email already exists');
  }

  db.run(
    'INSERT INTO users (email, password_hash, name, company_name) VALUES (?, ?, ?, ?)',
    [email, password, name, companyName]
  );
  
  saveDatabase();
  return getUserByEmail(email);
}

export function getUserByEmail(email) {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);
  
  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const columns = result[0].columns;
  const values = result[0].values[0];
  
  return Object.fromEntries(columns.map((col, i) => [col, values[i]]));
}

export function getUserById(id) {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM users WHERE id = ?', [id]);
  
  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const columns = result[0].columns;
  const values = result[0].values[0];
  
  return Object.fromEntries(columns.map((col, i) => [col, values[i]]));
}

export function createSession(userId) {
  const db = getDatabase();
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  db.run(
    'INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, ?)',
    [sessionId, userId, expiresAt]
  );
  
  saveDatabase();
  return { sessionId, expiresAt };
}

export function getSession(sessionId) {
  const db = getDatabase();
  const result = db.exec(
    'SELECT * FROM sessions WHERE session_id = ? AND expires_at > datetime("now")',
    [sessionId]
  );
  
  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const columns = result[0].columns;
  const values = result[0].values[0];
  
  return Object.fromEntries(columns.map((col, i) => [col, values[i]]));
}

export function deleteSession(sessionId) {
  const db = getDatabase();
  db.run('DELETE FROM sessions WHERE session_id = ?', [sessionId]);
  saveDatabase();
}

export function updateUserPassword(userId, newPasswordHash) {
  const db = getDatabase();
  db.run(
    'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [newPasswordHash, userId]
  );
  saveDatabase();
}

export function getApiConfigs(userId) {
  const db = getDatabase();
  const result = db.exec(
    'SELECT * FROM api_configs WHERE user_id = ? AND is_active = 1',
    [userId]
  );
  
  if (result.length === 0 || result[0].values.length === 0) {
    return [];
  }

  const columns = result[0].columns;
  return result[0].values.map(row => Object.fromEntries(columns.map((col, i) => [col, row[i]])));
}

export function saveApiConfig(userId, config) {
  const db = getDatabase();
  
  db.run(
    `INSERT OR REPLACE INTO api_configs 
     (id, user_id, platform_name, api_endpoint, api_key, refresh_interval, is_active, updated_at)
     VALUES (
       COALESCE((SELECT id FROM api_configs WHERE user_id = ? AND platform_name = ?), NULL),
       ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP
    )`,
    [userId, config.platformName, userId, config.platformName, config.apiEndpoint, config.apiKey, config.refreshInterval || 3600]
  );
  
  saveDatabase();
}

export function createProject(name, type, description = null, startDate = null, endDate = null) {
  const db = getDatabase();

  db.run(
    'INSERT INTO projects (name, type, description, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
    [name, type, description, startDate, endDate]
  );

  saveDatabase();
  return getProjectById(db.exec('SELECT last_insert_rowid() as id').pop().values[0][0]);
}

export function getProjectById(id) {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM projects WHERE id = ?', [id]);

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const columns = result[0].columns;
  const values = result[0].values[0];

  const project = Object.fromEntries(columns.map((col, i) => [col, values[i]]));
  project.notes = JSON.parse(project.notes || '[]');
  return project;
}

export function getAllProjects() {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM projects ORDER BY created_at DESC');

  if (result.length === 0 || result[0].values.length === 0) {
    return [];
  }

  const columns = result[0].columns;
  return result[0].values.map(row => {
    const project = Object.fromEntries(columns.map((col, i) => [col, row[i]]));
    project.notes = JSON.parse(project.notes || '[]');
    return project;
  });
}

export function getProjectsByIds(ids) {
  if (!ids || ids.length === 0) return [];

  const db = getDatabase();
  const placeholders = ids.map(() => '?').join(',');
  const result = db.exec(`SELECT * FROM projects WHERE id IN (${placeholders}) ORDER BY created_at DESC`, ids);

  if (result.length === 0 || result[0].values.length === 0) {
    return [];
  }

  const columns = result[0].columns;
  return result[0].values.map(row => {
    const project = Object.fromEntries(columns.map((col, i) => [col, row[i]]));
    project.notes = JSON.parse(project.notes || '[]');
    return project;
  });
}

export function updateProjectProgress(projectId, progress) {
  const db = getDatabase();
  db.run(
    'UPDATE projects SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [Math.min(100, Math.max(0, progress)), projectId]
  );
  saveDatabase();
}

export function addProjectNote(projectId, note) {
  const db = getDatabase();
  const project = getProjectById(projectId);
  if (!project) return false;

  const notes = project.notes || [];
  notes.push({
    date: new Date().toISOString(),
    note: note
  });

  db.run(
    'UPDATE projects SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [JSON.stringify(notes), projectId]
  );
  saveDatabase();
  return true;
}

export async function seedProjects() {
  const projects = [
    { name: 'Local Dominator', type: 'SEO Package', description: 'Local SEO optimization package' },
    { name: 'Market Research Project', type: 'Market Research', description: 'Comprehensive market research and analysis' },
    { name: 'Pitch Deck/Fundraising Deck', type: 'Fundraising Deck', description: 'Professional pitch deck for fundraising' },
    { name: 'GTM Strategy Project', type: 'GTM Strategy', description: 'Go-to-market strategy development' }
  ];

  for (const proj of projects) {
    try {
      createProject(proj.name, proj.type, proj.description);
      console.log(`Project created: ${proj.name}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`Project already exists: ${proj.name}`);
      } else {
        console.error(`Error creating project ${proj.name}:`, error);
      }
    }
  }
}

export async function seedDemoUser() {
  const bcrypt = await import('bcrypt');
  const passwordHash = await bcrypt.hash('demo123', 10);

  try {
    const user = createUser('demo@acg.com', passwordHash, 'Demo Client', 'Local Dominator Client');

    // Assign all projects to demo user
    const allProjects = getAllProjects();
    const projectIds = allProjects.map(p => p.id);
    db.run(
      'UPDATE users SET project_ids = ? WHERE id = ?',
      [JSON.stringify(projectIds), user.id]
    );
    saveDatabase();

    console.log('Demo user created:', user.email);
    console.log('Login credentials: demo@acg.com / demo123');
    return user;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Demo user already exists');
      return getUserByEmail('demo@acg.com');
    }
    throw error;
  }
}
