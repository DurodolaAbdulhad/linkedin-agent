import express from 'express';

const router = express.Router();

// Dummy in-memory storage for testing
let profiles = [];
let profileId = 1;

// GET all profiles
router.get('/', (req, res) => {
  res.json(profiles);
});

// POST new profile
router.post('/', (req, res) => {
  try {
    const { name, title, company, location, painPoint, icpSegment, linkedinUrl } = req.body;
    
    if (!name || !painPoint) {
      return res.status(400).json({ error: 'Name and painPoint required' });
    }

    const profile = {
      _id: profileId++,
      name,
      title,
      company,
      location,
      painPoint,
      icpSegment,
      linkedinUrl,
      createdAt: new Date(),
    };

    profiles.push(profile);
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// GET single profile
router.get('/:id', (req, res) => {
  const profile = profiles.find(p => p._id == req.params.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});

export { profiles };
export default router;
