// Component: Search tab logic (calling RAWG global search)

import { state } from '../state.js';

// DOM elements
const rawgSearchInput = document.getElementById('rawg-search-input');
const searchLoading = document.getElementById('search-loading');
const searchGameGrid = document.getElementById('search-game-grid');
const searchResultsTitle = document.getElementById('search-results-title');
const searchLoadMoreContainer = document.getElementById('search-load-more-container');
const btnSearchLoadMore = document.getElementById('btn-search-load-more');

// Render RAWG search tab. Load trending if empty search
export async function renderSearchTab() {
  if (!rawgSearchInput || !searchGameGrid) return;
  
  const query = rawgSearchInput.value.trim();
  searchGameGrid.innerHTML = '';
  if (searchLoadMoreContainer) searchLoadMoreContainer.classList.add('hidden');
  
  if (!state.appConfig.apiKey) {
    searchGameGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-size:14px;">
        Vui lòng cấu hình RAWG API Key ở Tab Cài đặt để có thể tìm kiếm dữ liệu.
      </div>
    `;
    return;
  }

  // Load Popular trending games as initial fallback
  if (!query) {
    if (searchResultsTitle) searchResultsTitle.textContent = 'Những game nổi bật (RAWG)';
    if (state.popularGamesCached) {
      const rendered = renderRawgSearchResults(state.popularGamesCached.results);
      if (state.popularGamesCached.next && rendered > 0) {
        if (searchLoadMoreContainer) searchLoadMoreContainer.classList.remove('hidden');
      }
      return;
    }
    
    showSearchLoading(true);
    try {
      const data = await window.api.getPopularGames(1);
      state.popularGamesCached = data;
      const rendered = renderRawgSearchResults(data.results);
      if (data.next && rendered > 0) {
        if (searchLoadMoreContainer) searchLoadMoreContainer.classList.remove('hidden');
      }
    } catch (err) {
      handleRawgFetchError(err);
    } finally {
      showSearchLoading(false);
    }
    return;
  }

  // Perform search
  if (searchResultsTitle) searchResultsTitle.textContent = `Kết quả tìm kiếm cho: "${query}"`;
  
  // Use cache if query matches and cache exists
  if (query === state.searchQueryCached && state.searchGamesCached) {
    const rendered = renderRawgSearchResults(state.searchGamesCached.results);
    if (state.searchGamesCached.next && rendered > 0) {
      if (searchLoadMoreContainer) searchLoadMoreContainer.classList.remove('hidden');
    }
    return;
  }

  showSearchLoading(true);
  try {
    const data = await window.api.searchGames(query, 1);
    state.searchQueryCached = query;
    state.searchGamesCached = data;
    const rendered = renderRawgSearchResults(data.results);
    if (data.next && rendered > 0) {
      if (searchLoadMoreContainer) searchLoadMoreContainer.classList.remove('hidden');
    }
  } catch (err) {
    handleRawgFetchError(err);
  } finally {
    showSearchLoading(false);
  }
}

export function showSearchLoading(show) {
  if (!searchLoading || !searchGameGrid) return;
  if (show) {
    searchLoading.classList.remove('hidden');
    searchGameGrid.classList.add('hidden');
  } else {
    searchLoading.classList.add('hidden');
    searchGameGrid.classList.remove('hidden');
  }
}

export function handleRawgFetchError(err) {
  if (!searchGameGrid) return;
  searchGameGrid.innerHTML = '';
  let errMsg = 'Có lỗi xảy ra khi truy vấn dữ liệu từ RAWG.';
  
  if (err.message === 'API_KEY_MISSING') {
    errMsg = 'Thiếu API Key. Hãy nhập API Key trong tab Cài đặt.';
  } else if (err.message === 'API_KEY_INVALID') {
    errMsg = 'API Key RAWG của bạn không hợp lệ. Hãy kiểm tra lại tab Cài đặt.';
  }

  searchGameGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--accent-danger); font-size:14px;">
      ⚠️ ${errMsg}
    </div>
  `;
}

// Render grid with RAWG API query results
export function renderRawgSearchResults(results, append = false) {
  if (!searchGameGrid) return 0;
  if (!append) {
    searchGameGrid.innerHTML = '';
  }
  
  // Filter out games that are already in the 3 lists (playing, backlog, completed)
  const filteredResults = (results || []).filter(game => !state.localGames.some(g => String(g.id) === String(game.id)));

  if (!append && filteredResults.length === 0) {
    searchGameGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-size:14px;">
        Không tìm thấy game nào phù hợp (hoặc tất cả đã có trong thư viện).
      </div>
    `;
    return 0;
  }

  filteredResults.forEach(game => {
    const card = document.createElement('div');
    card.className = `game-card glass-card`;
    card.addEventListener('click', () => window.openGameDetails(game.id));

    // Metacritic
    const mcScore = game.metacritic;
    let mcClass = '';
    if (mcScore) {
      if (mcScore < 50) mcClass = 'score-low';
      else if (mcScore < 75) mcClass = 'score-medium';
    }
    const mcBadge = mcScore ? `<div class="metacritic-badge ${mcClass}">${mcScore}</div>` : '';
    const firstGenre = game.genres && game.genres.length > 0 ? game.genres[0].name : 'RAWG Game';

    card.innerHTML = `
      <div class="game-card-img-container">
        <img class="game-card-img" src="${game.background_image || 'src/css/placeholder.svg'}" alt="${game.name}">
        ${mcBadge}
      </div>
      <div class="game-card-info">
        <div>
          <h4 class="game-card-title">${game.name}</h4>
          <div class="game-card-subtitle">
            <span>${firstGenre}</span>
            <span>${game.released ? game.released.substring(0, 4) : '--'}</span>
          </div>
        </div>
      </div>
    `;
    searchGameGrid.appendChild(card);
  });
  
  return filteredResults.length;
}

// Load more search results
export async function loadMoreSearch() {
  state.searchPage++;
  if (btnSearchLoadMore) {
    btnSearchLoadMore.disabled = true;
    btnSearchLoadMore.textContent = 'Đang tải...';
  }
  const query = rawgSearchInput.value.trim();
  try {
    let data;
    if (!query) {
      data = await window.api.getPopularGames(state.searchPage);
      if (data && data.results && data.results.length > 0) {
        if (state.popularGamesCached) {
          state.popularGamesCached.results.push(...data.results);
          state.popularGamesCached.next = data.next;
        }
      }
    } else {
      data = await window.api.searchGames(query, state.searchPage);
      if (data && data.results && data.results.length > 0) {
        if (state.searchGamesCached) {
          state.searchGamesCached.results.push(...data.results);
          state.searchGamesCached.next = data.next;
        }
      }
    }
    
    if (data && data.results && data.results.length > 0) {
      const rendered = renderRawgSearchResults(data.results, true);
      if (rendered === 0 && data.next) {
        await loadMoreSearch();
        return;
      }
      if (!data.next) {
        if (searchLoadMoreContainer) searchLoadMoreContainer.classList.add('hidden');
      }
    } else {
      if (searchLoadMoreContainer) searchLoadMoreContainer.classList.add('hidden');
    }
  } catch (err) {
    console.error('Lỗi tải thêm kết quả tìm kiếm:', err);
  } finally {
    if (btnSearchLoadMore) {
      btnSearchLoadMore.disabled = false;
      btnSearchLoadMore.textContent = 'Xem thêm';
    }
  }
}
