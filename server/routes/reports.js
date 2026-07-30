const express = require('express');
const router = express.Router();
const { Order, Product } = require('../models');
const { verifyAdminToken } = require('../middleware');
const { isDbReady, memoryOrders, memoryProducts } = require('../store');

/**
 * 1. Sales & Orders Report CSV Exporter
 */
router.get('/sales', verifyAdminToken, async (req, res) => {
  try {
    let ordersList = memoryOrders;
    if (isDbReady()) {
      try {
        const dbOrders = await Order.find().sort({ createdAt: -1 });
        if (dbOrders && dbOrders.length) ordersList = dbOrders;
      } catch (e) {}
    }

    const headers = ['Order Number', 'Order ID', 'Customer Name', 'Customer Email', 'Customer Phone', 'Grand Total (INR)', 'Fulfillment Status', 'Payment Method', 'Courier Partner', 'AWB Tracking Number', 'Order Date'];
    
    const rows = ordersList.map(o => [
      `"${o.orderNumber || o.id}"`,
      `"${o.id}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerEmail || ''}"`,
      `"${o.customerPhone || ''}"`,
      o.grandTotal || 0,
      `"${o.status || 'PENDING'}"`,
      `"${o.paymentMethod || 'Prepaid'}"`,
      `"${o.courierName || 'BlueDart Luxury'}"`,
      `"${o.awbTrackingNumber || o.trackingNumber || ''}"`,
      `"${new Date(o.createdAt).toISOString().split('T')[0]}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="eclipsera_sales_orders_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2. Tax / GST Ledger CSV Exporter (18% GST Breakdown)
 */
router.get('/tax', verifyAdminToken, async (req, res) => {
  try {
    let ordersList = memoryOrders;
    if (isDbReady()) {
      try {
        const dbOrders = await Order.find().sort({ createdAt: -1 });
        if (dbOrders && dbOrders.length) ordersList = dbOrders;
      } catch (e) {}
    }

    const headers = ['Invoice / Order Number', 'Transaction Date', 'Customer Name', 'State / Place of Supply', 'Taxable Amount (INR)', 'CGST 9% (INR)', 'SGST 9% (INR)', 'Total GST 18% (INR)', 'Grand Total (INR)'];

    const rows = ordersList.map(o => {
      const grandTotal = o.grandTotal || 0;
      const subtotal = o.subtotal || Math.round(grandTotal / 1.18);
      const taxTotal = o.taxTotal || (grandTotal - subtotal);
      const cgst = Math.round(taxTotal / 2);
      const sgst = taxTotal - cgst;
      const state = o.shippingAddress?.state || 'Karnataka';

      return [
        `"${o.orderNumber || o.id}"`,
        `"${new Date(o.createdAt).toISOString().split('T')[0]}"`,
        `"${(o.customerName || '').replace(/"/g, '""')}"`,
        `"${state}"`,
        subtotal,
        cgst,
        sgst,
        taxTotal,
        grandTotal
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="eclipsera_gst_tax_ledger_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. Product Catalog & Inventory Snapshot CSV Exporter
 */
router.get('/inventory', verifyAdminToken, async (req, res) => {
  try {
    let productsList = memoryProducts;
    if (isDbReady()) {
      try {
        const dbProducts = await Product.find();
        if (dbProducts && dbProducts.length) productsList = dbProducts;
      } catch (e) {}
    }

    const headers = ['Product ID', 'SKU', 'Title', 'Category', 'Craft Technique', 'Origin Region', 'Master Artisan', 'Base Price (INR)', 'Available Stock Quantity', 'Inventory Status', 'Silk Mark Certified'];

    const rows = [];
    productsList.forEach(p => {
      const variant = (p.variants && p.variants[0]) || {};
      const stock = variant.stockQuantity !== undefined ? variant.stockQuantity : 10;
      const status = stock === 0 ? 'OUT_OF_STOCK' : stock < 3 ? 'CRITICAL_LOW' : stock < 5 ? 'WARNING' : 'HEALTHY';

      rows.push([
        `"${p.id}"`,
        `"${variant.sku || 'SKU-ECL'}"`,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${p.category || ''}"`,
        `"${p.craftTechnique || ''}"`,
        `"${p.originRegion || ''}"`,
        `"${p.artisanName || ''}"`,
        p.basePrice || 0,
        stock,
        `"${status}"`,
        `"${p.isSilkMarkCertified !== false ? 'YES' : 'NO'}"`
      ]);
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="eclipsera_inventory_snapshot_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
