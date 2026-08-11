const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Notification = require('../models/notificationModel');
const Razorpay = require('razorpay');
const { generateInvoicePDF } = require('../services/invoiceService');
const { sendOrderConfirmation } = require('../services/emailService');
const { recordAuditLog } = require('../services/auditService');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    totalPrice,
  } = req.body;

  // 1. Check if the order contains any items
  if (orderItems && orderItems.length === 0) {
    res.status(400); // 400 Bad Request
    throw new Error('No order items');
  } else {
    // 2. Instantiate a new order
    const order = new Order({
      orderItems,
      shippingAddress,
      totalPrice,
      user: req.user ? req.user._id : undefined,
    });

    // 3. Save the order to the database
    const createdOrder = await order.save();

    // 4. Asynchronously generate invoice and send email
    (async () => {
      try {
        const pdfBuffer = await generateInvoicePDF(createdOrder);
        await sendOrderConfirmation(createdOrder, pdfBuffer);
      } catch (err) {
        console.error('Background Invoice/Email Error:', err);
      }
    })();

    // 5. Return the successful creation status and the order data
    res.status(201).json(createdOrder);
  }
});

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getOrders = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || '';

  let query = {};
  if (search) {
    // Search by order ID or user name/email. Since we populate user, it's easier to search by order _id first
    // or we can search by order _id if it's a valid object ID.
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(search)) {
      query._id = search;
    } else {
      // Searching populated fields requires an aggregation or a 2-step query.
      // To keep it simple, search by shippingAddress.email or shippingAddress.name.
      query = {
        $or: [
          { 'shippingAddress.email': { $regex: search, $options: 'i' } },
          { 'shippingAddress.name': { $regex: search, $options: 'i' } }
        ]
      };
    }
  }

  const totalCount = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'id name email')
    .populate('orderItems.product', 'image')
    .skip(limit * (page - 1))
    .limit(limit)
    .sort({ createdAt: -1 });
  
  res.json({
    data: orders,
    page,
    totalPages: Math.ceil(totalCount / limit) || 1,
    totalCount
  });
});

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/mine
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('orderItems.product', 'image');
  res.json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'image');

  if (order) {
    if (order.user) {
      // Only allow admin or the user who created the order to view it
      if (req.user && (order.user._id.toString() === req.user._id.toString() || req.user.isAdmin)) {
        res.json(order);
      } else {
        res.status(401);
        throw new Error('Not authorized to view this order');
      }
    } else {
      // Guest order
      res.json(order);
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(order.totalPrice * 100), // amount in the smallest currency unit
      currency: "INR",
      receipt: order._id.toString(),
    };

    try {
      const razorpayOrder = await razorpay.orders.create(options);
      res.json(razorpayOrder);
    } catch (error) {
      res.status(500);
      throw new Error('Razorpay error: ' + error.message);
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.razorpay_payment_id,
      status: 'success',
      email_address: req.user ? req.user.email : order.shippingAddress.email,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.fulfillmentStatus = 'DELIVERED';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

/**
 * @desc    Update order fulfillment status (Admin)
 * @route   PUT /api/orders/:id/fulfillment
 * @access  Private/Admin
 */
const updateOrderFulfillment = asyncHandler(async (req, res) => {
  const { status, trackingNumber, note } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'id name email');

  if (order) {
    order.fulfillmentStatus = status || order.fulfillmentStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (note !== undefined) order.fulfillmentNote = note;

    if (status === 'DELIVERED') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    // Create a notification for the customer
    let notificationMsg = `Your order ${order._id} status is now ${status}.`;
    if (trackingNumber) {
      notificationMsg += ` Tracking Number: ${trackingNumber}.`;
    }
    if (note) {
      notificationMsg += ` Note: ${note}`;
    }

    await Notification.create({
      user: order.user._id,
      title: 'Order Status Update',
      message: notificationMsg,
      type: 'order'
    });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

/**
 * @desc    Download invoice PDF
 * @route   GET /api/orders/:id/invoice
 * @access  Private/Guest
 */
const downloadInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'image name');

  if (order) {
    if (order.user) {
      if (!req.user || (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin)) {
        res.status(401);
        throw new Error('Not authorized to view this invoice');
      }
    }
    
    try {
      const pdfBuffer = await generateInvoicePDF(order);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Invoice-EP-${order._id}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      res.status(500);
      throw new Error('Failed to generate invoice PDF');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

/**
 * @desc    Update multiple orders' fulfillment status (Admin)
 * @route   PUT /api/orders/bulk-fulfillment
 * @access  Private/Admin
 */
const bulkUpdateOrderStatuses = asyncHandler(async (req, res) => {
  const { orderIds, status, note } = req.body;

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    res.status(400);
    throw new Error('No order IDs provided for bulk update');
  }

  const orders = await Order.find({ _id: { $in: orderIds } }).populate('user', 'id name email');
  
  if (orders.length === 0) {
    res.status(404);
    throw new Error('No orders found');
  }

  const restoringStatuses = ['CANCELLED', 'RETURN_APPROVED', 'REFUNDED'];

  for (const order of orders) {
    const oldStatus = order.fulfillmentStatus || 'PENDING';
    order.fulfillmentStatus = status;
    
    if (status === 'DELIVERED') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    order.trackingHistory.push({
      status,
      note: note || '',
      date: Date.now()
    });

    // CRITICAL: Stock restoration logic
    if (restoringStatuses.includes(status) && !restoringStatuses.includes(oldStatus)) {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.countInStock += item.quantity;
          await product.save();
        }
      }
    }
    
    await order.save();
  }

  await recordAuditLog(`Bulk status update to ${status} for ${orders.length} orders`, 'ORDER');

  res.json({ message: `Successfully updated ${orders.length} orders`, updatedCount: orders.length });
});


module.exports = {
  addOrderItems,
  getOrders,
  getMyOrders,
  getOrderById,
  createRazorpayOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderFulfillment,
  downloadInvoice,
  bulkUpdateOrderStatuses,
};
