
// --- FONCTIONS CAPTCHA ---
function initCaptcha() {
  const contactForm = document.getElementById("contactForm");
  const captchaCanvas = document.getElementById("captcha-canvas");
  const captchaAnswerInput = document.getElementById("captcha-answer");
  const captchaError = document.getElementById("captcha-error");
  let captchaCode = "";

  function randomColor() {
    const r = Math.floor(Math.random() * 200);
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    return `rgb(${r},${g},${b})`;
  }

  window.generateCaptcha = function () {
    if (!captchaCanvas) return;
    const ctx = captchaCanvas.getContext("2d");
    const width = captchaCanvas.width;
    const height = captchaCanvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, width, height);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    captchaCode = "";
    for (let i = 0; i < 4; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      captchaCode += char;
      ctx.save();
      const x = 20 + i * 22;
      const y = 30 + Math.random() * 10;
      const angle = (Math.random() - 0.5) * 0.5;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = "bold 28px Arial";
      ctx.fillStyle = randomColor();
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.strokeStyle = randomColor();
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  generateCaptcha();

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userAnswer = captchaAnswerInput.value.toUpperCase().trim();

    if (userAnswer !== captchaCode) {
      // ERREUR CAPTCHA
      captchaError.classList.remove("hidden");
      captchaAnswerInput.classList.add("border-red-500");
      showToast("Code de sécurité incorrect", "error");
      generateCaptcha();
      captchaAnswerInput.value = "";
    } else {
      // SUCCÈS
      captchaError.classList.add("hidden");
      captchaAnswerInput.classList.remove("border-red-500");

      showToast("Message envoyé avec succès !", "success");

      // NETTOYAGE COMPLET (Formulaire + LocalStorage)
      contactForm.reset();
      const inputs = contactForm.querySelectorAll('input, textarea');
      inputs.forEach(input => localStorage.removeItem('autosave_' + input.name));

      generateCaptcha();
    }
  });
}




