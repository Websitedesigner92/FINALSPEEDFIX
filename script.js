// document.addEventListener('DOMContentLoaded', () => {

//   // SELECTIONS
//   const camionHero = document.getElementById('camion-wrapper');

//   const sectionServices = document.getElementById('services');
//   const camionServices = document.getElementById('camion-services');
//   const dashboard = document.getElementById('dashboard-ux');
//   const serviceCards = document.querySelectorAll('#dashboard-ux a');

//   // Variable pour gérer l'état du dashboard (pour ne pas relancer l'anim en boucle)
//   let isDashboardVisible = false; 

//   // FONCTION PRINCIPALE DE SCROLL
//   window.addEventListener('scroll', () => {
//     const scrollY = window.scrollY;
//     const windowHeight = window.innerHeight;

//     // =======================================================
//     // 1. PREMIER CAMION (HERO) - Départ vers la droite
//     // =======================================================
//     if (camionHero) {
//       const startHero = 0; 
//       const endHero = 700; // Distance de scroll pour faire disparaître le 1er camion

//       let progressHero = (scrollY - startHero) / (endHero - startHero);

//       // On borne entre 0 et 1
//       if (progressHero < 0) progressHero = 0;
//       if (progressHero > 1) progressHero = 1;

//       const moveX_Hero = progressHero * 700; // Il part de 700px vers la droite
//       const opacityHero = 1 - progressHero;

//       camionHero.style.transform = `translateX(${moveX_Hero}px) scale(1.5)`;
//       camionHero.style.opacity = opacityHero;
//     }

//     // =======================================================
//     // 2. DEUXIÈME CAMION (SERVICES) - Arrivée depuis la droite
//     // =======================================================
//     if (sectionServices && camionServices) {

//       // Calculer la position de la section par rapport à l'écran
//       const rect = sectionServices.getBoundingClientRect();
//       const sectionTop = rect.top; // Distance entre le haut de la section et le haut de l'écran

//       // REGLAGES DU PILOTAGE
//       // Quand est-ce qu'on commence à bouger ? Quand la section entre en bas de l'écran
//       const startPoint = windowHeight * 1; 
//       // Quand est-ce qu'on est garé ? Quand la section est un peu remontée (milieu d'écran)
//       const endPoint = windowHeight * 0.15; 

//       // Calcul du % d'avancement (Inverse car on scroll vers le bas pour le faire venir)
//       let progressServices = (startPoint - sectionTop) / (startPoint - endPoint);

//       // Bornage entre 0 et 1
//       if (progressServices < 0) progressServices = 0;
//       if (progressServices > 1) progressServices = 1;

//       // MATHÉMATIQUES DU MOUVEMENT
//       // À 0% (pas visible) -> Il est à 1500px (loin à droite)
//       // À 100% (visible) -> Il est à 0px (garé)
//       const startPositionX = 1500; 
//       const currentPositionX = startPositionX - (progressServices * startPositionX);

//       // Appliquer le mouvement (PILOTAGE EN TEMPS RÉEL)
//       camionServices.style.transform = `translateX(${currentPositionX - 60}px) scale(1.5)`;
//       // On gère l'opacité aussi : transparent au début, visible à la fin
//       camionServices.style.opacity = progressServices;


//       // =======================================================
//       // 3. GESTION DU DASHBOARD (Apparition / Disparition)
//       // =======================================================
//       // Si le camion est quasiment arrivé (> 95%) ET que le dashboard n'est pas encore là
//       if (progressServices >= 1 && !isDashboardVisible) {
//         isDashboardVisible = true;

//         // Petit délai de 20ms comme demandé
//         setTimeout(() => {
//           if(dashboard) {
//             dashboard.classList.remove('opacity-0', 'translate-y-4');
//             dashboard.classList.add('opacity-100', 'translate-y-0');

//             // Cascade des cartes
//             serviceCards.forEach((card, index) => {
//               setTimeout(() => {
//                 card.classList.remove('opacity-0', 'translate-y-8');
//               }, 200 + (index * 250));
//             });
//           }
//         }, 100);

//       } 
//       // Si on remonte et que le camion repart (< 80%) ET que le dashboard est visible
//       else if (progressServices < 1 && isDashboardVisible) {
//         isDashboardVisible = false;

//         // On cache tout
//         if(dashboard) {
//           dashboard.classList.remove('opacity-100', 'translate-y-0');
//           dashboard.classList.add('opacity-0', 'translate-y-4'); // Remettre translate-y-4 pour l'effet de montée au retour

//           serviceCards.forEach(card => {
//             card.classList.add('opacity-0', 'translate-y-8');
//           });
//         }
//       }
//     }
//   });
// });


document.addEventListener('DOMContentLoaded', () => {

  // SELECTIONS
  const camionHero = document.getElementById('camion-wrapper');

  const sectionServices = document.getElementById('services');
  const camionServices = document.getElementById('camion-services');
  const dashboard = document.getElementById('dashboard-ux');
  const serviceCards = document.querySelectorAll('#dashboard-ux a');

  // MENU MOBILE
  // Sur mobile, le menu de navigation est masqué par défaut et un bouton hamburger est affiché.
  // Nous sélectionnons le bouton et le conteneur du menu mobile afin de pouvoir
  // basculer l'affichage lorsque l'utilisateur clique dessus. Si aucun des deux
  // éléments n'existe (par exemple sur les grandes résolutions où le menu est toujours visible),
  // aucune action n'est exécutée.
  const mobileMenuButton = document.getElementById('mobileMenuButton');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  let isDashboardVisible = false;

  // FONCTION PRINCIPALE DE SCROLL
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // On définit si on est sur mobile ou desktop (point de rupture md = 768px)
    const isDesktop = windowWidth >= 768;

    // Calcul du facteur d'échelle du camion du héro en fonction de la taille d'écran.
    // Sur mobile on réduit légèrement l'échelle pour ne pas dépasser la largeur
    // disponible ; sur desktop on reste à 1.5 comme dans la maquette.
    const heroScale = isDesktop ? 1.5 : .5;

    // =======================================================
    // 1. PREMIER CAMION (HERO) - Départ
    // =======================================================
    if (camionHero) {
      // Configuration responsive
      // Sur Desktop : le camion part vers la droite (60% de l'écran)
      // Sur Mobile : il bouge très peu ou juste en opacité pour éviter de sortir de l'écran
      const moveDistance = isDesktop ? windowWidth * 0.6 : 50;

      const startHero = 0;
      const endHero = isDesktop ? 700 : 400; // Plus court sur mobile

      let progressHero = (scrollY - startHero) / (endHero - startHero);

      if (progressHero < 0) progressHero = 0;
      if (progressHero > 1) progressHero = 1;

      const moveX_Hero = progressHero * moveDistance;
      const opacityHero = 1 - progressHero;

      // Application
      camionHero.style.transform = `translateX(${moveX_Hero}px) scale(${heroScale})`;
      camionHero.style.opacity = opacityHero;
    }

    // =======================================================
    // 2. DEUXIÈME CAMION (SERVICES) - Pilotage
    // =======================================================
    if (sectionServices && camionServices) {

      const rect = sectionServices.getBoundingClientRect();
      const sectionTop = rect.top;

      // REGLAGES DU PILOTAGE
      const startPoint = windowHeight * 1;
      const endPoint = windowHeight * 0.15;

      let progressServices = (startPoint - sectionTop) / (startPoint - endPoint);

      if (progressServices < 0) progressServices = 0;
      if (progressServices > 1) progressServices = 1;

      // MATHÉMATIQUES RESPONSIVES
      // Position de départ : Juste en dehors de l'écran à droite (largeur de l'écran + un peu de marge)
      // Sur mobile, on réduit la distance pour éviter les bugs d'affichage
      const startPositionX = isDesktop ? windowWidth * 0.8 : 300;

      // Calcul de la position actuelle (de startPositionX vers 0)
      let currentPositionX = startPositionX - (progressServices * startPositionX);

      // Ajustement fin : parfois à 100% il reste un petit décalage, on force le 0 si proche
      if (progressServices > 0.98) currentPositionX = 0;

      // Application du mouvement
      // Note : j'ai retiré le "- 60" fixe qui pouvait poser problème sur petit écran
      camionServices.style.transform = `translateX(${currentPositionX}px) scale(${isDesktop ? 1.5 : 1.2})`;
      camionServices.style.opacity = progressServices;


      // =======================================================
      // 3. GESTION DU DASHBOARD (CORRIGÉ)
      // =======================================================
      // Seuil d'apparition (ex: 80% du trajet)
      if (progressServices > 0.8 && !isDashboardVisible) {
        isDashboardVisible = true;

        // Code d'apparition (inchangé)
        if (dashboard) {
          dashboard.classList.remove('opacity-0', 'translate-y-4');
          dashboard.classList.add('opacity-100', 'translate-y-0');

          serviceCards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.remove('opacity-0', 'translate-y-8');
            }, 200 + (index * 300));
          });
        }

      }
      // CORRECTION ICI : On ne masque que si on REMONTE (progress < 0.8)
      else if (progressServices < 0.8 && isDashboardVisible) {
        isDashboardVisible = false;

        // Code de disparition (inchangé)
        if (dashboard) {
          dashboard.classList.remove('opacity-100', 'translate-y-0');
          dashboard.classList.add('opacity-0', 'translate-y-4');

          serviceCards.forEach(card => {
            card.classList.add('opacity-0', 'translate-y-8');
          });
        }
      }
    }
  });
});
