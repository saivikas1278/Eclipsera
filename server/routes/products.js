const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { verifyAdminToken } = require('../middleware');
const { isDbReady, memoryProducts } = require('../store');
const { deleteFromCloudinary } = require('../cloudinary');

// GET all products
router.get('/', async (req, res) => {
  try {
    if (isDbReady()) {
      try {
        const dbProducts = await Product.find().sort({ createdAt: -1 });
        if (dbProducts && dbProducts.length) {
          return res.json(dbProducts);
        }
      } catch (e) {}
    }
    res.json(memoryProducts);
  } catch (err) {
    res.json(memoryProducts);
  }
});

// POST Create Product
router.post('/', verifyAdminToken, async (req, res) => {
  const p = req.body;
  const newId = `prod-${Date.now()}`;
  const slug = (p.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  const imageUrl = p.imageUrl || p.images?.[0] || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=85';
  const cloudinaryPublicId = p.cloudinaryPublicId || p.public_id || '';
  const images = p.images?.length ? p.images : [imageUrl];
  
  const basePriceNum = Number(p.basePrice || p.price) || 1450;
  const compareAtPriceNum = Number(p.compareAtPrice) || Math.round(basePriceNum * 1.2);

  const variants = p.variants?.length ? p.variants : [{
    id: `v-${Date.now()}`,
    sku: `ECL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    colorName: 'Natural Gold Finish',
    colorHex: '#C5A059',
    additionalPrice: 0,
    stockQuantity: Number(p.stockQuantity || p.stock) || 10
  }];

  const newProductObj = {
    id: newId,
    title: p.title || 'Handcrafted Masterpiece',
    slug,
    description: p.description || '',
    basePrice: basePriceNum,
    compareAtPrice: compareAtPriceNum,
    craftTechnique: p.craftTechnique || 'Handcrafted Technique',
    originRegion: p.originRegion || 'India',
    artisanName: p.artisanName || 'Master Guild',
    artisanBio: p.artisanBio || '',
    category: p.category || 'handcrafted-toys',
    material: p.material || 'Natural Organic Material',
    careInstructions: p.careInstructions || 'Keep dry, clean with soft cloth.',
    rating: 5.0,
    reviewsCount: 1,
    isFeatured: true,
    isBestSeller: false,
    silkMarkCertified: true,
    imageUrl,
    cloudinaryPublicId,
    createdBy: p.createdBy || 'Admin',
    images,
    variants,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    memoryProducts.unshift(newProductObj);

    if (isDbReady()) {
      try {
        await Product.create(newProductObj);
      } catch (dbErr) {
        // Rollback Cloudinary asset if DB write throws unrecoverable exception
        if (cloudinaryPublicId) {
          await deleteFromCloudinary(cloudinaryPublicId);
        }
        throw dbErr;
      }
    }

    res.json({ success: true, id: newId, product: newProductObj });
  } catch (err) {
    if (cloudinaryPublicId) {
      deleteFromCloudinary(cloudinaryPublicId).catch(() => {});
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Product
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const p = req.body;

    const idx = memoryProducts.findIndex(item => item.id === id);
    if (idx !== -1) {
      if (p.title) memoryProducts[idx].title = p.title;
      if (p.description) memoryProducts[idx].description = p.description;
      if (p.basePrice || p.price) memoryProducts[idx].basePrice = Number(p.basePrice || p.price);
      if (p.category) memoryProducts[idx].category = p.category;
      if (p.imageUrl) memoryProducts[idx].imageUrl = p.imageUrl;
      if (p.cloudinaryPublicId) memoryProducts[idx].cloudinaryPublicId = p.cloudinaryPublicId;
      if (p.images && p.images.length) memoryProducts[idx].images = p.images;
      if (p.craftTechnique) memoryProducts[idx].craftTechnique = p.craftTechnique;
      if (p.artisanName) memoryProducts[idx].artisanName = p.artisanName;
      memoryProducts[idx].updatedAt = new Date().toISOString();
    }

    if (isDbReady()) {
      try {
        await Product.findOneAndUpdate({ id }, { $set: { ...p, updatedAt: new Date() } });
      } catch (e) {}
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Stock
router.put('/:id/stock', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { variantId, stockQuantity } = req.body;
    const newQty = Number(stockQuantity) || 0;

    const prod = memoryProducts.find(item => item.id === id);
    if (prod && prod.variants) {
      prod.variants.forEach(v => {
        if (v.id === variantId || !variantId) {
          v.stockQuantity = newQty;
        }
      });
      prod.updatedAt = new Date().toISOString();
    }

    if (isDbReady()) {
      try {
        const dbProd = await Product.findOne({ id });
        if (dbProd) {
          dbProd.variants.forEach(v => {
            if (v.id === variantId || !variantId) {
              v.stockQuantity = newQty;
            }
          });
          dbProd.updatedAt = new Date();
          await dbProd.save();
        }
      } catch (e) {}
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Product & Destroy Cloudinary Asset
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Find product to extract cloudinaryPublicId
    let targetProd = memoryProducts.find(item => item.id === id);
    if (!targetProd && isDbReady()) {
      try {
        targetProd = await Product.findOne({ id });
      } catch (e) {}
    }

    const publicId = targetProd?.cloudinaryPublicId;
    if (publicId) {
      console.log(`🗑️ Removing Cloudinary Asset for product ${id}: ${publicId}`);
      await deleteFromCloudinary(publicId);
    }

    // Remove from memory store
    const idx = memoryProducts.findIndex(item => item.id === id);
    if (idx !== -1) {
      memoryProducts.splice(idx, 1);
    }

    // Remove from primary DB
    if (isDbReady()) {
      try {
        await Product.deleteOne({ id });
      } catch (e) {}
    }

    res.json({ 
      success: true, 
      message: `Product ${id} deleted successfully.`,
      cloudinaryAssetDestroyed: !!publicId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
