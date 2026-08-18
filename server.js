import 'dotenv/config';
import express from 'express';
import cors from 'cors';
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
import { startScheduler } from './utils/messageScheduler.js';
import { initializeResources } from './models/Resource.js';
import { initializeFocus } from './models/Focus.js';
import { initializeProducts } from './models/Product.js';
import { initializeAudiences } from './models/Audience.js';
import { initializeOffers } from './models/Offer.js';
import { initializeAudienceResources } from './models/AudienceResource.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'LinkedIn Agent API running - Week 5 Autonomous Sales Machine 🚀' });
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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log('🚀 Phase 2: Audience Profiles & Offer Configuration');
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

  console.log('📨 Message Scheduler starting...');
  startScheduler(5);
});
