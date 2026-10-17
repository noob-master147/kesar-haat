// Kesar Haat - Central Store & Cart Management

const STORE_CONFIG = {
  phone: '919586119191', // Merchant WhatsApp contact
  currencySymbol: '₹',
  storageKey: 'kesar_haat_cart'
};

// Fallback products data for seamless offline / file:// protocol execution
const FALLBACK_MENU = {
  brand: {
    name: "Kesar Haat",
    subtitle: "Bazaar-e-Koshur",
    english_translation: "Marketplace of Kashmir",
    tagline: "Authentic. Pure. From the Valley to Your Home.",
    banner: "assets/banner.jpeg",
    cover: "assets/cover.jpeg",
    trust_badges: [
      "Naturally Sourced",
      "Authentic Kashmiri Produce",
      "Tradition You Can Trust",
      "Pure Goodness For Your Family"
    ]
  },
  products: [
    {
      id: "kashmiri-kagzi-walnuts",
      name: "Kashmiri Kagzi Walnuts",
      alternate_name: "Kagzi Akhroot",
      category: "Dry Fruits",
      image: "assets/wallnut.jpeg",
      description: "Premium Kashmiri Kagzi walnuts with thin shell, rich taste and high nutritional value. Naturally sourced from the orchards of Kashmir.",
      price: 1200,
      currency: "INR",
      currency_symbol: "₹",
      base_unit: "250 gm",
      formatted_price: "₹ 1,200 / 250 gm",
      pack_sizes: ["250 gm", "500 gm", "1 kg"],
      default_pack_size: "250 gm",
      default_quantity: 1,
      benefits: ["Rich in Omega-3", "Supports Heart Health", "Good for Brain Function"]
    },
    {
      id: "kashmiri-kagzi-almonds",
      name: "Kashmiri Kagzi Almonds",
      alternate_name: "Kagzi Badaam",
      category: "Dry Fruits",
      image: "assets/almond.jpeg",
      description: "Finest Kashmiri Kagzi almonds naturally grown in the valley. Known for their delicate crunch, rich flavour and superior quality.",
      price: 1500,
      currency: "INR",
      currency_symbol: "₹",
      base_unit: "250 gm",
      formatted_price: "₹ 1,500 / 250 gm",
      pack_sizes: ["250 gm", "500 gm", "1 kg"],
      default_pack_size: "250 gm",
      default_quantity: 1,
      benefits: ["Rich in Protein", "Supports Heart Health", "Boosts Immunity"]
    },
    {
      id: "kashmiri-rajma",
      name: "Kashmiri Rajma",
      alternate_name: "Kashmiri Kidney Beans",
      category: "Pulses & Grains",
      image: "assets/rajma.jpeg",
      description: "Authentic Kashmiri Rajma with rich texture, natural taste and superior quality. A wholesome addition to your everyday meals.",
      price: 400,
      currency: "INR",
      currency_symbol: "₹",
      base_unit: "250 gm",
      formatted_price: "₹ 400 / 250 gm",
      pack_sizes: ["250 gm", "500 gm", "1 kg"],
      default_pack_size: "250 gm",
      default_quantity: 1,
      benefits: ["High in Protein", "Good for Heart Health", "Rich in Fibre"]
    },
    {
      id: "kashmiri-sauth-masala",
      name: "Kashmiri Sauth Masala (Sauth Powder)",
      alternate_name: "Kashmiri Dry Ginger Powder (Soth)",
      category: "Spices",
      image: "assets/ginger.jpeg",
      description: "Pure Kashmiri Sauth (dry ginger) powder made from high quality sun-dried ginger roots. Aromatic, warm and full of natural goodness.",
      price: 350,
      currency: "INR",
      currency_symbol: "₹",
      base_unit: "250 gm",
      formatted_price: "₹ 350 / 250 gm",
      pack_sizes: ["250 gm", "500 gm", "1 kg"],
      default_pack_size: "250 gm",
      default_quantity: 1,
      benefits: ["Aids Digestion", "Boosts Immunity", "Natural Warmth"]
    },
    {
      id: "kashmiri-red-chilli-powder",
      name: "Kashmiri Red Chilli Powder",
      alternate_name: "Kashmiri Lal Mirch",
      category: "Spices",
      image: "assets/chili.jpeg",
      description: "Authentic Kashmiri Lal Mirch powder known for its vibrant red colour, mild heat and rich aroma. Adds natural colour and flavour to your dishes.",
      price: 500,
      currency: "INR",
      currency_symbol: "₹",
      base_unit: "250 gm",
      formatted_price: "₹ 500 / 250 gm",
      pack_sizes: ["250 gm", "500 gm", "1 kg"],
      default_pack_size: "250 gm",
      default_quantity: 1,
      benefits: ["Natural Colour", "Mild Heat Rich Flavour", "100% Natural"]
    },
    {
      id: "kashmiri-saunf-powder",
      name: "Kashmiri Saunf Powder",
      alternate_name: "Kashmiri Badyan",
      category: "Spices",
      image: "assets/sauf.jpeg",
      description: "Finely ground Kashmiri Badyan (Saunf) with a sweet, refreshing aroma and distinct flavour. Perfect for cooking, beverages and digestive use.",
      price: 300,
      currency: "INR",
      currency_symbol: "₹",
      base_unit: "250 gm",
      formatted_price: "₹ 300 / 250 gm",
      pack_sizes: ["250 gm", "500 gm", "1 kg"],
      default_pack_size: "250 gm",
      default_quantity: 1,
      benefits: ["Aids Digestion", "Freshens Breath", "Natural Coolant"]
    }
  ]
};

let cachedMenu = null;

// Multiplier mapping for pack sizes relative to 250gm base unit
function getPackMultiplier(packSize) {
  if (packSize === '500 gm') return 2;
  if (packSize === '1 kg') return 4;
  return 1;
}

// Calculate price for product and pack size
function calculateItemPrice(basePrice, packSize) {
  return basePrice * getPackMultiplier(packSize);
}

// Format currency
function formatCurrency(amount) {
  return '₹ ' + Number(amount).toLocaleString('en-IN');
}

// Fetch menu data with graceful fallback
async function fetchMenu() {
  if (cachedMenu) return cachedMenu;
  try {
    const res = await fetch('menu.json');
    if (!res.ok) throw new Error('Network response not ok');
    cachedMenu = await res.json();
  } catch (err) {
    console.warn('Using embedded menu fallback:', err);
    cachedMenu = FALLBACK_MENU;
  }
  return cachedMenu;
}

// Cart State helpers
function getCart() {
  try {
    const raw = localStorage.getItem(STORE_CONFIG.storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read cart from localStorage', e);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(STORE_CONFIG.storageKey, JSON.stringify(cart));
    updateCartBadges();
  } catch (e) {
    console.error('Failed to save cart to localStorage', e);
  }
}

function addToCart(product, packSize = '250 gm', quantity = 1) {
  const cart = getCart();
  const unitPrice = calculateItemPrice(product.price, packSize);
  const cartItemId = `${product.id}_${packSize.replace(/\s+/g, '')}`;

  const existingIndex = cart.findIndex(item => item.cartItemId === cartItemId);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += Number(quantity);
  } else {
    cart.push({
      cartItemId,
      id: product.id,
      name: product.name,
      alternateName: product.alternate_name,
      image: product.image,
      packSize: packSize,
      unitPrice: unitPrice,
      quantity: Number(quantity)
    });
  }

  saveCart(cart);
  showToast(`Added ${product.name} (${packSize}) to Cart!`);
}

function updateCartQuantity(cartItemId, delta) {
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
  if (itemIndex === -1) return;

  cart[itemIndex].quantity += delta;
  if (cart[itemIndex].quantity <= 0) {
    cart.splice(itemIndex, 1);
  }

  saveCart(cart);
}

function removeFromCart(cartItemId) {
  let cart = getCart();
  cart = cart.filter(item => item.cartItemId !== cartItemId);
  saveCart(cart);
  showToast('Item removed from Cart', 'info');
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
}

function updateCartBadges() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}

// Sleek Toast notification
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgClass = type === 'info' ? 'bg-[#1F1D1A] text-[#FAF7F2]' : 'bg-[#8B1E1E] text-white';
  toast.className = `${bgClass} border border-[#C59B27]/40 shadow-xl px-5 py-3 rounded-xl flex items-center gap-3 text-sm font-medium toast-enter pointer-events-auto`;
  
  toast.innerHTML = `
    <span class="text-[#E6CA65] text-lg font-bold">✦</span>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 400);
  }, 2600);
}

// Generate formatted WhatsApp checkout URL
function generateWhatsAppOrderUrl(customerDetails = {}) {
  const cart = getCart();
  if (cart.length === 0) return null;

  let text = `*New Order Inquiry — Kesar Haat (Bazaar-e-Koshur)*\n\n`;
  text += `*Order Items:*\n`;

  cart.forEach((item, index) => {
    text += `${index + 1}. *${item.name}* (${item.packSize})\n`;
    text += `   Qty: ${item.quantity} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.unitPrice * item.quantity)}\n`;
  });

  const total = getCartTotal();
  text += `\n*Cart Total:* ${formatCurrency(total)}\n`;

  if (customerDetails.name) {
    text += `\n*Customer Details:*\n`;
    text += `• Name: ${customerDetails.name}\n`;
    text += `• Phone: ${customerDetails.phone || 'Provided via WhatsApp'}\n`;
    if (customerDetails.address) {
      text += `• Delivery Address: ${customerDetails.address}\n`;
    }
    if (customerDetails.city) {
      text += `• City / Pincode: ${customerDetails.city} - ${customerDetails.pincode || ''}\n`;
    }
    if (customerDetails.notes) {
      text += `• Special Instructions: ${customerDetails.notes}\n`;
    }
  }

  text += `\nPlease confirm product availability and payment details. Thank you!`;

  return `https://wa.me/${STORE_CONFIG.phone}?text=${encodeURIComponent(text)}`;
}

// Initialize badges on load
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadges();
});
