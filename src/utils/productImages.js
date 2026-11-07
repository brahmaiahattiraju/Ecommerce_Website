/**
 * Comprehensive Product Image Fallback System
 * Provides guaranteed, high-resolution, category-matched product imagery.
 * Prevents broken image icons across all customer and admin views.
 */

export const CATEGORY_FALLBACKS = {
  // Mobiles & Smartphones
  'mobiles-smartphones': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format',
  'smartphones': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format',
  'mobiles': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format',
  
  // Electronics & Computing
  'electronics': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format',
  'computers': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format',
  'laptops': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format',
  
  // Wearables & Audio
  'wearables-audio': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format',
  'audio': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format',
  'wearables': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format',
  'headphones': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format',
  
  // Home & Living
  'home-living': 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=800&auto=format',
  'home': 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=800&auto=format',
  'living': 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=800&auto=format',
  
  // Fashion & Apparel
  'fashion-apparel': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format',
  'fashion': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format',
  'apparel': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format',
  
  // Fitness & Outdoors
  'fitness-outdoors': 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&auto=format',
  'fitness': 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&auto=format',
  'outdoors': 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&auto=format',

  // Default Universal Fallback
  'default': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format'
};

/**
 * Returns a high-definition, category-accurate fallback image based on product metadata.
 */
export function getProductFallback(product) {
  if (!product) return CATEGORY_FALLBACKS.default;

  const name = (product.name || '').toLowerCase();
  const slug = (product.category?.slug || product.category || '').toLowerCase();

  // Keyword-specific fine-tuning
  if (name.includes('quest') || name.includes('vr') || name.includes('mixed reality')) {
    return 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&auto=format';
  }
  if (name.includes('watch') || name.includes('chronograph')) {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format';
  }
  if (name.includes('chair') || name.includes('desk')) {
    return 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=800&auto=format';
  }
  if (name.includes('coffee') || name.includes('espresso') || name.includes('kettle')) {
    return 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format';
  }
  if (name.includes('camera') || name.includes('lens')) {
    return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format';
  }
  if (name.includes('laptop') || name.includes('macbook')) {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format';
  }
  if (name.includes('shoe') || name.includes('sneaker') || name.includes('running')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format';
  }
  if (name.includes('phone') || name.includes('galaxy') || name.includes('iphone') || name.includes('pixel')) {
    return 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format';
  }
  if (name.includes('headphone') || name.includes('airpods') || name.includes('earbuds') || name.includes('audio')) {
    return 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format';
  }

  // Slug matching
  for (const [key, url] of Object.entries(CATEGORY_FALLBACKS)) {
    if (slug.includes(key)) return url;
  }

  return CATEGORY_FALLBACKS.default;
}

/**
 * Image onError handler to seamlessly swap broken image with category-accurate photo.
 */
export function handleImageError(e, product) {
  const fallback = getProductFallback(product);
  if (e.currentTarget.src !== fallback) {
    e.currentTarget.src = fallback;
  }
}
