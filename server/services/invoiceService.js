const PDFDocument = require('pdfkit');

const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Branding / Header
      doc
        .fillColor('#d4af37') // accent-gold
        .fontSize(20)
        .text('ECLIPSERA.', 50, 57)
        .fillColor('#444444')
        .fontSize(10)
        .text('123 Artisan Way', 200, 50, { align: 'right' })
        .text('Mumbai, India 400001', 200, 65, { align: 'right' })
        .text('contact@eclipsera.com', 200, 80, { align: 'right' })
        .moveDown();

      const customerName = order.user?.name || order.shippingAddress?.name || 'Guest';
      const customerEmail = order.user?.email || order.shippingAddress?.email || '';

      doc
        .fillColor('#000000')
        .fontSize(20)
        .text('INVOICE', 50, 160);

      doc
        .fontSize(10)
        .text(`Invoice Number: ${order._id}`, 50, 200)
        .text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 215)
        .text(`Total Amount: INR ${order.totalPrice.toFixed(2)}`, 50, 230)
        
        // Customer Details on the right
        .text(customerName, 300, 200)
        .text(customerEmail, 300, 215)
        .text(`${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.country}`, 300, 230)
        .moveDown();

      // Table Header
      let i;
      const invoiceTableTop = 330;
      doc.font('Helvetica-Bold');
      doc.text('Item', 50, invoiceTableTop);
      doc.text('Unit Price', 280, invoiceTableTop, { width: 90, align: 'right' });
      doc.text('Quantity', 370, invoiceTableTop, { width: 90, align: 'right' });
      doc.text('Line Total', 400, invoiceTableTop, { width: 90, align: 'right' });
      doc.moveTo(50, invoiceTableTop + 15).lineTo(500, invoiceTableTop + 15).stroke();

      // Table Rows
      doc.font('Helvetica');
      let position = invoiceTableTop + 30;
      for (i = 0; i < order.orderItems.length; i++) {
        const item = order.orderItems[i];
        const lineTotal = item.price * item.quantity;
        // Keep name short so it doesn't overlap
        let shortName = item.name;
        if (shortName.length > 30) shortName = shortName.substring(0, 30) + '...';

        doc.text(shortName, 50, position);
        doc.text(`INR ${item.price.toFixed(2)}`, 280, position, { width: 90, align: 'right' });
        doc.text(item.quantity, 370, position, { width: 90, align: 'right' });
        doc.text(`INR ${lineTotal.toFixed(2)}`, 400, position, { width: 90, align: 'right' });
        position += 20;
      }

      doc.moveTo(50, position + 10).lineTo(500, position + 10).stroke();
      
      // Footer Totals
      doc.font('Helvetica-Bold');
      doc.text('Subtotal:', 300, position + 30, { align: 'right' });
      doc.text(`INR ${order.totalPrice.toFixed(2)}`, 400, position + 30, { width: 90, align: 'right' });
      doc.text('Tax & Shipping:', 300, position + 45, { align: 'right' });
      doc.text(`INR 0.00`, 400, position + 45, { width: 90, align: 'right' });
      doc.text('Total:', 300, position + 60, { align: 'right' });
      doc.text(`INR ${order.totalPrice.toFixed(2)}`, 400, position + 60, { width: 90, align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF };
