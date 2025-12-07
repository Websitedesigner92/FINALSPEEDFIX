
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
   function getOffset() {
      // Si écran < 768px → mobile
      if (window.innerWidth < 768) {
        return -80;  // 📱 descend plus bas sur téléphone
      } else {
        return -10;  // 🖥️ offset parfait sur PC
      }
    }

    function smoothScrollTo(targetY, duration = 1800) {
      const start = window.scrollY || window.pageYOffset;
      const change = targetY - start;
      const startTime = performance.now();

      function animateScroll(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        window.scrollTo(0, start + change * ease);

        if (progress < 1) requestAnimationFrame(animateScroll);
      }

      requestAnimationFrame(animateScroll);
    }

    const tarifsSection = document.getElementById("tarifs");
    if (!tarifsSection) return;

    const cards = document.querySelectorAll('#form-services a[href="#tarifs"]');

    cards.forEach((card) => {
      card.addEventListener("click", function (e) {
        e.preventDefault();

        const offset = getOffset(); // 🌟 offset dynamique mobile/PC
        const rect = tarifsSection.getBoundingClientRect();
        const targetY = rect.top + window.scrollY - offset;

        smoothScrollTo(targetY, 1800);
      });
    });
});

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
        if (contactModel.name) localStorage.setItem('autosave_' + contactModel.name, modelName);
        if (contactIssue.name) localStorage.setItem('autosave_' + contactIssue.name, issueText);

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

