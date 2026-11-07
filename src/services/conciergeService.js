import { productAPI } from './api.js';

// Cached catalog for fast local reasoning
let cachedCatalog = null;

export async function fetchConciergeCatalog() {
  if (cachedCatalog && cachedCatalog.length > 0) {
    return cachedCatalog;
  }
  try {
    const res = await productAPI.list({ size: 150 });
    const items = res.content || [];
    cachedCatalog = items;
    return items;
  } catch (err) {
    console.error('Failed to pre-fetch concierge catalog', err);
    return [];
  }
}

/**
 * Extracts budget limits from natural language query
 * e.g., "under 15,000", "below 20k", "under ₹50000", "between 20000 and 40000"
 */
function extractBudget(text) {
  const normalized = text.toLowerCase().replace(/,/g, '');
  
  // Under / Below / Less than / Budget of / Max
  const underMatch = normalized.match(/(?:under|below|less\s+than|budget\s+of|within|max(?:\s+price)?)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k|thousand|l|lakh)?/i);
  if (underMatch) {
    let num = parseFloat(underMatch[1]);
    const unit = (underMatch[2] || '').toLowerCase();
    if (unit === 'k' || unit === 'thousand') num *= 1000;
    if (unit === 'l' || unit === 'lakh') num *= 100000;
    return { maxPrice: num };
  }

  // Pure "₹X" pattern
  const directMatch = normalized.match(/(?:₹|rs\.?)\s*(\d+)/i);
  if (directMatch) {
    return { maxPrice: parseFloat(directMatch[1]) };
  }

  return {};
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'best', 'good', 'some', 'any', 'that', 'this',
  'have', 'does', 'what', 'which', 'about', 'need', 'want', 'like', 'into', 'tell',
  'show', 'find', 'search', 'price', 'product', 'products', 'please', 'give', 'item', 'items', 'me'
]);

/**
 * Semantic & Product Name Reasoning Engine for Aura AI
 */
export async function getConciergeResponse(userMessage, conversationHistory = []) {
  let catalog = await fetchConciergeCatalog();
  const lowerMsg = userMessage.toLowerCase().trim();
  const budget = extractBudget(userMessage);

  // Check store policies only if message is clearly policy-related and NOT asking for a product
  const isPolicySearch = (lowerMsg.includes('shipping') || lowerMsg.includes('delivery speed') || lowerMsg.includes('track order')) ||
    (lowerMsg.includes('return policy') || lowerMsg.includes('refund policy') || lowerMsg.includes('warranty policy')) ||
    (lowerMsg.includes('payment method') || lowerMsg.includes('razorpay') || lowerMsg.includes('how to pay'));

  if (isPolicySearch) {
    if (lowerMsg.includes('shipping') || lowerMsg.includes('delivery') || lowerMsg.includes('track')) {
      return {
        reply: `At **AURA**, every acquisition is dispatched via **Complimentary Insured Courier** with guaranteed delivery across 10,000+ pin codes. Orders are dispatched within 24 hours in secure, tamper-proof luxury packaging with real-time transit tracking.`,
        products: [],
        followUps: ['How do I track my order?', 'What is your return policy?', 'Show me best sellers']
      };
    }
    if (lowerMsg.includes('return') || lowerMsg.includes('refund') || lowerMsg.includes('warranty')) {
      return {
        reply: `All wares purchased through AURA are backed by our **AURA ASSURED Guarantee**:
- **7-Day Frictionless Replacement**: If you are not completely satisfied, our concierge handles pickup at your door.
- **2-Year Comprehensive Warranty**: Covered against manufacturing defects and authorized service center support.
- **100% Genuine Origin**: Sourced directly from premier luxury technology houses.`,
        products: [],
        followUps: ['Are payments secure?', 'Find gifts under ₹15,000', 'Show me today deals']
      };
    }
    if (lowerMsg.includes('payment') || lowerMsg.includes('razorpay') || lowerMsg.includes('emi') || lowerMsg.includes('card')) {
      return {
        reply: `We partner with **Razorpay Secure** to support frictionless, enterprise-grade payment options:
- **Instant Cards**: Visa, Mastercard, RuPay & American Express with instant 10% banking discounts.
- **No-Cost EMI**: Available on select credit cards.
- **UPI & Instant Netbanking**: Google Pay, PhonePe, Paytm, and leading financial institutions.`,
        products: [],
        followUps: ['Show me flagship phones', 'Find audio under ₹10,000', 'Accessories for OnePlus']
      };
    }
  }

  // Clean the user message for product search
  const cleanSearchTerm = userMessage
    .replace(/^(can you )?(please )?(show me|find me|search for|look for|i want to buy|i want|i am looking for|recommend me|what is the price of|show|find|search|price of|details of)\s+/i, '')
    .replace(/[?!.]+$/, '')
    .trim();

  const cleanLower = cleanSearchTerm.toLowerCase();

  // If user searched a term, query backend to ensure live catalog freshness
  if (cleanLower.length >= 2) {
    try {
      const searchRes = await productAPI.list({ search: cleanSearchTerm, size: 25 });
      const liveItems = searchRes.content || [];
      if (liveItems.length > 0) {
        const existingIds = new Set(catalog.map((c) => c.id));
        const newItems = liveItems.filter((item) => !existingIds.has(item.id));
        catalog = [...newItems, ...catalog];
      }
    } catch (_) {}
  }

  // Extract query tokens (keeping short alphanumeric identifiers like '15', 's24', 'm3', 'tv', 'pro', 'max', 'air', 'fe', '5g')
  const queryTokens = cleanLower
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));

  // Determine explicit exploratory intents
  const isDeals = lowerMsg.includes('deal') || lowerMsg.includes('discount') || lowerMsg.includes('offer') || lowerMsg.includes('sale');
  const isBestSellers = lowerMsg.includes('best seller') || lowerMsg.includes('bestseller') || lowerMsg.includes('top rated') || lowerMsg.includes('popular');
  const isGift = lowerMsg.includes('gift') || lowerMsg.includes('present') || lowerMsg.includes('anniversary');

  // Score each product strictly requiring genuine word matches in name or category
  const scoredItems = catalog.map((product) => {
    let score = 0;
    let nameMatches = 0;
    let catMatches = 0;
    const name = (product.name || '').toLowerCase();
    const cat = (product.category?.name || product.category?.slug || '').toLowerCase();
    const price = product.price || 0;

    // Budget constraint check
    if (budget.maxPrice && price > budget.maxPrice) {
      return { product, score: -10000, nameMatches: 0, catMatches: 0 };
    }

    // Exact full name match
    if (cleanLower.length >= 2) {
      if (name === cleanLower) {
        score += 2000;
        nameMatches++;
      } else if (name.includes(cleanLower)) {
        score += 900;
        nameMatches++;
        if (name.startsWith(cleanLower)) {
          score += 300;
        }
      }
    }

    // Token-level word boundary matching
    if (queryTokens.length > 0) {
      queryTokens.forEach((token) => {
        const safeToken = escapeRegExp(token);
        const wholeWordRegex = new RegExp(`\\b${safeToken}\\b`, 'i');
        const prefixWordRegex = new RegExp(`\\b${safeToken}`, 'i');

        // Check product name with word boundary (NEVER matches substrings inside unrelated words like "bed" in "ribbed")
        if (wholeWordRegex.test(name)) {
          score += 250;
          nameMatches++;
          if (name.startsWith(token)) {
            score += 150;
          }
        } else if (prefixWordRegex.test(name)) {
          score += 150;
          nameMatches++;
        }

        // Check category name with word boundary
        if (wholeWordRegex.test(cat)) {
          score += 120;
          catMatches++;
        } else if (prefixWordRegex.test(cat)) {
          score += 60;
          catMatches++;
        }
      });

      // Bonus if all query tokens are present in the product name
      if (nameMatches >= queryTokens.length) {
        score += 500;
      }
    }

    // Rating tie-breaker
    score += (product.rating || 4.5) * 2;

    return { product, score, nameMatches, catMatches };
  });

  // A product is only a genuine search match if its NAME or CATEGORY matched the query tokens
  const validMatches = scoredItems
    .filter((item) => (item.nameMatches > 0 || item.catMatches > 0) && item.score > 50)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);

  let topMatches = [];
  let replyText = '';
  let followUps = [];

  // SCENARIO 1: Matching products found in the catalog
  if (validMatches.length > 0) {
    topMatches = validMatches.slice(0, 4);

    if (topMatches.length === 1) {
      const p = topMatches[0];
      replyText = `I located **${p.name}** in our catalog. Priced at **₹${p.price.toLocaleString('en-IN')}**, it is in stock with complimentary expedited shipping:`;
      followUps = [
        `View specs for ${p.name.slice(0, 22)}`,
        'Check current discount deals',
        'Compare with similar models'
      ];
    } else {
      replyText = `Based on your search for **"${cleanSearchTerm}"**, here are the matching products from our catalog:`;
      followUps = [
        `Details for ${topMatches[0].name.slice(0, 20)}`,
        `Compare ${topMatches[0].name.slice(0, 15)} vs ${topMatches[1]?.name.slice(0, 15) || 'alternatives'}`,
        'Filter under ₹50,000'
      ];
    }
  }
  // SCENARIO 2: Explicit general exploratory query (Deals / Best Sellers / Gifts) without a specific missing product
  else if (queryTokens.length === 0 || isDeals || isBestSellers || (isGift && cleanLower.length <= 4)) {
    if (isDeals) {
      topMatches = catalog
        .filter((p) => p.comparePrice && p.comparePrice > p.price)
        .sort((a, b) => ((b.comparePrice - b.price) / b.comparePrice) - ((a.comparePrice - a.price) / a.comparePrice))
        .slice(0, 4);
      replyText = `Here are the top discount deals currently live in our catalog:`;
      followUps = ['Show deals under ₹10,000', 'Flagship phone offers', 'Audio deals'];
    } else if (isGift) {
      const budgetStr = budget.maxPrice ? `under ₹${budget.maxPrice.toLocaleString('en-IN')}` : 'for tech connoisseurs';
      topMatches = catalog
        .filter((p) => !budget.maxPrice || p.price <= budget.maxPrice)
        .filter((p) => p.featured || (p.rating && p.rating >= 4.7))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);
      replyText = `Here are standout luxury gift selections **${budgetStr}**:`;
      followUps = ['Gifts under ₹10,000', 'Show smartwatches', 'Audio gift sets'];
    } else {
      // Best sellers
      topMatches = catalog
        .filter((p) => !budget.maxPrice || p.price <= budget.maxPrice)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);
      replyText = `Here are our highest-rated best sellers across all categories:`;
      followUps = ['Show deals today', 'Explore smartphones', 'Explore audio gear'];
    }
  }
  // SCENARIO 3: User searched for a specific product/item that is NOT in the catalog (e.g. "bed")
  // MUST NOT SHOW ANY PRODUCTS!
  else {
    topMatches = []; // EMPTY ARRAY - DO NOT SHOW ANY PRODUCTS!
    replyText = `I searched our catalog, but could not find any products matching **"${cleanSearchTerm}"**.\n\nTry searching for items in our available collections such as smartphones, headphones, smartwatches, laptops, or home gear.`;
    followUps = [
      'Show all categories',
      "Today's Best Deals",
      'Flagship Smartphones',
      'Noise-canceling headphones'
    ];
  }

  return {
    reply: replyText,
    products: topMatches,
    followUps
  };
}
