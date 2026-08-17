import express from 'express';
import { generateDM } from '../utils/llm.js';

const router = express.Router();

// Dummy in-memory storage for testing
let dms = [];
let dmId = 1;

// In-memory profiles (shared with profiles route)
export let profiles = [];

// GET all DMs
router.get('/', (req, res) => {
  res.json(dms);
});

// POST generate DM using Ollama
router.post('/generate', async (req, res) => {
  try {
    const { profileId, name, title, company, painPoint } = req.body;

    if (!profileId) {
      return res.status(400).json({ error: 'profileId required' });
    }

    // Use provided profile data or create minimal profile
    const profileData = {
      name: name || `Profile ${profileId}`,
      title: title || 'Professional',
      company: company || 'Unknown Company',
      painPoint: painPoint || 'Business Growth',
    };

    // Generate personalized DM using Ollama
    let dmText = '';
    try {
      dmText = await generateDM(profileData);
    } catch (error) {
      console.error('LLM generation error:', error);
      // Fallback to template if Ollama fails
      dmText = `Hey ${profileData.name}! I noticed you're focused on ${profileData.painPoint}. Would love to connect and share insights.`;
    }

    const dm = {
      _id: dmId++,
      profileId,
      dmText,
      status: 'draft',
      aiGenerated: true,
      createdAt: new Date(),
    };

    dms.push(dm);
    res.status(201).json(dm);
  } catch (error) {
    console.error('DM generation error:', error);
    res.status(500).json({ error: 'Failed to generate DM' });
  }
});

// POST send DM
router.post('/:id/send', (req, res) => {
  const dm = dms.find(d => d._id == req.params.id);
  if (!dm) return res.status(404).json({ error: 'DM not found' });
  
  dm.status = 'sent';
  dm.sentDate = new Date();
  res.json(dm);
});

export default router;
