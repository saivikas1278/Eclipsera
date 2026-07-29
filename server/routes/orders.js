const express = require('express');
const router = express.Router();
const { Order, Product } = require('../models');
const { verifyAdminToken } = require('../middleware');
const { isDbReady, memoryOrders, memoryProducts } = require('../store');

// GET all orders
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    if (isDbReady()) {
      try {
        const dbOrders = await Order.find().sort({ createdAt: -1 });
        if (dbOrders && dbOrders.length) {
          return res.json(dbOrders);
        }
      } catch (e) {}
    }
    res.json(memoryOrders);
  } catch (err) {
    res.json(memoryOrders);
  }
});

// POST Create Order
router.post('/', async (req, res) => {
  try {
    const o = req.body;
    const newId = `ord-${Date.now()}`;
    const orderNum = `EP-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrderObj = {
      id: newId,
      orderNumber: orderNum,
      customerName: o.customerName || 'Artisan Patron',
      customerEmail: o.customerEmail || 'patron@example.com',
      customerPhone: o.customerPhone || '9876543210',
      subtotal: Number(o.subtotal) || 0,
      discountTotal: Number(o.discountTotal) || 0,
      shippingFee: Number(o.shippingFee) || 0,
      taxTotal: Number(o.taxTotal) || 0,
      grandTotal: Number(o.grandTotal) || 0,
      status: 'PAYMENT_CONFIRMED',
      paymentMethod: o.paymentMethod || 'RAZORPAY_UPI',
      paymentId: `pay_${Date.now()}`,
      shippingAddress: o.shippingAddress || { street: '42 Lavelle Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', country: 'India' },
      items: o.items || [],
      createdAt: new Date().toISOString()
    };

    memoryOrders.unshift(newOrderObj);

    // Decrement stock in memoryProducts
    if (o.items && Array.isArray(o.items)) {
      for (const item of o.items) {
        const prod = memoryProducts.find(p => p.id === item.productId || p.id === item.id);
        if (prod && prod.variants) {
          prod.variants.forEach(v => {
            if (v.id === item.variantId || !item.variantId) {
              v.stockQuantity = Math.max(0, v.stockQuantity - (item.quantity || 1));
            }
          });
        }
      }
    }

    if (isDbReady()) {
      try {
        await Order.create(newOrderObj);

        if (o.items && Array.isArray(o.items)) {
          for (const item of o.items) {
            const dbProd = await Product.findOne({ id: item.productId });
            if (dbProd) {
              dbProd.variants.forEach(v => {
                if (v.id === item.variantId || !item.variantId) {
                  v.stockQuantity = Math.max(0, v.stockQuantity - (item.quantity || 1));
                }
              });
              await dbProd.save();
            }
          }
        }
      } catch (e) {}
    }

    res.json({ success: true, id: newId, orderNumber: orderNum, order: newOrderObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Order Status & Courier
router.put('/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, courierName, trackingNumber } = req.body;

    const ord = memoryOrders.find(o => o.id === id);
    if (ord) {
      if (status) ord.status = status;
      if (courierName) ord.courierName = courierName;
      if (trackingNumber) ord.trackingNumber = trackingNumber;
    }

    if (isDbReady()) {
      try {
        await Order.findOneAndUpdate({ id }, {
          $set: { status, courierName, trackingNumber }
        });
      } catch (e) {}
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
