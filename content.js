(() => {
  let isReading = false;
  let navObserver = null;
  const OVERLAY_ID = "easy-reader-overlay";
  const THEME_KEY = "easy-reader-theme";

  const MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>`;
  const SUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "dark";
  }

  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.setAttribute("data-theme", theme);
    const btn = document.getElementById("easy-reader-theme-btn");
    if (btn) btn.innerHTML = theme === "dark" ? SUN_SVG : MOON_SVG;
  }

  function buildSideNav(headings) {
    if (!headings.length) return null;

    const nav = document.createElement("nav");
    nav.id = "easy-reader-sidenav";
    nav.setAttribute("aria-label", "Article sections");

    headings.forEach((h, i) => {
      const id = `easy-sec-${i}`;
      h.id = id;

      const a = document.createElement("a");
      a.href = `#${id}`;
      a.className = "easy-nav-link";
      a.textContent = h.textContent.trim();
      a.dataset.target = id;

      a.addEventListener("click", (e) => {
        e.preventDefault();
        const scroller = document.getElementById("easy-reader-scroller");
        const target = document.getElementById(id);
        if (!scroller || !target) return;
        // instant scroll — no behavior:'smooth'
        scroller.scrollTop = target.offsetTop - 56;
      });

      nav.appendChild(a);
    });

    return nav;
  }

  function setupActiveTracking(headings) {
    if (!headings.length) return;

    const scroller = document.getElementById("easy-reader-scroller");
    if (!scroller) return;

    // Use IntersectionObserver on the scroller as root
    navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const link = document.querySelector(`#easy-reader-sidenav [data-target="${id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          // Clear all, mark this one active
          document.querySelectorAll("#easy-reader-sidenav .easy-nav-link").forEach((l) => {
            l.classList.remove("easy-nav-active");
          });
          link.classList.add("easy-nav-active");
        }
      });
    }, {
      root: scroller,
      rootMargin: "0px 0px -60% 0px",
      threshold: 0,
    });

    headings.forEach((h) => navObserver.observe(h));
  }

  function activate() {
    const docClone = document.cloneNode(true);
    const reader = new Readability(docClone);
    const article = reader.parse();

    if (!article) return;

    const theme = getTheme();

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute("data-theme", theme);

    overlay.innerHTML = `
      <div id="easy-reader-scroller">
        <div id="easy-reader-layout">
          <div id="easy-reader-content">
            <div class="easy-reader-controls">
              <button id="easy-reader-theme-btn" title="Toggle theme" aria-label="Toggle theme">
                ${theme === "dark" ? SUN_SVG : MOON_SVG}
              </button>
            </div>
            <h1 id="easy-reader-title">${article.title || ""}</h1>
            <div id="easy-reader-body">${article.content}</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.documentElement.style.overflow = "hidden";

    document.getElementById("easy-reader-theme-btn").addEventListener("click", () => {
      const current = overlay.getAttribute("data-theme");
      setTheme(current === "dark" ? "light" : "dark");
    });

    // Build side nav from h2s in the rendered body
    const h2s = Array.from(document.querySelectorAll("#easy-reader-body h2"));
    const nav = buildSideNav(h2s);
    if (nav) {
      const layout = document.getElementById("easy-reader-layout");
      layout.insertBefore(nav, layout.firstChild);
      setupActiveTracking(h2s);
    }

    // Make h2s in the article body clickable — clicking scrolls to that heading
    h2s.forEach((h) => {
      h.addEventListener("click", () => {
        const scroller = document.getElementById("easy-reader-scroller");
        if (!scroller) return;
        scroller.scrollTop = h.offsetTop - 56;
      });
    });

    isReading = true;
  }

  function deactivate() {
    if (navObserver) {
      navObserver.disconnect();
      navObserver = null;
    }
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
    document.documentElement.style.overflow = "";
    isReading = false;
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action !== "toggle") return;
    if (isReading) {
      deactivate();
    } else {
      activate();
    }
  });
})();
