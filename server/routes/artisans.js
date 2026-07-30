const express = require('express');
const router = express.Router();
const { Artisan } = require('../models');
const { verifyAdminToken } = require('../middleware');
const { isDbReady, memoryArtisans } = require('../store');

// GET all artisans
router.get('/', async (req, res) => {
  try {
    if (isDbReady()) {
      try {
        const dbArtisans = await Artisan.find().sort({ createdAt: -1 });
        if (dbArtisans && dbArtisans.length) {
          return res.json(dbArtisans);
        }
      } catch (e) {}
    }
    res.json(memoryArtisans);
  } catch (err) {
    res.json(memoryArtisans);
  }
});

// POST Create Artisan Profile
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const body = req.body;
    const newId = `artisan-${Date.now()}`;
    const newArtisanObj = {
      id: newId,
      name: body.name || 'Master Craftsperson',
      story: body.story || 'Dedicated heritage craftsperson.',
      yearsExperience: Number(body.yearsExperience) || 10,
      region: body.region || 'India',
      avatarUrl: body.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      craftSpecialty: body.craftSpecialty || 'Handicrafts',
      createdAt: new Date().toISOString()
    };

    memoryArtisans.unshift(newArtisanObj);

    if (isDbReady()) {
      try {
        await Artisan.create(newArtisanObj);
      } catch (e) {}
    }

    res.json({ success: true, id: newId, artisan: newArtisanObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Artisan Profile
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const idx = memoryArtisans.findIndex(a => a.id === id);
    if (idx !== -1) {
      if (body.name) memoryArtisans[idx].name = body.name;
      if (body.story) memoryArtisans[idx].story = body.story;
      if (body.yearsExperience) memoryArtisans[idx].yearsExperience = Number(body.yearsExperience);
      if (body.region) memoryArtisans[idx].region = body.region;
      if (body.avatarUrl) memoryArtisans[idx].avatarUrl = body.avatarUrl;
      if (body.craftSpecialty) memoryArtisans[idx].craftSpecialty = body.craftSpecialty;
    }

    if (isDbReady()) {
      try {
        await Artisan.findOneAndUpdate({ id }, { $set: body });
      } catch (e) {}
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Artisan Profile
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const idx = memoryArtisans.findIndex(a => a.id === id);
    if (idx !== -1) {
      memoryArtisans.splice(idx, 1);
    }

    if (isDbReady()) {
      try {
        await Artisan.deleteOne({ id });
      } catch (e) {}
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
