import express from 'express';
import { Resend } from 'resend';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use(express.static(__dirname, {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache');
  }
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`xScapes server running on http://localhost:${PORT}`);
});
