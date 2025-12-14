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
  const currencySymbolEl = document.getElementById("currencySymbol"); // Nouveau sélecteur
  const priceValueHTEl = document.getElementById("priceValueHT");
  const priceContainerHT = document.getElementById("price-ht-container");
  const priceDetailEl = document.getElementById("priceDetail");
  const tvaBadge = document.getElementById("tva-badge");

  // Fonction utilitaire pour gérer l'affichage de l'Euro
  const toggleCurrency = (show) => {
    if (currencySymbolEl) {
      if (show) currencySymbolEl.classList.remove("hidden");
      else currencySymbolEl.classList.add("hidden");
    }
  };

  if (!tarifsData || !tarifsData.iphone) return;

  // --- CAS 1 : RIEN SÉLECTIONNÉ ---
  if (!selectedType || !selectedModel || !selectedQuality) {
    if (priceValueEl) {
      priceValueEl.textContent = "--";
      // Taille renforcée par défaut
      priceValueEl.className = "font-black text-white/60 tracking-tighter drop-shadow-2xl text-8xl md:text-9xl transition-all duration-300"; 
    }
    toggleCurrency(false);
    
    if (priceDetailEl) priceDetailEl.textContent = "Sélectionnez vos options.";
    if (priceContainerHT) {
        priceContainerHT.style.height = "0px";
        priceContainerHT.classList.remove('opacity-100', 'mt-4');
        priceContainerHT.classList.add('opacity-0');
    }
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

  // --- AFFICHAGE ---
  if (priceRaw === "NAN" || priceRaw === null) {
    if (priceValueEl) {
      priceValueEl.textContent = "Devis";
      priceValueEl.className = "font-black text-white tracking-tighter drop-shadow-2xl text-7xl md:text-9xl transition-all duration-300";
    }
    toggleCurrency(false);

    if (priceContainerHT) {
        priceContainerHT.style.height = "0px";
        priceContainerHT.classList.remove('opacity-100', 'mt-4');
        priceContainerHT.classList.add('opacity-0');
    }
    if (tvaBadge) tvaBadge.classList.remove('opacity-100');

  }  else {
    // --- CAS 3 : PRIX NORMAL ---
    const priceTTC = parseFloat(priceRaw);
    const priceHT = (priceTTC / 1.2).toFixed(2);

    if (priceValueEl) {
      priceValueEl.textContent = priceTTC;
      priceValueEl.className = "font-black text-white tracking-tighter drop-shadow-2xl text-8xl md:text-9xl transition-all duration-300";
    }
    toggleCurrency(true); // On affiche l'euro

    if (priceValueHTEl) priceValueHTEl.textContent = priceHT;

    if (priceContainerHT) {
        priceContainerHT.classList.remove('opacity-0');
        priceContainerHT.classList.add('opacity-100', 'mt-4');
        priceContainerHT.style.height = "auto"; 
    }
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
     priceDetailEl.innerHTML = `Estimation pour <span class="text-primary font-bold">${labelService}</span> sur <span class="text-white font-bold">${modelLabel}</span>.`;
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

