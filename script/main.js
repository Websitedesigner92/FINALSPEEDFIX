// --- FONCTION  (Notifications) ---
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
  // --- TRAITEMENT DU PANIER  ---
  const contactIssue = document.getElementById('contact-issue');

  const cart = JSON.parse(localStorage.getItem('speedfix_cart')) || [];

  if (cart.length > 0 && contactIssue) {
  
    let cartText = "\n\n🛍️ MA COMMANDE ACCESSOIRES :";
 
    
    cart.forEach(item => {
        cartText += `\n- ${item.name} (${item.price})`;
        
    });

    
    // On vérifie si le champ est vide ou non
    if (contactIssue.value.trim() === "") {
        contactIssue.value = "Bonjour," + cartText;
    } else {
        
        contactIssue.value = contactIssue.value + cartText;
    }

    
    localStorage.removeItem('speedfix_cart');
    
    setTimeout(() => {
        showToast("Votre panier a été ajouté au formulaire !", "success");
    }, 800);
  }


  // --- 4. INIT CAPTCHA ---
  const contactForm = document.getElementById("contactForm");
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
    for (let i = 0; i < Math.random() * 4; i++) {
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
      captchaError.classList.remove("hidden");
      captchaAnswerInput.classList.add("border-red-500");
      showToast("Code de sécurité incorrect", "error");
      generateCaptcha();
      captchaAnswerInput.value = "";
    } else {
      captchaError.classList.add("hidden");
      captchaAnswerInput.classList.remove("border-red-500");
      showToast("Message envoyé avec succès !", "success");
      contactForm.reset();
      generateCaptcha();
    }
  });
}


const reserveBtn = document.getElementById("reserveButton");
if (reserveBtn) {
  reserveBtn.addEventListener("click", () => {
    const contactModel = document.getElementById("contact-model");
    const contactIssue = document.getElementById("contact-issue");
    if (selectedModel && tarifsData && contactModel && contactIssue) {
      const modelName = tarifsData.iphone[selectedModel].label;
      const typeName = TYPE_LABELS[selectedType];
      const qualityName = QUALITY_LABELS[selectedQuality];
      
      contactModel.value = modelName;
      contactIssue.value = `Demande de réparation : ${typeName} (${qualityName}). Prix estimé : ${priceValueEl.textContent}`;
      showToast("Réparation ajoutée au formulaire !", "success");
    }
  });
}

