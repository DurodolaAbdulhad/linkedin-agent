import express from 'express';
import Profile from '../models/Profile.js';

const router = express.Router();

// GET all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().limit(50);
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// POST new profile
router.post('/', async (req, res) => {
  try {
    const { name, title, company, location, painPoint, icpSegment, linkedinUrl } = req.body;
    
    if (!name || !painPoint) {
      return res.status(400).json({ error: 'Name and painPoint required' });
    }

    const profile = new Profile({
      name,
      title,
      company,
      location,
      painPoint,
      icpSegment,
      linkedinUrl,
    });

    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// GET single profile
router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
