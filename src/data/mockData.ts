export interface ProductVariant {
  id: string;
  sku: string;
  colorName: string;
  colorHex: string;
  size?: string;
  additionalPrice: number;
  stockQuantity: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number;
  craftTechnique: string;
  originRegion: string;
  artisanName: string;
  artisanBio: string;
  artisanAvatar: string;
  material: string;
  careInstructions: string;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  silkMarkCertified: boolean; // Craft certified badge
  category: string;
  images: string[];
  variants: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  ctaText: string;
  categorySlug: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  colorName: string;
  size?: string;
  unitPrice: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  taxTotal: number;
  grandTotal: number;
  status: 'PENDING' | 'PAYMENT_CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: string;
  paymentId: string;
  courierName?: string;
  trackingNumber?: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  minSubtotal: number;
  description: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    title: 'Authentic Channapatna Toys & Wooden Artifacts',
    subtitle: 'Hand-lathed using organic vegetable dyes by master toy craftsmen of Karnataka.',
    tag: 'HANDMADE TOY COLLECTION',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'Explore Handmade Toys',
    categorySlug: 'handcrafted-toys'
  },
  {
    id: 'slide-2',
    title: 'Artisan Brass & Carved Teak Keychains',
    subtitle: 'Pocket-sized heirloom craftsmanship, hand-chiselled with intricate heritage motifs.',
    tag: 'ARTISAN KEYCHAINS',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'Shop Keychains',
    categorySlug: 'artisan-keychains'
  },
  {
    id: 'slide-3',
    title: 'Studio Pottery & Hand-Painted Custom Art',
    subtitle: 'Wheel-thrown clay ceramics and folk Madhubani paintings created by master artisans.',
    tag: 'STUDIO POTTERY & ART',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'Browse Pottery & Art',
    categorySlug: 'studio-pottery'
  }
];

export const CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Handmade Toys',
    slug: 'handcrafted-toys',
    description: 'Channapatna wooden toys, Kondapalli clay dolls, and eco-friendly wooden spinning tops.',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
    itemCount: 16
  },
  {
    id: 'cat-2',
    name: 'Artisan Keychains',
    slug: 'artisan-keychains',
    description: 'Solid brass engraved keychains, hand-carved teak charms, and leather key holders.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    itemCount: 14
  },
  {
    id: 'cat-3',
    name: 'Studio Pottery',
    slug: 'studio-pottery',
    description: 'Hand-thrown terracotta planters, ceramic mugs, glazed vases, and clay incense burners.',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    itemCount: 12
  },
  {
    id: 'cat-4',
    name: 'Custom Art & Woodcraft',
    slug: 'custom-art-woodcraft',
    description: 'Hand-painted Madhubani art plaques, carved teakwood boxes, and brass desk sculptures.',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
    itemCount: 18
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Channapatna Hand-Lathed Wooden Stacking Ring Toy',
    slug: 'channapatna-wooden-stacking-ring-toy',
    description: 'Handcrafted from soft ivory wood (Hale mara) and turned on a manual lathe using non-toxic natural lacquer and turmeric vegetable dyes. Safe for children and a heritage decor piece.',
    basePrice: 1250,
    compareAtPrice: 1600,
    craftTechnique: 'Channapatna Wood Lathe & Lacquer Work',
    originRegion: 'Channapatna, Karnataka',
    artisanName: 'Master Craftsman B. Ramappa',
    artisanBio: 'B. Ramappa is a 3rd generation GI-certified Channapatna toy craftsman with 32 years of woodturning expertise.',
    artisanAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    material: 'Natural Wrightia Tinctoria Wood & Organic Lac',
    careInstructions: 'Wipe gently with a dry cotton cloth. Keep away from excess moisture.',
    rating: 4.9,
    reviewsCount: 42,
    isFeatured: true,
    isBestSeller: true,
    silkMarkCertified: true,
    category: 'handcrafted-toys',
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=85'
    ],
    variants: [
      { id: 'v1-1', sku: 'ECL-TOY-CHN-RAI', colorName: 'Rainbow Harvest', colorHex: '#D4AF37', size: 'Standard (7 Rungs)', additionalPrice: 0, stockQuantity: 8 },
      { id: 'v1-2', sku: 'ECL-TOY-CHN-PAST', colorName: 'Pastel Earth', colorHex: '#9E4730', size: 'Standard (7 Rungs)', additionalPrice: 100, stockQuantity: 4 }
    ]
  },
  {
    id: 'prod-2',
    title: 'Hand-Carved Antique Brass Royal Peacock Keychain',
    slug: 'hand-carved-brass-peacock-keychain',
    description: 'Solid brass keychain hand-engraved with dancing peacock feathers and finished with a rich antique vintage patina. Features a heavy-duty brass screw-lock ring.',
    basePrice: 850,
    compareAtPrice: 1200,
    craftTechnique: 'Lost-Wax Brass Engraving & Hand Chiselling',
    originRegion: 'Moradabad, Uttar Pradesh',
    artisanName: 'Rameshwar Brass Guild',
    artisanBio: 'Rameshwar Ji leads a foundry preserving 18th-century royal miniature metalware chiselling.',
    artisanAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    material: '100% Solid Brass with Vintage Patina',
    careInstructions: 'Clean with soft cotton cloth or brasso polish if high shine is desired.',
    rating: 4.8,
    reviewsCount: 35,
    isFeatured: true,
    isBestSeller: true,
    silkMarkCertified: false,
    category: 'artisan-keychains',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85'
    ],
    variants: [
      { id: 'v2-1', sku: 'ECL-KEY-BRS-PEA', colorName: 'Antique Vintage Brass', colorHex: '#C5A059', size: 'Heavy Duty (4 inch)', additionalPrice: 0, stockQuantity: 12 }
    ]
  },
  {
    id: 'prod-3',
    title: 'Hand-Thrown Terracotta Studio Ceramic Planter Vessel',
    slug: 'hand-thrown-terracotta-studio-planter',
    description: 'Wheel-thrown natural river clay vessel fired at 1100°C with an earthy matte glaze finish. Designed for indoor succulents, bonsai, or standalone desk art.',
    basePrice: 2100,
    compareAtPrice: 2800,
    craftTechnique: 'Pottery Wheel Throwing & Wood Firing',
    originRegion: 'Khurja, Uttar Pradesh',
    artisanName: 'Anil Kumar Studio Pottery',
    artisanBio: 'Anil Kumar creates minimalist modern studio ceramics combining ancient clay techniques with contemporary Scandinavian silhouettes.',
    artisanAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    material: 'Natural Terracotta Clay & Matte Glaze',
    careInstructions: 'Hand wash with mild soapy water. Drain completely before planting.',
    rating: 5.0,
    reviewsCount: 28,
    isFeatured: true,
    isBestSeller: false,
    silkMarkCertified: true,
    category: 'studio-pottery',
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85'
    ],
    variants: [
      { id: 'v3-1', sku: 'ECL-POT-TER-OAK', colorName: 'Terracotta Rust', colorHex: '#9E4730', size: 'Medium (6 inch height)', additionalPrice: 0, stockQuantity: 5 },
      { id: 'v3-2', sku: 'ECL-POT-TER-SLT', colorName: 'Slate Charcoal', colorHex: '#161B22', size: 'Medium (6 inch height)', additionalPrice: 200, stockQuantity: 3 }
    ]
  },
  {
    id: 'prod-4',
    title: 'Madhubani Hand-Painted Teakwood Wall Art Plaque',
    slug: 'madhubani-hand-painted-teakwood-wall-art',
    description: 'Authentic Mithila Madhubani art hand-painted on solid teakwood using natural twig brushes and plant mineral pigments. Depicts the Tree of Life with birds.',
    basePrice: 3400,
    compareAtPrice: 4200,
    craftTechnique: 'Madhubani Folk Painting & Teak Carving',
    originRegion: 'Madhubani, Bihar',
    artisanName: 'Sita Devi Folk Artists Guild',
    artisanBio: 'Sita Devi leads a 12-woman artisan collective preserving ancestral Mithila wall art traditions.',
    artisanAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    material: 'Seasoned Burma Teak & Natural Pigments',
    careInstructions: 'Clean gently with a soft dry microfiber cloth. Keep away from direct moisture.',
    rating: 4.8,
    reviewsCount: 19,
    isFeatured: true,
    isBestSeller: true,
    silkMarkCertified: false,
    category: 'custom-art-woodcraft',
    images: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=85'
    ],
    variants: [
      { id: 'v4-1', sku: 'ECL-ART-MAD-TREE', colorName: 'Earth Mineral Gold', colorHex: '#C5A059', size: '12x8 inches', additionalPrice: 0, stockQuantity: 6 }
    ]
  },
  {
    id: 'prod-5',
    title: 'Hand-Carved Teakwood Jali Keepsake Jewelry Box',
    slug: 'teakwood-jali-keepsake-box',
    description: 'Solid teakwood hand-carved with intricate Mughal lattice (Jali) cutouts and lined with soft crimson velvet inside. Ideal for storing rings, keys, and desk treasures.',
    basePrice: 2800,
    compareAtPrice: 3500,
    craftTechnique: 'Saharanpur Lattice Woodcarving',
    originRegion: 'Saharanpur, Uttar Pradesh',
    artisanName: 'Ibrahim & Sons Woodcraft',
    artisanBio: 'Master carvers specializing in royal architectural lattice panels since 1962.',
    artisanAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    material: 'Seasoned Burma Teak & Crimson Velvet',
    careInstructions: 'Wipe with soft cotton cloth and polish with beeswax once a year.',
    rating: 4.7,
    reviewsCount: 22,
    isFeatured: false,
    isBestSeller: true,
    silkMarkCertified: false,
    category: 'custom-art-woodcraft',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=85'
    ],
    variants: [
      { id: 'v5-1', sku: 'ECL-WOD-JAL-BOX', colorName: 'Natural Walnut', colorHex: '#3D2314', size: '8x5x3 inches', additionalPrice: 0, stockQuantity: 9 }
    ]
  },
  {
    id: 'prod-6',
    title: 'Hand-Painted Kondapalli Wooden Dancing Doll Toy',
    slug: 'kondapalli-wooden-dancing-doll-toy',
    description: 'Traditional Telugu bobblehead dancing doll (Aatabommalu) carved from light Puniki wood and hand-painted with vibrant natural lac colors.',
    basePrice: 1450,
    compareAtPrice: 1900,
    craftTechnique: 'Kondapalli Wood Carving & Hand Painting',
    originRegion: 'Kondapalli, Andhra Pradesh',
    artisanName: 'Kondapalli Toy Artisans Co-op',
    artisanBio: 'Centuries-old artisan guild specializing in lightweight wooden figurines.',
    artisanAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    material: 'Puniki Soft Wood & Natural Paints',
    careInstructions: 'Keep dry. Dust gently with a soft feather duster.',
    rating: 4.9,
    reviewsCount: 16,
    isFeatured: false,
    isBestSeller: true,
    silkMarkCertified: false,
    category: 'handcrafted-toys',
    images: [
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=85'
    ],
    variants: [
      { id: 'v6-1', sku: 'ECL-TOY-KON-DOL', colorName: 'Royal Crimson Gold', colorHex: '#9E4730', size: '9 inch Height', additionalPrice: 0, stockQuantity: 7 }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_COUPONS: Coupon[] = [
  { code: 'CRAFT10', discountType: 'PERCENT', discountValue: 10, minSubtotal: 1000, description: '10% off on all handcrafted toys and art' },
  { code: 'HANDMADE300', discountType: 'FLAT', discountValue: 300, minSubtotal: 2000, description: '₹300 flat discount on orders above ₹2,000' },
  { code: 'ECLIPSERA20', discountType: 'PERCENT', discountValue: 20, minSubtotal: 5000, description: '20% off on artisan woodcrafts above ₹5,000' }
];
