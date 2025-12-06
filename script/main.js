// --- FONCTION TOAST (Notifications) ---
window.showToast = function (message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  let bgColors = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  let icon = type === 'success' ? '✅' : '⚠️';
  toast.className = `${bgColors} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transform translate-x-full transition-transform duration-300 pointer-events-auto min-w-[300px] z-50 mb-3`;
  toast.innerHTML = `<span class="text-xl">${icon}</span><p class="font-bold text-sm">${message}</p>`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.remove('translate-x-full'));

  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 2000);
};


// --- FORMULAIRE CONTACT ---
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  const contactAccessories = document.getElementById('contact-accessories');

  // --- (LocalStorage) ---
  if (contactForm) {
    const inputs = contactForm.querySelectorAll('input, textarea');

    inputs.forEach(input => {

      if (input.id === 'captcha-answer') return;

      // A. Charger la valeur sauvegardée au démarrage
      const savedValue = localStorage.getItem('autosave_' + input.name);
      if (savedValue) {
        input.value = savedValue;
        // Ajuster hauteur si c'est un textarea
        if (input.tagName === 'TEXTAREA') {
          input.style.height = "auto";
          input.style.height = input.scrollHeight + "px";
        }
      }


      input.addEventListener('input', () => {
        localStorage.setItem('autosave_' + input.name, input.value);
      });
    });

    // "RESET"
    contactForm.addEventListener('reset', () => {
      // 1. Nettoyage du localStorage (AutoSave des champs)
      inputs.forEach(input => localStorage.removeItem('autosave_' + input.name));

      // 2. Suppression du résumé visuel du panier (AJOUT)
      const summaryVisual = document.getElementById('cart-summary-visual');
      const accessoriesField = document.getElementById('contact-accessories');
      
      if (summaryVisual) {
        summaryVisual.remove(); // On supprime le bloc visuel
      }

      // 3. Réinitialisation du champ "Accessoires" 
      if (accessoriesField) {
        accessoriesField.style.display = 'block'; // On réaffiche le textarea classique
        accessoriesField.value = ''; // On vide sa valeur
      }

      // 4. Suppression du champ caché JSON (s'il existe)
      const hiddenJson = document.querySelector('input[name="commande_json"]');
      if (hiddenJson) hiddenJson.remove();
      localStorage.removeItem('speedfix_cart', JSON.stringify(cart));
      setTimeout(() => showToast("Formulaire effacé", "success"), 100);
    });
  }


  // --- 2. AJOUT DU PANIER AU FORMULAIRE ---
  const cart = JSON.parse(localStorage.getItem('speedfix_cart')) || [];

  // Dans la section "AJOUT DU PANIER AU FORMULAIRE"
if (cart.length > 0) {
    const contactForm = document.getElementById("contactForm");
    const accessoriesField = document.getElementById('contact-accessories'); //
    
    // 1. Création du conteneur visuel (Respect de la DA Dark Mode)
    const summaryDiv = document.createElement('div');
    summaryDiv.id = "cart-summary-visual"; 
    summaryDiv.className = "mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-sm animate-pulse"; // Animation légère à l'arrivée
    summaryDiv.style.animation = "none"; // On stop l'animation après chargement
    
    // 2. Construction du HTML
    let total = 0;
    let itemsHtml = cart.map(item => {
        total += item.price * item.qty;
        return `
            <div class="flex justify-between items-center text-sm py-1 border-b border-white/5 last:border-0">
                <span class="text-white/80"><span class="text-primary font-bold">${item.qty}x</span> ${item.name}</span>
                <span class="font-mono text-white/60">${item.price * item.qty}€</span>
            </div>
        `;
    }).join('');

    summaryDiv.innerHTML = `
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
        <input type="hidden" name="commande_json" value='${JSON.stringify(cart)}'> 
    `;

    // 3. Insertion dans le DOM (Juste avant le captcha ou après les accessoires)
    // On cache le champ texte standard car on a maintenant le visuel
    if(accessoriesField) {
        accessoriesField.style.display = 'none'; 
        accessoriesField.parentNode.insertBefore(summaryDiv, accessoriesField);
        
        // On remplit quand même le champ caché pour l'envoi du mail
        accessoriesField.value = "COMMANDE : " + JSON.stringify(cart);
    }
    
    // 4. Feedback utilisateur
    setTimeout(() => {
      showToast("Votre panier a été joint à la demande !", "success"); //
    }, 500);
    
}

  // --- 3. INIT CAPTCHA ---
  if (contactForm) {
    initCaptcha();
  }
});


