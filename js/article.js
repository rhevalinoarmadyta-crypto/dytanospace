// Article-specific script - Rhevalino Armadyta's Blog
document.addEventListener("DOMContentLoaded", () => {
  initArticlePage();
});

function initArticlePage() {
  const articles = window.articlesData || [];
  
  // 1. Get article ID from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get("id");

  // Find the requested article or fall back to the first one
  let article = articles.find(a => a.id === articleId);
  if (!article) {
    // If not found, use the first article as default
    article = articles[0];
  }

  if (!article) {
    showErrorState();
    return;
  }

  // 2. Render Article Details
  renderArticle(article);

  // 3. Setup Reading Progress Bar
  setupReadingProgress();

  // 4. Generate Table of Contents (ToC)
  generateToC();

  // 5. Setup Distraction-Free Reading Mode
  setupDistractionFreeMode();

  // 6. Setup Theme Switcher Controls
  setupThemeToggle();

  // 7. Setup Font Scale Adjustments
  setupFontScale();

  // 8. Setup Persistent Local Comments
  setupComments(article.id);

  // 9. Setup Related Articles
  renderRelatedArticles(article, articles);
}

function renderArticle(article) {
  // Set page title
  document.title = `${article.title} | dytanospace`;

  // Render header metadata
  const metaContainer = document.getElementById("article-meta");
  if (metaContainer) {
    metaContainer.innerHTML = `
      <span class="badge">${article.category}</span>
      <span style="color: var(--text-muted);">•</span>
      <span style="color: var(--text-secondary);">${article.date}</span>
      <span style="color: var(--text-muted);">•</span>
      <span style="color: var(--text-secondary);">${article.readTime} Min Baca</span>
    `;
  }

  // Render title
  const titleContainer = document.getElementById("article-title");
  if (titleContainer) {
    titleContainer.innerText = article.title;
  }

  // Render featured image
  const imgContainer = document.getElementById("article-featured-image-container");
  if (imgContainer) {
    imgContainer.innerHTML = `
      <img src="${article.thumbnail}" alt="${article.title}" onerror="this.src='https://placehold.co/900x500/161616/C68E17?text=Article'">
    `;
  }

  // Render core article text content (Markdown support)
  const textContainer = document.getElementById("article-text-content");
  if (textContainer) {
    if (window.marked) {
      textContainer.innerHTML = window.marked.parse(article.content);
    } else {
      textContainer.innerHTML = article.content;
    }
  }
}

// Reading Progress Bar handler
function setupReadingProgress() {
  const progressBar = document.getElementById("progress-bar");
  if (!progressBar) return;

  window.addEventListener("scroll", () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const scrolled = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${scrolled}%`;
    }
  });
}

// Generate Table of Contents
function generateToC() {
  const tocList = document.getElementById("toc-list");
  const articleBody = document.getElementById("article-text-content");
  if (!tocList || !articleBody) return;

  // Find all h2 headings in article body
  const headings = articleBody.querySelectorAll("h2, h3");
  if (headings.length === 0) {
    // Hide ToC container if no headers are present
    const tocContainer = document.getElementById("toc-container");
    if (tocContainer) tocContainer.style.display = "none";
    return;
  }

  // Generate lists
  tocList.innerHTML = Array.from(headings).map((heading, idx) => {
    // Fallback ID if heading doesn't have one
    if (!heading.id) {
      heading.id = `heading-section-${idx}`;
    }
    
    // Add margin class for h3 nested level
    const paddingClass = heading.tagName.toLowerCase() === "h3" ? 'style="padding-left: 12px; font-size: 0.8rem;"' : '';
    
    return `
      <li class="toc-item" data-target="${heading.id}" ${paddingClass}>
        <a href="#${heading.id}">${heading.textContent}</a>
      </li>
    `;
  }).join("");

  // Setup active scroll highlighting for ToC
  window.addEventListener("scroll", () => {
    let activeId = "";
    
    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      // If heading is in viewport, or slightly scrolled past the top
      if (rect.top <= 160) {
        activeId = heading.id;
      }
    });

    const tocItems = tocList.querySelectorAll(".toc-item");
    tocItems.forEach(item => {
      item.classList.remove("active");
      if (item.getAttribute("data-target") === activeId) {
        item.classList.add("active");
      }
    });
  });
}

// Distraction-Free Reading Mode
function setupDistractionFreeMode() {
  const toggleBtn = document.getElementById("distraction-free-toggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const isDF = document.body.classList.toggle("distraction-free");
    
    if (isDF) {
      toggleBtn.classList.add("active");
      toggleBtn.setAttribute("data-tooltip", "Keluar Mode Membaca");
      // Optional: scroll a bit down to frame text beautifully
      window.scrollTo({
        top: document.getElementById("article-text-content").offsetTop - 60,
        behavior: "smooth"
      });
    } else {
      toggleBtn.classList.remove("active");
      toggleBtn.setAttribute("data-tooltip", "Mode Bebas Gangguan");
    }
  });

  // Enable ESC key to exit Distraction-Free Mode
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("distraction-free")) {
      document.body.classList.remove("distraction-free");
      toggleBtn.classList.remove("active");
      toggleBtn.setAttribute("data-tooltip", "Mode Bebas Gangguan");
    }
  });
}

// Render Related Articles (matching category)
function renderRelatedArticles(currentArticle, allArticles) {
  const container = document.getElementById("related-articles-container");
  if (!container) return;

  // Filter out the current article and search matching categories
  let related = allArticles.filter(a => a.id !== currentArticle.id && a.category === currentArticle.category);

  // If we don't have enough matching category, fill with others
  if (related.length < 3) {
    const extra = allArticles.filter(a => a.id !== currentArticle.id && a.category !== currentArticle.category);
    related = [...related, ...extra].slice(0, 3);
  } else {
    related = related.slice(0, 3);
  }

  container.innerHTML = related.map(article => `
    <article class="article-card">
      <div class="card-img-wrapper" style="height: 180px;">
        <a href="article.html?id=${article.id}">
          <img src="${article.thumbnail}" alt="${article.title}" class="card-img" onerror="this.src='https://placehold.co/400x250/161616/C68E17?text=Article'">
        </a>
      </div>
      <div class="card-content">
        <div class="card-category">
          <span class="badge">${article.category}</span>
        </div>
        <h3 class="card-title" style="font-size: 1.15rem; margin-bottom: 8px;">
          <a href="article.html?id=${article.id}">${article.title}</a>
        </h3>
        <div class="card-footer" style="padding-top: 12px; margin-top: auto;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">${article.date}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${article.readTime} Min Baca</span>
        </div>
      </div>
    </article>
  `).join("");
}

function showErrorState() {
  const main = document.querySelector("main");
  if (main) {
    main.innerHTML = `
      <div class="container" style="text-align: center; padding: 100px 24px;">
        <h1 style="font-size: 3rem; margin-bottom: 20px;">Artikel Tidak Ditemukan</h1>
        <p style="color: var(--text-secondary); margin-bottom: 40px;">Maaf, artikel yang Anda cari tidak tersedia atau telah dipindahkan.</p>
        <a href="index.html" class="btn">Kembali ke Beranda</a>
      </div>
    `;
  }
}

// Theme toggle logic (Dark, Sepia, Light)
function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  const themes = ["light", "dark", "sepia"];
  
  // Restore theme from localStorage
  const savedTheme = localStorage.getItem("reader-theme") || "light";
  applyTheme(savedTheme);

  toggleBtn.addEventListener("click", () => {
    let currentTheme = localStorage.getItem("reader-theme") || "light";
    let nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
    let nextTheme = themes[nextIndex];
    
    applyTheme(nextTheme);
  });
}

function applyTheme(themeName) {
  document.body.classList.remove("theme-dark", "theme-sepia", "theme-light");
  
  if (themeName !== "light") {
    document.body.classList.add(`theme-${themeName}`);
  }
  
  localStorage.setItem("reader-theme", themeName);
  
  // Update tooltip/icon
  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    if (themeName === "dark") {
      toggleBtn.innerHTML = `🌙`;
      toggleBtn.setAttribute("data-tooltip", "Tema: Gelap (Klik untuk Sepia)");
    } else if (themeName === "sepia") {
      toggleBtn.innerHTML = `📜`;
      toggleBtn.setAttribute("data-tooltip", "Tema: Sepia (Klik untuk Terang)");
    } else {
      toggleBtn.innerHTML = `☀️`;
      toggleBtn.setAttribute("data-tooltip", "Tema: Terang (Klik untuk Gelap)");
    }
  }
}

// Font Scale logic
let currentFontSizePercent = 100;
function setupFontScale() {
  const plusBtn = document.getElementById("font-plus-btn");
  const minusBtn = document.getElementById("font-minus-btn");
  
  if (plusBtn) {
    plusBtn.addEventListener("click", () => adjustFontScale(10));
  }
  if (minusBtn) {
    minusBtn.addEventListener("click", () => adjustFontScale(-10));
  }
}

function adjustFontScale(delta) {
  currentFontSizePercent += delta;
  if (currentFontSizePercent < 80) currentFontSizePercent = 80;
  if (currentFontSizePercent > 140) currentFontSizePercent = 140;
  
  const articleText = document.getElementById("article-text-content");
  if (articleText) {
    articleText.style.fontSize = `${currentFontSizePercent / 100 * 1.15}rem`;
  }
}

// Persistent comments logic
function setupComments(articleId) {
  const form = document.getElementById("comment-form");
  const feed = document.getElementById("comment-feed");
  
  if (!form || !feed) return;
  
  // Render comments
  renderComments(articleId);
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("comment-name");
    const textInput = document.getElementById("comment-message");
    
    if (nameInput.value.trim() === "" || textInput.value.trim() === "") return;
    
    const newComment = {
      name: nameInput.value.trim(),
      message: textInput.value.trim(),
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    };
    
    // Save to localStorage
    const savedComments = JSON.parse(localStorage.getItem(`comments_${articleId}`) || "[]");
    savedComments.push(newComment);
    localStorage.setItem(`comments_${articleId}`, JSON.stringify(savedComments));
    
    // Reset inputs
    textInput.value = "";
    
    // Rerender feed
    renderComments(articleId);
  });
}

function renderComments(articleId) {
  const feed = document.getElementById("comment-feed");
  if (!feed) return;
  
  const savedComments = JSON.parse(localStorage.getItem(`comments_${articleId}`) || "[]");
  
  // If no comments, show placeholder
  if (savedComments.length === 0) {
    feed.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--text-secondary); font-size: 0.95rem;">
        Belum ada diskusi. Jadilah yang pertama memberikan opini!
      </div>
    `;
    return;
  }
  
  feed.innerHTML = savedComments.map(c => {
    const initials = c.name ? c.name.charAt(0).toUpperCase() : "?";
    return `
      <div class="comment-card">
        <div class="comment-avatar">${initials}</div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author">${c.name}</span>
            <span class="comment-date">${c.date}</span>
          </div>
          <p class="comment-text">${c.message}</p>
        </div>
      </div>
    `;
  }).join("");
}
