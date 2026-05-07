/* ════════════════════════════════════════════════════════════════════
   script.js  —  Portfolio ILBOUDO Sibri Pendwendé Toussaint
   Modules : Loader · Cursor · Nav · Observers · Filters · i18n · Theme
   ════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════
   0. UTILITAIRES
   ═══════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const debounce = (fn, wait = 10) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
};


/* ═══════════════════════════════════════
   1. LOADER
   ═══════════════════════════════════════ */
function initLoader() {
  const loader = $('#loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('out'), 2100);
  });
}


/* ═══════════════════════════════════════
   2. CUSTOM CURSOR (desktop seulement)
   ═══════════════════════════════════════ */
function initCursor() {
  const dot  = $('#cdot');
  const ring = $('#cring');
  if (!dot || !ring) return;
  if (window.matchMedia('(max-width:768px)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  const tick = () => {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  };
  tick();

  $$('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('ch'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
  });
}


/* ═══════════════════════════════════════
   3. NAVIGATION
   ═══════════════════════════════════════ */
function initNav() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const mobileNav = $('#mobileNav');
  const navLinks  = $$('.nlinks a');

  /* Mobile menu toggle */
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      }
    });
  }

  /* Scroll → hauteur navbar */
  const handleScroll = debounce(() => {
    if (!navbar) return;
    const scrolled = window.scrollY > 60;
    navbar.style.height     = scrolled ? '58px' : '68px';
    navbar.style.background = scrolled
      ? 'rgba(4, 8, 15, 0.95)'
      : 'rgba(4, 8, 15, 0.82)';
  });
  window.addEventListener('scroll', handleScroll);

  /* Lien actif au scroll */
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link =>
        link.classList.toggle('ac',
          link.getAttribute('href') === '#' + entry.target.id)
      );
    });
  }, { threshold: 0.35 });

  $$('section[id]').forEach(s => navObserver.observe(s));
}

/* Fonction globale pour fermer le menu mobile (appelée depuis HTML onclick) */
window.closeMobileNav = function () {
  $('#hamburger')?.classList.remove('open');
  $('#mobileNav')?.classList.remove('open');
};


/* ═══════════════════════════════════════
   4. OBSERVERS (révélations au scroll)
   ═══════════════════════════════════════ */
function initObservers() {
  const revealObs = new IntersectionObserver(
    entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('in')),
    { threshold: 0.08 }
  );
  $$('.rv').forEach(el => revealObs.observe(el));

  const toolsObs = new IntersectionObserver(
    entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('in')),
    { threshold: 0.2 }
  );
  $$('.tc').forEach(el => toolsObs.observe(el));
}


/* ═══════════════════════════════════════
   5. FILTRES
   ═══════════════════════════════════════ */
window.filterTools = function (category, btn) {
  $$('.tf-btn').forEach(b => b.classList.remove('on'));
  btn?.classList.add('on');

  $$('.tc').forEach(card => {
    const show = category === 'all' || (card.dataset.cat || '') === category;
    card.style.display = show ? '' : 'none';
    card.classList.toggle('hidden', !show);
  });
};

window.filterProjects = function (category, btn) {
  $$('.pf-btn').forEach(b => b.classList.remove('on'));
  btn?.classList.add('on');

  $$('#projectsGrid .pjc').forEach(card => {
    const cats = (card.dataset.pcat || '').split(' ');
    card.classList.toggle('pj-hidden', category !== 'all' && !cats.includes(category));
  });
};


/* ═══════════════════════════════════════
   6. GESTION DES THÈMES
   ═══════════════════════════════════════ */
const THEMES       = ['original', 'light', 'dark'];
const THEME_KEY    = 'portfolio-theme';

function detectDefaultTheme() {
  /* Préférence système si aucun choix utilisateur */
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'original'; /* sombre par défaut (identique à "original") */
}

function applyTheme(theme) {
  if (!THEMES.includes(theme)) theme = 'original';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);

  /* Mettre à jour le bouton actif dans le widget */
  $$('.sw-btn[data-theme]').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.theme === theme)
  );

  /* Adapter la couleur de fond de la navbar selon le thème */
  const navbar = $('#navbar');
  if (navbar && theme === 'light') {
    navbar.style.background = 'rgba(240,244,251,0.92)';
  } else if (navbar) {
    navbar.style.background =
      window.scrollY > 60 ? 'rgba(4,8,15,0.95)' : 'rgba(4,8,15,0.82)';
  }
}

function getSavedTheme() {
  return localStorage.getItem(THEME_KEY) || detectDefaultTheme();
}

function initTheme() {
  applyTheme(getSavedTheme());

  /* Écouter les changements de préférence système */
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'light' : 'original');
    }
  });
}


/* ═══════════════════════════════════════
   7. GESTION DES LANGUES (i18n)
   ═══════════════════════════════════════ */
const LANGS   = ['fr', 'en'];
const LANG_KEY = 'portfolio-lang';

function detectDefaultLang() {
  const nav = (navigator.language || navigator.userLanguage || 'fr').toLowerCase();
  return nav.startsWith('fr') ? 'fr' : 'en';
}

function getSavedLang() {
  return localStorage.getItem(LANG_KEY) || detectDefaultLang();
}

/**
 * Applique toutes les traductions sur les éléments [data-i18n].
 * Attributs supportés :
 *   data-i18n="clé"           → innerText / innerHTML
 *   data-i18n-html="clé"      → innerHTML (force HTML)
 *   data-i18n-placeholder="clé" → attribut placeholder
 *   data-i18n-title="clé"     → attribut title
 */
function applyLang(lang) {
  if (!LANGS.includes(lang)) lang = 'fr';
  const dict = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) || {};

  document.documentElement.setAttribute('lang', lang);
  localStorage.setItem(LANG_KEY, lang);

  /* Mettre à jour les boutons actifs */
  $$('.sw-btn[data-lang]').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.lang === lang)
  );

  /* Appliquer les traductions */
  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (!dict[key]) return;
    el.innerHTML = dict[key]; /* innerHTML pour supporter les <strong>, <em>, <br> */
  });

  $$('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key]) el.placeholder = dict[key];
  });

  $$('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    if (dict[key]) el.title = dict[key];
  });

  /* Mettre à jour le <title> de la page */
  const titles = {
    fr: 'ILBOUDO Sibri Pendwendé Toussaint · Développeur Web',
    en: 'ILBOUDO Sibri Pendwendé Toussaint · Web Developer',
  };
  document.title = titles[lang] || document.title;
}

function initLang() {
  applyLang(getSavedLang());
}


/* ═══════════════════════════════════════
   8. WIDGET SETTINGS (UI flottante)
   ═══════════════════════════════════════ */
function buildSettingsWidget() {
  const widget = document.createElement('div');
  widget.id = 'settings-widget';
  widget.setAttribute('aria-label', 'Paramètres d\'affichage');

  /* Panneau */
  widget.innerHTML = `
    <div id="settings-panel" role="dialog" aria-label="Paramètres">
      <div>
        <div class="sw-section-label" data-i18n="theme.original">Thème</div>
        <div class="sw-group" style="margin-top:8px">
          
          <button class="sw-btn" data-theme="light" onclick="applyTheme('light')">
            <span data-i18n="theme.light">Clair</span>
          </button>
          <button class="sw-btn" data-theme="dark" onclick="applyTheme('dark')">
            <span data-i18n="theme.dark">Sombre</span>
          </button>
        </div>
      </div>
      
    </div>

    <button id="settings-toggle" aria-label="Ouvrir les paramètres" title="Paramètres">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06
                 a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09
                 A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83
                 l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
                 A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83
                 l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09
                 a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83
                 l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09
                 a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </button>
  `;

  document.body.appendChild(widget);

  /* Toggle panneau */
  const toggle = $('#settings-toggle');
  const panel  = $('#settings-panel');
  toggle?.addEventListener('click', e => {
    e.stopPropagation();
    panel?.classList.toggle('open');
  });

  /* Fermer en cliquant ailleurs */
  document.addEventListener('click', e => {
    if (!widget.contains(e.target)) panel?.classList.remove('open');
  });

  /* Fermer avec Échap */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') panel?.classList.remove('open');
  });
}

/* Exposer les fonctions globalement (pour onclick dans le widget) */
window.applyTheme = applyTheme;
window.applyLang  = applyLang;


/* ═══════════════════════════════════════
   9. BOOTSTRAP GÉNÉRAL
   ═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  /* Ordre important : thème et langue avant le reste pour éviter un flash */
  initTheme();
  buildSettingsWidget();
  initLang();

  initLoader();
  initNav();
  initObservers();
  initCursor();
});