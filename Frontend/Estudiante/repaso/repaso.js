/**
 * ============================================================
 *  BIBLIOTECA MULTIMEDIA DE EQUIPOS BIOMÉDICOS
 *  script.js — Library Logic & Dynamic Rendering
 * ============================================================
 */

'use strict';

/* ── DATA ──────────────────────────────────────────────────── */

const CATEGORIES = {
  'nihon-kohden': {
    id: 'nihon-kohden',
    name: 'Nihon Kohden',
    description: 'Monitores de signos vitales y electrocardiógrafos',
    colorClass: 'nihon-kohden',
  },
  'mindray': {
    id: 'mindray',
    name: 'Mindray Beneheart D6',
    description: 'Desfibriladores y monitores de emergencia',
    colorClass: 'mindray',
  },
};

const VIDEOS = [
  /* ── Nihon Kohden ────────────────────────────────────────── */
  {
    id: 'nk-1',
    category: 'nihon-kohden',
    youtubeId: 'PrYEbICcfS0',
    title: 'Partes del Desfibrilador Nihon Kohden: Guía Completa del Equipo Biomédico',
    description: 'En este video se explican las principales partes del desfibrilador Nihon Kohden, un equipo fundamental en la atención de emergencias cardíacas.',
  },
  {
    id: 'nk-2',
    category: 'nihon-kohden',
    youtubeId: 'kw5qZMGohu8',
    title: 'Uso de Palas Internas en Desfibrilación Nihon Kohden | Procedimiento Explicado',
    description: 'Este video presenta el uso de las palas internas en procedimientos de desfibrilación, explicando su aplicación en contextos clínicos específicos.',
  },
  {
    id: 'nk-3',
    category: 'nihon-kohden',
    youtubeId: '-c8Kz-JAifU',
    title: 'Chequeo Básico de un Desfibrilador Nihon Kohden | Verificación del Equipo',
    description: 'En este video se muestra cómo realizar un chequeo básico a un desfibrilador, garantizando su correcto funcionamiento antes de su uso clínico.',
  },
  {
    id: 'nk-4',
    category: 'nihon-kohden',
    youtubeId: '22WRO9VuhKM',
    title: 'Desfibrilación Manual (Asincrónica) Nihon Kohden | ¿Cuándo y Cómo Usarla?',
    description: 'Este video explica el funcionamiento de la desfibrilación manual o asincrónica, utilizada en situaciones de emergencia como fibrilación ventricular.',
  },
  {
    id: 'nk-5',
    category: 'nihon-kohden',
    youtubeId: 'IMIq0s1NMRo',
    title: 'Cardioversión Sincrónica Desfibrilador Nihon Kohden | Procedimiento y Aplicación Clínica',
    description: 'En este video se explica la cardioversión en modo sincrónico, utilizada para tratar ciertas arritmias de manera controlada.',
  },
  {
    id: 'nk-6',
    category: 'nihon-kohden',
    youtubeId: 'XJNm1XbJJEs',
    title: 'Modo Monitor en Desfibrilador Nihon Kohden | Interpretación y Uso',
    description: 'Este video presenta el modo monitor del desfibrilador, permitiendo visualizar y analizar la actividad eléctrica del corazón en tiempo real.',
  },

  /* ── Mindray Beneheart D6 ────────────────────────────────── */
  {
    id: 'md-1',
    category: 'mindray',
    youtubeId: 'rGWBEpTxreQ',
    title: 'Funciones y Características del Desfibrilador Mindray BeneHeart D6',
    description: 'En este video se presenta una visión general del desfibrilador monitor Mindray BeneHeart D6, destacando sus principales funciones clínicas y operativas.',
  },
  {
    id: 'md-2',
    category: 'mindray',
    youtubeId: '2EQufZNd2fQ',
    title: 'Prueba de Usuario del Mindray BeneHeart D6 | Verificación del Equipo',
    description: 'En este video se realiza una prueba de usuario del desfibrilador Mindray BeneHeart D6, con el fin de verificar su correcto funcionamiento antes de su uso clínico.',
  },
  {
    id: 'md-3',
    category: 'mindray',
    youtubeId: '0zNqZv0c2OU',
    title: 'Modo Monitor en el Mindray BeneHeart D6 | Monitoreo Cardíaco',
    description: 'Este video explica el uso del modo monitor del equipo Mindray BeneHeart D6 para la visualización de señales cardíacas en tiempo real.',
  },
  {
    id: 'md-4',
    category: 'mindray',
    youtubeId: 'C4EFgzEd1BA',
    title: 'Cardioversión Sincronizada en el Mindray BeneHeart D6 | Guía Práctica',
    description: 'En este video se explica el uso de la cardioversión sincronizada en el desfibrilador Mindray BeneHeart D6, utilizada para el tratamiento de arritmias con pulso.',
  },
  {
    id: 'md-5',
    category: 'mindray',
    youtubeId: 'RF6-ytVItXU',
    title: 'Desfibrilación Manual en el Mindray BeneHeart D6 | Uso en Emergencias',
    description: 'Este video muestra el procedimiento de desfibrilación manual (modo asincrónico) en el equipo Mindray BeneHeart D6.',
  },
];

/* ── STATE ─────────────────────────────────────────────────── */

let activeCategory = 'all';

/* ── DOM REFS ──────────────────────────────────────────────── */

const videoGrid     = document.getElementById('videoGrid');
const sectionHeader = document.getElementById('sectionHeader');
const emptyState    = document.getElementById('emptyState');
const heroStats     = document.getElementById('heroStats');

/* ── HELPERS ───────────────────────────────────────────────── */

function getFilteredVideos(category) {
  if (category === 'all') return VIDEOS;
  return VIDEOS.filter(v => v.category === category);
}

function getCount(category) {
  return category === 'all' ? VIDEOS.length : VIDEOS.filter(v => v.category === category).length;
}

function thumbUrl(youtubeId) {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

function watchUrl(youtubeId) {
  return `https://youtu.be/${youtubeId}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── RENDER FUNCTIONS ──────────────────────────────────────── */

function renderHeroStats() {
  heroStats.innerHTML = [
    `<div class="stat-card">
       <span class="stat-card__number">${VIDEOS.length}</span>
       <span class="stat-card__label">Videos</span>
     </div>`,
    ...Object.values(CATEGORIES).map(cat => `
     <div class="stat-card">
       <span class="stat-card__number">${getCount(cat.id)}</span>
       <span class="stat-card__label">${cat.name}</span>
     </div>
    `),
  ].join('');
}

function renderTabCounts() {
  const countAll = document.getElementById('count-all');
  if (countAll) countAll.textContent = getCount('all');
  Object.keys(CATEGORIES).forEach(catId => {
    const el = document.getElementById(`count-${catId}`);
    if (el) el.textContent = getCount(catId);
  });
}

function renderSectionHeader(videos) {
  const label = activeCategory === 'all'
    ? 'Todos los videos'
    : CATEGORIES[activeCategory].name;
  sectionHeader.innerHTML = `
    <h2 class="section-title">
      <span class="section-accent" aria-hidden="true"></span>${label}
    </h2>
    <span class="section-count">${videos.length} video${videos.length !== 1 ? 's' : ''}</span>
  `;
}

function createVideoCard(video, index) {
  const cat  = CATEGORIES[video.category];
  const card = document.createElement('article');
  card.className = 'video-card';
  card.setAttribute('role', 'listitem');
  card.style.animationDelay = `${Math.min(index, 8) * 55}ms`;

  card.innerHTML = `
    <a
      class="video-wrapper"
      href="${watchUrl(video.youtubeId)}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ver ${escapeHtml(video.title)} en YouTube"
    >
      <img
        class="video-wrapper__thumb"
        src="${thumbUrl(video.youtubeId)}"
        alt="Miniatura: ${escapeHtml(video.title)}"
        loading="lazy"
        onerror="this.src='https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg'"
      />
      <div class="video-wrapper__overlay" aria-hidden="true"></div>
      <div class="video-wrapper__play" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      <div class="video-wrapper__yt-badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/>
        </svg>
        YouTube
      </div>
    </a>
    <div class="video-card__body">
      <div class="video-card__meta">
        <span class="video-card__category video-card__category--${cat.colorClass}">
          ${escapeHtml(cat.name)}
        </span>
        <span class="video-card__number">#${String(index + 1).padStart(2, '0')}</span>
      </div>
      <h3 class="video-card__title">${escapeHtml(video.title)}</h3>
      <p class="video-card__description">${escapeHtml(video.description)}</p>
      <div class="video-card__footer">
        <svg class="video-card__footer-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14.4A6.4 6.4 0 0 1 3.6 10 6.4 6.4 0 0 1 10 3.6 6.4 6.4 0 0 1 16.4 10 6.4 6.4 0 0 1 10 16.4zm.8-9.2H9.2v4l3.4 2 .8-1.3-2.6-1.6V7.2z" fill="currentColor"/>
        </svg>
        <a
          class="video-card__link"
          href="${watchUrl(video.youtubeId)}"
          target="_blank"
          rel="noopener noreferrer"
        >Ver en YouTube ↗</a>
      </div>
    </div>
  `;

  return card;
}

function createCategoryHeader(catId) {
  const cat   = CATEGORIES[catId];
  const div   = document.createElement('div');
  div.className = 'category-header-card';
  const count = getCount(catId);
  div.innerHTML = `
    <div class="category-header-card__dot category-header-card__dot--${cat.colorClass}"></div>
    <div>
      <div class="category-header-card__name">${escapeHtml(cat.name)}</div>
      <div class="category-header-card__desc">${escapeHtml(cat.description)}</div>
    </div>
    <span class="category-header-card__badge">${count} video${count !== 1 ? 's' : ''}</span>
  `;
  return div;
}

function renderGrid(category) {
    // Usa requestAnimationFrame en lugar de setTimeout(180)
    videoGrid.style.opacity = '0';
    videoGrid.style.transform = 'translateY(8px)';

    requestAnimationFrame(() => {
        videoGrid.innerHTML = '';
        emptyState.classList.add('hidden');
        emptyState.setAttribute('aria-hidden', 'true');

        const videos = getFilteredVideos(category);
        renderSectionHeader(videos);

        if (videos.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.setAttribute('aria-hidden', 'false');
            videoGrid.style.opacity = '1';
            videoGrid.style.transform = 'translateY(0)';
            return;
        }

        if (category === 'all') {
            Object.keys(CATEGORIES).forEach(catId => {
                const catVideos = videos.filter(v => v.category === catId);
                if (catVideos.length === 0) return;
                videoGrid.appendChild(createCategoryHeader(catId));
                catVideos.forEach((video, i) => videoGrid.appendChild(createVideoCard(video, i)));
            });
        } else {
            videos.forEach((video, index) => videoGrid.appendChild(createVideoCard(video, index)));
        }

        videoGrid.style.opacity = '1';
        videoGrid.style.transform = 'translateY(0)';
    });
}

/* ── TABS ───────────────────────────────────────────────────── */

function initTabs() {
  const tabs = document.querySelectorAll('.cat-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category;
      if (category === activeCategory) return;
      activeCategory = category;
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      renderGrid(activeCategory);
    });
  });
}

/* ── INIT ───────────────────────────────────────────────────── */

function injectTransitionStyles() {
  const style = document.createElement('style');
  style.textContent = `#videoGrid { transition: opacity .18s ease, transform .18s ease; }`;
  document.head.appendChild(style);
}

function init() {
  injectTransitionStyles();
  renderHeroStats();
  renderTabCounts();
  initTabs();
  renderGrid(activeCategory);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
