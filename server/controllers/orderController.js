const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
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
    paymentMethod,
    paymentReceipt,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new Error(`Product ${item.name} not found`);
      }
      if (product.countInStock < item.quantity && product.countInStock < item.qty) {
        const qty = item.qty || item.quantity;
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.countInStock} available, requested ${qty}.`);
      }
      // Decrement stock
      const qty = item.qty || item.quantity || 1;
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: -qty } },
        { session }
      );
    }

    const order = new Order({
      orderItems,
      shippingAddress,
      totalPrice,
      paymentMethod,
      paymentReceipt,
      user: req.user ? req.user._id : undefined,
    });

    const createdOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Asynchronously generate invoice and send email outside the transaction
    (async () => {
      try {
        const pdfBuffer = await generateInvoicePDF(createdOrder);
        await sendOrderConfirmation(createdOrder, pdfBuffer);
      } catch (err) {
        console.error('Background Invoice/Email Error:', err);
      }
    })();

    res.status(201).json(createdOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400);
    throw new Error(error.message);
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
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(search)) {
      query._id = search;
    } else {
      query = {
        $or: [
          { 'shippingAddress.email': { $regex: search, $options: 'i' } },
          { 'shippingAddress.name': { $regex: search, $options: 'i' } }
        ]
      };
    }
  }

  if (req.query.status) {
    query.fulfillmentStatus = req.query.status;
  }
  
  if (req.query.financialStatus) {
    query.financialStatus = req.query.financialStatus;
  }

  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) {
      const end = new Date(req.query.endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
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
      receipt: `receipt_order_${order._id}`
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
    order.financialStatus = 'PAID';
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.razorpay_payment_id,
      status: 'success',
      email_address: req.user ? req.user.email : order.shippingAddress.email,
    };

    const updatedOrder = await order.save();

    // Send admin alert asynchronously
    const { sendEmailJS } = require('../services/emailService');
    sendEmailJS({
      to_email: 'admin@eclipsera.com', // Replace with actual admin email if needed
      to_name: 'Admin',
      subject: `New Order Received! #${updatedOrder._id}`,
      message: `You have received a new order from ${updatedOrder.paymentResult.email_address} for a total of INR ${updatedOrder.totalPrice}. Please fulfill it as soon as possible.`,
    });

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

    // Send email to customer asynchronously
    const { sendEmailJS } = require('../services/emailService');
    const customerEmail = order.user?.email || order.shippingAddress?.email;
    const customerName = order.user?.name || order.shippingAddress?.name || 'Customer';
    
    if (customerEmail) {
      sendEmailJS({
        to_email: customerEmail,
        email: customerEmail,
        to_name: customerName,
        name: customerName,
        subject: `Order Status Update - Eclipsera #${order._id}`,
        message: notificationMsg,
      });
    }

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

/**
 * @desc    Verify manual payment (e.g. PhonePe)
 * @route   PUT /api/orders/:id/verify-payment
 * @access  Private/Admin
 */
const verifyManualPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isVerifiedByAdmin = true;
    order.isPaid = true;
    order.financialStatus = 'PAID';
    order.paidAt = Date.now();
    order.paymentResult = {
      id: 'MANUAL_VERIFICATION',
      status: 'COMPLETED',
      email_address: req.user.email,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

/**
 * @desc    Cancel order (Admin)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private/Admin
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'id name email');

  if (order) {
    if (order.isCancelled) {
      res.status(400);
      throw new Error('Order is already cancelled');
    }

    order.isCancelled = true;
    order.cancelReason = req.body.reason || 'No reason provided';
    
    if (order.isPaid || order.financialStatus === 'PAID') {
      order.financialStatus = 'REFUND_PENDING';
    }
    
    const oldStatus = order.fulfillmentStatus || 'PENDING';
    order.fulfillmentStatus = 'CANCELLED';
    order.trackingHistory.push({
      status: 'CANCELLED',
      note: req.body.reason || 'Cancelled by admin',
      date: Date.now()
    });

    const restoringStatuses = ['CANCELLED', 'RETURN_APPROVED', 'REFUNDED'];
    if (!restoringStatuses.includes(oldStatus)) {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.countInStock += item.quantity;
          await product.save();
        }
      }
    }

    const updatedOrder = await order.save();

    if (order.user) {
      await Notification.create({
        user: order.user._id,
        title: 'Order Cancelled',
        message: `Your order ${order._id} was cancelled. Reason: ${order.cancelReason}`,
        type: 'order'
      });
    }

    await recordAuditLog(`Order ${order._id} cancelled. Reason: ${order.cancelReason}`, 'ORDER');

    // Send email to customer asynchronously
    const { sendEmailJS } = require('../services/emailService');
    const customerEmail = order.user?.email || order.shippingAddress?.email;
    const customerName = order.user?.name || order.shippingAddress?.name || 'Customer';
    
    if (customerEmail) {
      let emailMessage = `Your order #${order._id} has been cancelled. Reason: ${order.cancelReason}`;
      
      if (order.paymentMethod === 'Cash On Delivery') {
        emailMessage = `We regret to inform you that we are unable to fulfill your Cash on Delivery order (#${order._id}) at this time. Your order has been declined. Reason: ${order.cancelReason}. If you wish to place the order again using a prepaid method, please visit our website.`;
      }
      
      sendEmailJS({
        to_email: customerEmail,
        email: customerEmail,
        to_name: customerName,
        name: customerName,
        subject: `Order Cancelled - Eclipsera #${order._id}`,
        message: emailMessage,
      });
    }

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

/**
 * @desc    Mark order as refunded (Admin)
 * @route   PUT /api/orders/:id/refund
 * @access  Private/Admin
 */
const markOrderRefunded = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.financialStatus !== 'REFUND_PENDING') {
      res.status(400);
      throw new Error('Order is not pending a refund');
    }
    
    order.financialStatus = 'REFUNDED';
    const updatedOrder = await order.save();
    
    const { recordAuditLog } = require('../utils/auditLog');
    await recordAuditLog(`Order ${order._id} marked as REFUNDED`, 'ORDER');
    
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
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
  verifyManualPayment,
  markOrderRefunded,
  cancelOrder,
};
