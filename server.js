import express from 'express';
import session from 'express-session';
import { Resend } from 'resend';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import {
  initDatabase,
  getDatabase,
  createUser,
  getUserByEmail,
  getUserById,
  createSession,
  getSession,
  deleteSession,
  seedDemoUser,
  getApiConfigs
} from './database/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'acg-portal-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7);
  const dbSession = getSession(token);
  
  if (!dbSession) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  const user = getUserById(dbSession.user_id);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  
  req.user = user;
  req.sessionToken = token;
  next();
}

async function getResendClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  const response = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  );
  
  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error('Resend not connected');
  }
  
  return {
    client: new Resend(connectionSettings.settings.api_key),
    fromEmail: connectionSettings.settings.from_email
  };
}

app.post('/api/contact', async (req, res) => {
  try {
    const { 
      name, email, phone, address, 
      services, budget, timeline, description 
    } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ error: 'Email and phone are required' });
    }

    const { client, fromEmail } = await getResendClient();

    const serviceList = Array.isArray(services) ? services.join(', ') : (services || 'Not specified');
    const budgetRange = budget || 'Not specified';
    const projectTimeline = timeline || 'Not specified';
    const projectAddress = address || 'Not provided';
    const projectDescription = description || 'No description provided';

    const emailContent = `
New Quote Request from xScapes Website:

CONTACT INFORMATION
Name: ${name || 'Not provided'}
Email: ${email}
Phone: ${phone}
Address: ${projectAddress}

PROJECT DETAILS
Services Interested In: ${serviceList}
Budget Range: ${budgetRange}
Timeline: ${projectTimeline}

PROJECT DESCRIPTION:
${projectDescription}

---
This lead was submitted through the xScapes (NoVA Landscape Architecture) website quote request form.
    `.trim();

    const htmlContent = `
<h2 style="color: #1e293b; margin-bottom: 20px;">New Quote Request from xScapes</h2>

<div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
  <h3 style="color: #0f172a; margin-bottom: 12px; font-size: 16px;">Contact Information</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">Name:</td>
      <td style="padding: 8px 0; color: #1e293b;">${name || 'Not provided'}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email:</td>
      <td style="padding: 8px 0; color: #1e293b;"><a href="mailto:${email}" style="color: #558b6e;">${email}</a></td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; color: #475569;">Phone:</td>
      <td style="padding: 8px 0; color: #1e293b;"><a href="tel:${phone}" style="color: #1e293b;">${phone}</a></td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; color: #475569;">Address:</td>
      <td style="padding: 8px 0; color: #1e293b;">${projectAddress}</td>
    </tr>
  </table>
</div>

<div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
  <h3 style="color: #0f172a; margin-bottom: 12px; font-size: 16px;">Project Details</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 0; font-weight: bold; color: #475569;">Services:</td>
      <td style="padding: 12px 0; color: #1e293b;">${serviceList}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 0; font-weight: bold; color: #475569;">Budget:</td>
      <td style="padding: 12px 0; color: #1e293b;">${budgetRange}</td>
    </tr>
    <tr>
      <td style="padding: 12px 0; font-weight: bold; color: #475569;">Timeline:</td>
      <td style="padding: 12px 0; color: #1e293b;">${projectTimeline}</td>
    </tr>
  </table>
</div>

<div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
  <h3 style="color: #0f172a; margin-bottom: 12px; font-size: 16px;">Project Description</h3>
  <p style="color: #1e293b; line-height: 1.6; margin: 0;">${projectDescription}</p>
</div>

<hr style="margin-top: 24px; border: none; border-top: 1px solid #e2e8f0;">
<p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">This lead was submitted through the xScapes (NoVA Landscape Architecture) website quote request form.</p>
    `.trim();

    await client.emails.send({
      from: fromEmail,
      to: ['info@xscapesnova.com'],
      subject: 'New xScapes Quote Request',
      text: emailContent,
      html: htmlContent
    });

    res.json({ success: true, message: 'Your quote request has been sent successfully! We\'ll be in touch within 24 hours.' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send request. Please try again or call us directly.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, companyName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = createUser(email, passwordHash, name, companyName);

    res.json({ success: true, message: 'Registration successful', user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const sessionData = createSession(user.id);

    res.json({
      success: true,
      token: sessionData.sessionId,
      expiresAt: sessionData.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyName: user.company_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    deleteSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      companyName: req.user.company_name
    }
  });
});

app.get('/api/portal/projects', requireAuth, (req, res) => {
  const projects = [
    {
      id: 'local-dominator',
      name: 'Local Dominator',
      type: 'SEO Package',
      status: 'active',
      startDate: '2024-01-01',
      lastUpdated: new Date().toISOString()
    }
  ];
  
  res.json({ projects });
});

app.get('/api/portal/stats', requireAuth, (req, res) => {
  res.json({
    visibilityScore: 78,
    localPackRankings: 3,
    keywordsTracked: 24,
    reviewRating: 4.8,
    citationsBuilt: 45,
    tasksPending: 5
  });
});

app.get('/api/portal/keywords', requireAuth, (req, res) => {
  res.json({
    keywords: [
      { id: 1, term: 'landscape architecture nova', position: 3, change: 2, volume: 1000 },
      { id: 2, term: 'patio builder fairfax', position: 1, change: 0, volume: 800 },
      { id: 3, term: 'deck contractor arlington', position: 4, change: -1, volume: 600 },
      { id: 4, term: 'hardscaping alexandria', position: 2, change: 1, volume: 500 },
      { id: 5, term: 'outdoor living spaces nova', position: 5, change: 3, volume: 400 }
    ]
  });
});

app.get('/api/portal/tasks', requireAuth, (req, res) => {
  res.json({
    tasks: [
      { id: 1, title: 'Optimize Google Business Profile', status: 'in-progress', priority: 'high', dueDate: '2026-01-20' },
      { id: 2, title: 'Build 10 new local citations', status: 'pending', priority: 'medium', dueDate: '2026-01-25' },
      { id: 3, title: 'Submit review request to top 5 clients', status: 'pending', priority: 'medium', dueDate: '2026-01-22' },
      { id: 4, title: 'Update local landing page content', status: 'complete', priority: 'high', dueDate: '2026-01-15' },
      { id: 5, title: 'Monitor competitor rankings', status: 'pending', priority: 'low', dueDate: '2026-01-30' }
    ]
  });
});

app.get('/api/portal/trends', requireAuth, (req, res) => {
  res.json({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    visibility: [45, 52, 58, 65, 72, 78],
    rankings: [25, 22, 18, 12, 8, 5]
  });
});

app.use('/portal', express.static(path.join(__dirname, 'portal')));
app.use('/auth', express.static(path.join(__dirname, 'auth')));
app.use(express.static(__dirname, {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache');
  }
}));

app.get('/portal/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'portal', 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

async function startServer() {
  try {
    await initDatabase();
    await seedDemoUser();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('Portal: http://localhost:' + PORT + '/portal/');
      console.log('Demo login: demo@acg.com / demo123');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
