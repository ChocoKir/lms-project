// js/langToggle.js
document.addEventListener("DOMContentLoaded", () => {
  const langBtn = document.getElementById("toggle-lang");
  if (!langBtn) return;
  
  let currentLang = localStorage.getItem("lang") || "EN";
  
  const translations = {
    EN: {
      headerTitle: "Library Management System",
      adminHeader: "Library Management System - Admin Panel",
      loginHeading: "Login",
      registerHeading: "Register",
      searchPlaceholder: "Search by title",
      authorPlaceholder: "Search by author",
      sortByTitle: "Sort by Title",
      sortByAuthor: "Sort by Author",
      chatButton: "Chat",
      profileButton: "My Profile",
      logoutButton: "Logout",
      addBookPlaceholderName: "Book Name",
      addBookPlaceholderAuthor: "Author Name",
      addBookPlaceholderImage: "Image URL (optional)",
      addBookButton: "Add Book"
    },
    TA: {
      headerTitle: "நூலக மேலாண்மை அமைப்பு",
      adminHeader: "நூலக மேலாண்மை அமைப்பு - நிர்வாக பேனல்",
      loginHeading: "உள்நுழைவு",
      registerHeading: "பதிவு",
      searchPlaceholder: "தலைப்பினால் தேடுங்கள்",
      authorPlaceholder: "ஆசிரியரால் தேடுங்கள்",
      sortByTitle: "தலைப்பின் அடிப்படையில் வரிசைப்படுத்து",
      sortByAuthor: "ஆசிரியரின் அடிப்படையில் வரிசைப்படுத்து",
      chatButton: "சாட்",
      profileButton: "எனது சுயவிவரம்",
      logoutButton: "வெளியேறு",
      addBookPlaceholderName: "புத்தகத்தின் பெயர்",
      addBookPlaceholderAuthor: "ஆசிரியரின் பெயர்",
      addBookPlaceholderImage: "பட URL (விருப்பம்)",
      addBookButton: "புத்தகம் சேர்க்கவும்"
    }
  };

  function applyTranslations(lang) {
    const headerTitle = document.getElementById("header-title");
    if (headerTitle) {
      if (window.location.pathname.includes("admin.html")) {
        headerTitle.innerText = translations[lang].adminHeader;
      } else {
        headerTitle.innerText = translations[lang].headerTitle;
      }
    }
    const heading = document.querySelector(".login-box h2");
    if (heading) {
      if (window.location.pathname.includes("register.html")) {
        heading.innerText = translations[lang].registerHeading;
      } else {
        heading.innerText = translations[lang].loginHeading;
      }
    }
    const searchInput = document.getElementById("search");
    if (searchInput) searchInput.placeholder = translations[lang].searchPlaceholder;
    const authorInput = document.getElementById("search-author");
    if (authorInput) authorInput.placeholder = translations[lang].authorPlaceholder;
    const sortSelect = document.getElementById("sort-by");
    if (sortSelect && sortSelect.options.length >= 2) {
      sortSelect.options[0].text = translations[lang].sortByTitle;
      sortSelect.options[1].text = translations[lang].sortByAuthor;
    }
    const chatBtn = document.getElementById("chat-btn");
    if (chatBtn) chatBtn.innerText = translations[lang].chatButton;
    const profileBtn = document.getElementById("profile-btn");
    if (profileBtn) profileBtn.innerText = translations[lang].profileButton;
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) logoutBtn.innerText = translations[lang].logoutButton;
    const bookNameInput = document.getElementById("book-name");
    if (bookNameInput) bookNameInput.placeholder = translations[lang].addBookPlaceholderName;
    const bookAuthorInput = document.getElementById("book-author");
    if (bookAuthorInput) bookAuthorInput.placeholder = translations[lang].addBookPlaceholderAuthor;
    const bookImageInput = document.getElementById("book-image");
    if (bookImageInput) bookImageInput.placeholder = translations[lang].addBookPlaceholderImage;
    const addBookBtn = document.querySelector("#add-book-form button");
    if (addBookBtn) addBookBtn.innerText = translations[lang].addBookButton;
  }
  
  applyTranslations(currentLang);
  langBtn.innerText = currentLang;
  
  langBtn.addEventListener("click", () => {
    currentLang = currentLang === "EN" ? "TA" : "EN";
    localStorage.setItem("lang", currentLang);
    langBtn.innerText = currentLang;
    applyTranslations(currentLang);
  });
});
