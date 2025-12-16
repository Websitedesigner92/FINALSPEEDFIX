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
  const priceValueEl = document.getElementById("priceValue");
  const currencySymbolEl = document.getElementById("currencySymbol");
  const priceDetailEl = document.getElementById("priceDetail");
  const tvaBadge = document.getElementById("tva-badge");

  // Style de base pour le gros texte (Dégradé Blanc vers Gris + Ombre portée)
  const baseClasses = "font-display font-black tracking-tighter drop-shadow-xl transition-all duration-300 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent";

  // Fonction utilitaire pour gérer l'affichage de l'Euro
  const toggleCurrency = (show) => {
    if (currencySymbolEl) {
      if (show) {
        currencySymbolEl.classList.remove("hidden");
        // Petit effet d'apparition
        currencySymbolEl.classList.add("opacity-100", "translate-y-0");
        currencySymbolEl.classList.remove("opacity-0", "translate-y-2");
      } else {
        currencySymbolEl.classList.add("hidden");
      }
    }
  };

  if (!tarifsData || !tarifsData.iphone) return;

  // --- CAS 1 : RIEN SÉLECTIONNÉ ---
  if (!selectedType || !selectedModel || !selectedQuality) {
    if (priceValueEl) {
      priceValueEl.textContent = "--";
      // On garde une taille grande mais grisée
      priceValueEl.className = `${baseClasses} text-5xl md:text-7xl opacity-30`; 
    }
    toggleCurrency(false);
    
    if (priceDetailEl) priceDetailEl.innerHTML = "Sélectionnez vos options <br>pour voir le tarif.";
    if (tvaBadge) tvaBadge.classList.remove('opacity-100');
    return;
  }

  // --- RÉCUPÉRATION DONNÉES ---
  const modelData = tarifsData.iphone[selectedModel];
  const serviceData = modelData[selectedType];
  let jsonKey = selectedQuality;

  if (selectedType === 'chassis') {
    if (selectedQuality === 'eco') jsonKey = 'Vitre_AR';
    if (selectedQuality === 'premium') jsonKey = 'chassis-prix';
  }

  const priceRaw = serviceData ? serviceData[jsonKey] : null;

  // --- CAS 2 : DEVIS ---
  if (priceRaw === "NAN" || priceRaw === null) {
    if (priceValueEl) {
      priceValueEl.textContent = "Sur Devis";
      // Taille un peu plus petite pour que le mot "Devis" rentre bien
      priceValueEl.className = `${baseClasses} text-7xl text-white`;
    }
    toggleCurrency(false);

    if (tvaBadge) tvaBadge.classList.remove('opacity-100');

  } else {
    // --- CAS 3 : PRIX NORMAL ---
    const priceTTC = parseFloat(priceRaw);

    if (priceValueEl) {
      priceValueEl.textContent = priceTTC;
      // Taille Maximale pour le prix
      priceValueEl.className = `${baseClasses} text-7xl `;
    }
    toggleCurrency(true);


    if (tvaBadge) tvaBadge.classList.add('opacity-100');
  }

  // --- TEXTES DESCRIPTIFS ---
  const modelLabel = modelData.label || selectedModel;
  let labelService = "";
  
  switch (selectedType) {
    case 'ecran': labelService = (selectedQuality === 'eco') ? "Écran Gamme Éco" : "Écran Original"; break;
    case 'batterie': labelService = (selectedQuality === 'eco') ? "Batterie Compatible" : "Batterie Origine"; break;
    case 'chassis': labelService = (jsonKey === "Vitre_AR") ? "Vitre Arrière" : "Châssis Complet"; break;
    default: labelService = "Réparation";
  }

  if (priceDetailEl) {
     // Mise en page plus propre du texte de détail
     priceDetailEl.innerHTML = `
        <span class="block text-xs uppercase tracking-widest opacity-60 mb-1">Estimation pour</span>
        <span class= "">${labelService}</span> 
        <span class=""> sur </span> 
        <span class="">${modelLabel}</span>
     `;
  }
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

