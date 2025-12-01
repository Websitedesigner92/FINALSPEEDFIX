document.addEventListener("DOMContentLoaded", () => {
  
     // --- 1. GESTION DU SCROLL (SCROLLYTELLING) ---
  const scrollTrack = document.getElementById('scroll-track');
  const sceneHero = document.getElementById('scene-hero');
  const heroText = document.getElementById('hero-text');
  const heroCamion = document.getElementById('hero-camion');
  const sceneServices = document.getElementById('scene-services');
  const servicesCamion = document.getElementById('services-camion');
  const servicesDashboard = document.getElementById('services-dashboard');

  // Menu Mobile
  const mobileBtn = document.getElementById('mobileMenuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  }

  window.addEventListener('scroll', () => {
    if (!scrollTrack) return;

    const rect = scrollTrack.getBoundingClientRect();
    const trackHeight = scrollTrack.offsetHeight - window.innerHeight;
    let progress = (0 - rect.top) / trackHeight;

    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

     const isDesktop = window.innerWidth >= 768;
    // Echelle du camion
    const baseScale = isDesktop ? 1.5 : .9; // Ajusté pour mobile

    // --- PHASE 1 : DÉPART HERO (0% -> 50%) ---
    let exitProgress = progress * 1;
    if (exitProgress > 1) exitProgress = 1;

    const heroMoveX_Text = exitProgress * -1000;
    const heroMoveX_Camion = exitProgress * 1500;
    const heroOpacity = 1 - (exitProgress * 1.5);

    if (sceneHero) {
      heroText.style.transform = `translateX(${heroMoveX_Text}px)`;
      heroText.style.opacity = Math.max(0, heroOpacity);

      heroCamion.style.transform = `translateX(${heroMoveX_Camion}px) scale(${baseScale})`;
      heroCamion.style.opacity = Math.max(0, heroOpacity);
    }

    // --- PHASE 2 : ARRIVÉE SERVICES (20% -> 100%) ---
    let enterStart = 0.2;
    let enterEnd = 1;
    let enterProgress = (progress - enterStart) / (enterEnd - enterStart);
    if (enterProgress < 0) enterProgress = 0;
    if (enterProgress > 1) enterProgress = 1;

    const servicesMoveX = 1200 - (enterProgress * 1200);
    const dashboardMoveY = 1000 - (enterProgress * 1000);

    if (sceneServices) {
      sceneServices.style.opacity = enterProgress;
      // Le camion arrive de la droite
      servicesCamion.style.transform = `translateX(${servicesMoveX}px) scale(${baseScale})`;
      // Le dashboard monte
      servicesDashboard.style.transform = `translateY(${dashboardMoveY}px)`;
    }
  });

});