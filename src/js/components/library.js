// Component: Personal Game Library tab grids (Playing, Backlog, Completed)

import { state, SUB_STATUS_OPTIONS } from '../state.js';

// DOM elements
const playingGrid = document.getElementById('playing-game-grid');
const backlogGrid = document.getElementById('backlog-game-grid');
const completedGrid = document.getElementById('completed-game-grid');

const playingSearch = document.getElementById('playing-search-input');
const backlogSearch = document.getElementById('backlog-search-input');
const completedSearch = document.getElementById('completed-search-input');

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
  grid.innerHTML = '';
  
  const searchVal = searchField ? searchField.value.toLowerCase().trim() : '';
  
  // Filter games by status and search query
  const filtered = state.localGames.filter(g => {
    const matchStatus = g.status === status;
    const matchSearch = g.name.toLowerCase().includes(searchVal);
    return matchStatus && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px;">
        ${searchVal ? 'Không tìm thấy game nào khớp với từ khóa tìm kiếm.' : 'Không có game nào trong mục này.'}
      </div>
    `;
    return;
  }

  filtered.forEach(game => {
    const card = document.createElement('div');
    card.className = `game-card glass-card ${game.status}`;
    card.addEventListener('click', () => window.openGameDetails(game.id));

    // Custom badges content
    let userInfoContent = '';
    if (status === 'playing') {
      userInfoContent = `
        <svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm3.3 14.3L11 12.8V7h1.5v4.9l3.7 2.2-.7 1.2z"/></svg>
        <span>${parseFloat(game.playingHours || 0).toFixed(1)}h chơi</span>
      `;
    } else if (status === 'backlog') {
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

    const firstGenre = game.genres && game.genres.length > 0 ? game.genres[0] : 'RAWG Game';
    
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
    grid.appendChild(card);
  });
}
