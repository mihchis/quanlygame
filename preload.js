const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  getGames: () => ipcRenderer.invoke('get-games'),
  saveGames: (games) => ipcRenderer.invoke('save-games', games),
  
  // RAWG API helpers
  searchGames: (query, page = 1) => ipcRenderer.invoke('fetch-rawg', 'games', { 
    search: query, 
    page: page,
    page_size: 15
  }),
  getGameDetails: (id) => ipcRenderer.invoke('fetch-rawg', `games/${id}`),
  getGameScreenshots: (id) => ipcRenderer.invoke('fetch-rawg', `games/${id}/screenshots`),
  getPopularGames: (page = 1, pageSize = 24) => {
    // Return some trending/popular games to show in search/recommendations tab
    return ipcRenderer.invoke('fetch-rawg', 'games', {
      dates: '2025-01-01,2026-06-30',
      ordering: '-metacritic',
      page: page,
      page_size: pageSize
    });
  },
  getTrendingGames: (page = 1, pageSize = 20) => {
    return ipcRenderer.invoke('fetch-rawg', 'games', {
      ordering: '-added',
      page: page,
      page_size: pageSize
    });
  },
  getUpcomingGames: (page = 1, pageSize = 20) => {
    return ipcRenderer.invoke('fetch-rawg', 'games', {
      dates: '2026-06-12,2027-06-30',
      ordering: 'released',
      page: page,
      page_size: pageSize
    });
  },
  getSimilarGames: (tags, pageSize = 8) => {
    return ipcRenderer.invoke('fetch-rawg', 'games', {
      tags: tags,
      ordering: '-added',
      page_size: pageSize
    });
  },
  getGameAdditions: (id, pageSize = 8) => {
    return ipcRenderer.invoke('fetch-rawg', `games/${id}/additions`, {
      page_size: pageSize
    });
  },
  getGameDevelopmentTeam: (id, pageSize = 8) => {
    return ipcRenderer.invoke('fetch-rawg', `games/${id}/development-team`, {
      page_size: pageSize
    });
  },
  getGameSeries: (id, pageSize = 8) => {
    return ipcRenderer.invoke('fetch-rawg', `games/${id}/game-series`, {
      page_size: pageSize
    });
  },
  getGameParents: (id, pageSize = 8) => {
    return ipcRenderer.invoke('fetch-rawg', `games/${id}/parent-games`, {
      page_size: pageSize
    });
  },
  getGameStores: (id, pageSize = 8) => {
    return ipcRenderer.invoke('fetch-rawg', `games/${id}/stores`, {
      page_size: pageSize
    });
  },
  getGameAchievements: (id, pageSize = 6) => {
    return ipcRenderer.invoke('fetch-rawg', `games/${id}/achievements`, {
      page_size: pageSize
    });
  },
  getGameTrailers: (id, pageSize = 3) => {
    return ipcRenderer.invoke('fetch-rawg', `games/${id}/movies`, {
      page_size: pageSize
    });
  },
  getGameRedditPosts: (id, pageSize = 5) => {
    return ipcRenderer.invoke('fetch-rawg', `games/${id}/reddit`, {
      page_size: pageSize
    });
  },
  getGameSuggested: (id, pageSize = 8) => {
    return ipcRenderer.invoke('fetch-rawg', `games/${id}/suggested`, {
      page_size: pageSize
    });
  },
  getGameTwitch: (id, pageSize = 5) => {
    return ipcRenderer.invoke('fetch-rawg', `games/${id}/twitch`, {
      page_size: pageSize
    });
  },
  getGameYoutube: (id, pageSize = 5) => {
    return ipcRenderer.invoke('fetch-rawg', `games/${id}/youtube`, {
      page_size: pageSize
    });
  },

  // Genres & Tags
  getGenres: () => ipcRenderer.invoke('fetch-rawg', 'genres', { page_size: 30 }),
  getGenreDetails: (id) => ipcRenderer.invoke('fetch-rawg', `genres/${id}`),
  getGamesByGenre: (genreId, page = 1, pageSize = 20) => {
    return ipcRenderer.invoke('fetch-rawg', 'games', {
      genres: genreId,
      ordering: '-added',
      page,
      page_size: pageSize
    });
  },
  getTags: (page = 1, pageSize = 30) => {
    return ipcRenderer.invoke('fetch-rawg', 'tags', { page, page_size: pageSize });
  },
  getTagDetails: (id) => ipcRenderer.invoke('fetch-rawg', `tags/${id}`),
  getGamesByTag: (tagId, page = 1, pageSize = 20) => {
    return ipcRenderer.invoke('fetch-rawg', 'games', {
      tags: tagId,
      ordering: '-added',
      page,
      page_size: pageSize
    });
  },
  
  // Creators & Developers
  getCreators: (page = 1, pageSize = 30) => {
    return ipcRenderer.invoke('fetch-rawg', 'creators', { page, page_size: pageSize });
  },
  getCreatorDetails: (id) => {
    return ipcRenderer.invoke('fetch-rawg', `creators/${id}`);
  },
  getCreatorRoles: (page = 1, pageSize = 30) => {
    return ipcRenderer.invoke('fetch-rawg', 'creator-roles', { page, page_size: pageSize });
  },
  getDevelopers: (page = 1, pageSize = 30) => {
    return ipcRenderer.invoke('fetch-rawg', 'developers', { page, page_size: pageSize });
  },
  getDeveloperDetails: (id) => {
    return ipcRenderer.invoke('fetch-rawg', `developers/${id}`);
  },
  getGamesByDeveloper: (developerId, page = 1, pageSize = 20) => {
    return ipcRenderer.invoke('fetch-rawg', 'games', {
      developers: developerId,
      ordering: '-added',
      page,
      page_size: pageSize
    });
  },
  getGamesByCreator: (creatorId, page = 1, pageSize = 20) => {
    return ipcRenderer.invoke('fetch-rawg', 'games', {
      creators: creatorId,
      ordering: '-added',
      page,
      page_size: pageSize
    });
  }
});
