// Entry point of the Game Catalog Electron App
// Orchestrates navigation, events, and boot-up processes

import { state, loadConfig, saveConfig, loadGames, saveGames } from './state.js';
import { updateLibraryStats, renderDashboard } from './components/dashboard.js';
import { renderDiscoverTab, loadMoreTrending, loadMoreUpcoming, loadMoreBrowse } from './components/discover.js';
import { renderSearchTab, loadMoreSearch } from './components/search.js';
import { renderListTab } from './components/library.js';
import { openGameDetails, closeModal, saveModalGame, deleteModalGame, updateModalFieldsVisibility, updateSubstatusDropdown, setModalStarRating } from './components/modal.js';
import { parseDxDiagText, updateSpecsPreviewUI } from './components/dxdiag.js';

// DOM Elements
const sidebarLinks = document.querySelectorAll('.menu-item[data-tab]');
const viewPanes = document.querySelectorAll('.view-pane');
const viewTitle = document.getElementById('current-view-title');
const apiStatusDot = document.getElementById('api-status-dot');
const apiStatusText = document.getElementById('api-status-text');

// List Searches
const playingSearch = document.getElementById('playing-search-input');
const backlogSearch = document.getElementById('backlog-search-input');
const completedSearch = document.getElementById('completed-search-input');

// Search elements
const rawgSearchInput = document.getElementById('rawg-search-input');
const btnRawgSearch = document.getElementById('btn-rawg-search');
const searchLoadMoreContainer = document.getElementById('search-load-more-container');
const btnSearchLoadMore = document.getElementById('btn-search-load-more');

// Settings Elements
const inputApiKey = document.getElementById('input-api-key');
const btnToggleKey = document.getElementById('btn-toggle-key');
const btnSaveKey = document.getElementById('btn-save-key');
const btnTestKey = document.getElementById('btn-test-key');
const keyTestFeedback = document.getElementById('key-test-feedback');
const btnExportData = document.getElementById('btn-export-data');
const btnImportData = document.getElementById('btn-import-data');
const importFileInput = document.getElementById('import-file-input');
const btnClearAll = document.getElementById('btn-clear-all');

// Modal Elements
const gameDetailModal = document.getElementById('game-detail-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const selectGameStatus = document.getElementById('select-game-status');
const btnSaveModal = document.getElementById('btn-save-modal');
const btnDeleteModal = document.getElementById('btn-delete-modal');
const rowSubstatusPlatform = document.getElementById('row-substatus-platform');
const starBtns = document.querySelectorAll('#completed-rating-stars .star-btn');

// DxDiag Elements
const btnUploadDxdiag = document.getElementById('btn-upload-dxdiag');
const dxdiagFileInput = document.getElementById('dxdiag-file-input');

// Discover elements
const btnTrendingLoadMore = document.getElementById('btn-trending-load-more');
const btnUpcomingLoadMore = document.getElementById('btn-upcoming-load-more');
const btnBrowseLoadMore = document.getElementById('btn-browse-load-more');
const btnBrowseBack = document.getElementById('btn-browse-back');
const browseResultsSection = document.getElementById('browse-results-section');

// Sidebar collapse elements
const appSidebar = document.getElementById('app-sidebar');
const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
const toggleIconOpen = btnSidebarToggle?.querySelector('.toggle-icon-open');
const toggleIconClosed = btnSidebarToggle?.querySelector('.toggle-icon-closed');

function applySidebarState(collapsed) {
  if (!appSidebar) return;
  if (collapsed) {
    appSidebar.classList.add('collapsed');
    if (toggleIconOpen) toggleIconOpen.style.display = 'none';
    if (toggleIconClosed) toggleIconClosed.style.display = 'block';
  } else {
    appSidebar.classList.remove('collapsed');
    if (toggleIconOpen) toggleIconOpen.style.display = 'block';
    if (toggleIconClosed) toggleIconClosed.style.display = 'none';
  }
}

// Restore persisted sidebar state
applySidebarState(localStorage.getItem('sidebarCollapsed') === 'true');

// Initialize Application
async function initApp() {
  try {
    // 1. Load configuration
    const config = await loadConfig();
    if (inputApiKey) inputApiKey.value = config.apiKey || '';
    updateAPIKeyUIStatus();

    // 2. Load game database
    const games = await loadGames();
    
    // 3. Setup event listeners
    setupEventListeners();

    // Migrate existing CSV imported games to set needsResolution if they haven't been resolved
    let needsSave = false;
    state.localGames = games.map(game => {
      if (game.notes === 'Được nhập tự động từ playing.csv' && !game.rawgIdResolved) {
        game.needsResolution = true;
        needsSave = true;
      }
      return game;
    });
    if (needsSave) {
      await saveGames(state.localGames);
    }

    // Load DxDiag system specs if configured
    if (state.appConfig.systemSpecs) {
      updateSpecsPreviewUI(state.appConfig.systemSpecs);
    }

    // 4. Update data views
    updateLibraryStats();
    renderDashboard();

    // 5. If no API key is present, prompt user visually and go to settings tab
    if (!state.appConfig.apiKey) {
      switchTab('settings');
      if (keyTestFeedback) {
        keyTestFeedback.textContent = 'Vui lòng nhận và cấu hình RAWG API Key để sử dụng tính năng tìm kiếm!';
        keyTestFeedback.className = 'feedback-message error';
      }
    } else {
      renderActiveTabContents();
      
      // Resolve CSV imported games using RAWG API in the background
      resolveUnresolvedGames();
    }
  } catch (err) {
    console.error('Lỗi khi khởi tạo ứng dụng:', err);
  }
}

// Resolve CSV imported games to correct RAWG IDs and images in the background
async function resolveUnresolvedGames() {
  const unresolved = state.localGames.filter(g => g.needsResolution);
  if (unresolved.length === 0) return;

  console.log(`Bắt đầu giải quyết ${unresolved.length} game nhập từ CSV sang RAWG IDs...`);

  for (const game of unresolved) {
    try {
      // Pause 350ms to respect RAWG rate limit guidelines
      await new Promise(r => setTimeout(r, 350));
      
      const searchData = await window.api.searchGames(game.name, 1);
      if (searchData && searchData.results && searchData.results.length > 0) {
        // Find exact match or closest match
        const bestMatch = searchData.results.find(r => r.name.toLowerCase() === game.name.toLowerCase()) || searchData.results[0];
        
        // Find if another game already has this RAWG ID to avoid key conflicts
        const duplicateIdx = state.localGames.findIndex(g => g.id === bestMatch.id && g.id !== game.id);
        
        const oldId = game.id;
        game.id = bestMatch.id;
        game.background_image = bestMatch.background_image || '';
        game.metacritic = bestMatch.metacritic || null;
        game.rawgIdResolved = true; // Mark as successfully resolved
        delete game.needsResolution;

        const idx = state.localGames.findIndex(g => g.id === oldId);
        if (idx !== -1) {
          if (duplicateIdx !== -1) {
            console.log(`Phát hiện trùng lặp RAWG ID cho game ${game.name}. Gộp bản ghi.`);
            state.localGames.splice(idx, 1);
          } else {
            state.localGames[idx] = game;
          }
        }
      } else {
        game.rawgIdResolved = true;
        delete game.needsResolution;
      }
    } catch (err) {
      console.error(`Lỗi khi giải quyết game ${game.name}:`, err);
      game.rawgIdResolved = true;
      delete game.needsResolution;
    }
  }

  // Save changes and update UI
  await saveGames(state.localGames);
  updateLibraryStats();
  renderDashboard();
  renderActiveTabContents();
  console.log('Đã giải quyết xong tất cả RAWG IDs cho game nhập từ CSV!');
}

// Update UI indicator for API key status
function updateAPIKeyUIStatus() {
  if (!apiStatusDot || !apiStatusText) return;
  if (state.appConfig.apiKey && state.appConfig.apiKey.trim() !== '') {
    apiStatusDot.className = 'status-dot green';
    apiStatusText.textContent = 'API RAWG Sẵn sàng';
  } else {
    apiStatusDot.className = 'status-dot red';
    apiStatusText.textContent = 'Chưa cấu hình API';
  }
}

// Bind Navigation and general event listeners
function setupEventListeners() {
  // Sidebar tab switching
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // Sidebar collapse toggle
  if (btnSidebarToggle) {
    btnSidebarToggle.addEventListener('click', () => {
      const isNowCollapsed = !appSidebar.classList.contains('collapsed');
      applySidebarState(isNowCollapsed);
      localStorage.setItem('sidebarCollapsed', isNowCollapsed);
    });
  }

  // Client-side search filters for lists
  if (playingSearch) playingSearch.addEventListener('input', () => renderListTab('playing'));
  if (backlogSearch) backlogSearch.addEventListener('input', () => renderListTab('backlog'));
  if (completedSearch) completedSearch.addEventListener('input', () => renderListTab('completed'));

  // RAWG Global Search triggers
  if (btnRawgSearch) {
    btnRawgSearch.addEventListener('click', renderSearchTab);
  }
  if (rawgSearchInput) {
    rawgSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') renderSearchTab();
    });
  }

  // Toggle API Key input display
  if (btnToggleKey && inputApiKey) {
    btnToggleKey.addEventListener('click', () => {
      if (inputApiKey.type === 'password') {
        inputApiKey.type = 'text';
        btnToggleKey.textContent = 'Ẩn';
      } else {
        inputApiKey.type = 'password';
        btnToggleKey.textContent = 'Hiện';
      }
    });
  }

  // Save Settings
  if (btnSaveKey && inputApiKey && keyTestFeedback) {
    btnSaveKey.addEventListener('click', async () => {
      const key = inputApiKey.value.trim();
      state.appConfig.apiKey = key;
      const success = await saveConfig(state.appConfig);
      
      if (success) {
        updateAPIKeyUIStatus();
        keyTestFeedback.textContent = 'Cấu hình API Key đã được lưu thành công!';
        keyTestFeedback.className = 'feedback-message success';
        state.popularGamesCached = null; // Clear cache on key change
      } else {
        keyTestFeedback.textContent = 'Lưu cấu hình thất bại!';
        keyTestFeedback.className = 'feedback-message error';
      }
    });
  }

  // Test API Key Connection
  if (btnTestKey && inputApiKey && keyTestFeedback) {
    btnTestKey.addEventListener('click', async () => {
      const key = inputApiKey.value.trim();
      if (!key) {
        keyTestFeedback.textContent = 'Vui lòng điền API Key trước khi test!';
        keyTestFeedback.className = 'feedback-message error';
        return;
      }

      keyTestFeedback.textContent = 'Đang kiểm tra kết nối với RAWG...';
      keyTestFeedback.className = 'feedback-message';

      // Temporarily save config to test it
      const oldKey = state.appConfig.apiKey;
      state.appConfig.apiKey = key;
      await saveConfig(state.appConfig);

      try {
        // Fetch a simple query to verify
        await window.api.getPopularGames(1);
        keyTestFeedback.textContent = 'Kết nối thành công! API Key hợp lệ.';
        keyTestFeedback.className = 'feedback-message success';
        updateAPIKeyUIStatus();
      } catch (err) {
        keyTestFeedback.textContent = 'Kết nối thất bại. API Key không hợp lệ hoặc lỗi mạng!';
        keyTestFeedback.className = 'feedback-message error';
        // Reset key
        state.appConfig.apiKey = oldKey;
        await saveConfig(state.appConfig);
        updateAPIKeyUIStatus();
      }
    });
  }

  // Export library data
  if (btnExportData) {
    btnExportData.addEventListener('click', () => {
      if (state.localGames.length === 0) {
        alert('Thư viện game của bạn trống, không có gì để xuất!');
        return;
      }
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.localGames, null, 2));
      const dlAnchorElem = document.createElement('a');
      dlAnchorElem.setAttribute('href', dataStr);
      dlAnchorElem.setAttribute('download', 'gamevault_backup.json');
      dlAnchorElem.click();
    });
  }

  // Import library data
  if (btnImportData && importFileInput) {
    btnImportData.addEventListener('click', () => {
      importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            const isValid = imported.every(item => item.id && item.name && item.status);
            if (isValid) {
              if (confirm(`Bạn có muốn nhập ${imported.length} game vào thư viện? Hành động này sẽ gộp vào dữ liệu hiện tại.`)) {
                // Merge by id (unique game ids)
                const merged = [...state.localGames];
                imported.forEach(impItem => {
                  const index = merged.findIndex(g => g.id === impItem.id);
                  if (index !== -1) {
                    merged[index] = impItem; // update
                  } else {
                    merged.push(impItem); // insert
                  }
                });
                
                state.localGames = merged;
                await saveGames(state.localGames);
                updateLibraryStats();
                renderDashboard();
                renderActiveTabContents();
                alert('Nhập dữ liệu thành công!');
              }
            } else {
              alert('File JSON không đúng cấu trúc thư viện GameVault!');
            }
          } else {
            alert('Dữ liệu trong file không hợp lệ (Phải là một danh sách game)!');
          }
        } catch (err) {
          alert('Lỗi đọc file JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
      importFileInput.value = ''; // clear input
    });
  }

  // Clear library data
  if (btnClearAll) {
    btnClearAll.addEventListener('click', async () => {
      if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn XÓA TOÀN BỘ thư viện game? Hành động này không thể hoàn tác!')) {
        state.localGames = [];
        await saveGames(state.localGames);
        updateLibraryStats();
        renderDashboard();
        renderActiveTabContents();
        alert('Đã xóa sạch thư viện game!');
      }
    });
  }

  // Modal actions
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (gameDetailModal) {
    gameDetailModal.addEventListener('click', (e) => {
      if (e.target === gameDetailModal) closeModal();
    });
  }

  // Status dropdown toggle in Modal
  if (selectGameStatus && rowSubstatusPlatform) {
    selectGameStatus.addEventListener('change', () => {
      const status = selectGameStatus.value;
      updateModalFieldsVisibility(status);
      
      if (status === 'none') {
        rowSubstatusPlatform.classList.add('hidden');
      } else {
        rowSubstatusPlatform.classList.remove('hidden');
        updateSubstatusDropdown(status);
      }
    });
  }

  // Star Rating Selector handlers
  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.getAttribute('data-value'));
      setModalStarRating(val);
    });
  });

  // Modal Save Changes
  if (btnSaveModal) btnSaveModal.addEventListener('click', saveModalGame);

  // Modal Delete Game
  if (btnDeleteModal) btnDeleteModal.addEventListener('click', () => deleteModalGame(false));

  // DxDiag upload listeners
  if (btnUploadDxdiag && dxdiagFileInput) {
    btnUploadDxdiag.addEventListener('click', () => {
      dxdiagFileInput.click();
    });

    dxdiagFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const text = event.target.result;
          const specs = parseDxDiagText(text);
          
          if (specs.cpu !== 'Không rõ' || specs.gpu !== 'Không rõ' || specs.ram !== 'Không rõ') {
            state.appConfig.systemSpecs = specs;
            await saveConfig(state.appConfig);
            updateSpecsPreviewUI(specs);
            alert('Đã tải lên và phân tích cấu hình từ tệp DxDiag thành công!');
          } else {
            alert('Không thể nhận dạng thông tin phần cứng từ file này. Vui lòng tải đúng file txt xuất ra từ DxDiag!');
          }
        } catch (err) {
          alert('Lỗi xử lý file DxDiag: ' + err.message);
        }
      };
      reader.readAsText(file);
      dxdiagFileInput.value = ''; // clear input
    });
  }

  // Load more button triggers
  if (btnTrendingLoadMore) btnTrendingLoadMore.addEventListener('click', loadMoreTrending);
  if (btnUpcomingLoadMore) btnUpcomingLoadMore.addEventListener('click', loadMoreUpcoming);
  if (btnSearchLoadMore) btnSearchLoadMore.addEventListener('click', loadMoreSearch);
  if (btnBrowseLoadMore) btnBrowseLoadMore.addEventListener('click', loadMoreBrowse);
  if (btnBrowseBack) btnBrowseBack.addEventListener('click', () => {
    if (browseResultsSection) browseResultsSection.style.display = 'none';
    // Deactivate tag and creator pills
    document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.creator-pill').forEach(p => p.classList.remove('active'));
  });
}

// Switch tabs and trigger animations
export function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Reset pages for fresh load on manual tab click
  state.trendingPage = 1;
  state.upcomingPage = 1;
  state.searchPage = 1;

  // Clear cache for Discover/Search to trigger fresh load on tab switch
  state.trendingGamesCached = null;
  state.upcomingGamesCached = null;
  state.popularGamesCached = null;
  state.searchGamesCached = null;
  state.searchQueryCached = '';

  // Update Active Link UI
  sidebarLinks.forEach(link => {
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update Header Title
  const activeLink = document.querySelector(`.menu-item[data-tab="${tabId}"]`);
  if (activeLink && viewTitle) {
    viewTitle.textContent = activeLink.querySelector('span').textContent;
  }

  // Update View Pane
  viewPanes.forEach(pane => {
    if (pane.id === `view-${tabId}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  renderActiveTabContents();
}

// Render dynamic contents for current tab
export function renderActiveTabContents() {
  switch (state.activeTab) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'discover':
      renderDiscoverTab();
      break;
    case 'playing':
      renderListTab('playing');
      break;
    case 'backlog':
      renderListTab('backlog');
      break;
    case 'completed':
      renderListTab('completed');
      break;
    case 'search':
      renderSearchTab();
      break;
    case 'settings':
      // API Key input is pre-populated in initApp
      if (keyTestFeedback) keyTestFeedback.textContent = '';
      break;
  }
}

// Global functions exposed for dynamically rendered cards in HTML template
window.openGameDetails = openGameDetails;

// Fire up!
document.addEventListener('DOMContentLoaded', initApp);
