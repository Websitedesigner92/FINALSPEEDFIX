// --- FONCTION TOAST (Notifications) ---
window.showToast = function (message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  let bgColors = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  let icon = type === 'success' ? '✅' : '⚠️';
  toast.className = `${bgColors} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transform translate-x-full transition-transform duration-300 pointer-events-auto min-w-[300px] z-[90] mb-3`;
  toast.innerHTML = `<span class="text-xl">${icon}</span><p class="font-bold text-sm">${message}</p>`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.remove('translate-x-full'));

  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 2000);
};


// --- GESTION DU PANIER DANS LE FORMULAIRE ---
function updateFormCart() {
    const cart = JSON.parse(sessionStorage.getItem('speedfix_cart')) || [];
    const accessoriesField = document.getElementById('contact-accessories');
    let summaryVisual = document.getElementById('cart-summary-visual');
    let hiddenInput = document.querySelector('input[name="commande_json"]');

    // Mise à jour du total dans le panneau catalogue s'il est ouvert
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const panelTotal = document.getElementById('panel-total');
    if(panelTotal) panelTotal.textContent = total + "€";

    // CAS 1 : PANIER VIDE
    if (cart.length === 0) {
        // On supprime le bloc visuel "Résumé"
        if (summaryVisual) summaryVisual.remove();
        // On supprime le champ caché technique
        if (hiddenInput) hiddenInput.remove();
        
        // On réaffiche le champ texte normal... ET ON LE VIDE ! 
        if (accessoriesField) {
            accessoriesField.style.display = 'block';
            accessoriesField.value = ''; // <--- CORRECTION ICI
            accessoriesField.placeholder = "Ajoutez les accessoires...";
        }
        return;
    }

    // CAS 2 : PANIER REMPLI
    // Si le bloc visuel n'existe pas encore, on le crée
    if (!summaryVisual && accessoriesField) {
        summaryVisual = document.createElement('div');
        summaryVisual.id = "cart-summary-visual";
        summaryVisual.className = "mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-sm";
        accessoriesField.parentNode.insertBefore(summaryVisual, accessoriesField);
    }

    // Génération de la liste HTML
    let itemsHtml = cart.map(item => `
        <div class="flex justify-between items-center text-sm py-1 border-b border-white/5 last:border-0">
            <span class="text-white/80"><span class="text-primary font-bold">${item.qty}x</span> ${item.name}</span>
            <span class="font-mono text-white/60">${item.price * item.qty}€</span>
        </div>
    `).join('');

    // Mise à jour du contenu visuel
    if (summaryVisual) {
        summaryVisual.innerHTML = `
            <h4 class="text-primary font-bold text-[11px] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <span>🛍️</span> Résumé de la commande
            </h4>
            <div class="space-y-1 mb-3">
                ${itemsHtml}
            </div>
            <div class="flex justify-between items-center pt-3 border-t border-white/10">
                <span class="text-xs text-white/50 uppercase tracking-wider">Total estimé</span>
                <span class="text-xl font-bold text-white">${total}€</span>
            </div>
        `;
    }

    // On cache le champ texte et on met à jour les données cachées pour l'envoi mail
    if (accessoriesField) {
        accessoriesField.style.display = 'none';
        accessoriesField.value = "COMMANDE : " + JSON.stringify(cart);
    }

    if (!hiddenInput && accessoriesField) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'commande_json';
        accessoriesField.parentNode.appendChild(hiddenInput);
    }
    if (hiddenInput) hiddenInput.value = JSON.stringify(cart);
}



// --- CHARGEMENT DU DOM ---
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  updateFormCart();

  if (contactForm) {
    const inputs = contactForm.querySelectorAll('input:not([type="hidden"]), textarea');
    inputs.forEach(input => {
      if (input.id === 'captcha-answer') return;
      const savedValue = sessionStorage.getItem('autosave_' + input.name);
      if (savedValue) input.value = savedValue;
      input.addEventListener('input', () => sessionStorage.setItem('autosave_' + input.name, input.value));
    });

    contactForm.addEventListener('reset', () => {
      inputs.forEach(input => sessionStorage.removeItem('autosave_' + input.name));
      sessionStorage.removeItem('speedfix_cart');
      setTimeout(() => {
          updateFormCart();
          showToast("Formulaire et panier vidés", "success");
          // Si le catalogue est ouvert, on rafraichit les boutons
          const panel = document.getElementById('catalogue-panel');
          if(!panel.classList.contains('-translate-x-full')) {
             openCatalogue(); // Recharge la liste
          }
      }, 50);
    });
  }
  if (typeof initCaptcha === 'function') initCaptcha();
  if (sessionStorage.getItem('show_cart_toast')) {
      // On affiche la notification
      showToast("Panier validé !", "success");
      
      // On enlève le "Post-it" pour ne pas le réafficher si on rafraîchit la page
      sessionStorage.removeItem('show_cart_toast');
  }
});

// --- LOGIQUE CATALOGUE ---
const CATALOGUE_JSON_URL = "../script/catalogue.json"; 

window.openCatalogue = async function() {
    const overlay = document.getElementById('catalogue-panel-overlay');
    const panel = document.getElementById('catalogue-panel');
    const content = document.getElementById('catalogue-content');

    overlay.classList.remove('opacity-0', 'pointer-events-none');
    panel.classList.remove('-translate-x-full');

    try {
        const res = await fetch(CATALOGUE_JSON_URL);
        const data = await res.json();
        // On force le re-rendu à chaque ouverture pour être sûr d'avoir les bonnes quantités
        renderCatalogueInsidePanel(data);
        content.setAttribute('data-loaded', 'true');
        updateFormCart(); // Pour mettre à jour le total du bas
    } catch (e) {
        content.innerHTML = '<p class="text-red-500 text-center">Erreur de chargement.</p>';
    }
};

window.closeCatalogue = function() {
    const overlay = document.getElementById('catalogue-panel-overlay');
    const panel = document.getElementById('catalogue-panel');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    panel.classList.add('-translate-x-full');
};


// GÉNÉRATEUR DE BOUTON dans Modal catalogue formulaire
function getButtonHtml(qty) {
    if (qty > 0) {
        // Mode Compteur (Déjà dans le panier)
        return `
            <div class="flex items-center justify-between w-full h-full bg-primary text-white rounded-lg px-2">
                <button class="w-8 h-full flex items-center justify-center hover:bg-black/20 rounded transition-colors text-lg font-bold btn-minus">
                    −
                </button>
                <span class="font-bold text-sm">${qty}</span>
                <button class="w-8 h-full flex items-center justify-center hover:bg-black/20 rounded transition-colors text-lg font-bold btn-plus">
                    +
                </button>
            </div>
        `;
    } else {
        // Mode Ajouter (Rien dans le panier)
        return `
            <div class="flex items-center justify-center gap-2 w-full h-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group-hover:border-primary/50 btn-add">
                <span class="text-xs font-bold uppercase tracking-wider text-white/70 group-hover:text-white">+ Ajouter</span>
            </div>
        `;
    }
}

function renderCatalogueInsidePanel(data) {
    const container = document.getElementById('catalogue-content');
    container.innerHTML = ''; 
    const cart = JSON.parse(sessionStorage.getItem('speedfix_cart')) || [];

    data.categories.forEach(cat => {
        const title = document.createElement('h3');
        title.className = "text-sm font-bold text-white/50 uppercase tracking-widest mb-4 border-b border-white/10 pb-2 sticky top-0 bg-[#0f0f0f] z-10";
        title.textContent = cat.title;
        container.appendChild(title);

        const grid = document.createElement('div');
        grid.className = "grid grid-cols-1 gap-4 mb-8";

        cat.products.forEach(prod => {
            const rawPrice = parseInt(prod.price.replace('€', '').trim());
            
            // On cherche si l'item est déjà dans le panier
            const cartItem = cart.find(i => i.name === prod.name);
            let qty = cartItem ? cartItem.qty : 0;

            const card = document.createElement('div');
            card.className = "flex gap-4 p-3 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent transition-all duration-200 group relative overflow-hidden";
            
            card.innerHTML = `
                <div class="w-20 h-20 bg-black/10 rounded-xl p-2 flex-shrink-0 flex items-center justify-center shadow-inner">
                    <img src="${prod.image}" class="max-w-full max-h-full object-contain hover:scale-110 transition-transform duration-1000 drop-shadow-lg">
                </div>
                
                <div class="flex flex-col justify-center flex-grow min-w-0">
                    <div class="flex justify-between items-start">
                        <h4 class="font-bold text-white text-sm truncate pr-2">${prod.name}</h4>
                        <span class="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-lg border border-primary/20 whitespace-nowrap">${prod.price}</span>
                    </div>
                    
                    <p class="text-[11px] text-white/40 mt-1 mb-3 line-clamp-2 leading-relaxed">${prod.description}</p>
                    
                    <div class="action-container h-9 select-none">
                        ${getButtonHtml(qty)}
                    </div>
                </div>
            `;

            // GESTION DES CLICS 
            const actionContainer = card.querySelector('.action-container');

            actionContainer.onclick = (e) => {
                e.stopPropagation(); // Empêche les clics multiples 
                
                // --- AJOUT SENSATIONS (Vibration) ---
                if (navigator.vibrate) navigator.vibrate(50);
                // ------------------------------------

                // On détermine quelle action a été faite
                if (e.target.closest('.btn-add') || e.target.closest('.btn-plus')) {
                    qty++;
                } else if (e.target.closest('.btn-minus')) {
                    qty--;
                } else {
                    // Si on clique sur le conteneur "Ajouter" mais pas pile sur le texte
                    if (qty === 0) qty++; 
                }

                // Mise à jour visuelle immédiate
                actionContainer.innerHTML = getButtonHtml(qty);
                
                // Mise à jour des données
                updateCartItem(prod.name, rawPrice, prod.image, qty);
            };

            grid.appendChild(card);
        });
        container.appendChild(grid);
    });
}

function updateCartItem(name, price, image, qty) {
    let cart = JSON.parse(sessionStorage.getItem('speedfix_cart')) || [];
    const index = cart.findIndex(item => item.name === name);

    if (qty > 0) {
        if (index > -1) {
            cart[index].qty = qty;
        } else {
            cart.push({ name, price, image, qty: qty });
        }
    } else {
        if (index > -1) cart.splice(index, 1);
    }

    sessionStorage.setItem('speedfix_cart', JSON.stringify(cart));
    updateFormCart();
}







// Gestion du bouton Réserver (Page Tarifs)
const reserveBtn = document.getElementById("reserveButton");
if (reserveBtn) {
  reserveBtn.addEventListener("click", () => {
    const contactModel = document.getElementById("contact-model");
    const contactIssue = document.getElementById("contact-issue");

    // Vérification que les variables globales de tarif.js existent
    if (typeof selectedModel !== 'undefined' && typeof tarifsData !== 'undefined' && contactModel && contactIssue) {
      if (selectedModel && tarifsData.iphone[selectedModel]) {

        const modelName = tarifsData.iphone[selectedModel].label;

        // Récupération des libellés de base
        let qualityName = (typeof QUALITY_LABELS !== 'undefined') ? QUALITY_LABELS[selectedQuality] : selectedQuality;

        // --- CORRECTION ICI : On change le nom de la qualité si c'est un châssis ---
        switch (selectedType) {
          case 'chassis':
            if (selectedQuality === 'eco') qualityName = "Vitre Arrière";
            if (selectedQuality === 'premium') qualityName = "Châssis Complet";
            break;
          case 'batterie':
            if (selectedQuality === 'premium') qualityName = "Batterie Officielle Apple";
            if (selectedQuality === 'eco') qualityName = "Batterie Compatible";
            break;
          case 'ecran':
            if (selectedQuality === 'premium') qualityName = "Écran Original Apple";
            if (selectedQuality === 'eco') qualityName = "Écran Compatible";
            break;
          default:
            break;
        }

        // -----------------------------------------------------------------------

        const priceText = document.getElementById("priceValue") ? document.getElementById("priceValue").textContent : "-- €";

        // Remplissage du formulaire
        contactModel.value = modelName;
        const issueText = `Demande de réparation : (${qualityName}). Prix estimé : ${priceText}`;
        contactIssue.value = issueText;

        // Sauvegarde automatique
        if (contactModel.name) sessionStorage.setItem('autosave_' + contactModel.name, modelName);
        if (contactIssue.name) sessionStorage.setItem('autosave_' + contactIssue.name, issueText);

        showToast("Réparation ajoutée au formulaire !", "success");
      }
    }

    // --- SCROLL FLUIDE VERS LE FORMULAIRE ---
    const contactSection = document.getElementById("contactForm");
    if (!contactSection) return;

    // 1. Calcul de l'offset (Marge pour le header fixe)
    function getOffset() {
      if (window.innerWidth < 768) {
        return 50; // Mobile : on laisse 50px 
      } else {
        return 100;  // Desktop : on laisse 100px
      }
    }

    // 2. Fonction d'animation mathématique
    function smoothScrollTo(targetY, duration = 1800) {
      const start = window.scrollY || window.pageYOffset;
      const change = targetY - start;
      const startTime = performance.now();

      function animateScroll(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Fonction d'assouplissement (Ease Out Cubic)
        const ease = 1 - Math.pow(1 - progress, 3);

        window.scrollTo(0, start + change * ease);

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      }

      requestAnimationFrame(animateScroll);
    }

    // 3. Exécution
    const offset = getOffset();
    const rect = contactSection.getBoundingClientRect();
    // On vise la position actuelle + distance de l'élément - la hauteur du header
    const targetY = rect.top + window.scrollY - offset;

    smoothScrollTo(targetY, 1000); // Durée de 1 secondes comme demandé
  });
};

