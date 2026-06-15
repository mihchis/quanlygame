// Entry point of the Game Catalog Electron App
// Orchestrates navigation, events, and boot-up processes

import { state, loadConfig, saveConfig, loadGames, saveGames } from './state.js';
import { updateLibraryStats, renderDashboard } from './components/dashboard.js';
import { renderDiscoverTab } from './components/discover.js';
import { renderSearchTab } from './components/search.js';
import { renderListTab } from './components/library.js';
import { openGameDetails, closeModal, saveModalGame, deleteModalGame, updateModalFieldsVisibility, updateSubstatusDropdown, setModalStarRating } from './components/modal.js';
import { parseDxDiagText, updateSpecsPreviewUI } from './components/dxdiag.js';
import { initFirebase, onAuthChanged, signIn, signUp, signOutUser, fetchGamesFromCloud, syncGamesToCloud, saveAvatarToCloud, fetchAvatarFromCloud } from './firebase.js';
import { showConfirm, showAlert } from './components/dialog.js';

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

// Sync and merge cloud games with local games on login
async function handleCloudSyncOnLogin(cloudGames) {
  if (!cloudGames) {
    console.log('Không lấy được dữ liệu từ đám mây (hoặc trống). Giữ nguyên dữ liệu cục bộ.');
    if (state.localGames && state.localGames.length > 0) {
      await syncGamesToCloud(state.localGames);
    }
    return;
  }

  console.log(`Bắt đầu đồng bộ hóa. Game cục bộ: ${state.localGames.length}, Game đám mây: ${cloudGames.length}`);

  const mergedMap = new Map();
  
  // Load local games
  state.localGames.forEach(g => {
    mergedMap.set(g.id, g);
  });

  // Merge cloud games based on updatedAt timestamp
  cloudGames.forEach(cg => {
    const lg = mergedMap.get(cg.id);
    if (!lg || (cg.updatedAt || 0) > (lg.updatedAt || 0)) {
      mergedMap.set(cg.id, cg);
    }
  });

  const mergedGames = Array.from(mergedMap.values());
  console.log(`Kết quả gộp: ${mergedGames.length} game.`);

  state.localGames = mergedGames;
  await saveGames(state.localGames);
}

// Initialize Application
async function initApp() {
  try {
    // 1. Load configuration
    const config = await loadConfig();
    if (inputApiKey) {
      if (config.isEnvLoaded) {
        inputApiKey.value = '••••••••••••••••••••••••••••••••';
        inputApiKey.disabled = true;
        inputApiKey.style.opacity = '0.7';
        inputApiKey.style.cursor = 'not-allowed';
        if (btnToggleKey) btnToggleKey.style.display = 'none';
        if (btnSaveKey) {
          btnSaveKey.disabled = true;
          btnSaveKey.style.opacity = '0.5';
          btnSaveKey.style.cursor = 'not-allowed';
          btnSaveKey.title = 'API Key được nạp từ biến môi trường (.env)';
        }
        const settingsDesc = document.querySelector('.settings-card-desc');
        if (settingsDesc) {
          settingsDesc.innerHTML = 'API Key đang được nạp tự động từ file cấu hình <code>.env</code>. Bạn không cần phải chỉnh sửa thủ công ở đây.';
        }
        if (keyTestFeedback) {
          keyTestFeedback.innerHTML = '<span class="status-dot green" style="display:inline-block; vertical-align:middle; margin-right:6px;"></span> <strong style="color: var(--accent-green);">API Key được tự động tải từ file cấu hình .env (Đang hoạt động)</strong>';
          keyTestFeedback.className = 'feedback-message success';
        }
      } else {
        inputApiKey.value = config.apiKey || '';
      }
    }
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

    // 4. Initialize Firebase & Auth UI
    const fbApp = await initFirebase();
    if (!fbApp) {
      const authScreen = document.getElementById('auth-screen');
      const sidebarUserCard = document.getElementById('sidebar-user-card');
      if (authScreen) authScreen.style.display = 'none';
      if (sidebarUserCard) sidebarUserCard.style.display = 'none';
      console.log("Không thể kết nối Firebase hoặc chưa cấu hình. Bỏ qua Auth và đồng bộ đám mây.");
      
      // Setup offline views
      updateLibraryStats();
      renderDashboard();

      if (!state.appConfig.apiKey) {
        switchTab('settings');
        if (keyTestFeedback) {
          keyTestFeedback.textContent = 'Vui lòng nhận và cấu hình RAWG API Key để sử dụng tính năng tìm kiếm!';
          keyTestFeedback.className = 'feedback-message error';
        }
      } else {
        renderActiveTabContents();
        resolveUnresolvedGames();
        resolveLibrarySeries();
      }
    } else {
      let isLoginView = true;
      const authScreen = document.getElementById('auth-screen');
      const loginForm = document.getElementById('login-form');
      const registerForm = document.getElementById('register-form');
      const authErrorMsg = document.getElementById('auth-error-msg');
      const authToggleText = document.getElementById('auth-toggle-text');
      const linkToggleAuth = document.getElementById('link-toggle-auth');
      const sidebarUserCard = document.getElementById('sidebar-user-card');
      const userEmailLabel = document.getElementById('user-email-label');
      const btnLogout = document.getElementById('btn-logout');

      if (linkToggleAuth) {
        linkToggleAuth.addEventListener('click', (e) => {
          e.preventDefault();
          isLoginView = !isLoginView;
          if (authErrorMsg) authErrorMsg.style.display = 'none';
          if (isLoginView) {
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
            if (authToggleText) authToggleText.textContent = 'Chưa có tài khoản?';
            linkToggleAuth.textContent = 'Đăng ký ngay';
          } else {
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
            if (authToggleText) authToggleText.textContent = 'Đã có tài khoản?';
            linkToggleAuth.textContent = 'Đăng nhập';
          }
        });
      }

      if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('auth-email').value.trim();
          const password = document.getElementById('auth-password').value;
          const submitBtn = document.getElementById('btn-login-submit');
          
          try {
            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.textContent = 'Đang đăng nhập...';
            }
            if (authErrorMsg) authErrorMsg.style.display = 'none';
            
            await signIn(email, password);
          } catch (err) {
            console.error(err);
            if (authErrorMsg) {
              authErrorMsg.textContent = 'Đăng nhập thất bại: ' + err.message;
              authErrorMsg.style.display = 'block';
            }
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Đăng nhập';
            }
          }
        });
      }

      if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('reg-email').value.trim();
          const password = document.getElementById('reg-password').value;
          const confirm = document.getElementById('reg-confirm').value;
          const submitBtn = document.getElementById('btn-register-submit');
          
          if (password !== confirm) {
            if (authErrorMsg) {
              authErrorMsg.textContent = 'Mật khẩu xác nhận không khớp!';
              authErrorMsg.style.display = 'block';
            }
            return;
          }
          
          try {
            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.textContent = 'Đang đăng ký...';
            }
            if (authErrorMsg) authErrorMsg.style.display = 'none';
            
            await signUp(email, password);
          } catch (err) {
            console.error(err);
            if (authErrorMsg) {
              authErrorMsg.textContent = 'Đăng ký thất bại: ' + err.message;
              authErrorMsg.style.display = 'block';
            }
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Đăng ký tài khoản';
            }
          }
        });
      }

      if (btnLogout) {
        btnLogout.addEventListener('click', async (e) => {
          e.preventDefault();
          await signOutUser();
        });
      }

      // Avatar upload handler
      const avatarContainer = document.getElementById('user-avatar-container');
      const avatarFileInput = document.getElementById('avatar-file-input');
      if (avatarContainer && avatarFileInput) {
        avatarContainer.addEventListener('click', () => avatarFileInput.click());
        avatarFileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (ev) => {
            const base64 = ev.target.result;
            const avatarImg = document.getElementById('user-avatar-img');
            const avatarEmoji = document.getElementById('user-avatar-emoji');
            if (avatarImg) { avatarImg.src = base64; avatarImg.style.display = 'block'; }
            if (avatarEmoji) avatarEmoji.style.display = 'none';
            // Save locally
            const { getCurrentUser } = await import('./firebase.js');
            const cu = getCurrentUser();
            if (cu) localStorage.setItem('gamevault_avatar_' + cu.uid, base64);
            // Save to cloud
            saveAvatarToCloud(base64);
          };
          reader.readAsDataURL(file);
          avatarFileInput.value = '';
        });
      }

      await onAuthChanged(async (user) => {
        if (user) {
          if (authScreen) authScreen.style.display = 'none';
          if (sidebarUserCard) sidebarUserCard.style.display = 'flex';
          if (userEmailLabel) userEmailLabel.textContent = user.email || 'User';
          
          // Load avatar
          const avatarImg = document.getElementById('user-avatar-img');
          const avatarEmoji = document.getElementById('user-avatar-emoji');
          const localAvatar = localStorage.getItem('gamevault_avatar_' + user.uid);
          if (localAvatar) {
            if (avatarImg) { avatarImg.src = localAvatar; avatarImg.style.display = 'block'; }
            if (avatarEmoji) avatarEmoji.style.display = 'none';
          }
          // Also try cloud avatar (may be newer)
          fetchAvatarFromCloud().then(cloudAvatar => {
            if (cloudAvatar) {
              localStorage.setItem('gamevault_avatar_' + user.uid, cloudAvatar);
              if (avatarImg) { avatarImg.src = cloudAvatar; avatarImg.style.display = 'block'; }
              if (avatarEmoji) avatarEmoji.style.display = 'none';
            }
          }).catch(() => {});

          try {
            const cloudGames = await fetchGamesFromCloud();
            await handleCloudSyncOnLogin(cloudGames);
          } catch (err) {
            console.error("Lỗi khi đồng bộ đám mây:", err);
          }
          
          updateLibraryStats();
          renderDashboard();

          if (!state.appConfig.apiKey) {
            switchTab('settings');
            if (keyTestFeedback) {
              keyTestFeedback.textContent = 'Vui lòng nhận và cấu hình RAWG API Key để sử dụng tính năng tìm kiếm!';
              keyTestFeedback.className = 'feedback-message error';
            }
          } else {
            renderActiveTabContents();
            resolveUnresolvedGames();
            resolveLibrarySeries();
          }
        } else {
          if (authScreen) authScreen.style.display = 'flex';
          if (sidebarUserCard) sidebarUserCard.style.display = 'none';
          
          isLoginView = true;
          if (loginForm) loginForm.style.display = 'block';
          if (registerForm) registerForm.style.display = 'none';
          if (authToggleText) authToggleText.textContent = 'Chưa có tài khoản?';
          if (linkToggleAuth) linkToggleAuth.textContent = 'Đăng ký ngay';
          if (authErrorMsg) authErrorMsg.style.display = 'none';
        }
      });
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

// Resolve series game IDs for library games that don't have them yet in the background
async function resolveLibrarySeries() {
  const gamesMissingSeries = state.localGames.filter(g => !g.seriesGameIds);
  if (gamesMissingSeries.length === 0) return;

  console.log(`Bắt đầu lấy thông tin dòng game cho ${gamesMissingSeries.length} game trong thư viện...`);

  for (const game of gamesMissingSeries) {
    try {
      // Respect RAWG rate limit guidelines (350ms pause)
      await new Promise(r => setTimeout(r, 350));
      
      const data = await window.api.getGameSeries(game.id, 40);
      game.seriesGameIds = (data && data.results) ? data.results.map(r => r.id) : [];
      
      const idx = state.localGames.findIndex(g => g.id === game.id);
      if (idx !== -1) {
        state.localGames[idx] = game;
      }
    } catch (err) {
      console.error(`Lỗi khi lấy thông tin dòng game cho ${game.name}:`, err);
      // Give it an empty array so we don't try fetching again next boot
      game.seriesGameIds = [];
    }
  }

  await saveGames(state.localGames);
  console.log('Đã cập nhật xong thông tin dòng game cho tất cả game!');
  
  // Re-render the active tab if it's a library tab to show the grouped lists
  if (state.activeTab !== 'discover' && state.activeTab !== 'search' && state.activeTab !== 'dashboard') {
    renderListTab(state.activeTab);
  }
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

  // Client-side search filters and sort for lists
  const bindListFilters = (status) => {
    const search = document.getElementById(`${status}-search-input`);
    const genre = document.getElementById(`${status}-filter-genre`);
    const platform = document.getElementById(`${status}-filter-platform`);
    const sort = document.getElementById(`${status}-sort`);
    const viewMode = document.getElementById(`${status}-view-mode`);

    if (search) search.addEventListener('input', () => renderListTab(status));
    if (genre) genre.addEventListener('change', () => renderListTab(status));
    if (platform) platform.addEventListener('change', () => renderListTab(status));
    if (sort) sort.addEventListener('change', () => renderListTab(status));
    if (viewMode) viewMode.addEventListener('change', () => renderListTab(status));
  };

  bindListFilters('playing');
  bindListFilters('backlog');
  bindListFilters('completed');

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
      if (state.appConfig.isEnvLoaded) return;
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
      const isEnv = state.appConfig.isEnvLoaded;
      const key = isEnv ? state.appConfig.apiKey : inputApiKey.value.trim();
      if (!key || (key.startsWith('•••') && !isEnv)) {
        keyTestFeedback.textContent = 'Vui lòng điền API Key trước khi test!';
        keyTestFeedback.className = 'feedback-message error';
        return;
      }

      keyTestFeedback.textContent = 'Đang kiểm tra kết nối với RAWG...';
      keyTestFeedback.className = 'feedback-message';

      // Temporarily save config to test it
      let oldKey;
      if (!isEnv) {
        oldKey = state.appConfig.apiKey;
        state.appConfig.apiKey = key;
        await saveConfig(state.appConfig);
      }

      try {
        // Fetch a simple query to verify
        await window.api.getPopularGames(1);
        if (isEnv) {
          keyTestFeedback.innerHTML = '<span class="status-dot green" style="display:inline-block; vertical-align:middle; margin-right:6px;"></span> <strong style="color: var(--accent-green);">API Key được tự động tải từ file cấu hình .env (Kết nối thành công!)</strong>';
        } else {
          keyTestFeedback.textContent = 'Kết nối thành công! API Key hợp lệ.';
        }
        keyTestFeedback.className = 'feedback-message success';
        updateAPIKeyUIStatus();
      } catch (err) {
        if (isEnv) {
          keyTestFeedback.innerHTML = '<span class="status-dot red" style="display:inline-block; vertical-align:middle; margin-right:6px;"></span> <strong style="color: var(--accent-danger);">Kết nối thất bại. API Key trong .env không hợp lệ hoặc lỗi mạng!</strong>';
        } else {
          keyTestFeedback.textContent = 'Kết nối thất bại. API Key không hợp lệ hoặc lỗi mạng!';
        }
        keyTestFeedback.className = 'feedback-message error';
        if (!isEnv) {
          // Reset key
          state.appConfig.apiKey = oldKey;
          await saveConfig(state.appConfig);
          updateAPIKeyUIStatus();
        }
      }
    });
  }

  // Export library data
  if (btnExportData) {
    btnExportData.addEventListener('click', () => {
      if (state.localGames.length === 0) {
        showAlert('Thông báo', 'Thư viện game của bạn trống, không có gì để xuất!', 'info');
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
              showConfirm('Xác nhận nhập', `Bạn có muốn nhập ${imported.length} game vào thư viện? Hành động này sẽ gộp vào dữ liệu hiện tại.`).then(async (confirmImport) => {
                if (confirmImport) {
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
                  showAlert('Thành công', 'Nhập dữ liệu thành công!', 'success');
                }
              });
            } else {
              showAlert('Lỗi', 'File JSON không đúng cấu trúc thư viện GameVault!', 'error');
            }
          } else {
            showAlert('Lỗi', 'Dữ liệu trong file không hợp lệ (Phải là một danh sách game)!', 'error');
          }
        } catch (err) {
          showAlert('Lỗi', 'Lỗi đọc file JSON: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
      importFileInput.value = ''; // clear input
    });
  }

  // Clear library data
  if (btnClearAll) {
    btnClearAll.addEventListener('click', async () => {
      const confirmClear = await showConfirm('Cảnh báo nguy hiểm', 'CẢNH BÁO: Bạn có chắc chắn muốn XÓA TOÀN BỘ thư viện game? Hành động này không thể hoàn tác!');
      if (confirmClear) {
        state.localGames = [];
        await saveGames(state.localGames);
        updateLibraryStats();
        renderDashboard();
        renderActiveTabContents();
        showAlert('Thông báo', 'Đã xóa sạch thư viện game!', 'success');
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
            showAlert('Thành công', 'Đã tải lên và phân tích cấu hình từ tệp DxDiag thành công!', 'success');
          } else {
            showAlert('Lỗi', 'Không thể nhận dạng thông tin phần cứng từ file này. Vui lòng tải đúng file txt xuất ra từ DxDiag!', 'error');
          }
        } catch (err) {
          showAlert('Lỗi', 'Lỗi xử lý file DxDiag: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
      dxdiagFileInput.value = ''; // clear input
    });
  }


  if (btnBrowseBack) btnBrowseBack.addEventListener('click', () => {
    if (browseResultsSection) browseResultsSection.style.display = 'none';
    // Deactivate tag and creator pills
    document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.creator-pill').forEach(p => p.classList.remove('active'));
  });

  // Global Event Delegation for opening Game Details
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.game-card, .completed-showcase-item, .rec-card, .similar-game-card, [data-game-id]');
    if (target) {
      const gameId = target.getAttribute('data-game-id');
      if (gameId && gameId !== 'none') {
        openGameDetails(Number(gameId));
      }
    }
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

  // Reset pagination buffers
  state.trendingGamesBuffer = null;
  state.trendingApiPage = 0;
  state.trendingTotalCount = 0;
  state.upcomingGamesBuffer = null;
  state.upcomingApiPage = 0;
  state.upcomingTotalCount = 0;
  state.browseGamesBuffer = null;
  state.browseApiPage = 0;
  state.browseTotalCount = 0;
  state.searchGamesBuffer = null;
  state.searchApiPage = 0;
  state.searchTotalCount = 0;

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
      if (keyTestFeedback) {
        if (state.appConfig.isEnvLoaded) {
          keyTestFeedback.innerHTML = '<span class="status-dot green" style="display:inline-block; vertical-align:middle; margin-right:6px;"></span> <strong style="color: var(--accent-green);">API Key được tự động tải từ file cấu hình .env (Đang hoạt động)</strong>';
          keyTestFeedback.className = 'feedback-message success';
        } else {
          keyTestFeedback.textContent = '';
        }
      }
      break;
  }
}

// Global functions exposed for dynamically rendered cards in HTML template
window.openGameDetails = openGameDetails;

// Fire up!
document.addEventListener('DOMContentLoaded', initApp);
