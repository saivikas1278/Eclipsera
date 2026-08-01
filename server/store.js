const mongoose = require('mongoose');

const initialProducts = [
  {
    id: 'prod-1',
    title: 'Channapatna Lacquered Toy Train & Engine',
    slug: 'channapatna-lacquered-toy-train',
    description: 'Hand-lathed wooden toy train made from Wrightia Tinctoria ivory wood and coated with non-toxic turmeric and indigo vegetable lacquers.',
    basePrice: 1450,
    compareAtPrice: 1800,
    craftTechnique: 'Channapatna Wood Lathe',
    originRegion: 'Channapatna, Karnataka',
    artisanName: 'B. Ramappa & Toy Guild',
    artisanBio: 'Master woodturning collective preserving 400-year GI craft traditions.',
    category: 'handcrafted-toys',
    material: 'Natural Ivory Wood',
    careInstructions: 'Keep dry, clean with soft cloth.',
    rating: 4.9,
    reviewsCount: 2,
    isFeatured: true,
    isBestSeller: false,
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1000&q=85'
    ],
    variants: [{
      id: 'v-prod-1',
      sku: 'ECL-PROD-1',
      colorName: 'Natural Gold Finish',
      colorHex: '#C5A059',
      additionalPrice: 0,
      stockQuantity: 8
    }],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    title: 'Royal Engraved Brass Peacock Keychain Set',
    slug: 'brass-peacock-keychain-set',
    description: 'Solid brass keychain hand-carved with traditional peacock motifs using lost-wax casting and hand-chiselling techniques.',
    basePrice: 850,
    compareAtPrice: 1200,
    craftTechnique: 'Lost-Wax Brass Chiselling',
    originRegion: 'Varanasi, Uttar Pradesh',
    artisanName: 'Rameshwar Ji & Metal Guild',
    artisanBio: 'National metalware awardee specializing in brass antiquing.',
    category: 'brass-keychains',
    material: 'Solid Antique Brass',
    careInstructions: 'Avoid chemicals, polish occasionally.',
    rating: 5.0,
    reviewsCount: 1,
    isFeatured: false,
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1000&q=85'
    ],
    variants: [{
      id: 'v-prod-2',
      sku: 'ECL-PROD-2',
      colorName: 'Natural Gold Finish',
      colorHex: '#C5A059',
      additionalPrice: 0,
      stockQuantity: 8
    }],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    title: 'Jaipur Blue Quartz Studio Terracotta Pot',
    slug: 'jaipur-blue-terracotta-pot',
    description: 'Wheel-thrown terracotta pot with quartz blue glazing and hand-painted floral motifs.',
    basePrice: 2400,
    compareAtPrice: 2900,
    craftTechnique: 'Studio Quartz Terracotta',
    originRegion: 'Jaipur, Rajasthan',
    artisanName: 'Devika Devi & Terracotta Guild',
    artisanBio: 'UNESCO heritage award winning studio potter.',
    category: 'studio-pottery',
    material: 'Glazed Quartz Pottery',
    careInstructions: 'Handle with care.',
    rating: 4.8,
    reviewsCount: 3,
    isFeatured: true,
    isBestSeller: false,
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=85'
    ],
    variants: [{
      id: 'v-prod-3',
      sku: 'ECL-PROD-3',
      colorName: 'Natural Gold Finish',
      colorHex: '#C5A059',
      additionalPrice: 0,
      stockQuantity: 8
    }],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    title: 'Saharanpur Carved Teakwood Keepsake Box',
    slug: 'saharanpur-carved-teakwood-box',
    description: 'Hand-carved solid teakwood jewelry and incense box featuring traditional floral jaali fretwork.',
    basePrice: 1950,
    compareAtPrice: 2450,
    craftTechnique: 'Teakwood Relief Jaali',
    originRegion: 'Saharanpur, Uttar Pradesh',
    artisanName: 'Abdul Khan & Wood Guild',
    artisanBio: 'Master woodcarver with 35 years of heritage craftsmanship.',
    category: 'custom-woodcraft',
    material: 'Premium Teakwood',
    careInstructions: 'Keep dry, polish occasionally.',
    rating: 4.9,
    reviewsCount: 1,
    isFeatured: false,
    isBestSeller: false,
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=85'
    ],
    variants: [{
      id: 'v-prod-4',
      sku: 'ECL-PROD-4',
      colorName: 'Natural Gold Finish',
      colorHex: '#C5A059',
      additionalPrice: 0,
      stockQuantity: 8
    }],
    createdAt: new Date().toISOString()
  }
];

const initialArtisans = [
  {
    id: 'artisan-1',
    name: 'Master B. Ramappa',
    story: 'Pioneer of GI-tagged Channapatna woodturning craft with over 32 years of experience creating non-toxic ivory wood artifacts.',
    yearsExperience: 32,
    region: 'Channapatna, Karnataka',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    craftSpecialty: 'Channapatna Wood Lathe',
    createdAt: new Date().toISOString()
  },
  {
    id: 'artisan-2',
    name: 'Rameshwar Ji',
    story: 'National Awardee metal artisan specializing in Mughal lost-wax brass casting and hand-chiselling.',
    yearsExperience: 28,
    region: 'Varanasi, Uttar Pradesh',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    craftSpecialty: 'Lost-Wax Brass Chiselling',
    createdAt: new Date().toISOString()
  },
  {
    id: 'artisan-3',
    name: 'Devika Devi',
    story: 'UNESCO Heritage recognized studio potter crafting Jaipur quartz terracotta with mineral glazes.',
    yearsExperience: 24,
    region: 'Jaipur, Rajasthan',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    craftSpecialty: 'Studio Quartz Terracotta',
    createdAt: new Date().toISOString()
  },
  {
    id: 'artisan-4',
    name: 'Master Abdul Khan',
    story: 'Master Saharanpur woodcarver dedicated to preserving intricate floral jaali fretwork and hand-carved teakwood artifacts.',
    yearsExperience: 35,
    region: 'Saharanpur, Uttar Pradesh',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    craftSpecialty: 'Teakwood Relief Jaali',
    createdAt: new Date().toISOString()
  }
];
const initialOrders = [
  {
    id: 'ord-1001',
    orderNumber: 'EP-10482',
    customerName: 'Siddharth Verma',
    customerEmail: 'siddharth@example.com',
    customerPhone: '+91 98765 43210',
    subtotal: 1450,
    discountTotal: 100,
    shippingFee: 0,
    taxTotal: 67.5,
    grandTotal: 1417.5,
    status: 'IN_TRANSIT',
    paymentMethod: 'RAZORPAY_UPI',
    paymentId: 'pay_982103948',
    courierName: 'BlueDart Luxury Express',
    trackingNumber: 'ECL-AWB-984210',
    awbTrackingNumber: 'ECL-AWB-984210',
    estimatedDeliveryDate: '2026-08-03',
    packingVideoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4',
    shippingAddress: {
      street: '42 Lavelle Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India'
    },
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        variantId: 'v-prod-1',
        title: 'Channapatna Lacquered Toy Train & Engine',
        colorName: 'Natural Gold Finish',
        unitPrice: 1450,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=85'
      }
    ],
    trackingHistory: [
      { status: 'PENDING_FULFILLMENT', location: 'Channapatna Guild Hub', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), note: 'Order confirmed & assigned to Master B. Ramappa' },
      { status: 'QUALITY_CHECK', location: 'Bengaluru Heritage Vault', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: 'Silk Mark & GI Tag verification passed cleanly' },
      { status: 'PACKED', location: 'Bengaluru Fulfillment Center', timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(), note: 'Sealed in velvet padded gift box with certificate' },
      { status: 'DISPATCHED', location: 'BlueDart Air Hub', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), note: 'Handed to courier team' },
      { status: 'IN_TRANSIT', location: 'Bengaluru Central Sorting Facility', timestamp: new Date().toISOString(), note: 'Out for regional transit' }
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'ord-1002',
    orderNumber: 'EP-10483',
    customerName: 'Ananya Roy',
    customerEmail: 'ananya@example.com',
    customerPhone: '+91 99887 76655',
    subtotal: 2400,
    discountTotal: 0,
    shippingFee: 0,
    taxTotal: 120,
    grandTotal: 2520,
    status: 'DELIVERED',
    paymentMethod: 'CREDIT_CARD',
    paymentId: 'pay_982103949',
    courierName: 'Delhivery Direct',
    trackingNumber: 'ECL-AWB-984211',
    awbTrackingNumber: 'ECL-AWB-984211',
    estimatedDeliveryDate: '2026-07-28',
    shippingAddress: {
      street: '18 Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016',
      country: 'India'
    },
    items: [
      {
        id: 'item-2',
        productId: 'prod-3',
        variantId: 'v-prod-3',
        title: 'Jaipur Blue Quartz Studio Terracotta Pot',
        colorName: 'Natural Gold Finish',
        unitPrice: 2400,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=85'
      }
    ],
    trackingHistory: [
      { status: 'PENDING_FULFILLMENT', location: 'Jaipur Pottery Guild', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), note: 'Order assigned to Devika Devi' },
      { status: 'QUALITY_CHECK', location: 'Jaipur QC Lab', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), note: 'Glaze inspection passed' },
      { status: 'DISPATCHED', location: 'Delhivery Air Hub', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), note: 'In transit to Kolkata' },
      { status: 'DELIVERED', location: 'Kolkata Customer Residence', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), note: 'Delivered & signed by Ananya Roy' }
    ],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

let memoryProducts = [...initialProducts].map(p => ({
  ...p,
  isSilkMarkCertified: true,
  giTagRegion: p.originRegion.split(',')[0] || 'Kashmir',
  craftType: p.craftTechnique.includes('Wood') ? 'Hand-carved' : p.craftTechnique.includes('Brass') ? 'Hand-carved' : 'Hand-loom',
  craftingHours: 120,
  artisan: initialArtisans.find(a => a.name.includes(p.artisanName.split(' ')[0])) || initialArtisans[0]
}));
const initialReviews = [
  {
    id: 'rev-101',
    productId: 'prod-1',
    userId: 'usr-1001',
    userName: 'Ananya Roy',
    patronName: 'Ananya Roy',
    title: 'Exquisite Lacquered Channapatna Craft',
    rating: 5,
    comment: 'The vegetable dye sheen on this wooden toy engine is smooth and safe for kids. Authentic craft certificate included!',
    images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=85'],
    photos: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=85'],
    isVerifiedPurchase: true,
    isVerified: true,
    status: 'APPROVED',
    adminReply: 'Thank you Ananya! We are proud to support Master B. Ramappa’s 25-year legacy of non-toxic lacquerware.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'rev-102',
    productId: 'prod-3',
    userId: 'usr-1002',
    userName: 'Siddharth Verma',
    patronName: 'Siddharth Verma',
    title: 'Stunning Jaipur Quartz Terracotta Glaze',
    rating: 5,
    comment: 'Hand-painted turquoise oxide glaze looks majestic under gallery lighting. Packaged in custom padded wooden box.',
    images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=85'],
    photos: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=85'],
    isVerifiedPurchase: true,
    isVerified: true,
    status: 'APPROVED',
    adminReply: 'Warm regards Siddharth! Devika Devi takes 45 hours to formulate the natural blue quartz glaze.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

const initialNotifications = [
  {
    id: 'notif-1',
    recipientType: 'USER',
    recipientId: 'ananya@eclipsera.com',
    title: 'Order Dispatched! 🚚',
    message: 'Your Channapatna Engine toy has been dispatched via BlueDart Express. AWB: ECL-AWB-984321.',
    type: 'ORDER_STATUS',
    isRead: false,
    link: '/track-order',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'notif-2',
    recipientType: 'ADMIN',
    recipientId: 'admin',
    title: 'Low Stock Alert: Jaipur Quartz Terracotta Vases',
    message: 'Inventory dropped to 2 units. Consider contacting Devika Devi for restock.',
    type: 'LOW_STOCK',
    isRead: false,
    link: '/admin/dashboard',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'notif-3',
    recipientType: 'ADMIN',
    recipientId: 'admin',
    title: 'New Review Moderation Required',
    message: 'Patron Ananya Roy submitted a review for Channapatna Toy Engine.',
    type: 'REVIEW',
    isRead: true,
    link: '/admin/dashboard',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

let memoryOrders = [...initialOrders];
let memoryArtisans = [...initialArtisans];
let memoryReviews = [...initialReviews];
let memoryNotifications = [...initialNotifications];
let memoryAuditLogs = [
  {
    id: 'log-1',
    action: 'System Initialized & Security Engine Active',
    category: 'SYSTEM',
    createdAt: new Date().toISOString()
  }
];

const isDbReady = () => mongoose.connection && mongoose.connection.readyState === 1;

module.exports = {
  isDbReady,
  memoryProducts,
  memoryOrders,
  memoryArtisans,
  memoryReviews,
  memoryNotifications,
  memoryAuditLogs
};
