export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: 'perfume-oil' | 'combo';
  variants: {
    size: string;
    price: number;
    image_url?: string;
  }[];
  discount_percent?: number;
  top_notes?: string;
  middle_notes?: string;
  base_notes?: string;
  created_at?: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Amir Al Oud',
    description: 'A majestic blend of oriental oud with sweet balsamic notes.',
    image_url: '/product-attar.png',
    category: 'perfume-oil',
    variants: [
      { size: '3ml', price: 350 },
      { size: '6ml', price: 650 },
    ],
  },
  {
    id: '2',
    name: 'Black Oud',
    description: 'Intense and mysterious, a deep woody fragrance for a bold presence.',
    image_url: '/product-attar.png',
    category: 'perfume-oil',
    variants: [
      { size: '3ml', price: 400 },
      { size: '6ml', price: 750 },
    ],
  },
  {
    id: '3',
    name: 'White Oud',
    description: 'A clean, soft, and sophisticated take on the classic oud.',
    image_url: '/product-attar.png',
    category: 'perfume-oil',
    variants: [
      { size: '3ml', price: 380 },
      { size: '6ml', price: 700 },
    ],
  },
  {
    id: '4',
    name: 'Ehsas Al Arabia',
    description: 'Experience the essence of Arabia with this rich, floral-spicy blend.',
    image_url: '/product-attar.png',
    category: 'perfume-oil',
    variants: [
      { size: '3ml', price: 450 },
      { size: '6ml', price: 850 },
    ],
  },
  {
    id: '5',
    name: 'Joopy',
    description: 'Sweet, long-lasting, and vibrant fragrance for daily wear.',
    image_url: '/product-attar.png',
    category: 'perfume-oil',
    variants: [
      { size: '3ml', price: 300 },
      { size: '6ml', price: 550 },
    ],
  },
  {
    id: '6',
    name: 'Cool Water',
    description: 'Fresh, aquatic, and invigorating. Perfect for hot summer days.',
    image_url: '/product-attar.png',
    category: 'perfume-oil',
    variants: [
      { size: '3ml', price: 300 },
      { size: '6ml', price: 550 },
    ],
  },
  {
    id: '7',
    name: 'Dior Savage',
    description: 'Raw and noble, a fragrance that captures the spirit of the wild.',
    image_url: '/product-attar.png',
    category: 'perfume-oil',
    variants: [
      { size: '3ml', price: 500 },
      { size: '6ml', price: 950 },
    ],
  },
  {
    id: '8',
    name: 'One Million',
    description: 'Luxurious and provocative. The scent of success and gold.',
    image_url: '/product-attar.png',
    category: 'perfume-oil',
    variants: [
      { size: '3ml', price: 480 },
      { size: '6ml', price: 900 },
    ],
  },
  {
    id: '9',
    name: 'Vampire Blood',
    description: 'A dark, addictive, and deeply captivating floral-oriental scent.',
    image_url: '/product-attar.png',
    category: 'perfume-oil',
    variants: [
      { size: '3ml', price: 420 },
      { size: '6ml', price: 800 },
    ],
  },
  {
    id: '10',
    name: 'Gucci Flora',
    description: 'Delicate floral notes that embody femininity and grace.',
    image_url: '/product-attar.png',
    category: 'perfume-oil',
    variants: [
      { size: '3ml', price: 450 },
      { size: '6ml', price: 850 },
    ],
  },
  {
    id: '11',
    name: 'Good Girl',
    description: 'Sophisticated and playful. A daring mix of dark and light elements.',
    image_url: '/product-attar.png',
    category: 'perfume-oil',
    variants: [
      { size: '3ml', price: 450 },
      { size: '6ml', price: 850 },
    ],
  },
  {
    id: '12',
    name: 'Kacha Beli',
    description: 'Traditional jasmine essence, pure and blooming.',
    image_url: '/product-attar.png',
    category: 'perfume-oil',
    variants: [
      { size: '3ml', price: 250 },
      { size: '6ml', price: 450 },
    ],
  },
  // Combo Packs
  {
    id: '13',
    name: 'Oud Discovery Set',
    description: 'A curated selection of our finest Ouds (Amir, Black, and White).',
    image_url: '/product-attar.png',
    category: 'combo',
    variants: [{ size: 'set', price: 1200 }],
  },
  {
    id: '14',
    name: 'Royal Floral Trio',
    description: 'Experience the elegance of Gucci Flora, Good Girl, and Ehsas Al Arabia.',
    image_url: '/product-attar.png',
    category: 'combo',
    variants: [{ size: 'set', price: 1500 }],
  },
  {
    id: '15',
    name: 'Fresh Summer Duo',
    description: 'Cool Water and Joopy combined for the ultimate summer freshness.',
    image_url: '/product-attar.png',
    category: 'combo',
    variants: [{ size: 'set', price: 750 }],
  },
  {
    id: '16',
    name: 'Luxury Sampler Pack',
    description: 'Top 5 bestsellers in 3ml trial sizes. Perfect for gifting.',
    image_url: '/product-attar.png',
    category: 'combo',
    variants: [{ size: 'set', price: 1800 }],
  },
];
