import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import profileRoutes from './routes/profiles.js';
import dmRoutes from './routes/dms.js';
import campaignRoutes from './routes/campaigns.js';
import twitterRoutes from './routes/twitter.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'LinkedIn Agent API running - Week 4 with Drip Campaigns, ICP Scoring & Twitter/X' });
});

app.use('/api/profiles', profileRoutes);
app.use('/api/dms', dmRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/twitter', twitterRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
