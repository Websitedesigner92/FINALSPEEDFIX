
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
