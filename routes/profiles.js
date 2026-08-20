import express from 'express';
import {
  createProfile,
  getProfile,
  getAllProfiles,
} from '../services/AppwriteService.js';

const router = express.Router();

// GET all profiles (from Appwrite)
router.get('/', async (req, res) => {
  try {
    const profiles = await getAllProfiles();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// POST new profile (to Appwrite)
router.post('/', async (req, res) => {
  try {
    const { name, title, company, location, painPoint, icpSegment, linkedinUrl, icp } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }

    const profile = await createProfile({
      name,
      title: title || '',
      company: company || '',
      painPoint: painPoint || '',
      icp: icp || 0,
      linkedin_url: linkedinUrl || '',
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// GET single profile (from Appwrite)
router.get('/:id', async (req, res) => {
  try {
    const profile = await getProfile(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
