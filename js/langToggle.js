document.addEventListener("DOMContentLoaded", () => {
  const langBtn = document.getElementById("toggle-lang");
  let currentLang = localStorage.getItem("lang") || "EN";
  langBtn.innerText = currentLang;
  applyTranslations(currentLang);

  langBtn.addEventListener("click", () => {
    currentLang = currentLang === "EN" ? "TA" : "EN";
    localStorage.setItem("lang", currentLang);
    langBtn.innerText = currentLang;
    applyTranslations(currentLang);
  });
});

const translationDict = {
  EN: {
    "#header-title": "Library Management System",
    "#hero h1": "Welcome to the Ultimate LMS",
    "#hero p": "Your gateway to exploring and managing a world of books.",
    "#features h2": "Key Features",
    "#about h2": "About LMS",
    "#contact h2": "Contact Us"
  },
  TA: {
    "#header-title": "நூலக மேலாண்மை அமைப்பு",
    "#hero h1": "அல்டிமேட் LMS-க்கு வரவேற்கிறோம்",
    "#hero p": "உலகின் நூல்களை ஆராய்ந்து நிர்வகிக்க உங்கள் வாயில்.",
    "#features h2": "முக்கிய அம்சங்கள்",
    "#about h2": "LMS பற்றி",
    "#contact h2": "தொடர்பு கொள்ளவும்"
  }
};

function applyTranslations(lang) {
  const dict = translationDict[lang];
  if (!dict) return;
  for (const selector in dict) {
    const el = document.querySelector(selector);
    if (el) {
      el.innerText = dict[selector];
    }
  }
}
