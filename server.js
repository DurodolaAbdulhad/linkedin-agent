import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import profileRoutes from './routes/profiles.js';
import dmRoutes from './routes/dms.js';
import campaignRoutes from './routes/campaigns.js';
import twitterRoutes from './routes/twitter.js';
import analyticsRoutes from './routes/analytics.js';
import schedulerRoutes from './routes/scheduler.js';
import resourceRoutes from './routes/resources.js';
import settingsRoutes from './routes/settings.js';
import focusRoutes from './routes/focus.js';
import productsRoutes from './routes/products.js';
import audiencesRoutes from './routes/audiences.js';
import offersRoutes from './routes/offers.js';
import audienceResourcesRoutes from './routes/audience-resources.js';
import eventsRoutes from './routes/events.js';
import automationRulesRoutes from './routes/automation-rules.js';
import campaignAutomationRoutes from './routes/campaign-automation.js';
import automationExecutionRoutes from './routes/automation-execution.js';
import analyticsDashboardRoutes from './routes/analytics-dashboard.js';
import linkedinOAuthRoutes from './routes/linkedin-oauth.js';
import twitterOAuthRoutes from './routes/twitter-oauth.js';
import { startScheduler } from './utils/messageScheduler.js';
import { initializeAppwrite } from './utils/appwrite.js';
import { initializeResources } from './models/Resource.js';
import { initializeFocus } from './models/Focus.js';
import { initializeProducts } from './models/Product.js';
import { initializeAudiences } from './models/Audience.js';
import { initializeOffers } from './models/Offer.js';
import { initializeAudienceResources } from './models/AudienceResource.js';
import { initializeAutomationRules } from './models/AutomationRule.js';
import { initializeCampaignAutomation } from './models/CampaignAutomation.js';
import { initializeEvents } from './models/Event.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, 'public');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));

// Simple dashboard route
app.get('/dashboard', (req, res) => {
  const dashboardPath = path.join(publicPath, 'dashboard.html');
  if (fs.existsSync(dashboardPath)) {
    res.sendFile(dashboardPath);
  } else {
    // Fallback: serve dashboard from memory
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Autonomous Sales Machine Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      color: #333;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    header { background: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    h1 { color: #667eea; margin-bottom: 10px; font-size: 2em; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .card h2 { color: #667eea; font-size: 1.2em; margin-bottom: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .metric { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
    .metric-label { font-weight: 500; color: #666; }
    .metric-value { font-size: 1.5em; font-weight: bold; color: #667eea; }
    .button { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 15px; width: 100%; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; color: #666; border-bottom: 2px solid #ddd; }
    td { padding: 12px; border-bottom: 1px solid #eee; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 600; background: #dff0d8; color: #3c763d; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🚀 Autonomous Sales Machine</h1>
      <p>Real-time Campaign & Automation Dashboard</p>
    </header>
    <div class="grid">
      <div class="card">
        <h2>📊 Campaigns</h2>
        <div id="campaigns-content">Loading campaigns...</div>
        <button class="button" onclick="createTestCampaign()">+ New Campaign</button>
      </div>
      <div class="card">
        <h2>📈 Analytics Summary</h2>
        <div id="analytics-content">Loading analytics...</div>
      </div>
    </div>
  </div>
  <script>
    const API_URL = 'https://agent.durodola.africa/api';
    async function loadDashboard() {
      try {
        const campaigns = await fetch(\`\${API_URL}/campaigns\`).then(r => r.json());
        const analytics = await fetch(\`\${API_URL}/analytics/summary\`).then(r => r.json());

        document.getElementById('campaigns-content').innerHTML = campaigns.length > 0
          ? \`<table><tr><th>Campaign</th><th>Profile</th><th>Platform</th><th>Stage</th></tr>\${campaigns.slice(0,5).map(c => \`<tr><td>#\${c._id}</td><td>\${c.profileData?.name || 'N/A'}</td><td>\${c.platform}</td><td>\${c.currentStage}</td></tr>\`).join('')}</table>\`
          : '<p>No campaigns yet</p>';

        document.getElementById('analytics-content').innerHTML = \`
          <div class="metric"><span class="metric-label">Total Campaigns</span><span class="metric-value">\${analytics.campaigns?.total || 0}</span></div>
          <div class="metric"><span class="metric-label">Active Campaigns</span><span class="metric-value">\${analytics.campaigns?.active || 0}</span></div>
          <div class="metric"><span class="metric-label">Total Conversions</span><span class="metric-value">\${analytics.conversions?.total || 0}</span></div>
          <div class="metric"><span class="metric-label">Total Revenue</span><span class="metric-value">$\${(analytics.conversions?.totalRevenue || 0).toLocaleString()}</span></div>
        \`;
      } catch (e) {
        document.getElementById('campaigns-content').innerHTML = '<p>Error loading data</p>';
      }
    }
    loadDashboard();
    setInterval(loadDashboard, 30000);
  </script>
</body>
</html>`);
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'LinkedIn Agent API running - Week 5 Autonomous Sales Machine 🚀',
    oauthEnabled: true,
    timestamp: new Date().toISOString()
  });
});

// Dashboard data API - returns all dashboard metrics
app.get('/api/dashboard-data', async (req, res) => {
  try {
    const { getCampaigns } = await import('./routes/campaigns.js');
    const { getAnalyticsSummary } = await import('./routes/analytics.js');

    const campaigns = await import('./routes/campaigns.js').then(m => m.getCampaigns?.() || []);
    const analytics = await import('./routes/analytics.js').then(m => m.getAnalyticsSummary?.() || {});

    res.json({
      campaigns: Array.isArray(campaigns) ? campaigns : [],
      analytics: analytics || {},
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    res.json({
      campaigns: [],
      analytics: {},
      error: e.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.use('/api/profiles', profileRoutes);
app.use('/api/dms', dmRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/twitter', twitterRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/audiences', audiencesRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/audience-resources', audienceResourcesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/automation-rules', automationRulesRoutes);
app.use('/api/campaign-automation', campaignAutomationRoutes);
app.use('/api/automation/execute', automationExecutionRoutes);
app.use('/api/analytics', analyticsDashboardRoutes);

// OAuth Routes
app.use('/api/linkedin', linkedinOAuthRoutes);
app.use('/api/twitter-oauth', twitterOAuthRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log('🚀 Phase 5: Real-time Analytics & Multi-channel Orchestration');

  console.log('🌐 Connecting to Appwrite...');
  try {
    await initializeAppwrite();
    console.log('✅ Appwrite connected - persistent storage enabled');
  } catch (error) {
    console.error('⚠️ Appwrite connection failed, falling back to in-memory storage');
  }

  console.log('📚 Initializing resources...');

  initializeResources();
  console.log('✓ Resource library loaded');

  console.log('🎯 Initializing focus periods...');
  initializeFocus();
  console.log('✓ Focus system ready');

  console.log('📦 Initializing products...');
  initializeProducts();
  console.log('✓ Products loaded (Ascent Finance, Learn, Corporate)');

  console.log('👥 Initializing audiences...');
  initializeAudiences();
  console.log('✓ 8 audience profiles loaded');

  console.log('🎁 Initializing offers...');
  initializeOffers();
  console.log('✓ 9 product offers configured');

  console.log('🔗 Initializing audience resource mappings...');
  initializeAudienceResources();
  console.log('✓ Resource-to-audience-to-funnel mappings loaded');

  console.log('⚡ Initializing event system...');
  initializeEvents();
  console.log('✓ Event tracking ready');

  console.log('🤖 Initializing automation rules...');
  initializeAutomationRules();
  console.log('✓ 9 automation rules loaded (IF event → THEN action)');

  console.log('📋 Initializing campaign automation tracking...');
  initializeCampaignAutomation();
  console.log('✓ Campaign automation execution tracking ready');

  console.log('📊 Real-time Analytics Engine starting...');
  console.log('✓ ConversionTracker ready (meetings, deals, revenue)');
  console.log('✓ CampaignAnalytics ready (funnel, engagement, ROI metrics)');
  console.log('✓ ChannelOrchestrator ready (multi-channel sequencing)');

  console.log('⚙️ Autonomous Execution Engine starting...');
  console.log('✓ ActionExecutor ready (send DM, resource, offer, funnel updates)');
  console.log('✓ AutomationExecutor ready (rule evaluation + action execution)');

  console.log('📨 Event-driven Message Scheduler starting...');
  startScheduler(5);
  console.log('✓ Scheduler listening for events and triggering automations');

  console.log('🔐 OAuth Integration starting...');
  console.log('✓ LinkedIn OAuth ready: /api/linkedin/authorize');
  console.log('✓ Twitter OAuth ready: /api/twitter-oauth/authorize');
  console.log('✓ Check status: /api/linkedin/status and /api/twitter-oauth/status');
});
