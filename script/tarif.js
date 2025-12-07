// --- LOGIQUE SIMULATEUR ---
const TARIFS_URL = "./tarif.json";


const TYPE_LABELS = { ecran: "écran", batterie: "batterie", chassis: "vitre / châssis" };
const QUALITY_LABELS = { eco: "Éco", premium: "Premium" };
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
  Type_Probleme.forEach((btn) => {
    const active = btn.dataset.type === selectedType;
    btn.classList.toggle("bg-primary", active);
    btn.classList.toggle("text-black", active);
    btn.classList.toggle("border-primary", active);
    if (active) btn.classList.remove("bg-white/5", "text-white/80");
    else { btn.classList.add("bg-white/5", "text-white/80"); btn.classList.remove("text-black"); }
  });
}

function update_Qualiter() {
  Qualiter.forEach((btn) => {
    const active = btn.dataset.quality === selectedQuality;
    btn.classList.toggle("bg-primary", active);
    btn.classList.toggle("text-black", active);
    btn.classList.toggle("border-primary", active);
    if (active) btn.classList.remove("bg-white/5", "text-white/80");
    else { btn.classList.add("bg-white/5", "text-white/80"); btn.classList.remove("text-black"); }
  });
}

function updateQualityLabels() {
  const btnEco = document.querySelector('button[data-quality="eco"]');
  const btnPrem = document.querySelector('button[data-quality="premium"]');

  // Sécurité 
  if (!btnEco || !btnPrem) return;

  // On cible les titres 
  const titleEco = btnEco.querySelector("span:first-child");
  const descEco = btnEco.querySelector("span:last-child");

  const titlePrem = btnPrem.querySelector("span:first-child");
  const descPrem = btnPrem.querySelector("span:last-child");

  // --- 1. LOGIQUE DE MODIFICATION DES TEXTES ---
  if (selectedType === 'chassis') {
    // --- CAS CHÂSSIS ---
    if (titleEco) titleEco.textContent = "Vitre Arrière";
    if (descEco) descEco.textContent = "Remplacement de la vitre arrière uniquement.";


    if (titlePrem) titlePrem.textContent = "Châssis Complet";
    if (descPrem) descPrem.textContent = "Remplacement du châssis intégral.";

  } else if (selectedType === 'batterie') {
    // --- CAS BATTERIE ---
    if (titleEco) titleEco.textContent = "Batterie Eco";
    if (descEco) descEco.textContent = "Option économique offrant de bonnes performances, légèrement inférieur à la premium.";

    if (titlePrem) titlePrem.textContent = "Batterie Premium";
    if (descPrem) descPrem.textContent = "Capacité d’origine et performances optimales pour une excellente autonomie.";

  } else {
    // --- CAS PAR DÉFAUT ---
    if (titleEco) titleEco.textContent = "Éco";
    if (descEco) descEco.textContent = "Pièce générique de bonne facture, idéale pour les petits budgets.";

    if (titlePrem) titlePrem.textContent = "Premium";
    if (descPrem) descPrem.textContent = "Écrans conçus avec la technologie d’origine, offrant un rendu haut de gamme au meilleur rapport qualité-prix.";
  }
}

function Prix() {
  if (!tarifsData || !tarifsData.iphone) return;
  if (!selectedType || !selectedModel || !selectedQuality) {
    if (priceValueEl) priceValueEl.textContent = "-- €";
    if (priceDetailEl) priceDetailEl.textContent = "Sélectionnez vos options.";
    return;
  }
  const modelData = tarifsData.iphone[selectedModel];
  const serviceData = modelData[selectedType];

  let jsonKey = selectedQuality; // Par défaut : 'eco' ou 'premium'

  if (selectedType === 'chassis') {
    // Si on est sur Châssis, on change les noms
    if (selectedQuality === 'eco') jsonKey = 'Vitre_AR';
    if (selectedQuality === 'premium') jsonKey = 'chassis-prix';
  }

  const price = serviceData ? serviceData[jsonKey] : null;
  if (price == null) { if (priceValueEl) priceValueEl.textContent = "-- €"; return; }
  if (priceValueEl) priceValueEl.textContent = price + "€";
  // --- 2. GESTION DU TEXTE  ---
  const modelLabel = modelData.label || selectedModel;
  let labelchassis = "";
  switch (selectedType) {
    case 'ecran':
      (selectedQuality === 'eco') ? labelchassis = "Écran Éco" : labelchassis = "Écran Original";
      break;
    case 'batterie':
      (selectedQuality === 'eco') ? labelchassis = "Batterie Compatible" : labelchassis = "Batterie Origine";
      break;
    case 'chassis':
      (selectedQuality === 'eco') ? labelchassis = "Vitre Arrière" : labelchassis = "Châssis Complet";
      break;
    default:
      break;
  }
  if (priceDetailEl) priceDetailEl.textContent = `Réparation ${labelchassis} sur ${modelLabel}.`;

}

Type_Probleme.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedType = btn.dataset.type;
    update_Type_Probleme();
    updateQualityLabels();
    Prix();
  });
});

Qualiter.forEach((btn) => {
  btn.addEventListener("click", () => { selectedQuality = btn.dataset.quality; update_Qualiter(); Prix(); });
});
if (Modele) {
  Modele.addEventListener("change", (e) => { selectedModel = e.target.value; Prix(); });
}
loadTarifs();

window.selectServiceFromCard = function (type) {
  selectedType = type;
  update_Type_Probleme();
  updateQualityLabels();
  Prix();

};
