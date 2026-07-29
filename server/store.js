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

let memoryProducts = [...initialProducts];
let memoryOrders = [];

const isDbReady = () => mongoose.connection && mongoose.connection.readyState === 1;

module.exports = {
  isDbReady,
  memoryProducts,
  memoryOrders
};
