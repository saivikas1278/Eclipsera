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

const restoreOrderStock = async (items) => {
  if (!items || !Array.isArray(items)) return;
  for (const item of items) {
    const productId = item.productId || item.id;
    const qty = Number(item.quantity) || 1;

    // Memory restore
    const prod = memoryProducts.find(p => p.id === productId);
    if (prod && Array.isArray(prod.variants)) {
      prod.variants.forEach(v => {
        if (v.id === item.variantId || !item.variantId) {
          v.stockQuantity = (v.stockQuantity || 0) + qty;
        }
      });
    }

    // DB restore
    if (isDbReady()) {
      try {
        const dbProd = await Product.findOne({ id: productId });
        if (dbProd && Array.isArray(dbProd.variants)) {
          dbProd.variants.forEach(v => {
            if (v.id === item.variantId || !item.variantId) {
              v.stockQuantity = (v.stockQuantity || 0) + qty;
            }
          });
          await dbProd.save();
        }
      } catch (e) {}
    }
  }
};

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

// In-Memory Idempotency Key Store (24 Hour Expiration)
const idempotencyStore = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of idempotencyStore.entries()) {
    if (now - val.timestamp > 86400000) idempotencyStore.delete(key);
  }
}, 3600000);

// POST Reserve Inventory Concurrency Lock (10 Minutes)
router.post('/reserve-lock', async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body || {};
    let prod = memoryProducts.find(p => p.id === productId);
    if (!prod && isDbReady()) {
      try { prod = await Product.findOne({ id: productId }); } catch (e) {}
    }

    if (!prod) return res.status(404).json({ success: false, error: 'Product not found' });

    const variant = (prod.variants || []).find(v => v.id === variantId) || prod.variants[0];
    if (!variant) return res.status(404).json({ success: false, error: 'Variant not found' });

    const now = Date.now();
    const isLockActive = variant.lockedUntil && new Date(variant.lockedUntil).getTime() > now;
    const activeLockQty = isLockActive ? (variant.lockedQuantity || 0) : 0;
    const availableStock = Math.max(0, (variant.stockQuantity || 0) - activeLockQty);

    if (availableStock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient available stock for ${prod.title}. Available: ${availableStock}, Requested: ${quantity}`
      });
    }

    // Reserve 10-minute lock
    variant.lockedQuantity = (activeLockQty || 0) + quantity;
    variant.lockedUntil = new Date(now + 10 * 60 * 1000);

    if (isDbReady()) {
      try {
        await Product.updateOne(
          { id: productId, 'variants.id': variant.id },
          { 
            $set: { 
              'variants.$.lockedQuantity': variant.lockedQuantity,
              'variants.$.lockedUntil': variant.lockedUntil
            } 
          }
        );
      } catch (e) {}
    }

    res.json({
      success: true,
      data: {
        productId,
        variantId: variant.id,
        lockedQuantity: quantity,
        lockedUntil: variant.lockedUntil
      },
      message: '10-minute inventory lock reserved successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Create Order (with server-side price & coupon validation & idempotency)
router.post('/', async (req, res) => {
  try {
    const o = req.body;
    const idempotencyKey = req.headers['x-idempotency-key'] || o.idempotencyKey;

    // STEP 0: Check Idempotency Cache
    if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
      const cached = idempotencyStore.get(idempotencyKey);
      return res.json({
        success: true,
        data: cached.order,
        order: cached.order,
        id: cached.order.id,
        orderNumber: cached.order.orderNumber,
        message: 'Order returned from 24-hour idempotency cache',
        isDuplicate: true
      });
    }

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
      userId: o.userId || req.userId || null,
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

    // Increment Coupon usedCount in memory & DB
    if (couponCode) {
      try {
        const couponsRoute = require('./coupons');
        const memoryCoupons = couponsRoute.memoryCoupons || [];
        const memCoupon = memoryCoupons.find(c => c.code === couponCode);
        if (memCoupon) {
          memCoupon.usedCount = (memCoupon.usedCount || 0) + 1;
        }

        if (isDbReady()) {
          try {
            await Coupon.updateOne({ code: couponCode }, { $inc: { usedCount: 1 } });
          } catch (e) {}
        }

        const { recordAuditLog } = require('./auditLogs');
        await recordAuditLog(`Coupon "${couponCode}" applied to Order #${orderNum}`, 'ORDER');
      } catch (couponErr) {}
    }

    // Store in Idempotency Cache
    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, { order: newOrderObj, timestamp: Date.now() });
    }

    res.json({ success: true, data: newOrderObj, id: newId, orderNumber: orderNum, order: newOrderObj, message: 'Order placed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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

    if (status === 'CANCELLED' || status === 'RETURN_APPROVED' || status === 'REFUNDED') {
      await restoreOrderStock(ord.items);
      if (status === 'RETURN_APPROVED' || status === 'REFUNDED') {
        ord.trackingHistory.push({
          status,
          location: 'Central Vault Warehouse',
          timestamp: new Date().toISOString(),
          note: 'Returned craft item restocked to active inventory.'
        });
      }
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

    // Broadcast SSE Order Update to User & Admin
    try {
      const notificationsRoute = require('./notifications');
      if (notificationsRoute && typeof notificationsRoute.broadcastSSE === 'function') {
        notificationsRoute.broadcastSSE('ORDER_UPDATED', ord);
      }
    } catch (e) {}

    res.json({ success: true, data: ord, order: ord, message: 'Order fulfillment status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Customer / Admin Order Cancellation
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    let ord = memoryOrders.find(o => o.id === id || o.orderNumber === id);
    if (!ord && isDbReady()) {
      try {
        ord = await Order.findOne({ $or: [{ id }, { orderNumber: id }] });
      } catch (e) {}
    }

    if (!ord) {
      return res.status(404).json({ error: 'Order not found for cancellation.' });
    }

    const nonCancellable = ['DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'REFUNDED', 'CANCELLED'];
    if (nonCancellable.includes(ord.status)) {
      return res.status(400).json({ error: `Cannot cancel order #${ord.orderNumber || id} because it is currently in "${ord.status}" status.` });
    }

    ord.status = 'CANCELLED';
    ord.cancelReason = reason || 'Customer requested cancellation prior to dispatch';
    ord.cancelledAt = new Date().toISOString();

    if (!ord.trackingHistory) ord.trackingHistory = [];
    ord.trackingHistory.push({
      status: 'CANCELLED',
      location: 'System Portal',
      timestamp: new Date().toISOString(),
      note: `Order cancelled. Reason: ${reason || 'User/Admin Cancellation'}. Stock restored.`
    });

    await restoreOrderStock(ord.items);

    if (isDbReady()) {
      try {
        await Order.findOneAndUpdate({ $or: [{ id }, { orderNumber: id }] }, {
          $set: {
            status: 'CANCELLED',
            cancelReason: ord.cancelReason,
            cancelledAt: ord.cancelledAt,
            trackingHistory: ord.trackingHistory
          }
        });
      } catch (e) {}
    }

    // Trigger Admin Notification & Audit Log
    try {
      const { memoryNotifications } = require('../store');
      const { Notification } = require('../models');
      const newNotif = {
        id: `notif-${Date.now()}`,
        recipientType: 'ADMIN',
        recipientId: 'admin',
        title: `Order Cancelled #${ord.orderNumber || id}`,
        message: `Order #${ord.orderNumber || id} was cancelled and item stock was restored to available inventory.`,
        type: 'ORDER_STATUS',
        isRead: false,
        link: '/admin/dashboard',
        createdAt: new Date().toISOString()
      };
      memoryNotifications.unshift(newNotif);
      if (isDbReady()) {
        try { await Notification.create(newNotif); } catch(e) {}
      }

      const { recordAuditLog } = require('./auditLogs');
      await recordAuditLog(`Order #${ord.orderNumber || id} cancelled and stock restored`, 'ORDER');
    } catch (auditErr) {}

    res.json({ success: true, message: 'Order cancelled successfully and stock restored.', order: ord });
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
    if (!ord && isDbReady()) {
      try {
        ord = await Order.findOne({ $or: [{ id }, { orderNumber: id }] });
      } catch (e) {}
    }

    if (!ord) {
      return res.status(404).json({ error: 'Order not found for return request.' });
    }

    ord.status = 'RETURN_REQUESTED';
    ord.returnReason = reason || 'Damaged or defective craft item';
    ord.returnPhotos = photos || [];
    ord.returnRequestedAt = new Date().toISOString();

    if (!ord.trackingHistory) ord.trackingHistory = [];
    ord.trackingHistory.push({
      status: 'RETURN_REQUESTED',
      location: 'Customer Portal Request',
      timestamp: new Date().toISOString(),
      note: `Return/Exchange Requested: ${reason || 'Defective/Damaged'}. Comments: ${comments || 'None'}`
    });

    if (isDbReady()) {
      try {
        await Order.findOneAndUpdate({ $or: [{ id }, { orderNumber: id }] }, {
          $set: {
            status: 'RETURN_REQUESTED',
            returnReason: ord.returnReason,
            returnPhotos: ord.returnPhotos,
            returnRequestedAt: ord.returnRequestedAt,
            trackingHistory: ord.trackingHistory
          }
        });
      } catch (e) {}
    }

    // Trigger Admin System Notification & Audit Log
    try {
      const { memoryNotifications } = require('../store');
      const { Notification } = require('../models');
      const newNotif = {
        id: `notif-${Date.now()}`,
        recipientType: 'ADMIN',
        recipientId: 'admin',
        title: `Return Requested for Order #${ord.orderNumber || id}`,
        message: `Reason: ${reason || 'Damaged/defective craft item'}. Comments: ${comments || 'None'}`,
        type: 'ORDER_STATUS',
        isRead: false,
        link: '/admin/dashboard',
        createdAt: new Date().toISOString()
      };
      memoryNotifications.unshift(newNotif);
      if (isDbReady()) {
        try { await Notification.create(newNotif); } catch(e) {}
      }

      const { recordAuditLog } = require('./auditLogs');
      await recordAuditLog(`Return requested for Order #${ord.orderNumber || id}: ${reason || 'Customer Request'}`, 'ORDER');
    } catch (auditErr) {}

    res.json({ success: true, message: 'Return request registered successfully', order: ord });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Order Status (Legacy Fallback & Direct Controls)
router.put('/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, courierName, trackingNumber } = req.body;

    let ord = memoryOrders.find(o => o.id === id || o.orderNumber === id);
    if (!ord && isDbReady()) {
      try {
        ord = await Order.findOne({ $or: [{ id }, { orderNumber: id }] });
      } catch (e) {}
    }

    if (ord) {
      if (status) ord.status = status;
      if (courierName) ord.courierName = courierName;
      if (trackingNumber) {
        ord.trackingNumber = trackingNumber;
        ord.awbTrackingNumber = trackingNumber;
      }
      if (!ord.trackingHistory) ord.trackingHistory = [];
      ord.trackingHistory.push({
        status: status || ord.status,
        location: 'Eclipsera Central Logistics',
        timestamp: new Date().toISOString(),
        note: `Order status updated to ${status || ord.status}`
      });
    }

    if (isDbReady()) {
      try {
        await Order.findOneAndUpdate({ $or: [{ id }, { orderNumber: id }] }, {
          $set: { 
            status, 
            courierName, 
            trackingNumber, 
            awbTrackingNumber: trackingNumber,
            ...(ord ? { trackingHistory: ord.trackingHistory } : {})
          }
        });
      } catch (e) {}
    }

    // Broadcast SSE Order Update
    try {
      const notificationsRoute = require('./notifications');
      if (notificationsRoute && typeof notificationsRoute.broadcastSSE === 'function') {
        notificationsRoute.broadcastSSE('ORDER_UPDATED', ord);
      }
    } catch (e) {}

    res.json({ success: true, data: ord, order: ord, message: 'Order status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
