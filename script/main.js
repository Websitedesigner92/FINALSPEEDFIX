// --- FONCTION TOAST (Notifications) ---
window.showToast = function(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if(!container) return;
  const toast = document.createElement('div');
  let bgColors = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  let icon = type === 'success' ? '✅' : '⚠️';
  toast.className = `${bgColors} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transform translate-x-full transition-transform duration-300 pointer-events-auto min-w-[300px] z-50 mb-3`;
  toast.innerHTML = `<span class="text-xl">${icon}</span><p class="font-bold text-sm">${message}</p>`;
  container.appendChild(toast);
  
  requestAnimationFrame(() => toast.classList.remove('translate-x-full'));
  
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => { if(toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 2000);
};

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  const contactAccessories = document.getElementById('contact-accessories');

  // --- (LocalStorage) ---
  if (contactForm) {
    const inputs = contactForm.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      
      if(input.id === 'captcha-answer') return;

      // A. Charger la valeur sauvegardée au démarrage
      const savedValue = localStorage.getItem('autosave_' + input.name);
      if (savedValue) {
        input.value = savedValue;
        // Ajuster hauteur si c'est un textarea
        if(input.tagName === 'TEXTAREA') {
             input.style.height = "auto";
             input.style.height = input.scrollHeight + "px";
        }
      }

      
      input.addEventListener('input', () => {
        localStorage.setItem('autosave_' + input.name, input.value);
      });
    });

    // "Reset"
    contactForm.addEventListener('reset', () => {
      inputs.forEach(input => localStorage.removeItem('autosave_' + input.name));
      setTimeout(() => showToast("Formulaire effacé", "success"), 100);
    });
  }

  // --- 2. AJOUT DU PANIER AU FORMULAIRE ---
  const cart = JSON.parse(localStorage.getItem('speedfix_cart')) || [];

  if (cart.length > 0 && contactAccessories) {
    let cartText = "MA COMMANDE ACCESSOIRES :";
    
    cart.forEach(item => {
        cartText += `\n- ${item.name} (${item.qty})`;
    });

    // Ajout au texte existant 
    const prefix = contactAccessories.value ? "\n\n" : "";
    contactAccessories.value = contactAccessories.value + prefix + cartText;
    
    
    localStorage.setItem('autosave_' + contactAccessories.name, contactAccessories.value);
    
    // Ajustement visuel
    contactAccessories.style.height = "auto";
    contactAccessories.style.height = contactAccessories.scrollHeight + 'px';

    // On vide le panier 
    localStorage.removeItem('speedfix_cart');
    
    setTimeout(() => {
        showToast("Votre panier a été ajouté au formulaire !", "success");
    }, 800);
  }

  // --- 3. INIT CAPTCHA ---
  if (contactForm) {
    initCaptcha();
  }
});

// --- FONCTIONS CAPTCHA ---
function initCaptcha() {
  const contactForm = document.getElementById("contactForm");
  const captchaCanvas = document.getElementById("captcha-canvas");
  const captchaAnswerInput = document.getElementById("captcha-answer");
  const captchaError = document.getElementById("captcha-error");
  let captchaCode = "";

  function randomColor() {
    const r = Math.floor(Math.random() * 200);
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    return `rgb(${r},${g},${b})`;
  }

  window.generateCaptcha = function () {
    if (!captchaCanvas) return;
    const ctx = captchaCanvas.getContext("2d");
    const width = captchaCanvas.width;
    const height = captchaCanvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, width, height);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    captchaCode = "";
    for (let i = 0; i < 4; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      captchaCode += char;
      ctx.save();
      const x = 20 + i * 22;
      const y = 30 + Math.random() * 10;
      const angle = (Math.random() - 0.5) * 0.5;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = "bold 28px Arial";
      ctx.fillStyle = randomColor();
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.strokeStyle = randomColor();
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  generateCaptcha();

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userAnswer = captchaAnswerInput.value.toUpperCase().trim();
    
    if (userAnswer !== captchaCode) {
      // ERREUR CAPTCHA
      captchaError.classList.remove("hidden");
      captchaAnswerInput.classList.add("border-red-500");
      showToast("Code de sécurité incorrect", "error");
      generateCaptcha();
      captchaAnswerInput.value = "";
    } else {
      // SUCCÈS
      captchaError.classList.add("hidden");
      captchaAnswerInput.classList.remove("border-red-500");
      
      showToast("Message envoyé avec succès !", "success");
      
      // NETTOYAGE COMPLET (Formulaire + LocalStorage)
      contactForm.reset();
      const inputs = contactForm.querySelectorAll('input, textarea');
      inputs.forEach(input => localStorage.removeItem('autosave_' + input.name));
      
      generateCaptcha();
    }
  });
}

// Gestion du bouton Réserver (Page Tarifs)
const reserveBtn = document.getElementById("reserveButton");
if (reserveBtn) {
  reserveBtn.addEventListener("click", () => {
    const contactModel = document.getElementById("contact-model");
    const contactIssue = document.getElementById("contact-issue");
    
    // Vérification que les variables globales de tarif.js existent
    if (typeof selectedModel !== 'undefined' && typeof tarifsData !== 'undefined' && contactModel && contactIssue) {
        if(selectedModel && tarifsData.iphone[selectedModel]) {
            const modelName = tarifsData.iphone[selectedModel].label;
            const typeName = TYPE_LABELS[selectedType];
            const qualityName = QUALITY_LABELS[selectedQuality];
            const priceText = document.getElementById("priceValue") ? document.getElementById("priceValue").textContent : "-- €";
            
            contactModel.value = modelName;
            const issueText = `Demande de réparation : ${typeName} (${qualityName}). Prix estimé : ${priceText}`;
            contactIssue.value = issueText;

            
            if(contactModel.name) localStorage.setItem('autosave_' + contactModel.name, modelName);
            if(contactIssue.name) localStorage.setItem('autosave_' + contactIssue.name, issueText);

            showToast("Réparation ajoutée au formulaire !", "success");
        }
    }
  });
}




document.addEventListener("DOMContentLoaded", function () {
  const btn = document.querySelector('a[href="#form-services"]');
  const sceneTrack = document.getElementById("scroll-track");

  if (!btn || !sceneTrack) return;

  btn.addEventListener("click", function (e) {
    e.preventDefault();

    // Position de la section scroll-track
    const rect = sceneTrack.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const maxScrollInside = rect.height - window.innerHeight;

    // --- Ratio différent selon l'appareil ---
    let ratio;
    if (window.innerWidth < 768) {
      ratio = 1.15;  // 📱 Téléphone → descend plus bas
    } else {
      ratio = 1;   // 🖥️ PC → valeur normale
    }

    const targetY = sectionTop + Math.max(0, maxScrollInside * ratio);

    // ----- SMOOTH SCROLL LENT -----
    const duration = 1000; // tu peux modifier pour changer la vitesse
    const start = window.scrollY;
    const change = targetY - start;
    const startTime = performance.now();

    function animateScroll(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 2); // easing

      window.scrollTo(0, start + change * ease);

      if (progress < 1) requestAnimationFrame(animateScroll);
    }

    requestAnimationFrame(animateScroll);
  });
});
