const express = require('express');
const router = express.Router();
const { Order, Product } = require('../models');
const { verifyAdminToken } = require('../middleware');
const { isDbReady, memoryOrders, memoryProducts } = require('../store');
const { 
  sendOrderConfirmationEmail, 
  sendOrderDispatchEmail, 
  triggerLowStockNotification, 
  triggerNewOrderAdminNotification 
} = require('../services/notificationService');

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

// GET Public Order Tracking Endpoint
router.get('/track/:query', async (req, res) => {
  try {
    const rawQuery = (req.params.query || '').trim().toLowerCase();
    
    let ord = memoryOrders.find(o => 
      o.orderNumber.toLowerCase() === rawQuery ||
      o.id.toLowerCase() === rawQuery ||
      (o.awbTrackingNumber && o.awbTrackingNumber.toLowerCase() === rawQuery) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase() === rawQuery)
    );

    if (!ord && isDbReady()) {
      try {
        ord = await Order.findOne({
          $or: [
            { orderNumber: new RegExp(`^${rawQuery}$`, 'i') },
            { id: rawQuery },
            { awbTrackingNumber: new RegExp(`^${rawQuery}$`, 'i') },
            { trackingNumber: new RegExp(`^${rawQuery}$`, 'i') }
          ]
        });
      } catch (e) {}
    }

    if (!ord) {
      return res.status(404).json({ error: `No active shipment found matching "${req.params.query}"` });
    }

    res.json(ord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Order
router.post('/', async (req, res) => {
  try {
    const o = req.body;
    const newId = `ord-${Date.now()}`;
    const orderNum = `EP-${Math.floor(10000 + Math.random() * 90000)}`;
    const awbNum = `ECL-AWB-${Math.floor(100000 + Math.random() * 900000)}`;

    const initialTracking = [
      {
        status: 'PENDING_FULFILLMENT',
        location: 'Eclipsera Central Fulfillment Vault',
        timestamp: new Date().toISOString(),
        note: 'Order confirmed & assigned to Master Guild Quality Check.'
      }
    ];

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
      status: 'PENDING_FULFILLMENT',
      paymentMethod: o.paymentMethod || 'RAZORPAY_UPI',
      paymentId: `pay_${Date.now()}`,
      courierName: 'BlueDart Luxury Express',
      trackingNumber: awbNum,
      awbTrackingNumber: awbNum,
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      trackingHistory: initialTracking,
      shippingAddress: o.shippingAddress || { street: '42 Lavelle Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', country: 'India' },
      items: o.items || [],
      createdAt: new Date().toISOString()
    };

    memoryOrders.unshift(newOrderObj);

    // Trigger Order Confirmation Email & Admin Notification
    sendOrderConfirmationEmail(newOrderObj);
    triggerNewOrderAdminNotification(newOrderObj);

    // Decrement stock in memoryProducts & Check Low Stock (< 3 units)
    if (o.items && Array.isArray(o.items)) {
      for (const item of o.items) {
        const prod = memoryProducts.find(p => p.id === item.productId || p.id === item.id);
        if (prod && prod.variants) {
          prod.variants.forEach(v => {
            if (v.id === item.variantId || !item.variantId) {
              v.stockQuantity = Math.max(0, v.stockQuantity - (item.quantity || 1));
              if (v.stockQuantity < 3) {
                triggerLowStockNotification(prod, v.stockQuantity);
              }
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
                  if (v.stockQuantity < 3) {
                    triggerLowStockNotification(dbProd, v.stockQuantity);
                  }
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

// PUT Fulfillment State Machine & Tracking Log Update (Admin)
router.put('/:id/fulfillment', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      courierName, 
      awbTrackingNumber, 
      estimatedDeliveryDate, 
      packingVideoUrl, 
      location, 
      note 
    } = req.body;

    let ord = memoryOrders.find(o => o.id === id);
    if (!ord && isDbReady()) {
      try { ord = await Order.findOne({ id }); } catch (e) {}
    }

    if (!ord) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status) ord.status = status;
    if (courierName) ord.courierName = courierName;
    if (awbTrackingNumber) {
      ord.awbTrackingNumber = awbTrackingNumber;
      ord.trackingNumber = awbTrackingNumber;
    }
    if (estimatedDeliveryDate) ord.estimatedDeliveryDate = estimatedDeliveryDate;
    if (packingVideoUrl) ord.packingVideoUrl = packingVideoUrl;

    if (!ord.trackingHistory) ord.trackingHistory = [];
    
    if (location || note || status) {
      ord.trackingHistory.push({
        status: status || ord.status,
        location: location || 'Regional Fulfillment Hub',
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${status || ord.status}`
      });
    }

    if (status === 'DISPATCHED' || status === 'IN_TRANSIT') {
      sendOrderDispatchEmail(ord);
    }

    if (isDbReady()) {
      try {
        await Order.findOneAndUpdate({ id }, {
          $set: {
            status: ord.status,
            courierName: ord.courierName,
            trackingNumber: ord.trackingNumber,
            awbTrackingNumber: ord.awbTrackingNumber,
            estimatedDeliveryDate: ord.estimatedDeliveryDate,
            packingVideoUrl: ord.packingVideoUrl,
            trackingHistory: ord.trackingHistory
          }
        });
      } catch (e) {}
    }

    res.json({ success: true, order: ord });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Customer Return Request
router.post('/:id/return', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, photos, comments } = req.body;

    let ord = memoryOrders.find(o => o.id === id || o.orderNumber === id);
    if (ord) {
      ord.status = 'RETURN_REQUESTED';
      ord.returnReason = reason || 'Damaged or defective craft item';
      ord.returnPhotos = photos || [];
      ord.returnRequestedAt = new Date().toISOString();

      if (!ord.trackingHistory) ord.trackingHistory = [];
      ord.trackingHistory.push({
        status: 'RETURN_REQUESTED',
        location: 'Customer Portal Request',
        timestamp: new Date().toISOString(),
        note: `Return/Exchange Requested: ${reason}. Comments: ${comments || 'None'}`
      });
    }

    if (isDbReady()) {
      try {
        await Order.findOneAndUpdate({ $or: [{ id }, { orderNumber: id }] }, {
          $set: {
            status: 'RETURN_REQUESTED',
            returnReason: reason,
            returnPhotos: photos || [],
            returnRequestedAt: new Date()
          }
        });
      } catch (e) {}
    }

    res.json({ success: true, message: 'Return request registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Order Status (Legacy Fallback)
router.put('/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, courierName, trackingNumber } = req.body;

    const ord = memoryOrders.find(o => o.id === id);
    if (ord) {
      if (status) ord.status = status;
      if (courierName) ord.courierName = courierName;
      if (trackingNumber) {
        ord.trackingNumber = trackingNumber;
        ord.awbTrackingNumber = trackingNumber;
      }
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
