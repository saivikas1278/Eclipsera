const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/orderController');
const { protect, admin, optionalProtect } = require('../middleware/authMiddleware');

router.route('/')
  .post(optionalProtect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/mine').get(protect, getMyOrders);
router.route('/bulk-fulfillment').put(protect, admin, bulkUpdateOrderStatuses);
router.route('/:id').get(optionalProtect, getOrderById);
router.route('/:id/invoice').get(optionalProtect, downloadInvoice);
router.route('/:id/razorpay').post(optionalProtect, createRazorpayOrder);
router.put('/:id/pay', optionalProtect, updateOrderToPaid);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);
router.put('/:id/fulfillment', protect, admin, updateOrderFulfillment);

module.exports = router;
