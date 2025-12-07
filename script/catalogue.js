document.addEventListener('DOMContentLoaded', () => {
  const shopContainer = document.getElementById('shop-container');
  const SHOP_URL = "../script/catalogue.json";

  // État du panier
  let cart = JSON.parse(localStorage.getItem('speedfix_cart')) || [];

  // --- 1. CHARGEMENT DU CATALOGUE ---
  async function loadShop() {
    if (!shopContainer) return;

    try {
      const res = await fetch(SHOP_URL);
      if (!res.ok) throw new Error("Erreur HTTP");
      const data = await res.json();
      renderShop(data);
    } catch (e) {
      console.error(e);
      shopContainer.innerHTML = '<div class="text-center text-red-400 py-10">Oups ! Impossible de charger les produits.</div>';
    }
  }

  function renderShop(data) {
    shopContainer.innerHTML = '';

    data.categories.forEach(category => {
      // Titre de catégorie
      const catHeader = document.createElement('div');
      catHeader.className = "mb-8 mt-12 first:mt-0";
      catHeader.innerHTML = `
          <h3 class="text-2xl font-display font-bold text-white pl-4 border-l-4 border-primary flex items-center gap-3">
            ${category.title}
          </h3>
        `;
      shopContainer.appendChild(catHeader);

      // Grille de produits
      const grid = document.createElement('div');
      grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

      category.products.forEach(product => {
        // Nettoyage du prix pour stockage (15€ -> 15)
        const rawPrice = parseInt(product.price.replace('€', '').trim());

        const card = document.createElement('div');
        card.className = "group flex flex-col bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5";

        card.innerHTML = `
            <div class="h-52 bg-gradient-to-b from-white/5 to-transparent p-6 flex items-center justify-center relative">
              <img loading="lazy" src="${product.image}" alt="${product.name}" class="h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
              <div class="absolute top-3 right-3 bg-black/60 backdrop-blur px-3 py-1 rounded-lg border border-white/10 text-sm font-bold text-white">
                ${product.price}
              </div>
            </div>
            
            <div class="p-5 flex flex-col flex-grow">
              <h4 class="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">${product.name}</h4>
              <p class="text-xs text-white/50 mb-6 flex-grow leading-relaxed line-clamp-2">${product.description}</p>
              
              <button onclick="addToCart('${product.name}', ${rawPrice}, '${product.image}')" 
                class="w-full py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2">
                <span>Ajouter</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              </button>
            </div>
          `;
        grid.appendChild(card);
      });

      shopContainer.appendChild(grid);
    });


    updateCartUI();
  }

  // ---  PANIER ---


  window.addToCart = function(name, price, image) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
      existingItem.qty += 1;
      showToast(`${name} : quantité +1`, 'success');
    } else {
      cart.push({ name, price, image, qty: 1 });
      showToast(`${name} ajouté au panier !`, 'success');
    }
  
    saveCart();
    updateCartUI();
  };

  window.updateQty = function(index, change) {
    if (cart[index]) {
      cart[index].qty += change;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
      saveCart();
      renderCartItems();
      updateCartUI();
    }
  };

  window.removeItem = function (index) {
    cart.splice(index, 1);
    saveCart();
    renderCartItems();
    updateCartUI();
  };

  function saveCart() {
    localStorage.setItem('speedfix_cart', JSON.stringify(cart));
  }

  // --- MODALE ---

  function updateCartUI() {
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);


    const fabCount = document.getElementById('fab-cart-count');
    const headerCount = document.getElementById('header-cart-count');
    const cartFab = document.getElementById('cart-fab');

    if (fabCount) fabCount.textContent = totalQty;
    if (headerCount) {
      headerCount.textContent = totalQty;
      headerCount.style.opacity = totalQty > 0 ? '1' : '0';
    }


    if (totalQty > 0) {
      cartFab.classList.remove('translate-y-20', 'opacity-0');
    } else {
      cartFab.classList.add('translate-y-20', 'opacity-0');
    }


    const totalEl = document.getElementById('cart-total-price');
    if (totalEl) totalEl.textContent = totalPrice + ' €';


    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.disabled = totalQty === 0;
  }

  window.openCartModal = function () {
    const modal = document.getElementById('cart-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const panel = document.getElementById('modal-panel');

    renderCartItems();

    modal.classList.remove('hidden');

    setTimeout(() => {
      backdrop.classList.remove('opacity-0');
      panel.classList.remove('translate-x-full');
    }, 10);
  };

  window.closeCartModal = function () {
    const modal = document.getElementById('cart-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const panel = document.getElementById('modal-panel');

    backdrop.classList.add('opacity-0');
    panel.classList.add('translate-x-full');

    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300); //  transition (300ms)
  };

  function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    container.innerHTML = '';

    if (cart.length === 0) {
      container.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-white/30 space-y-4">
            <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            <p>Votre panier est vide</p>
          </div>
        `;
      return;
    }

    cart.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = "flex gap-4 mb-6 bg-white/5 p-3 rounded-xl border border-white/5 items-center";

      itemEl.innerHTML = `
          <div class="w-16 h-16 bg-white rounded-lg flex-shrink-0 p-1">
            <img loading="lazy" src="${item.image}" class="w-full h-full object-contain">
          </div>
          
          <div class="flex-grow min-w-0">
            <h5 class="text-sm font-bold text-white truncate">${item.name}</h5>
            <p class="text-xs text-primary font-bold">${item.price} €</p>
          </div>
          
          <div class="flex items-center gap-3 bg-black/40 rounded-lg px-2 py-1 border border-white/10">
            <button onclick="updateQty(${index}, -1)" class="text-white/50 hover:text-white px-1">-</button>
            <span class="text-xs font-mono w-4 text-center">${item.qty}</span>
            <button onclick="updateQty(${index}, 1)" class="text-white/50 hover:text-white px-1">+</button>
          </div>
  
          <button onclick="removeItem(${index})" class="text-red-500/50 hover:text-red-500 p-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        `;
      container.appendChild(itemEl);
    });
  }

  // --- 4. CHECKOUT  ---
  window.confirmOrder = function () {
    if (cart.length === 0) return;

    // On sauvegarde 
    saveCart();

    // Redirection vers le formulaire
    // On laisse un "Post-it" pour la page suivante
    localStorage.setItem('show_cart_toast', 'true');
    window.location.href = '../index.html#contact';
  };
  // Init
  loadShop();
});