document.addEventListener("DOMContentLoaded", () => {
  // Mobile Nav Toggle
  setupMobileNav();

  // Scroll Reveal Animations
  setupScrollReveal();

  // Initialize profile logo wrapper & login modal
  setupProfileModal();

  // Check if we are on index.html or home page (has trending container)
  const articlesContainer = document.getElementById("trending-container");
  if (articlesContainer) {
    initHomePage();
  }

  // Handle newsletter subscriptions globally
  setupNewsletter();

  // Handle contact form logic if on contact.html
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    initContactPage();
  }
});

// Mobile menu toggle logic
function setupMobileNav() {
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const navLinks = document.getElementById("nav-links-menu");

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", () => {
      if (navLinks.style.display === "flex") {
        navLinks.style.display = "none";
        mobileToggle.innerHTML = "☰";
      } else {
        navLinks.style.display = "flex";
        navLinks.style.flexDirection = "column";
        navLinks.style.position = "absolute";
        navLinks.style.top = "var(--header-height)";
        navLinks.style.left = "0";
        navLinks.style.width = "100%";
        navLinks.style.backgroundColor = "var(--bg-secondary)";
        navLinks.style.padding = "20px";
        navLinks.style.borderBottom = "1px solid var(--border-color)";
        mobileToggle.innerHTML = "✕";
      }
    });
  }
}

// State Object for Homepage Filtering
const state = {
  category: "all",
  tag: null,
  search: ""
};

// Homepage Initializer
function initHomePage() {
  const articles = window.articlesData || [];
  
  // 1. Read URL Category parameter on load
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get("cat");
  if (catParam) {
    state.category = catParam.toLowerCase();
    
    // Highlight correct menu
    document.querySelectorAll("#nav-links-menu li").forEach(li => {
      li.classList.remove("active");
      const a = li.querySelector("a");
      if (a && a.getAttribute("href").includes(`cat=${catParam}`)) {
        li.classList.add("active");
      }
    });
  }

  // 2. Setup menu filters dynamically without page reloads if already on home page
  setupMenuNavigation();

  // 3. Render Widgets
  renderSubHeaderTags(articles);
  renderRekomendasiWidget(articles);
  renderTrendingTopicsWidget();
  renderRegionalCategories();

  // 4. Run initial filter rendering
  applyFilters();

  // 5. Setup search bar listener
  setupSearch();
}

// Intercept Menu Clicks on Homepage for dynamic filtering
function setupMenuNavigation() {
  const navLinks = document.querySelectorAll("#nav-links-menu a");
  
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      
      // If we are on index.html, filter dynamically instead of reloading
      if (document.getElementById("trending-container")) {
        if (href.includes("cat=")) {
          e.preventDefault();
          const cat = href.split("cat=")[1];
          
          document.querySelectorAll("#nav-links-menu li").forEach(li => li.classList.remove("active"));
          link.parentElement.classList.add("active");
          
          state.category = cat.toLowerCase();
          state.tag = null; // reset tag
          applyFilters();
          
          // Smooth scroll to top of feed
          document.getElementById("trending-container").scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (href === "index.html" || href === "") {
          e.preventDefault();
          document.querySelectorAll("#nav-links-menu li").forEach(li => li.classList.remove("active"));
          link.parentElement.classList.add("active");
          
          state.category = "all";
          state.tag = null; // reset tag
          applyFilters();
        }
      }
    });
  });
}

// Renders the horizontal list keyword tags at the top
function renderSubHeaderTags(articles) {
  const container = document.getElementById("sub-header-tags-container");
  if (!container) return;

  // Extract top tags from data
  const allTags = [];
  articles.forEach(art => {
    if (art.tags) allTags.push(...art.tags);
  });
  
  // Unique tags list
  const uniqueTags = [...new Set(allTags)].slice(0, 10);

  container.innerHTML = uniqueTags.map(tag => `
    <button class="sub-header-tag" data-tag="${tag}">#${tag}</button>
  `).join("");

  // Setup click handler
  const tagBtns = container.querySelectorAll(".sub-header-tag");
  tagBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tag = btn.getAttribute("data-tag");
      
      if (btn.classList.contains("active")) {
        btn.classList.remove("active");
        state.tag = null;
      } else {
        tagBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.tag = tag;
      }
      applyFilters();
    });
  });
}

// Renders the horizontal list of trending items (left column)
function renderTrendingArticles(articlesList) {
  const container = document.getElementById("trending-container");
  if (!container) return;

  if (articlesList.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <p>Tidak ada artikel trending untuk kategori atau kata kunci ini.</p>
      </div>
    `;
    return;
  }

  // Display top 4 articles as Trending list
  const trendingList = articlesList.slice(0, 4);

  container.innerHTML = trendingList.map(article => `
    <article class="trending-item reveal fade-up">
      <div class="trending-img-wrapper">
        <a href="article.html?id=${article.id}">
          <img src="${article.thumbnail}" alt="${article.title}" class="trending-img" onerror="this.src='https://placehold.co/200x120/161616/C68E17?text=Article'">
        </a>
      </div>
      <div class="trending-info">
        <span class="trending-cat">${article.category}</span>
        <h3 class="trending-title">
          <a href="article.html?id=${article.id}">${article.title}</a>
        </h3>
        <div class="trending-meta">
          <span>Oleh ${article.author || "Rhevalino Armadyta"}</span>
          <span>•</span>
          <span>${article.date}</span>
          <span>•</span>
          <span>${article.readTime} Min Baca</span>
        </div>
      </div>
    </article>
  `).join("");

  setupScrollReveal();
}

// Renders the sidebar recommended widget
function renderRekomendasiWidget(articles) {
  const container = document.getElementById("rekomendasi-container");
  if (!container) return;

  // Let's get 3 articles that are not the primary trending ones or just any 3
  const recList = articles.slice(3, 7);
  if (recList.length === 0) {
    container.innerHTML = `<div style="font-size: 0.85rem; color: var(--text-muted);">Tidak ada rekomendasi saat ini.</div>`;
    return;
  }

  container.innerHTML = recList.map(article => `
    <div class="rekomendasi-item">
      <div class="rekomendasi-img-wrapper">
        <a href="article.html?id=${article.id}">
          <img src="${article.thumbnail}" alt="${article.title}" class="rekomendasi-img" onerror="this.src='https://placehold.co/90x60/161616/C68E17?text=Article'">
        </a>
      </div>
      <div>
        <div class="rekomendasi-cat" style="font-size: 0.7rem;">${article.category}</div>
        <h4 class="rekomendasi-title">
          <a href="article.html?id=${article.id}">${article.title}</a>
        </h4>
        <div class="rekomendasi-meta" style="font-size: 0.7rem;">${article.date}</div>
      </div>
    </div>
  `).join("");
}

// Renders the sidebar trending topics (1-9 list)
function renderTrendingTopicsWidget() {
  const container = document.getElementById("trending-topics-container");
  if (!container) return;

  // Real hot topics list matching user screenshot
  const topics = [
    { title: "Indonesia Summit 2026", query: "summit" },
    { title: "Badan Gizi Nasional", query: "gizi" },
    { title: "Nilai Tukar Rupiah", query: "keuangan" },
    { title: "Prabowo Subianto", query: "stoikisme" },
    { title: "Piala Dunia 2026", query: "piala dunia" },
    { title: "Haji 2026", query: "haji" },
    { title: "Harga BBM", query: "bbm" },
    { title: "Pertamax", query: "listrik" },
    { title: "Makan Bergizi Gratis", query: "gizi" }
  ];

  container.innerHTML = topics.map((t, idx) => `
    <div class="topic-item">
      <span class="topic-num">${idx + 1}</span>
      <h4 class="topic-title">
        <a href="#" class="topic-link" data-query="${t.query}">${t.title}</a>
      </h4>
      <span class="topic-arrow">›</span>
    </div>
  `).join("");

  // Setup click filters
  container.querySelectorAll(".topic-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const q = link.getAttribute("data-query");
      document.getElementById("search-input").value = q;
      state.search = q;
      applyFilters();
      
      document.getElementById("trending-container").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// Renders the middle regional circular category slider
function renderRegionalCategories() {
  const container = document.getElementById("regional-categories-container");
  if (!container) return;

  const categories = [
    { name: "Business", slug: "business", image: "file:///Users/rhevalinoarmadytagmail.com/.gemini/antigravity/brain/42aa2b49-3a3a-42ee-83c2-ce8444a3f114/business_concept_1781223217450.png" },
    { name: "News", slug: "news", image: "file:///Users/rhevalinoarmadytagmail.com/.gemini/antigravity/brain/42aa2b49-3a3a-42ee-83c2-ce8444a3f114/pr_concept_1781223230751.png" },
    { name: "Science", slug: "science", image: "file:///Users/rhevalinoarmadytagmail.com/.gemini/antigravity/brain/42aa2b49-3a3a-42ee-83c2-ce8444a3f114/env_concept_1781223245926.png" },
    { name: "Life", slug: "life", image: "file:///Users/rhevalinoarmadytagmail.com/.gemini/antigravity/brain/42aa2b49-3a3a-42ee-83c2-ce8444a3f114/stoic_concept_1781223259887.png" },
    { name: "Travel", slug: "travel", image: "file:///Users/rhevalinoarmadytagmail.com/.gemini/antigravity/brain/42aa2b49-3a3a-42ee-83c2-ce8444a3f114/env_concept_1781223245926.png" },
    { name: "Sport", slug: "sport", image: "file:///Users/rhevalinoarmadytagmail.com/.gemini/antigravity/brain/42aa2b49-3a3a-42ee-83c2-ce8444a3f114/project_concept_1781223276696.png" }
  ];

  container.innerHTML = categories.map(cat => `
    <div class="regional-item" data-slug="${cat.slug}">
      <div class="regional-icon-wrapper">
        <img src="${cat.image}" alt="${cat.name}" onerror="this.src='https://placehold.co/70x70/161616/C68E17?text=${cat.name}'">
      </div>
      <span class="regional-name">${cat.name}</span>
    </div>
  `).join("");

  // Setup click filter
  container.querySelectorAll(".regional-item").forEach(item => {
    item.addEventListener("click", () => {
      const slug = item.getAttribute("data-slug");
      state.category = slug;
      state.tag = null; // reset tag
      
      // Update nav link active state
      document.querySelectorAll("#nav-links-menu li").forEach(li => {
        li.classList.remove("active");
        const a = li.querySelector("a");
        if (a && a.getAttribute("href").includes(`cat=${slug}`)) {
          li.classList.add("active");
        }
      });

      applyFilters();
      document.getElementById("trending-container").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// Renders the Latest block grid (bottom)
function renderLatestGrid(articlesList) {
  const container = document.getElementById("latest-grid-container");
  if (!container) return;

  if (articlesList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
        <p>Tidak ada artikel terbaru untuk kategori atau kata kunci ini.</p>
      </div>
    `;
    return;
  }

  // Display all filtered articles, skipping the top 2 if we are showing all
  let displayList = articlesList;
  if (state.category === "all" && articlesList.length > 2) {
    displayList = articlesList.slice(2);
  }

  container.innerHTML = displayList.map(article => `
    <article class="article-card reveal" data-category="${article.categorySlug}">
      <div class="card-img-wrapper">
        <a href="article.html?id=${article.id}">
          <img src="${article.thumbnail}" alt="${article.title}" class="card-img" onerror="this.src='https://placehold.co/400x250/161616/C68E17?text=Article'">
        </a>
      </div>
      <div class="card-content">
        <div class="card-category">
          <span class="badge" style="background-color: var(--accent); color: #000;">${article.category}</span>
        </div>
        <h3 class="card-title">
          <a href="article.html?id=${article.id}">${article.title}</a>
        </h3>
        <p class="card-excerpt">${article.summary}</p>
        <div class="card-footer">
          <span style="font-size: 0.8rem; color: var(--text-muted);">${article.date}</span>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${article.readTime} Min Baca</span>
        </div>
      </div>
    </article>
  `).join("");

  setupScrollReveal();
}

// Setup search bar binding
function setupSearch() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    state.search = e.target.value.toLowerCase().trim();
    applyFilters();
  });
}

// Filter core logic and dispatch renderers
function applyFilters() {
  const articles = window.articlesData || [];
  let filtered = articles;

  // 1. Filter by category
  if (state.category !== "all") {
    filtered = filtered.filter(art => art.categorySlug === state.category);
  }

  // 2. Filter by tag
  if (state.tag !== null) {
    filtered = filtered.filter(art => art.tags && art.tags.includes(state.tag));
  }

  // 3. Filter by search query
  if (state.search !== "") {
    const q = state.search;
    filtered = filtered.filter(art => 
      art.title.toLowerCase().includes(q) || 
      art.summary.toLowerCase().includes(q) ||
      (art.tags && art.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  // Dispatch to Trending and Latest
  renderTrendingArticles(filtered);
  renderLatestGrid(filtered);
}

// Newsletter Sign-up Mock Functionality
function setupNewsletter() {
  const forms = document.querySelectorAll(".newsletter-form, .article-newsletter-form");
  if (forms.length === 0) return;

  forms.forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type='email']");
      const successMsg = form.nextElementSibling || form.querySelector(".newsletter-success");
      
      if (input && input.value.trim() !== "") {
        if (successMsg) {
          successMsg.style.display = "block";
          successMsg.innerText = `Terima kasih! Email ${input.value} telah terdaftar.`;
        }
        input.value = "";
        
        setTimeout(() => {
          if (successMsg) successMsg.style.display = "none";
        }, 5000);
      }
    });
  });
}

// Scroll Reveal Intersection Observer
function setupScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => observer.observe(el));
}

// Contact & Booking Page initialization
function initContactPage() {
  const form = document.getElementById("contact-form");
  const successMsg = document.getElementById("contact-success-msg");

  if (form && successMsg) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("contact-name").value;
      
      successMsg.style.display = "block";
      successMsg.innerHTML = `Pesan terkirim! Terima kasih <strong>${name}</strong>, saya akan menghubungi Anda kembali segera.`;
      
      form.reset();
      
      setTimeout(() => {
        successMsg.style.display = "none";
      }, 5000);
    });
  }

  // Mock Calendly scheduling selection
  const dates = document.querySelectorAll(".calendar-date:not(.empty):not(.disabled)");
  const slotsContainer = document.getElementById("booking-slots-container");

  if (dates.length > 0 && slotsContainer) {
    dates.forEach(date => {
      date.addEventListener("click", () => {
        dates.forEach(d => d.classList.remove("active"));
        date.classList.add("active");
        
        const day = date.innerText;
        slotsContainer.innerHTML = `
          <div class="booking-slot-title">Waktu Tersedia - ${day} Juni 2026</div>
          <button class="booking-slot-btn" onclick="alert('Jadwal konsultasi berhasil dipesan untuk tanggal ${day} Juni pukul 10:00 WIB!')">10:00 - 10:30 WIB</button>
          <button class="booking-slot-btn" onclick="alert('Jadwal konsultasi berhasil dipesan untuk tanggal ${day} Juni pukul 13:00 WIB!')">13:00 - 13:30 WIB</button>
          <button class="booking-slot-btn" onclick="alert('Jadwal konsultasi berhasil dipesan untuk tanggal ${day} Juni pukul 15:30 WIB!')">15:30 - 16:00 WIB</button>
        `;
      });
    });
  }
}

// ============================================================
//  setupProfileModal  —  SSO via Firebase Auth
//  Mendukung: Google · Apple · Phone OTP (nyata)
//  Fallback: demo mode jika Firebase belum dikonfigurasi
// ============================================================
function setupProfileModal() {

  /* ── 1. Inject Modal Markup ── */
  if (!document.getElementById('profile-modal')) {
    const modal = document.createElement('div');
    modal.id = 'profile-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-label="Login / Profil">
        <button class="modal-close-btn" id="modal-close" aria-label="Tutup">&times;</button>
        <div id="modal-loading" class="modal-loading-overlay">
          <div class="modal-spinner"></div>
          <p id="modal-loading-text" style="margin-top:16px;font-weight:600;color:var(--text-primary)">Menghubungkan&hellip;</p>
        </div>
        <div id="recaptcha-container"></div>
        <div id="modal-content-area"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  /* ── 2. Firebase auth state listener ── */
  if (window.DytanospaceAuth) {
    DytanospaceAuth.onAuthStateChanged(function(user) {
      var trigger = document.getElementById('profile-trigger');
      if (!trigger) return;
      if (user) {
        var firstName = (user.displayName || 'Akun').split(' ')[0];
        trigger.setAttribute('data-logged-in', 'true');
        trigger.title = 'Halo, ' + firstName + ' — klik untuk profil';
      } else {
        trigger.removeAttribute('data-logged-in');
        trigger.title = 'Klik untuk Masuk / Daftar';
      }
    });
  }

  /* ── 3. Wire trigger & close ── */
  var trigger = document.getElementById('profile-trigger');
  if (trigger) {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      _renderModalState();
      document.getElementById('profile-modal').classList.add('open');
    });
    trigger.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        _renderModalState();
        document.getElementById('profile-modal').classList.add('open');
      }
    });
  }

  document.getElementById('modal-close') &&
    document.getElementById('modal-close').addEventListener('click', _closeModal);

  var modalOverlay = document.getElementById('profile-modal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) _closeModal();
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') _closeModal();
  });

  /* ── State lokal ── */
  var _activeTab   = 'signin';
  var _phoneStep   = 'input';
  var _phoneNumber = '';
  var _otpTimer    = null;
  var _otpSecs     = 59;
  var _isBusy      = false;

  function _closeModal() {
    var m = document.getElementById('profile-modal');
    if (m) m.classList.remove('open');
    clearInterval(_otpTimer);
  }

  function _setLoading(visible, text) {
    var el  = document.getElementById('modal-loading');
    var txt = document.getElementById('modal-loading-text');
    if (!el) return;
    if (txt && text) txt.textContent = text;
    if (visible) el.classList.add('visible');
    else el.classList.remove('visible');
  }

  function _showError(msg) {
    var errBox = document.getElementById('modal-error-box');
    if (!errBox) {
      errBox = document.createElement('div');
      errBox.id = 'modal-error-box';
      errBox.style.cssText = [
        'background:#fff3f0',
        'border:1px solid rgba(180,50,50,.25)',
        'border-radius:6px',
        'padding:10px 14px',
        'margin-bottom:14px',
        'font-size:.82rem',
        'color:#c0392b',
        'display:flex',
        'align-items:center',
        'gap:8px'
      ].join(';');
    }
    errBox.innerHTML = '<span>&#9888;</span><span>' + msg + '</span>';
    var area = document.getElementById('modal-content-area');
    if (area) area.prepend(errBox);
    setTimeout(function() { if (errBox.parentNode) errBox.parentNode.removeChild(errBox); }, 5000);
  }

  function _friendlyError(err) {
    var code = err.code || '';
    var map = {
      'auth/popup-closed-by-user':      'Jendela login ditutup. Silakan coba lagi.',
      'auth/popup-blocked':             'Pop-up diblokir browser. Izinkan pop-up untuk situs ini.',
      'auth/cancelled-popup-request':   'Permintaan login dibatalkan.',
      'auth/account-exists-with-different-credential': 'Email sudah terdaftar dengan metode lain.',
      'auth/invalid-phone-number':      'Nomor telepon tidak valid. Gunakan format +62 atau 08xxx.',
      'auth/too-many-requests':         'Terlalu banyak percobaan. Tunggu beberapa saat.',
      'auth/invalid-verification-code': 'Kode OTP salah. Periksa SMS Anda.',
      'auth/code-expired':              'Kode OTP kedaluwarsa. Kirim ulang OTP.',
      'auth/network-request-failed':    'Koneksi gagal. Periksa internet Anda.',
      'auth/operation-not-allowed':     'Metode login belum diaktifkan di Firebase Console.',
      'auth/user-disabled':             'Akun ini telah dinonaktifkan.'
    };
    return map[code] || (err.message || 'Terjadi kesalahan. Silakan coba lagi.');
  }

  function _getProviderLabel(user) {
    if (user._provider) return user._provider;
    if (user.providerData && user.providerData.length > 0) {
      var pid = user.providerData[0].providerId;
      if (pid === 'google.com') return 'Google';
      if (pid === 'apple.com')  return 'Apple';
      if (pid === 'phone')      return 'Phone';
    }
    if (user.phoneNumber) return 'Phone';
    return 'SSO';
  }

  function _startOtpCountdown() {
    clearInterval(_otpTimer);
    _otpSecs = 59;
    _otpTimer = setInterval(function() {
      _otpSecs--;
      var el = document.getElementById('otp-timer-text');
      if (!el) { clearInterval(_otpTimer); return; }
      if (_otpSecs > 0) {
        el.textContent = 'Kirim ulang OTP dalam ' + _otpSecs + 's';
      } else {
        clearInterval(_otpTimer);
        el.innerHTML = '<a href="#" id="resend-otp-btn" style="color:var(--accent);font-weight:700;text-decoration:none">Kirim Ulang OTP</a>';
        var resendBtn = document.getElementById('resend-otp-btn');
        if (resendBtn) {
          resendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (_isBusy) return;
            _isBusy = true;
            _setLoading(true, 'Mengirim ulang OTP\u2026');
            var doResend = Auth && Auth.isReady()
              ? Auth.resendPhoneOTP(_phoneNumber, 'recaptcha-container')
              : Promise.resolve();
            doResend.then(function() {
              _startOtpCountdown();
            }).catch(function(err) {
              _showError(_friendlyError(err));
            }).finally(function() {
              _setLoading(false);
              _isBusy = false;
            });
          });
        }
      }
    }, 1000);
  }

  /* Demo sign-in (no Firebase) */
  function _demoSignIn(displayName, email, photoURL, providerLabel) {
    return new Promise(function(resolve) {
      var demoUser = { displayName: displayName, email: email, photoURL: photoURL, _provider: providerLabel };
      sessionStorage.setItem('dytan_demo_user', JSON.stringify(demoUser));

      var origGet    = DytanospaceAuth.getCurrentUser;
      var origSignOut = DytanospaceAuth.signOut;

      DytanospaceAuth.getCurrentUser = function() {
        var raw = sessionStorage.getItem('dytan_demo_user');
        if (!raw) return null;
        var u = JSON.parse(raw);
        return { displayName: u.displayName, email: u.email, phoneNumber: null, photoURL: u.photoURL, _provider: u._provider, _isDemo: true };
      };
      DytanospaceAuth.signOut = function() {
        sessionStorage.removeItem('dytan_demo_user');
        DytanospaceAuth.getCurrentUser = origGet;
        DytanospaceAuth.signOut = origSignOut;
        return Promise.resolve();
      };
      setTimeout(resolve, 500);
    });
  }

  var Auth = window.DytanospaceAuth;

  /* ════════════════════════════════════════════
     RENDER UTAMA
  ════════════════════════════════════════════ */
  function _renderModalState() {
    var area = document.getElementById('modal-content-area');
    if (!area) return;
    clearInterval(_otpTimer);

    var firebaseReady = Auth && Auth.isReady();
    var currentUser   = Auth ? Auth.getCurrentUser() : null;

    /* ── A. Kartu Profil (sudah login) ── */
    if (currentUser) {
      var name     = currentUser.displayName || 'Pengguna dytanospace';
      var email    = currentUser.email || currentUser.phoneNumber || '\u2014';
      var avatar   = currentUser.photoURL || 'avatar.png';
      var provider = _getProviderLabel(currentUser);
      var initial  = encodeURIComponent(name[0] || 'U');

      area.innerHTML = [
        '<div class="profile-card">',
          '<div class="profile-avatar-wrapper">',
            '<img src="' + avatar + '" alt="Avatar" class="profile-avatar-img"',
              ' onerror="this.src=\'https://placehold.co/90x90/5C3317/FFF8F0?text=' + initial + '\'" >',
            '<span class="profile-badge">' + provider + '</span>',
          '</div>',
          '<h3 class="profile-name">' + name + '</h3>',
          '<p class="profile-email">' + email + '</p>',
          '<div class="profile-stats">',
            '<div class="profile-stat-box" style="border-right:1px solid var(--border-color)">',
              '<span class="profile-stat-num">5</span>',
              '<span class="profile-stat-label">Esai Tersimpan</span>',
            '</div>',
            '<div class="profile-stat-box">',
              '<span class="profile-stat-num">12</span>',
              '<span class="profile-stat-label">Komentar</span>',
            '</div>',
          '</div>',
          '<button id="btn-logout" class="modal-btn modal-submit-btn" style="width:100%">Keluar dari Akun</button>',
        '</div>'
      ].join('');

      document.getElementById('btn-logout') &&
        document.getElementById('btn-logout').addEventListener('click', function() {
          if (_isBusy) return;
          _isBusy = true;
          _setLoading(true, 'Keluar\u2026');
          (Auth ? Auth.signOut() : Promise.resolve())
            .then(function() { _renderModalState(); })
            .catch(function(err) { _showError(_friendlyError(err)); })
            .finally(function() { _setLoading(false); _isBusy = false; });
        });
      return;
    }

    /* ── B. Layar OTP ── */
    if (_phoneStep === 'otp') {
      area.innerHTML = [
        '<div class="modal-header">',
          '<h3 class="modal-title">Verifikasi OTP</h3>',
          '<p class="modal-desc">Kode OTP dikirim ke <strong style="color:var(--text-primary)">' + _phoneNumber + '</strong> via SMS.</p>',
        '</div>',
        '<form id="otp-form" class="modal-input-group">',
          '<input type="text" inputmode="numeric" maxlength="6" id="otp-input" class="modal-input"',
            ' placeholder="\u2014\u2014\u2014\u2014\u2014\u2014" autocomplete="one-time-code"',
            ' style="text-align:center;font-size:1.5rem;letter-spacing:.5em;font-weight:700" required>',
          '<button type="submit" class="modal-btn modal-submit-btn">Verifikasi &amp; Masuk</button>',
        '</form>',
        '<div class="modal-footer" style="margin-top:16px">',
          '<span id="otp-timer-text">Kirim ulang OTP dalam ' + _otpSecs + 's</span>',
          '<br><br>',
          '<a href="#" id="btn-back-phone" style="color:var(--accent);font-weight:600;text-decoration:none">\u2190 Ganti nomor</a>',
        '</div>'
      ].join('');

      _startOtpCountdown();

      document.getElementById('otp-form') &&
        document.getElementById('otp-form').addEventListener('submit', function(e) {
          e.preventDefault();
          if (_isBusy) return;
          var otp = document.getElementById('otp-input').value.trim();
          if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            _showError('Masukkan kode OTP 6 digit angka.');
            return;
          }
          _isBusy = true;
          _setLoading(true, 'Memverifikasi OTP\u2026');
          var doVerify = firebaseReady
            ? Auth.verifyPhoneOTP(otp)
            : (otp === '123456'
                ? _demoSignIn('Pengguna Demo', null, null, 'Phone')
                : Promise.reject({ message: 'Kode demo salah. Gunakan: 123456' }));
          doVerify.then(function() {
            clearInterval(_otpTimer);
            _phoneStep = 'input';
            _setLoading(false);
            _isBusy = false;
            _renderModalState(); // Tampilkan kartu profil setelah login berhasil
          }).catch(function(err) {
            _showError(_friendlyError(err));
            _setLoading(false);
            _isBusy = false;
          });
        });

      document.getElementById('btn-back-phone') &&
        document.getElementById('btn-back-phone').addEventListener('click', function(e) {
          e.preventDefault();
          clearInterval(_otpTimer);
          _phoneStep = 'input';
          _renderModalState();
        });
      return;
    }

    /* ── C. Layar Sign In / Sign Up ── */
    var isSignIn = _activeTab === 'signin';
    var demoBanner = firebaseReady ? '' : [
      '<div style="background:rgba(160,98,42,.1);border:1px solid rgba(160,98,42,.3);border-radius:6px;',
        'padding:10px 14px;margin-top:12px;font-size:.78rem;color:var(--accent);line-height:1.5">',
        '\u2699 <strong>Mode Demo</strong> \u2014 Firebase belum dikonfigurasi.<br>',
        'Isi <code>js/firebase-config.js</code> untuk SSO nyata.<br>',
        'Demo: Google/Apple masuk langsung &bull; OTP: kode <strong>123456</strong>',
      '</div>'
    ].join('');

    area.innerHTML = [
      '<div class="modal-tabs">',
        '<button class="modal-tab-btn ' + (isSignIn ? 'active' : '') + '" id="tab-signin-btn">Masuk</button>',
        '<button class="modal-tab-btn ' + (!isSignIn ? 'active' : '') + '" id="tab-signup-btn">Daftar</button>',
      '</div>',
      '<div class="modal-header" style="margin-top:12px">',
        '<h3 class="modal-title">' + (isSignIn ? 'Selamat Datang Kembali' : 'Bergabung dengan dytanospace') + '</h3>',
        '<p class="modal-desc">' + (isSignIn ? 'Masuk ke akunmu dan lanjutkan membaca.' : 'Buat akun untuk menyimpan artikel &amp; berdiskusi.') + '</p>',
        demoBanner,
      '</div>',
      '<div class="modal-options">',
        /* Google */
        '<button class="modal-btn" id="btn-google-auth" aria-label="Masuk dengan Google">',
          '<svg viewBox="0 0 24 24" width="18" height="18">',
            '<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>',
            '<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>',
            '<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>',
            '<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>',
          '</svg>',
          '<span>' + (isSignIn ? 'Masuk dengan Google' : 'Daftar dengan Google') + '</span>',
        '</button>',
        /* Apple */
        '<button class="modal-btn" id="btn-apple-auth" aria-label="Masuk dengan Apple"',
          ' style="background:#000;color:#fff;border-color:#000">',
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">',
            '<path d="M17.05 20.28c-.98.95-2.05 1.88-3.08 1.88-1.02 0-1.4-.61-2.52-.61-1.12 0-1.55.61-2.52.61-1.02 0-2.23-.97-3.2-1.92-2-1.95-3.52-5.5-3.52-8.83 0-5.28 3.44-8.08 6.82-8.08 1.07 0 2.08.4 2.74.81.65.42 1.48.97 2.15.97.67 0 1.25-.45 1.95-.91.86-.56 2.02-1.07 3.32-1.07 3.65 0 6.3 3.2 5.25 7.62-.85 2.5-2.73 6.36-4.16 7.42zM12.03 3.25c.02-2.13 1.8-3.86 3.93-3.9 0 2.25-1.87 4.01-4 3.9z"/>',
          '</svg>',
          '<span>' + (isSignIn ? 'Masuk dengan Apple' : 'Daftar dengan Apple') + '</span>',
        '</button>',
      '</div>',
      '<div class="modal-divider">atau gunakan Nomor Telepon</div>',
      '<form id="phone-form" class="modal-input-group">',
        '<div style="display:flex;gap:8px">',
          '<select id="phone-country" class="modal-input" style="flex:0 0 90px;padding:12px 6px;cursor:pointer">',
            '<option value="+62">\uD83C\uDDEE\uD83C\uDDE9 +62</option>',
            '<option value="+1">\uD83C\uDDFA\uD83C\uDDF8 +1</option>',
            '<option value="+44">\uD83C\uDDEC\uD83C\uDDE7 +44</option>',
            '<option value="+65">\uD83C\uDDF8\uD83C\uDDEC +65</option>',
            '<option value="+60">\uD83C\uDDF2\uD83C\uDDFE +60</option>',
            '<option value="+61">\uD83C\uDDE6\uD83C\uDDFA +61</option>',
            '<option value="+81">\uD83C\uDDEF\uD83C\uDDF5 +81</option>',
            '<option value="+82">\uD83C\uDDF0\uD83C\uDDF7 +82</option>',
          '</select>',
          '<input type="tel" id="phone-number-input" class="modal-input"',
            ' placeholder="8123456789" inputmode="numeric" style="flex:1" required>',
        '</div>',
        '<button type="submit" class="modal-btn modal-submit-btn">',
          (isSignIn ? 'Kirim Kode OTP' : 'Daftar via OTP'),
        '</button>',
      '</form>',
      '<p class="modal-footer">',
        'Dengan melanjutkan, Anda menyetujui ',
        '<a href="#" style="color:var(--accent)">Syarat Layanan</a> &amp; ',
        '<a href="#" style="color:var(--accent)">Kebijakan Privasi</a> dytanospace.',
      '</p>'
    ].join('');

    /* Tabs */
    document.getElementById('tab-signin-btn') &&
      document.getElementById('tab-signin-btn').addEventListener('click', function() { _activeTab = 'signin'; _renderModalState(); });
    document.getElementById('tab-signup-btn') &&
      document.getElementById('tab-signup-btn').addEventListener('click', function() { _activeTab = 'signup'; _renderModalState(); });

    /* Google */
    document.getElementById('btn-google-auth') &&
      document.getElementById('btn-google-auth').addEventListener('click', function() {
        if (_isBusy) return;
        _isBusy = true;
        _setLoading(true, 'Menghubungkan ke Google\u2026');
        var doSign = firebaseReady
          ? Auth.signInWithGoogle()
          : _demoSignIn('Demo Google User', 'demo@gmail.com', null, 'Google');
        doSign.then(function() { _setLoading(false); _isBusy = false; _renderModalState(); })
              .catch(function(err) { _showError(_friendlyError(err)); _setLoading(false); _isBusy = false; });
      });

    /* Apple */
    document.getElementById('btn-apple-auth') &&
      document.getElementById('btn-apple-auth').addEventListener('click', function() {
        if (_isBusy) return;
        _isBusy = true;
        _setLoading(true, 'Menghubungkan ke Apple ID\u2026');
        var doSign = firebaseReady
          ? Auth.signInWithApple()
          : _demoSignIn('Demo Apple User', 'demo@icloud.com', null, 'Apple');
        doSign.then(function() { _setLoading(false); _isBusy = false; _renderModalState(); })
              .catch(function(err) { _showError(_friendlyError(err)); _setLoading(false); _isBusy = false; });
      });

    /* Phone */
    document.getElementById('phone-form') &&
      document.getElementById('phone-form').addEventListener('submit', function(e) {
        e.preventDefault();
        if (_isBusy) return;
        var code   = document.getElementById('phone-country').value;
        var local  = document.getElementById('phone-number-input').value.trim();
        if (!local || local.length < 7) { _showError('Masukkan nomor telepon yang valid.'); return; }
        var clean  = local.startsWith('0') ? local.slice(1) : local;
        _phoneNumber = code + clean;
        _isBusy = true;
        _setLoading(true, 'Mengirim OTP ke ' + _phoneNumber + '\u2026');
        var doSend = firebaseReady
          ? Auth.sendPhoneOTP(_phoneNumber, 'recaptcha-container')
          : Promise.resolve();
        doSend.then(function() {
          _phoneStep = 'otp';
          _otpSecs   = 59;
          _renderModalState();
        }).catch(function(err) {
          _showError(_friendlyError(err));
        }).finally(function() {
          _setLoading(false);
          _isBusy = false;
        });
      });
  }

} // end setupProfileModal
