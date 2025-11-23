
// --- CALCULATEUR DE PRIX (Code Standard) ---
const TARIFS_URL = "../tarif.json";

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
    if(priceDetailEl) priceDetailEl.textContent = "Erreur chargement tarifs.";
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
    else { btn.classList.add("bg-white/5", "text-white/80"); btn.classList.remove("text-black"); }
  });
}

function update_Qualiter() {
  Qualiter.forEach(btn => {
    const active = btn.dataset.quality === selectedQuality;
    btn.classList.toggle("bg-primary", active);
    btn.classList.toggle("text-black", active);
    btn.classList.toggle("border-primary", active);
    if (active) btn.classList.remove("bg-white/5", "text-white/80");
    else { btn.classList.add("bg-white/5", "text-white/80"); btn.classList.remove("text-black"); }
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

  if (price == null) { priceValueEl.textContent = "-- €"; return; }

  priceValueEl.textContent = price + "€";
  const typeLabel = TYPE_LABELS[selectedType] || selectedType;
  const qualLabel = QUALITY_LABELS[selectedQuality] || selectedQuality;
  const modelLabel = modelData.label || selectedModel;
  priceDetailEl.textContent = `Réparation ${typeLabel} (${qualLabel}) sur ${modelLabel}.`;
}

Type_Probleme.forEach(btn => {
  btn.addEventListener("click", () => { selectedType = btn.dataset.type; update_Type_Probleme(); Prix(); });
});
Qualiter.forEach(btn => {
  btn.addEventListener("click", () => { selectedQuality = btn.dataset.quality; update_Qualiter(); Prix(); });
});
if (Modele) {
  Modele.addEventListener("change", e => { selectedModel = e.target.value; Prix(); });
}
loadTarifs();