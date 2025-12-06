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

  if (selectedType === 'chassis') {
    // --- CAS CHÂSSIS ---
    if(titleEco) titleEco.textContent = "Vitre Arrière";
    if(descEco) descEco.textContent = "Remplacement de la vitre arrière uniquement.";


    if(titlePrem) titlePrem.textContent = "Châssis Complet";
    if(descPrem) descPrem.textContent = "Remplacement du châssis intégral.";

  } else {
    // --- CAS PAR DÉFAUT ---
    if(titleEco) titleEco.textContent = "Éco";
    if(descEco) descEco.textContent = "Pièce générique de bonne facture, idéale petits budgets.";

    if(titlePrem) titlePrem.textContent = "Premium";
    if(descPrem) descPrem.textContent = "Qualité d'affichage et tactile identique à l'original.";
  }
}

function Prix() {
  if (!tarifsData || !tarifsData.iphone) return;
  if (!selectedType || !selectedModel || !selectedQuality) {
    if(priceValueEl) priceValueEl.textContent = "-- €";
    if(priceDetailEl) priceDetailEl.textContent = "Sélectionnez vos options.";
    return;
  }
  const modelData = tarifsData.iphone[selectedModel];
  const serviceData = modelData[selectedType];
  const price = serviceData ? serviceData[selectedQuality] : null;
  if (price == null) { if(priceValueEl) priceValueEl.textContent = "-- €"; return; }
  if(priceValueEl) priceValueEl.textContent = price + "€";
  const typeLabel = TYPE_LABELS[selectedType] || selectedType;
  const qualLabel = QUALITY_LABELS[selectedQuality] || selectedQuality;
  const modelLabel = modelData.label || selectedModel;
  if(priceDetailEl) priceDetailEl.textContent = `Réparation ${typeLabel} (${qualLabel}) sur ${modelLabel}.`;
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