const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

router.get('/sitemap.xml', async (req, res) => {
  try {
    // Determine the base URL
    // In production, you might want to force this to your actual domain
    const baseUrl = process.env.FRONTEND_URL || (req.protocol + '://' + req.get('host'));

    // Fetch all products to include in the sitemap
    // We only need the _id and updatedAt fields to save memory
    const products = await Product.find({}).select('_id updatedAt');

    // Define static pages
    const staticPages = [
      '',
      '/search',
      '/about',
      '/contact',
      '/faq',
      '/shipping-returns',
      '/product-care',
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach((page) => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Add product pages
    products.forEach((product) => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/product/${product._id}</loc>\n`;
      // Convert Date object to ISO string for the sitemap
      xml += `    <lastmod>${product.updatedAt.toISOString()}</lastmod>\n`;
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>0.9</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    // Send the XML response
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).end();
  }
});

module.exports = router;
