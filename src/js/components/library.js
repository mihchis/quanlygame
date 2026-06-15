// Component: Personal Game Library tab grids (Playing, Backlog, Completed)

import { state, SUB_STATUS_OPTIONS } from '../state.js';

// DOM elements
const playingGrid = document.getElementById('playing-game-grid');
const backlogGrid = document.getElementById('backlog-game-grid');
const completedGrid = document.getElementById('completed-game-grid');

const playingSearch = document.getElementById('playing-search-input');
const backlogSearch = document.getElementById('backlog-search-input');
const completedSearch = document.getElementById('completed-search-input');

// Helper to dynamically populate filter dropdown options from games in the active list
function populateFilterDropdowns(status, games) {
  const genreDropdown = document.getElementById(`${status}-filter-genre`);
  const platformDropdown = document.getElementById(`${status}-filter-platform`);

  if (!genreDropdown || !platformDropdown) return;

  const prevGenre = genreDropdown.value;
  const prevPlatform = platformDropdown.value;

  genreDropdown.innerHTML = '<option value="all">Tất cả thể loại</option>';
  platformDropdown.innerHTML = '<option value="all">Tất cả hệ máy</option>';

  const genres = new Set();
  const platforms = new Set();

  games.forEach(game => {
    if (game.genres && Array.isArray(game.genres)) {
      game.genres.forEach(genre => {
        const name = typeof genre === 'object' ? genre.name : genre;
        if (name) genres.add(name);
      });
    }
    if (game.platform && game.platform !== 'none') {
      platforms.add(game.platform);
    }
  });

  // Sort and append genres
  [...genres].sort().forEach(genre => {
    const opt = document.createElement('option');
    opt.value = genre;
    opt.textContent = genre;
    genreDropdown.appendChild(opt);
  });

  // Sort and append platforms
  [...platforms].sort().forEach(platform => {
    const opt = document.createElement('option');
    opt.value = platform;
    opt.textContent = platform;
    platformDropdown.appendChild(opt);
  });

  // Restore previous selection if valid
  if (genres.has(prevGenre)) {
    genreDropdown.value = prevGenre;
  } else {
    genreDropdown.value = 'all';
  }

  if (platforms.has(prevPlatform)) {
    platformDropdown.value = prevPlatform;
  } else {
    platformDropdown.value = 'all';
  }
}

// Render local library list grids
export function renderListTab(status) {
  let grid, searchField;
  if (status === 'playing') {
    grid = playingGrid;
    searchField = playingSearch;
  } else if (status === 'backlog') {
    grid = backlogGrid;
    searchField = backlogSearch;
  } else {
    grid = completedGrid;
    searchField = completedSearch;
  }

  if (!grid) return;
  
  // 1. Get all games with matching status
  const statusGames = state.localGames.filter(g => g.status === status);

  // 2. Populate filter options
  populateFilterDropdowns(status, statusGames);

  // 3. Get current values
  const genreFilter = document.getElementById(`${status}-filter-genre`)?.value || 'all';
  const platformFilter = document.getElementById(`${status}-filter-platform`)?.value || 'all';
  const sortBy = document.getElementById(`${status}-sort`)?.value || 'updated-desc';
  const searchVal = searchField ? searchField.value.toLowerCase().trim() : '';

  // 4. Filter games by status, search key, genre, and platform
  let filtered = statusGames.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(searchVal);
    
    const matchGenre = genreFilter === 'all' || (g.genres && g.genres.some(genre => {
      const name = typeof genre === 'object' ? genre.name : genre;
      return name === genreFilter;
    }));

    const matchPlatform = platformFilter === 'all' || g.platform === platformFilter;

    return matchSearch && matchGenre && matchPlatform;
  });

  // 5. Sort games based on sorting option
  filtered.sort((a, b) => {
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
    }
    if (sortBy === 'name-desc') {
      return b.name.localeCompare(a.name, 'vi', { sensitivity: 'base' });
    }
    if (sortBy === 'metacritic-desc') {
      return (b.metacritic || 0) - (a.metacritic || 0);
    }
    if (sortBy === 'released-desc') {
      return (b.released || '').localeCompare(a.released || '');
    }
    if (sortBy === 'updated-desc') {
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    }
    if (sortBy === 'playtime-desc') {
      return (parseFloat(b.playingHours) || 0) - (parseFloat(a.playingHours) || 0);
    }
    if (sortBy === 'playtime-asc') {
      return (parseFloat(a.playingHours) || 0) - (parseFloat(b.playingHours) || 0);
    }
    if (sortBy === 'startdate-desc') {
      return (b.startDate || '').localeCompare(a.startDate || '');
    }
    if (sortBy === 'priority-desc') {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const weightA = priorityWeight[a.priority] || 2;
      const weightB = priorityWeight[b.priority] || 2;
      return weightB - weightA;
    }
    if (sortBy === 'rating-desc') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'enddate-desc') {
      return (b.endDate || '').localeCompare(a.endDate || '');
    }
    return 0;
  });

  // Clear grid
  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px;">
        ${searchVal || genreFilter !== 'all' || platformFilter !== 'all' ? 'Không tìm thấy game nào khớp với bộ lọc.' : 'Không có game nào trong mục này.'}
      </div>
    `;
    return;
  }

  // Helper to construct individual game card DOM
  function createGameCard(game, cardStatus) {
    const card = document.createElement('div');
    card.className = `game-card glass-card ${game.status}`;
    card.setAttribute('data-game-id', game.id);

    // Custom badges content
    let userInfoContent = '';
    if (cardStatus === 'playing') {
      userInfoContent = `
        <svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm3.3 14.3L11 12.8V7h1.5v4.9l3.7 2.2-.7 1.2z"/></svg>
        <span>${parseFloat(game.playingHours || 0).toFixed(1)}h chơi</span>
      `;
    } else if (cardStatus === 'backlog') {
      userInfoContent = `
        <span class="priority-tag ${game.priority || 'medium'}" style="font-size: 9px; padding: 1px 5px;">
          ${game.priority === 'high' ? 'High' : game.priority === 'low' ? 'Low' : 'Med'}
        </span>
      `;
    } else {
      // Stars for rating
      let stars = '';
      for (let i = 1; i <= 5; i++) {
        stars += i <= (game.rating || 0) ? '★' : '☆';
      }
      userInfoContent = `<span style="color: var(--accent-orange); font-size: 12px; letter-spacing: 1px;">${stars}</span>`;
    }

    // Metacritic badge
    const mcScore = game.metacritic;
    let mcClass = '';
    if (mcScore) {
      if (mcScore < 50) mcClass = 'score-low';
      else if (mcScore < 75) mcClass = 'score-medium';
    }
    const mcBadge = mcScore ? `<div class="metacritic-badge ${mcClass}">${mcScore}</div>` : '';

    const firstGenre = game.genres && game.genres.length > 0 ? (typeof game.genres[0] === 'object' ? game.genres[0].name : game.genres[0]) : 'RAWG Game';
    
    // Platform details
    const platformText = game.platform && game.platform !== 'none' ? game.platform : '';
    const subtitleText = platformText ? `${firstGenre} • ${platformText}` : firstGenre;
    
    // Sub-status pill
    let substatusBadge = '';
    if (game.subStatus && game.subStatus !== 'none') {
      const opt = (SUB_STATUS_OPTIONS[game.status] || []).find(o => o.value === game.subStatus);
      if (opt) {
        const labelClean = opt.label.split(' (')[0];
        substatusBadge = `<span class="substatus-pill status-${game.subStatus}">${labelClean}</span>`;
      }
    }

    // Append sub-status badge next to the stats
    let cardUserRow = userInfoContent;
    if (substatusBadge) {
      cardUserRow = `<div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
        <div style="display:flex; align-items:center; gap:4px;">${userInfoContent}</div>
        ${substatusBadge}
      </div>`;
    }

    card.innerHTML = `
      <div class="game-card-img-container">
        <img class="game-card-img" src="${game.background_image || 'src/css/placeholder.svg'}" alt="${game.name}">
        ${mcBadge}
      </div>
      <div class="game-card-info">
        <div>
          <h4 class="game-card-title">${game.name}</h4>
          <div class="game-card-subtitle">
            <span title="${subtitleText}" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">${subtitleText}</span>
            <span>${game.released ? game.released.substring(0, 4) : '--'}</span>
          </div>
        </div>
        <div class="game-card-user-info" style="display:flex; width:100%;">
          ${cardUserRow}
        </div>
      </div>
    `;
    return card;
  }

  // Helper to extract series name
  function determineSeriesName(group) {
    const names = group.map(g => g.name);
    let shortest = names[0];
    names.forEach(name => {
      if (name.length < shortest.length) shortest = name;
    });
    
    let clean = shortest.split(':')[0].split('-')[0].trim();
    clean = clean.replace(/\s+\d+$/, '').replace(/\s+[IVXLCDM]+$/i, '').trim();
    return clean || shortest;
  }

  const viewMode = document.getElementById(`${status}-view-mode`)?.value || 'grid';

  if (viewMode === 'grid') {
    filtered.forEach(game => {
      const card = createGameCard(game, status);
      grid.appendChild(card);
    });
  } else {
    // 1. Group games transitively based on seriesGameIds matches
    const groups = [];
    const ungrouped = [...filtered];

    while (ungrouped.length > 0) {
      const game = ungrouped.shift();
      const currentGroup = [game];
      const seriesIds = new Set(game.seriesGameIds || []);

      for (let i = ungrouped.length - 1; i >= 0; i--) {
        const other = ungrouped[i];
        const otherSeries = other.seriesGameIds || [];
        const isRelated = seriesIds.has(other.id) || otherSeries.includes(game.id);

        if (isRelated) {
          currentGroup.push(other);
          otherSeries.forEach(id => seriesIds.add(id));
          ungrouped.splice(i, 1);
        }
      }
      groups.push(currentGroup);
    }

    // 2. Sort into series groups vs standalone games
    const seriesGroups = [];
    const standaloneGames = [];

    groups.forEach(g => {
      if (g.length >= 2) {
        seriesGroups.push({
          name: determineSeriesName(g),
          games: g,
          maxUpdatedAt: Math.max(...g.map(game => game.updatedAt || 0))
        });
      } else {
        standaloneGames.push(g[0]);
      }
    });

    // Sort series groups by maxUpdatedAt descending (recently updated series float to the top)
    seriesGroups.sort((a, b) => b.maxUpdatedAt - a.maxUpdatedAt);

    // 3. Render series groups
    seriesGroups.forEach(group => {
      const groupContainer = document.createElement('div');
      groupContainer.className = 'series-group-container';

      const title = document.createElement('h3');
      title.className = 'series-group-title';
      title.innerHTML = `📦 Dòng game: ${group.name} <span class="series-group-count">${group.games.length} game</span>`;
      groupContainer.appendChild(title);

      const subGrid = document.createElement('div');
      subGrid.className = 'series-game-grid';
      group.games.forEach(game => {
        const card = createGameCard(game, status);
        subGrid.appendChild(card);
      });
      groupContainer.appendChild(subGrid);

      grid.appendChild(groupContainer);
    });

    // 4. Render standalone games
    if (standaloneGames.length > 0) {
      const standaloneContainer = document.createElement('div');
      standaloneContainer.className = 'series-group-container standalone-group-container';

      const title = document.createElement('h3');
      title.className = 'series-group-title';
      title.innerHTML = `🎮 Các game đơn bản khác <span class="series-group-count">${standaloneGames.length} game</span>`;
      standaloneContainer.appendChild(title);

      const subGrid = document.createElement('div');
      subGrid.className = 'series-game-grid';
      standaloneGames.forEach(game => {
        const card = createGameCard(game, status);
        subGrid.appendChild(card);
      });
      standaloneContainer.appendChild(subGrid);

      grid.appendChild(standaloneContainer);
    }
  }
}
