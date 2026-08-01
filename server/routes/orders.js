const express = require('express');
const router = express.Router();
const { Order, Product, Profile, Coupon } = require('../models');
const { verifyAdminToken, verifyCustomerToken, parseCookies } = require('../middleware');
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

// GET Customer-specific Order History (Strict User Isolation)
router.get('/customer', verifyCustomerToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Resolve email from profile to filter orders securely
    let email = '';
    if (isDbReady()) {
      try {
        const profile = await Profile.findOne({ id: userId });
        if (profile) email = profile.email;
      } catch (e) {}
    }
    
    if (!email) {
      // Import memoryProfiles dynamically from auth route to resolve local/mock accounts
      const { memoryProfiles } = require('./auth');
      const memProfile = (memoryProfiles || []).find(p => p.id === userId);
      if (memProfile) email = memProfile.email;
    }
    
    if (!email) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const formattedEmail = email.trim().toLowerCase();
    
    // Query local memory orders for fallback
    let list = memoryOrders.filter(o => o && o.customerEmail && o.customerEmail.toLowerCase() === formattedEmail);
    
    // Query DB orders if active
    if (isDbReady()) {
      try {
        const dbOrders = await Order.find({ customerEmail: new RegExp(`^${formattedEmail}$`, 'i') }).sort({ createdAt: -1 });
        if (dbOrders && dbOrders.length) list = dbOrders;
      } catch (e) {}
    }
    
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// POST Create Order (with server-side price & coupon validation)
router.post('/', async (req, res) => {
  try {
    const o = req.body;
    const clientItems = Array.isArray(o.items) ? o.items : [];

    // -----------------------------------------------------------------------
    // STEP 1: Recalculate subtotal from authoritative server-side prices
    // -----------------------------------------------------------------------
    let serverSubtotal = 0;
    const resolvedItems = [];

    for (const item of clientItems) {
      const productId = item.productId || item.id;
      const variantId = item.variantId;
      const qty = Math.max(1, parseInt(item.quantity) || 1);

      // Look up product in memory first, then DB
      let prod = memoryProducts.find(p => p.id === productId);
      if (!prod && isDbReady()) {
        try { prod = await Product.findOne({ id: productId }); } catch (e) {}
      }

      if (!prod) {
        return res.status(400).json({ error: `Product "${productId}" not found. Please refresh your cart.` });
      }

      // Resolve authoritative unit price from product + variant
      let unitPrice = Number(prod.basePrice) || 0;
      if (prod.variants && prod.variants.length > 0) {
        const variant = prod.variants.find(v => v.id === variantId) || prod.variants[0];
        unitPrice = unitPrice + (Number(variant.additionalPrice) || 0);
      }

      serverSubtotal += unitPrice * qty;
      resolvedItems.push({ ...item, unitPrice, quantity: qty, productId });
    }

    // -----------------------------------------------------------------------
    // STEP 2: Validate coupon and compute server-side discount
    // -----------------------------------------------------------------------
    let serverDiscountTotal = 0;
    const couponCode = (o.couponCode || '').trim().toUpperCase();

    if (couponCode) {
      // Resolve coupon from memory or DB
      const couponsRoute = require('./coupons');
      const memoryCoupons = couponsRoute.memoryCoupons || [];
      let coupon = memoryCoupons.find(c => c.code === couponCode && c.isActive);

      if (!coupon && isDbReady()) {
        try { coupon = await Coupon.findOne({ code: couponCode, isActive: true }); } catch (e) {}
      }

      if (!coupon) {
        return res.status(400).json({ error: `Coupon code "${couponCode}" is invalid or has expired.` });
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ error: `Coupon "${couponCode}" has reached its maximum usage limit.` });
      }

      if (serverSubtotal < (Number(coupon.minSubtotal) || 0)) {
        return res.status(400).json({
          error: `Coupon "${couponCode}" requires a minimum order of ₹${(coupon.minSubtotal || 0).toLocaleString()}.`
        });
      }

      const discountPct = Number(coupon.discountPercentage || coupon.discountValue) || 0;
      serverDiscountTotal = Math.round((serverSubtotal * discountPct) / 100);
    }

    // -----------------------------------------------------------------------
    // STEP 3: Recalculate shipping and tax server-side
    // -----------------------------------------------------------------------
    const discountedSubtotal = Math.max(0, serverSubtotal - serverDiscountTotal);
    const serverShippingFee = discountedSubtotal >= 1000 ? 0 : 150;
    const serverTaxTotal = Math.round(discountedSubtotal * 0.05);
    const serverGrandTotal = discountedSubtotal + serverShippingFee + serverTaxTotal;

    // -----------------------------------------------------------------------
    // STEP 4: Validate client-submitted grand total (allow ₹5 rounding buffer)
    // -----------------------------------------------------------------------
    const clientGrandTotal = Number(o.grandTotal) || 0;
    if (clientGrandTotal > 0 && Math.abs(clientGrandTotal - serverGrandTotal) > 5) {
      return res.status(400).json({
        error: 'Price mismatch detected. Order total recalculated for security.',
        serverGrandTotal,
        clientGrandTotal
      });
    }

    // -----------------------------------------------------------------------
    // STEP 5: Build and persist the verified order
    // -----------------------------------------------------------------------
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
      subtotal: serverSubtotal,
      discountTotal: serverDiscountTotal,
      couponCode: couponCode || null,
      shippingFee: serverShippingFee,
      taxTotal: serverTaxTotal,
      grandTotal: serverGrandTotal,
      status: 'PENDING_FULFILLMENT',
      paymentMethod: o.paymentMethod || 'RAZORPAY_UPI',
      paymentId: `pay_${Date.now()}`,
      courierName: 'BlueDart Luxury Express',
      trackingNumber: awbNum,
      awbTrackingNumber: awbNum,
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      trackingHistory: initialTracking,
      shippingAddress: o.shippingAddress || { street: '42 Lavelle Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', country: 'India' },
      items: resolvedItems,
      createdAt: new Date().toISOString()
    };

    memoryOrders.unshift(newOrderObj);

    // Trigger Order Confirmation Email & Admin Notification
    sendOrderConfirmationEmail(newOrderObj);
    triggerNewOrderAdminNotification(newOrderObj);

    // Decrement stock in memoryProducts & Check Low Stock (< 3 units)
    for (const item of resolvedItems) {
      const prod = memoryProducts.find(p => p.id === item.productId);
      if (prod && Array.isArray(prod.variants)) {
        prod.variants.forEach(v => {
          if (v.id === item.variantId || !item.variantId) {
            v.stockQuantity = Math.max(0, (v.stockQuantity || 0) - item.quantity);
            if (v.stockQuantity < 3) triggerLowStockNotification(prod, v.stockQuantity);
          }
        });
      }
    }

    if (isDbReady()) {
      try {
        await Order.create(newOrderObj);
        for (const item of resolvedItems) {
          const dbProd = await Product.findOne({ id: item.productId });
          if (dbProd && Array.isArray(dbProd.variants)) {
            dbProd.variants.forEach(v => {
              if (v.id === item.variantId || !item.variantId) {
                v.stockQuantity = Math.max(0, (v.stockQuantity || 0) - item.quantity);
                if (v.stockQuantity < 3) triggerLowStockNotification(dbProd, v.stockQuantity);
              }
            });
            await dbProd.save();
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

    // --- Strict State Machine Transition Validator ---
    const VALID_TRANSITIONS = {
      'PENDING_FULFILLMENT': ['PROCESSING', 'DISPATCHED', 'CANCELLED'],
      'PROCESSING':          ['DISPATCHED', 'CANCELLED'],
      'DISPATCHED':          ['IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
      'IN_TRANSIT':          ['DELIVERED', 'CANCELLED'],
      'DELIVERED':           ['RETURN_REQUESTED'],
      'RETURN_REQUESTED':    ['RETURN_APPROVED', 'RETURN_REJECTED'],
      'RETURN_APPROVED':     ['REFUNDED'],
      'RETURN_REJECTED':     [],
      'REFUNDED':            [],
      'CANCELLED':           []
    };

    if (status && status !== ord.status) {
      const currentStatus = ord.status || 'PENDING_FULFILLMENT';
      const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
      if (!allowedNext.includes(status)) {
        return res.status(400).json({
          error: `Invalid status transition: cannot move order from "${currentStatus}" to "${status}". Allowed next states: [${allowedNext.join(', ') || 'none'}].`
        });
      }
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

    try {
      const { recordAuditLog } = require('./auditLogs');
      await recordAuditLog(`Order #${ord.orderNumber || ord.id} status updated to ${ord.status}`, 'ORDER');
    } catch (auditErr) {}

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
