const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { verifyAdminToken } = require('../middleware');
const { isDbReady, memoryProducts } = require('../store');
const { deleteFromCloudinary } = require('../cloudinary');

const crypto = require('crypto');

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

// GET Digital Certificate of Authenticity for Product
router.get('/:id/certificate', async (req, res) => {
  try {
    const { id } = req.params;
    let prod = memoryProducts.find(p => p.id === id || p.slug === id);

    if (!prod && isDbReady()) {
      try {
        prod = await Product.findOne({ $or: [{ id }, { slug: id }] });
      } catch (e) {}
    }

    if (!prod) {
      return res.status(404).json({ error: 'Product not found for certificate generation' });
    }

    const sku = prod.variants?.[0]?.sku || `ECL-${prod.id.toUpperCase()}`;
    const rawPayload = `${prod.id}-${sku}-${prod.giTagRegion || prod.originRegion}-${Date.now()}`;
    const verificationHash = `ECL-CERT-${crypto.createHash('sha256').update(rawPayload).digest('hex').substring(0, 16).toUpperCase()}`;

    const certificate = {
      certificateId: `GI-ECL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      productSku: sku,
      productId: prod.id,
      title: prod.title,
      giTagRegion: prod.giTagRegion || prod.originRegion || 'Kashmir',
      craftType: prod.craftType || 'Hand-loom',
      craftingHours: prod.craftingHours || 120,
      isSilkMarkCertified: prod.isSilkMarkCertified ?? prod.silkMarkCertified ?? true,
      material: prod.material || 'Natural Organic Material',
      artisan: prod.artisan || {
        name: prod.artisanName || 'Master Craftsman Guild',
        story: prod.artisanBio || 'Heritage master guild member.',
        yearsExperience: 25,
        region: prod.originRegion || 'India',
        avatarUrl: prod.artisanAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
      },
      verificationHash,
      issuedAt: new Date().toISOString(),
      registrar: 'Eclipsera National GI Heritage Board'
    };

    res.json(certificate);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    artisanName: p.artisanName || p.artisan?.name || 'Master Guild',
    artisanBio: p.artisanBio || p.artisan?.story || '',
    category: p.category || 'handcrafted-toys',
    material: p.material || 'Natural Organic Material',
    careInstructions: p.careInstructions || 'Keep dry, clean with soft cloth.',
    rating: 5.0,
    reviewsCount: 1,
    isFeatured: true,
    isBestSeller: false,
    silkMarkCertified: p.isSilkMarkCertified ?? true,
    isSilkMarkCertified: p.isSilkMarkCertified ?? true,
    giTagRegion: p.giTagRegion || p.originRegion || 'Kashmir',
    craftType: p.craftType || 'Hand-loom',
    craftingHours: Number(p.craftingHours) || 120,
    artisanId: p.artisanId || p.artisan?.id || '',
    artisan: p.artisan || null,
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
      if (p.giTagRegion) memoryProducts[idx].giTagRegion = p.giTagRegion;
      if (p.craftType) memoryProducts[idx].craftType = p.craftType;
      if (p.craftingHours) memoryProducts[idx].craftingHours = Number(p.craftingHours);
      if (p.isSilkMarkCertified !== undefined) {
        memoryProducts[idx].isSilkMarkCertified = Boolean(p.isSilkMarkCertified);
        memoryProducts[idx].silkMarkCertified = Boolean(p.isSilkMarkCertified);
      }
      if (p.artisan) memoryProducts[idx].artisan = p.artisan;
      if (p.artisanId) memoryProducts[idx].artisanId = p.artisanId;
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
