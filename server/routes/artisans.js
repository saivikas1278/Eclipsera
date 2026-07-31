const express = require('express');
const router = express.Router();
const { Artisan, Product } = require('../models');
const { verifyAdminToken } = require('../middleware');
const { isDbReady, memoryArtisans, memoryProducts } = require('../store');

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
    const body = req.body || {};

    const idx = memoryArtisans.findIndex(a => a.id === id);
    if (idx !== -1) {
      if (body.name) memoryArtisans[idx].name = body.name;
      if (body.story) memoryArtisans[idx].story = body.story;
      if (body.yearsExperience) memoryArtisans[idx].yearsExperience = Number(body.yearsExperience);
      if (body.region) memoryArtisans[idx].region = body.region;
      if (body.avatarUrl) memoryArtisans[idx].avatarUrl = body.avatarUrl;
      if (body.craftSpecialty) memoryArtisans[idx].craftSpecialty = body.craftSpecialty;
    }

    // Sync nested artisan properties inside memoryProducts with null safety
    if (Array.isArray(memoryProducts)) {
      memoryProducts.forEach(p => {
        if (p && p.artisan && p.artisan.id === id) {
          if (body.name) {
            p.artisanName = body.name;
            p.artisan.name = body.name;
          }
          if (body.story) {
            p.artisanBio = body.story;
            p.artisan.story = body.story;
          }
          if (body.yearsExperience) {
            p.artisan.yearsExperience = Number(body.yearsExperience);
          }
          if (body.region) {
            p.originRegion = body.region;
            p.artisan.region = body.region;
          }
          if (body.avatarUrl) {
            p.artisan.avatarUrl = body.avatarUrl;
            p.artisanAvatar = body.avatarUrl;
          }
          if (body.craftSpecialty) {
            p.artisan.craftSpecialty = body.craftSpecialty;
          }
        }
      });
    }

    if (isDbReady()) {
      try {
        await Artisan.findOneAndUpdate({ id }, { $set: body });

        // Build product update payload dynamically
        const updateFields = {};
        if (body.name) {
          updateFields['artisanName'] = body.name;
          updateFields['artisan.name'] = body.name;
        }
        if (body.story) {
          updateFields['artisanBio'] = body.story;
          updateFields['artisan.story'] = body.story;
        }
        if (body.yearsExperience) {
          updateFields['artisan.yearsExperience'] = Number(body.yearsExperience);
        }
        if (body.region) {
          updateFields['originRegion'] = body.region;
          updateFields['artisan.region'] = body.region;
        }
        if (body.avatarUrl) {
          updateFields['artisan.avatarUrl'] = body.avatarUrl;
          updateFields['artisanAvatar'] = body.avatarUrl;
        }
        if (body.craftSpecialty) {
          updateFields['artisan.craftSpecialty'] = body.craftSpecialty;
        }

        if (Object.keys(updateFields).length > 0) {
          await Product.updateMany({ 'artisan.id': id }, { $set: updateFields });
        }
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
