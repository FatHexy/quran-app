import { PageFlip } from 'page-flip';
import { SURAH_DATA } from './data/surahs.js';

// Configuration
const TOTAL_PAGES = 604;
const IMAGE_BASE_URL = 'https://media.qurankemenag.net/khat2/QK_';

// App State
let pageFlip = null;
let currentPage = 1;
let isDarkMode = false;
let isImmersiveMode = false;

// LocalStorage keys
const STORAGE_KEYS = {
  LAST_PAGE: 'quran_last_page',
  BOOKMARKS: 'quran_bookmarks',
  THEME: 'quran_theme',
  IMMERSIVE: 'quran_immersive'
};

// Image preloader with smart caching
class ImagePreloader {
  constructor() {
    this.cache = new Map();
    this.preloadQueue = [];
  }

  getImageUrl(page) {
    const pageNum = String(page).padStart(3, '0');
    return `${IMAGE_BASE_URL}${pageNum}.webp`;
  }

  loadImage(page) {
    return new Promise((resolve, reject) => {
      const url = this.getImageUrl(page);

      if (this.cache.has(url)) {
        resolve(this.cache.get(url));
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.cache.set(url, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load page ${page}`));
      img.src = url;
    });
  }

  async preloadPages(currentPage) {
    const pagesToPreload = [];

    // Preload previous and next pages
    if (currentPage > 1) pagesToPreload.push(currentPage - 1);
    if (currentPage < TOTAL_PAGES) pagesToPreload.push(currentPage + 1);

    // Preload 2 pages ahead and behind for smooth experience
    if (currentPage > 2) pagesToPreload.push(currentPage - 2);
    if (currentPage < TOTAL_PAGES - 1) pagesToPreload.push(currentPage + 2);

    const promises = pagesToPreload.map(page =>
      this.loadImage(page).catch(err => {
        console.warn(`Preload failed for page ${page}:`, err);
      })
    );

    await Promise.all(promises);
  }
}

const preloader = new ImagePreloader();

// Initialize PageFlip
function initPageFlip() {
  const bookElement = document.getElementById('book');

  // Detect mobile
  const isMobile = window.innerWidth < 768;

  pageFlip = new PageFlip(bookElement, {
    width: isMobile ? window.innerWidth : 800,
    height: isMobile ? window.innerWidth * 1.414 : 1131,
    size: 'stretch',
    minWidth: 300,
    maxWidth: isMobile ? window.innerWidth : 1600,
    minHeight: 424,
    maxHeight: isMobile ? window.innerWidth * 1.414 : 2262,
    maxShadowOpacity: 0.3,
    showCover: false,
    mobileScrollSupport: false,
    useMouseEvents: true,
    swipeDistance: isMobile ? 40 : 30,
    clickEventForward: true,
    usePortrait: isMobile,
    startPage: 1,
    drawShadow: true,
    flippingTime: isMobile ? 400 : 600,
    usePortrait: isMobile
  });

  // Load initial pages
  loadPages(currentPage);

  // Page flip event handler
  pageFlip.on('flip', (e) => {
    const newPage = e.data + 1;
    if (newPage !== currentPage) {
      currentPage = newPage;
      updateUI();
      preloader.preloadPages(currentPage);
      saveState();
    }
  });
}

// Load pages dynamically
async function loadPages(startPage) {
  const pagesHtml = [];

  // Load current page and next few pages
  for (let i = 0; i < 3; i++) {
    const pageNum = startPage + i;
    if (pageNum > TOTAL_PAGES) break;

    const imgUrl = preloader.getImageUrl(pageNum);
    const imgClass = isDarkMode ? 'dark-mode-img' : '';

    pagesHtml.push(`
      <div class="page" data-density="hard">
        <div class="page-content w-full h-full flex items-center justify-center bg-white dark:bg-gray-800">
          <img
            src="${imgUrl}"
            alt="Halaman ${pageNum}"
            class="w-full h-full object-contain ${imgClass}"
            loading="lazy"
            onerror="this.parentElement.innerHTML='<div class=\\'flex items-center justify-center h-full text-gray-500\\'><div><svg class=\\'w-12 h-12 mx-auto mb-2\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z\\'/></svg><p>Gagal memuat halaman ${pageNum}</p><button onclick=\\'retryPage(${pageNum})\\' class=\\'mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg\\'>Coba Lagi</button></div></div>'"
          />
        </div>
      </div>
    `);
  }

  await pageFlip.loadFromHTML(pagesHtml);
  await preloader.preloadPages(startPage);
}

// Retry loading a page
window.retryPage = async function(pageNum) {
  try {
    await preloader.loadImage(pageNum);
    loadPages(currentPage);
  } catch (error) {
    console.error('Retry failed:', error);
  }
};

// UI Update functions
function updateUI() {
  // Update page display
  document.getElementById('currentPageDisplay').textContent = currentPage;
  document.getElementById('pageSlider').value = currentPage;

  // Update navigation buttons
  document.getElementById('prevBtn').disabled = currentPage <= 1;
  document.getElementById('nextBtn').disabled = currentPage >= TOTAL_PAGES;
}

function navigateToPage(page) {
  if (page < 1 || page > TOTAL_PAGES) return;

  pageFlip.flip(page - 1);
  currentPage = page;
  updateUI();
  saveState();
}

// Theme management
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  isDarkMode = savedTheme === 'dark';
  applyTheme();
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  applyTheme();
  localStorage.setItem(STORAGE_KEYS.THEME, isDarkMode ? 'dark' : 'light');
}

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDarkMode);

  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');

  if (isDarkMode) {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  } else {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }

  // Reload pages to apply dark mode filter to images
  if (pageFlip) {
    const images = document.querySelectorAll('#book img');
    images.forEach(img => {
      if (isDarkMode) {
        img.classList.add('dark-mode-img');
      } else {
        img.classList.remove('dark-mode-img');
      }
    });
  }
}

// Immersive mode
function initImmersiveMode() {
  const saved = localStorage.getItem(STORAGE_KEYS.IMMERSIVE);
  isImmersiveMode = saved === 'true';
  applyImmersiveMode();
}

function toggleImmersiveMode() {
  isImmersiveMode = !isImmersiveMode;
  applyImmersiveMode();
  localStorage.setItem(STORAGE_KEYS.IMMERSIVE, isImmersiveMode);
}

function applyImmersiveMode() {
  const header = document.getElementById('header');
  const footer = document.getElementById('footer');

  if (isImmersiveMode) {
    header.classList.add('immersive-hidden');
    footer.classList.add('immersive-hidden');
  } else {
    header.classList.remove('immersive-hidden');
    footer.classList.remove('immersive-hidden');
  }
}

// Toggle immersive mode on center click
document.addEventListener('click', (e) => {
  const mainContent = document.getElementById('mainContent');
  const isCenterClick = !e.target.closest('button') && !e.target.closest('input') && !e.target.closest('#book');

  if (isCenterClick && mainContent.contains(e.target)) {
    toggleImmersiveMode();
  }
});

// Surah Modal
function initSurahModal() {
  const modal = document.getElementById('surahModal');
  const btn = document.getElementById('surahBtn');
  const closeBtn = document.getElementById('closeSurahModal');
  const list = document.getElementById('surahList');
  const search = document.getElementById('surahSearch');

  // Render surah list
  function renderSurahList(filter = '') {
    const filtered = SURAH_DATA.filter(([num, name]) => {
      const searchStr = `${num} ${name}`.toLowerCase();
      return searchStr.includes(filter.toLowerCase());
    });

    list.innerHTML = filtered.map(([num, name, arabic, startPage]) => `
      <button
        onclick="goToSurah(${startPage})"
        class="w-full p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-bold">
            ${num}
          </span>
          <div class="text-left">
            <p class="font-medium text-gray-900 dark:text-white">${name}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Halaman ${startPage}</p>
          </div>
        </div>
        <span class="text-2xl text-gray-700 dark:text-gray-300">${arabic}</span>
      </button>
    `).join('');
  }

  btn.addEventListener('click', () => {
    renderSurahList();
    modal.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  search.addEventListener('input', (e) => {
    renderSurahList(e.target.value);
  });
}

window.goToSurah = function(page) {
  navigateToPage(page);
  document.getElementById('surahModal').classList.add('hidden');
};

// Bookmark system
function initBookmarks() {
  const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
  return saved ? JSON.parse(saved) : [];
}

function saveBookmarks(bookmarks) {
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
}

function renderBookmarkList() {
  const list = document.getElementById('bookmarkList');
  const bookmarks = initBookmarks();

  if (bookmarks.length === 0) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
        </svg>
        <p>Belum ada penanda</p>
      </div>
    `;
    return;
  }

  list.innerHTML = bookmarks.map((bm, index) => `
    <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <button onclick="goToBookmark(${bm.page})" class="text-left">
            <p class="font-medium text-gray-900 dark:text-white">Halaman ${bm.page}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">${bm.date}</p>
            ${bm.note ? `<p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${bm.note}</p>` : ''}
          </button>
        </div>
        <button onclick="deleteBookmark(${index})" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

window.goToBookmark = function(page) {
  navigateToPage(page);
  document.getElementById('bookmarkModal').classList.add('hidden');
};

window.deleteBookmark = function(index) {
  const bookmarks = initBookmarks();
  bookmarks.splice(index, 1);
  saveBookmarks(bookmarks);
  renderBookmarkList();
};

function initBookmarkModal() {
  const modal = document.getElementById('bookmarkModal');
  const btn = document.getElementById('bookmarkBtn');
  const closeBtn = document.getElementById('closeBookmarkModal');
  const addBtn = document.getElementById('addBookmarkBtn');

  btn.addEventListener('click', () => {
    renderBookmarkList();
    modal.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  addBtn.addEventListener('click', () => {
    const note = prompt('Tambahkan catatan (opsional):');
    const bookmarks = initBookmarks();

    // Check if bookmark already exists
    const existingIndex = bookmarks.findIndex(bm => bm.page === currentPage);

    if (existingIndex >= 0) {
      bookmarks[existingIndex] = {
        page: currentPage,
        date: new Date().toLocaleDateString('id-ID'),
        note: note || bookmarks[existingIndex].note
      };
    } else {
      bookmarks.push({
        page: currentPage,
        date: new Date().toLocaleDateString('id-ID'),
        note: note || ''
      });
    }

    saveBookmarks(bookmarks);
    renderBookmarkList();
  });
}

// State persistence
function saveState() {
  localStorage.setItem(STORAGE_KEYS.LAST_PAGE, currentPage);
}

function loadState() {
  const savedPage = localStorage.getItem(STORAGE_KEYS.LAST_PAGE);
  if (savedPage) {
    currentPage = parseInt(savedPage);
  }
}

// Navigation event listeners
function initNavigation() {
  document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentPage > 1) navigateToPage(currentPage - 1);
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentPage < TOTAL_PAGES) navigateToPage(currentPage + 1);
  });

  document.getElementById('pageSlider').addEventListener('input', (e) => {
    navigateToPage(parseInt(e.target.value));
  });

  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Immersive mode toggle
  document.getElementById('immersiveBtn').addEventListener('click', toggleImmersiveMode);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentPage > 1) {
      navigateToPage(currentPage - 1);
    } else if (e.key === 'ArrowRight' && currentPage < TOTAL_PAGES) {
      navigateToPage(currentPage + 1);
    }
  });
}

// Touch/swipe support for mobile - improved
function initTouchSupport() {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  const bookElement = document.getElementById('book');

  bookElement.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  bookElement.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 40;
    const verticalDiff = Math.abs(touchEndY - touchStartY);
    const horizontalDiff = touchStartX - touchEndX;

    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(horizontalDiff) > swipeThreshold && Math.abs(horizontalDiff) > verticalDiff) {
      if (horizontalDiff > 0 && currentPage < TOTAL_PAGES) {
        // Swipe left - next page
        navigateToPage(currentPage + 1);
      } else if (horizontalDiff < 0 && currentPage > 1) {
        // Swipe right - previous page
        navigateToPage(currentPage - 1);
      }
    }
  }
}

// Jump pages function for quick navigation
window.jumpPages = function(amount) {
  const newPage = currentPage + amount;
  if (newPage >= 1 && newPage <= TOTAL_PAGES) {
    navigateToPage(newPage);
  }
};

// Initialize app
async function init() {
  // Load saved state
  loadState();
  initTheme();
  initImmersiveMode();

  // Initialize PageFlip
  initPageFlip();

  // Initialize UI components
  initNavigation();
  initSurahModal();
  initBookmarkModal();
  initTouchSupport();

  // Initial UI update
  updateUI();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
