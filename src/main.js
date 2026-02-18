import { SURAH_DATA } from './data/surahs.js';

// Configuration
const TOTAL_PAGES = 604;
const IMAGE_BASE_URL = 'https://media.qurankemenag.net/khat2/QK_';

// App State
let currentPage = 1;
let isImmersiveMode = false;
let preloadedImages = new Map();

// LocalStorage keys
const STORAGE_KEYS = {
  LAST_PAGE: 'quran_last_page',
  BOOKMARKS: 'quran_bookmarks',
  IMMERSIVE: 'quran_immersive'
};

// Get image URL for a page
function getImageUrl(page) {
  const pageNum = String(page).padStart(3, '0');
  return `${IMAGE_BASE_URL}${pageNum}.webp`;
}

// Preload images around current page
function preloadPages(page) {
  const pagesToLoad = [];

  // Preload previous and next pages
  if (page > 1) pagesToLoad.push(page - 1);
  if (page < TOTAL_PAGES) pagesToLoad.push(page + 1);
  if (page > 2) pagesToLoad.push(page - 2);
  if (page < TOTAL_PAGES - 1) pagesToLoad.push(page + 2);

  pagesToLoad.forEach(pageNum => {
    if (!preloadedImages.has(pageNum)) {
      const img = new Image();
      img.src = getImageUrl(pageNum);
      preloadedImages.set(pageNum, img);
    }
  });
}

// Load and display current page
function loadPage(page) {
  const bookContainer = document.getElementById('book');
  const imgUrl = getImageUrl(page);

  // Create page container - no background, clean
  bookContainer.innerHTML = `
    <div class="quran-page-container relative w-full h-full flex items-center justify-center">
      <img
        id="quranPageImage"
        src="${imgUrl}"
        alt="Halaman ${page}"
        class="w-full h-auto max-w-full"
        loading="eager"
        style="display: block;"
      />

      <!-- Left tap zone - Next page (Quran RTL) -->
      <div
        id="leftTapZone"
        class="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
        title="Halaman Selanjutnya"
      ></div>

      <!-- Right tap zone - Previous page (Quran RTL) -->
      <div
        id="rightTapZone"
        class="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
        title="Halaman Sebelumnya"
      ></div>

      <!-- Center tap zone - Toggle immersive mode -->
      <div
        id="centerTapZone"
        class="absolute top-0 bottom-0 left-1/3 right-1/3 cursor-pointer z-10"
        title="Mode Imersif"
      ></div>
    </div>
  `;

  const imgElement = document.getElementById('quranPageImage');

  // Show loading while image loads
  imgElement.onload = () => {
    console.log('Page loaded:', page);
    preloadPages(page);
  };

  imgElement.onerror = () => {
    bookContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full p-8 text-gray-500">
        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p class="text-lg mb-2">Gagal memuat halaman ${page}</p>
        <p class="text-sm mb-4">Periksa koneksi internet Anda</p>
        <button onclick="retryLoadPage(${page})" class="px-6 py-3 bg-emerald-600 text-white rounded-lg">
          Coba Lagi
        </button>
      </div>
    `;
  };

  // Set up tap zones
  document.getElementById('leftTapZone').addEventListener('click', () => {
    if (page < TOTAL_PAGES) navigateToPage(page + 1);
  });

  document.getElementById('rightTapZone').addEventListener('click', () => {
    if (page > 1) navigateToPage(page - 1);
  });

  document.getElementById('centerTapZone').addEventListener('click', () => {
    toggleImmersiveMode();
  });
}

// Retry loading a page
window.retryLoadPage = function(page) {
  loadPage(page);
};

// UI Update functions
function updateUI() {
  document.getElementById('currentPageDisplay').textContent = currentPage;
  document.getElementById('pageSlider').value = currentPage;

  // Update navigation buttons
  document.getElementById('prevBtn').disabled = currentPage >= TOTAL_PAGES;
  document.getElementById('nextBtn').disabled = currentPage <= 1;
}

function navigateToPage(page) {
  if (page < 1 || page > TOTAL_PAGES) return;

  currentPage = page;
  updateUI();
  loadPage(currentPage);
  saveState();
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
  const exitBtn = document.getElementById('exitFullscreenBtn');

  if (isImmersiveMode) {
    header.classList.add('immersive-hidden');
    footer.classList.add('immersive-hidden');
    exitBtn.classList.remove('hidden');
  } else {
    header.classList.remove('immersive-hidden');
    footer.classList.remove('immersive-hidden');
    exitBtn.classList.add('hidden');
  }
}

// Surah Modal
function initSurahModal() {
  const modal = document.getElementById('surahModal');
  const btn = document.getElementById('surahBtn');
  const closeBtn = document.getElementById('closeSurahModal');
  const list = document.getElementById('surahList');
  const search = document.getElementById('surahSearch');

  function renderSurahList(filter = '') {
    const filtered = SURAH_DATA.filter(([num, name]) => {
      const searchStr = `${num} ${name}`.toLowerCase();
      return searchStr.includes(filter.toLowerCase());
    });

    list.innerHTML = filtered.map(([num, name, arabic, startPage]) => `
      <button
        onclick="goToSurah(${startPage})"
        class="w-full p-3 flex items-center justify-between rounded-lg transition-all hover:scale-[1.02]"
        style="background-color: #faf8f3;"
        onmouseover="this.style.backgroundColor='#e6e2d8'"
        onmouseout="this.style.backgroundColor='#faf8f3'"
      >
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold" style="background-color: #d4a574; color: #faf8f3;">
            ${num}
          </span>
          <div class="text-left">
            <p class="font-medium" style="color: #5c4b37;">${name}</p>
            <p class="text-xs" style="color: #8b7355;">Halaman ${startPage}</p>
          </div>
        </div>
        <span class="text-2xl" style="color: #5c4b37;">${arabic}</span>
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
      <div class="flex flex-col items-center justify-center py-12" style="color: #8b7355;">
        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
        </svg>
        <p>Belum ada penanda</p>
      </div>
    `;
    return;
  }

  list.innerHTML = bookmarks.map((bm, index) => `
    <div class="p-3 rounded-lg mb-2 transition-all hover:scale-[1.02]" style="background-color: #faf8f3;" onmouseover="this.style.backgroundColor='#e6e2d8'" onmouseout="this.style.backgroundColor='#faf8f3'">
      <div class="flex items-start justify-between gap-2">
        <button onclick="goToBookmark(${bm.page})" class="flex-1 text-left">
          <div class="flex items-center gap-2 mb-1">
            <svg class="w-5 h-5" style="color: #d4a574;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <p class="font-bold" style="color: #5c4b37;">Halaman ${bm.page}</p>
          </div>
          <p class="text-xs" style="color: #8b7355;">${bm.date}</p>
          ${bm.note ? `<p class="text-sm mt-1" style="color: #5c4b37;">${bm.note}</p>` : ''}
        </button>
        <button onclick="deleteBookmark(${index})" class="p-2 rounded-lg hover:bg-red-100 transition-colors" style="color: #c05850;">
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
  // Previous button (goes to lower page number)
  document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentPage > 1) navigateToPage(currentPage - 1);
  });

  // Next button (goes to higher page number)
  document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentPage < TOTAL_PAGES) navigateToPage(currentPage + 1);
  });

  document.getElementById('pageSlider').addEventListener('input', (e) => {
    navigateToPage(parseInt(e.target.value));
  });

  // Immersive mode toggle
  document.getElementById('immersiveBtn').addEventListener('click', toggleImmersiveMode);

  // Exit fullscreen button
  document.getElementById('exitFullscreenBtn').addEventListener('click', () => {
    isImmersiveMode = false;
    applyImmersiveMode();
    localStorage.setItem(STORAGE_KEYS.IMMERSIVE, 'false');
  });

  // Keyboard navigation - REVERSED for Quran RTL
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentPage < TOTAL_PAGES) {
      navigateToPage(currentPage + 1);
    } else if (e.key === 'ArrowRight' && currentPage > 1) {
      navigateToPage(currentPage - 1);
    }
  });
}

// Touch/swipe support - REVERSED for Quran RTL
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

    if (Math.abs(horizontalDiff) > swipeThreshold && Math.abs(horizontalDiff) > verticalDiff) {
      if (horizontalDiff > 0 && currentPage < TOTAL_PAGES) {
        navigateToPage(currentPage + 1);
      } else if (horizontalDiff < 0 && currentPage > 1) {
        navigateToPage(currentPage - 1);
      }
    }
  }
}

// Jump pages function
window.jumpPages = function(amount) {
  const newPage = currentPage + amount;
  if (newPage >= 1 && newPage <= TOTAL_PAGES) {
    navigateToPage(newPage);
  }
};

// Initialize app
async function init() {
  loadState();
  initImmersiveMode();
  initNavigation();
  initSurahModal();
  initBookmarkModal();
  initTouchSupport();

  updateUI();
  loadPage(currentPage);
}

document.addEventListener('DOMContentLoaded', init);
