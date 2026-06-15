// Global State Manager for Electron Game Catalog App

export const state = {
  localGames: [],
  appConfig: { apiKey: '' },
  activeTab: 'dashboard',
  selectedGame: null,
  currentRating: 0,
  
  // Cache for discover/search to prevent collapse on modal load
  popularGamesCached: null,
  trendingGamesCached: null,
  upcomingGamesCached: null,
  trendingPage: 1,
  upcomingPage: 1,
  searchPage: 1,
  searchQueryCached: '',
  searchGamesCached: null,

  // Pagination buffer arrays and API trackers
  trendingGamesBuffer: null,
  trendingApiPage: 0,
  trendingTotalCount: 0,
  upcomingGamesBuffer: null,
  upcomingApiPage: 0,
  upcomingTotalCount: 0,
  browseGamesBuffer: null,
  browseApiPage: 0,
  browseTotalCount: 0,
  searchGamesBuffer: null,
  searchApiPage: 0,
  searchTotalCount: 0,

  // Genres & Tags browser state
  genresCached: null,
  tagsCached: null,
  developersCached: null,
  creatorsCached: null,
  browseGenreId: null,
  browseTagId: null,
  browseDeveloperId: null,
  browseCreatorId: null,
  browseGamesCached: null,
  browsePage: 1,
  browseMode: null, // 'genre' | 'tag' | 'developer' | 'creator' | null
};


export const SUB_STATUS_OPTIONS = {
  none: [
    { value: 'none', label: 'Không có phân loại' }
  ],
  playing: [
    { value: 'none', label: 'Không phân loại' },
    { value: 'currently_playing', label: 'Đang cày (Currently Playing)' },
    { value: 'on_hold', label: 'Tạm dừng (On Hold)' },
    { value: 'endless', label: 'Game vô tận (Endless)' },
    { value: 'replaying', label: 'Chơi lại (Replaying)' }
  ],
  backlog: [
    { value: 'none', label: 'Không phân loại' },
    { value: 'next_in_line', label: 'Chơi kế tiếp (Next in Line)' },
    { value: 'backlog', label: 'Hàng chờ thường (Backlog)' },
    { value: 'wishlist', label: 'Chờ mua (Wishlist)' }
  ],
  completed: [
    { value: 'none', label: 'Không phân loại' },
    { value: 'completed_story', label: 'Xong cốt truyện (Story Completed)' },
    { value: 'completed_100', label: 'Hoàn thành 100% (Platinum)' },
    { value: 'dropped', label: 'Drop nửa chừng (Dropped)' }
  ]
};

// Syncing functions
export async function loadConfig() {
  try {
    state.appConfig = await window.api.getConfig();
    return state.appConfig;
  } catch (err) {
    console.error('Error loading config:', err);
    return state.appConfig;
  }
}

export async function saveConfig(config) {
  try {
    const success = await window.api.saveConfig(config);
    if (success) {
      state.appConfig = config;
    }
    return success;
  } catch (err) {
    console.error('Error saving config:', err);
    return false;
  }
}

export async function loadGames() {
  try {
    state.localGames = await window.api.getGames();
    return state.localGames;
  } catch (err) {
    console.error('Error loading games database:', err);
    return [];
  }
}

export async function saveGames(games) {
  try {
    const success = await window.api.saveGames(games);
    if (success) {
      state.localGames = games;
      // Sync with Firebase Firestore in the background
      import('./firebase.js').then(fb => {
        fb.syncGamesToCloud(games);
      }).catch(err => {
        console.error('Error triggering cloud sync:', err);
      });
    }
    return success;
  } catch (err) {
    console.error('Error saving games database:', err);
    return false;
  }
}
