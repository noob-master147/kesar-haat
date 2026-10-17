// Kesar Haat - Catalog Rendering & Filtering Logic

let allProducts = [];
let activeCategory = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', async () => {
  const data = await fetchMenu();
  if (!data || !data.products) return;
  allProducts = data.products;

  // Render initial products
  renderCatalog();

  // Setup search input listener
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderCatalog();
    });
  }

  // Setup category filter buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.category-btn').forEach(b => {
        b.classList.remove('bg-kesar-red', 'text-white', 'border-kesar-red');
        b.classList.add('bg-white', 'text-kesar-charcoal', 'border-kesar-gold/30');
      });

      btn.classList.add('bg-kesar-red', 'text-white', 'border-kesar-red');
      btn.classList.remove('bg-white', 'text-kesar-charcoal', 'border-kesar-gold/30');

      activeCategory = btn.getAttribute('data-category');
      renderCatalog();
    });
  });
});

function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  const countEl = document.getElementById('catalog-count');
  if (!grid) return;

  const filtered = allProducts.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery) || 
      (p.alternate_name && p.alternate_name.toLowerCase().includes(searchQuery)) ||
      p.description.toLowerCase().includes(searchQuery) ||
      (p.benefits && p.benefits.some(b => b.toLowerCase().includes(searchQuery)));
    return matchesCategory && matchesSearch;
  });

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} authentic Kashmiri items`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center space-y-4">
        <div class="w-16 h-16 mx-auto rounded-full bg-kesar-sand/60 text-kesar-crimson flex items-center justify-center text-2xl font-serif">
          ✦
        </div>
        <h3 class="font-serif text-2xl font-bold text-kesar-charcoal">No items match your search</h3>
        <p class="text-sm text-stone-500 max-w-sm mx-auto">Try clearing your search query or selecting another category.</p>
        <button onclick="document.getElementById('search-input').value=''; searchQuery=''; renderCatalog();" class="px-5 py-2 rounded-lg bg-kesar-red text-white text-xs font-semibold">
          Reset Filter
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const defaultPack = p.default_pack_size || '250 gm';
    const initialPrice = calculateItemPrice(p.price, defaultPack);

    return `
      <div class="bg-white border border-kesar-gold/30 rounded-2xl overflow-hidden card-hover-lift flex flex-col justify-between" id="card-${p.id}">
        <div>
          <!-- Product Image -->
          <div class="relative h-64 overflow-hidden bg-stone-100 group">
            <a href="product.html?id=${p.id}" class="block h-full w-full">
              <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500">
            </a>
            <span class="absolute top-3 left-3 bg-kesar-crimson/95 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              ${p.category}
            </span>
            <span class="absolute top-3 right-3 bg-white/90 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-stone-200">
              ${p.base_unit} base
            </span>
          </div>

          <!-- Product Details -->
          <div class="p-6">
            <span class="text-xs font-bold text-kesar-saffron tracking-wide block">${p.alternate_name || ''}</span>
            <h3 class="font-serif text-2xl font-bold text-kesar-charcoal mt-1 hover:text-kesar-red transition-colors">
              <a href="product.html?id=${p.id}">${p.name}</a>
            </h3>
            
            <p class="text-xs text-stone-600 mt-2.5 leading-relaxed line-clamp-3">${p.description}</p>

            <!-- Health Badges -->
            <div class="flex flex-wrap gap-1.5 mt-4">
              ${p.benefits.map(b => `
                <span class="text-[10px] bg-kesar-cream border border-kesar-gold/40 text-kesar-charcoal px-2 py-0.5 rounded-md font-medium">
                  ✦ ${b}
                </span>
              `).join('')}
            </div>

            <!-- Pack Size Selector Buttons -->
            <div class="mt-5 pt-4 border-t border-stone-100">
              <label class="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">Select Pack Size:</label>
              <div class="grid grid-cols-3 gap-2" id="pack-options-${p.id}">
                ${p.pack_sizes.map(size => `
                  <button 
                    type="button" 
                    onclick="handlePackSizeChange('${p.id}', '${size}')" 
                    class="pack-btn py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${size === defaultPack ? 'bg-kesar-red text-white border-kesar-red' : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-kesar-gold'}"
                    data-pack="${size}">
                    ${size}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Cart Action -->
        <div class="p-6 pt-0 mt-4 border-t border-kesar-gold/15 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-stone-400 uppercase tracking-wider block font-medium">Total Price</span>
            <span class="font-serif text-2xl font-bold text-kesar-crimson" id="price-display-${p.id}">
              ${formatCurrency(initialPrice)}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <a href="product.html?id=${p.id}" class="p-2.5 rounded-xl border border-stone-200 hover:border-kesar-gold text-stone-600 hover:text-kesar-red transition-colors" title="View Full Details">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </a>
            <button 
              id="add-btn-${p.id}" 
              onclick="handleAddProductToCart('${p.id}')" 
              class="px-4 py-2.5 rounded-xl bg-kesar-red hover:bg-kesar-crimson text-white text-xs font-bold tracking-wide transition-all flex items-center gap-2 shadow-sm hover:shadow">
              <i data-lucide="shopping-bag" class="w-4 h-4"></i>
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

// Track selected pack size per card
const selectedPackState = {};

function handlePackSizeChange(productId, packSize) {
  selectedPackState[productId] = packSize;
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  // Update button active state
  const container = document.getElementById(`pack-options-${productId}`);
  if (container) {
    container.querySelectorAll('.pack-btn').forEach(btn => {
      if (btn.getAttribute('data-pack') === packSize) {
        btn.classList.add('bg-kesar-red', 'text-white', 'border-kesar-red');
        btn.classList.remove('bg-stone-50', 'text-stone-700', 'border-stone-200');
      } else {
        btn.classList.remove('bg-kesar-red', 'text-white', 'border-kesar-red');
        btn.classList.add('bg-stone-50', 'text-stone-700', 'border-stone-200');
      }
    });
  }

  // Update price display
  const priceDisplay = document.getElementById(`price-display-${productId}`);
  if (priceDisplay) {
    const updatedPrice = calculateItemPrice(product.price, packSize);
    priceDisplay.textContent = formatCurrency(updatedPrice);
  }
}

function handleAddProductToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const chosenPack = selectedPackState[productId] || product.default_pack_size || '250 gm';
  addToCart(product, chosenPack, 1);
}
