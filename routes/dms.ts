import express from 'express';
import DM from '../models/DM.js';
import { generateDM } from '../utils/llm.js';
import Profile from '../models/Profile.js';

const router = express.Router();

// GET all DMs
router.get('/', async (req, res) => {
  try {
    const dms = await DM.find().limit(100);
    res.json(dms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch DMs' });
  }
});

// POST generate DM from profile
router.post('/generate', async (req, res) => {
  try {
    const { profileId } = req.body;
    
    if (!profileId) {
      return res.status(400).json({ error: 'profileId required' });
    }

    // Get profile
    const profile = await Profile.findById(profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Generate DM using Ollama
    const dmText = await generateDM(profile.toObject());

    // Save DM as draft
    const dm = new DM({
      profileId,
      dmText,
      status: 'draft',
      aiGenerated: true,
    });

    await dm.save();
    res.status(201).json(dm);
  } catch (error) {
    console.error('DM generation error:', error);
    res.status(500).json({ error: 'Failed to generate DM' });
  }
});

// POST send DM (mark as sent)
router.post('/:id/send', async (req, res) => {
  try {
    const dm = await DM.findByIdAndUpdate(
      req.params.id,
      { status: 'sent', sentDate: new Date() },
      { new: true }
    );
    res.json(dm);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send DM' });
  }
});

export default router;
