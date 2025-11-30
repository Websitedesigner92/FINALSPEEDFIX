document.addEventListener('DOMContentLoaded', () => {

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

  // 👉 On n'active l'animation que sur écran ≥ 768px
  const isDesktop = window.innerWidth >= 768;

  if (isDesktop && scrollTrack) {
    window.addEventListener('scroll', () => {

      const rect = scrollTrack.getBoundingClientRect();
      const trackHeight = scrollTrack.offsetHeight - window.innerHeight;
      let progress = (0 - rect.top) / trackHeight;

      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      // Echelle du camion (uniquement desktop)
      const baseScale = 1.5;

      // --- PHASE 1 : DÉPART HERO (0% -> 100%) ---
      let exitProgress = progress * 1;
      if (exitProgress > 1) exitProgress = 1;

      const heroMoveX_Text = exitProgress * -1000;
      const heroMoveX_Camion = exitProgress * 1500;
      const heroOpacity = 1 - (exitProgress * 1.5);

      if (sceneHero && heroText && heroCamion) {
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

      if (sceneServices && servicesCamion && servicesDashboard) {
        sceneServices.style.opacity = enterProgress;
        servicesCamion.style.transform = `translateX(${servicesMoveX}px) scale(${baseScale})`;
        servicesDashboard.style.transform = `translateY(${dashboardMoveY}px)`;
      }
    });

    // On force un premier calcul à l'ouverture
    window.dispatchEvent(new Event('scroll'));

  } else {
    // 👉 Sur mobile : on s’assure qu’il n’y a pas de styles bizarres
    if (sceneHero && heroText && heroCamion) {
      heroText.style.transform = '';
      heroText.style.opacity = '';
      heroCamion.style.transform = '';
      heroCamion.style.opacity = '';
    }
    if (sceneServices && servicesCamion && servicesDashboard) {
      sceneServices.style.opacity = '';
      servicesCamion.style.transform = '';
      servicesDashboard.style.transform = '';
    }
  }
});


/// calcul des pour le simulateur de tarifs
const TARIFS_URL = "./tarif.json";

const TYPE_LABELS = {
  ecran: "écran",
  batterie: "batterie",
  chassis: "vitre / châssis"
};

const QUALITY_LABELS = {
  eco: "Éco",
  premium: "Premium"
};

let tarifsData = null;
let selectedType = null;
let selectedModel = "";
let selectedQuality = null;

const Type_Probleme = document.querySelectorAll("#typeButtons button");
const Qualiter = document.querySelectorAll("#qualityButtons button");
const Modele = document.getElementById("deviceModel");
const priceValueEl = document.getElementById("priceValue");
const priceDetailEl = document.getElementById("priceDetail");

async function loadTarifs() {
  try {
    const res = await fetch(TARIFS_URL);
    tarifsData = await res.json();
    Modele_telephone();
  } catch (e) {
    if (priceDetailEl) priceDetailEl.textContent = "Erreur chargement tarifs.";
  }
}

function Modele_telephone() {
  if (!tarifsData || !tarifsData.iphone || !Modele) return;
  Modele.innerHTML = '<option value="">Choisissez un modèle</option>';
  Object.entries(tarifsData.iphone).forEach(([key, obj]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = obj.label || key;
    Modele.appendChild(opt);
  });
}

function update_Type_Probleme() {
  Type_Probleme.forEach(btn => {
    const active = btn.dataset.type === selectedType;
    btn.classList.toggle("bg-primary", active);
    btn.classList.toggle("text-black", active);
    btn.classList.toggle("border-primary", active);
    if (active) btn.classList.remove("bg-white/5", "text-white/80");
    else {
      btn.classList.add("bg-white/5", "text-white/80");
      btn.classList.remove("text-black");
    }
  });
}

function update_Qualiter() {
  Qualiter.forEach(btn => {
    const active = btn.dataset.quality === selectedQuality;
    btn.classList.toggle("bg-primary", active);
    btn.classList.toggle("text-black", active);
    btn.classList.toggle("border-primary", active);
    if (active) btn.classList.remove("bg-white/5", "text-white/80");
    else {
      btn.classList.add("bg-white/5", "text-white/80");
      btn.classList.remove("text-black");
    }
  });
}

function Prix() {
  if (!tarifsData || !tarifsData.iphone) return;
  if (!selectedType || !selectedModel || !selectedQuality) {
    priceValueEl.textContent = "-- €";
    priceDetailEl.textContent = "Sélectionnez vos options.";
    return;
  }
  const modelData = tarifsData.iphone[selectedModel];
  if (!modelData) return;
  const serviceData = modelData[selectedType];
  if (!serviceData) return;
  const price = serviceData[selectedQuality];

  if (price == null) {
    priceValueEl.textContent = "-- €";
    return;
  }

  priceValueEl.textContent = price + "€";
  const typeLabel = TYPE_LABELS[selectedType] || selectedType;
  const qualLabel = QUALITY_LABELS[selectedQuality] || selectedQuality;
  const modelLabel = modelData.label || selectedModel;
  priceDetailEl.textContent = `Réparation ${typeLabel} (${qualLabel}) sur ${modelLabel}.`;
}

Type_Probleme.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedType = btn.dataset.type;
    update_Type_Probleme();
    Prix();
  });
});

Qualiter.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedQuality = btn.dataset.quality;
    update_Qualiter();
    Prix();
  });
});

if (Modele) {
  Modele.addEventListener("change", e => {
    selectedModel = e.target.value;
    Prix();
  });
}

loadTarifs();
