// Component: Discover tab rendering (trending, upcoming, genre browser, tag cloud)

import { state } from '../state.js';

// DOM Elements – Trending & Upcoming
const discoverTrendingGrid = document.getElementById('discover-trending-grid');
const discoverUpcomingGrid = document.getElementById('discover-upcoming-grid');
const discoverTrendingLoading = document.getElementById('discover-trending-loading');
const discoverUpcomingLoading = document.getElementById('discover-upcoming-loading');
const btnTrendingLoadMore = document.getElementById('btn-trending-load-more');
const btnUpcomingLoadMore = document.getElementById('btn-upcoming-load-more');
const trendingLoadMoreContainer = document.getElementById('trending-load-more-container');
const upcomingLoadMoreContainer = document.getElementById('upcoming-load-more-container');

// DOM Elements – Genre Browser
const genresLoading = document.getElementById('genres-loading');
const genresGrid = document.getElementById('genres-grid');

// DOM Elements – Developer Browser
const developersLoading = document.getElementById('developers-loading');
const developersGrid = document.getElementById('developers-grid');

// DOM Elements – Creators Cloud
const creatorsLoading = document.getElementById('creators-loading');
const creatorsCloud = document.getElementById('creators-cloud');

// DOM Elements – Tags Cloud
const tagsLoading = document.getElementById('tags-loading');
const tagsCloud = document.getElementById('tags-cloud');

// DOM Elements – Browse Results
const browseResultsSection = document.getElementById('browse-results-section');
const browseResultsTitle = document.getElementById('browse-results-title');
const browseResultsDesc = document.getElementById('browse-results-desc');
const browseResultsLoading = document.getElementById('browse-results-loading');
const browseResultsGrid = document.getElementById('browse-results-grid');
const browseLoadMoreContainer = document.getElementById('browse-load-more-container');
const btnBrowseLoadMore = document.getElementById('btn-browse-load-more');
const btnBrowseBack = document.getElementById('btn-browse-back');

// ─── Render Discover Tab ─────────────────────────────────────────────────────
export async function renderDiscoverTab() {
  if (discoverTrendingGrid) discoverTrendingGrid.innerHTML = '';
  if (discoverUpcomingGrid) discoverUpcomingGrid.innerHTML = '';
  if (trendingLoadMoreContainer) trendingLoadMoreContainer.classList.add('hidden');
  if (upcomingLoadMoreContainer) upcomingLoadMoreContainer.classList.add('hidden');

  // Reset browse state whenever tab is switched
  if (browseResultsSection) browseResultsSection.style.display = 'none';
  if (browseResultsGrid) browseResultsGrid.innerHTML = '';
  state.browseMode = null;
  state.browseGenreId = null;
  state.browseTagId = null;
  state.browseDeveloperId = null;
  state.browseCreatorId = null;
  state.browseGamesCached = null;
  state.browsePage = 1;

  if (!state.appConfig.apiKey) {
    const errorHtml = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-size:14px;">
        Vui lòng cấu hình RAWG API Key ở Tab Cài đặt để khám phá game.
      </div>
    `;
    if (discoverTrendingGrid) discoverTrendingGrid.innerHTML = errorHtml;
    if (discoverUpcomingGrid) discoverUpcomingGrid.innerHTML = errorHtml;
    if (genresGrid) genresGrid.innerHTML = errorHtml;
    if (developersGrid) developersGrid.innerHTML = errorHtml;
    if (creatorsCloud) creatorsCloud.innerHTML = errorHtml;
    return;
  }

  // Load all sections in parallel
  renderGenres();
  renderDevelopers();
  renderCreators();
  renderTagsCloud();
  renderTrending();
  renderUpcoming();
}

// ─── Genre Browser ───────────────────────────────────────────────────────────
async function renderGenres() {
  if (!genresGrid || !genresLoading) return;

  if (state.genresCached) {
    renderGenreCards(state.genresCached);
    return;
  }

  genresLoading.style.display = 'flex';
  genresGrid.style.display = 'none';

  try {
    const data = await window.api.getGenres();
    state.genresCached = data.results || [];
    renderGenreCards(state.genresCached);
  } catch (err) {
    console.error('Lỗi tải genres:', err);
    genresLoading.style.display = 'none';
    genresGrid.style.display = 'grid';
    genresGrid.innerHTML = `<div style="color: var(--text-muted); font-size:13px;">Không thể tải thể loại game.</div>`;
  }
}

function renderGenreCards(genres) {
  if (!genresGrid || !genresLoading) return;
  genresLoading.style.display = 'none';
  genresGrid.style.display = 'grid';
  genresGrid.innerHTML = '';

  genres.forEach(genre => {
    const card = document.createElement('div');
    card.className = 'genre-card';
    card.title = genre.name;

    card.innerHTML = `
      <img class="genre-card-bg" src="${genre.image_background || 'src/css/placeholder.svg'}" alt="${genre.name}" loading="lazy">
      <div class="genre-card-overlay">
        <div class="genre-card-name">${genre.name}</div>
        <div class="genre-card-count">${genre.games_count ? genre.games_count.toLocaleString() + ' games' : ''}</div>
      </div>
    `;

    card.addEventListener('click', () => browseByGenre(genre));
    genresGrid.appendChild(card);
  });
}

// ─── Developer Browser ──────────────────────────────────────────────────────
async function renderDevelopers() {
  if (!developersGrid || !developersLoading) return;

  if (state.developersCached) {
    renderDeveloperCards(state.developersCached);
    return;
  }

  developersLoading.style.display = 'flex';
  developersGrid.style.display = 'none';

  try {
    const data = await window.api.getDevelopers(1, 12);
    state.developersCached = data.results || [];
    renderDeveloperCards(state.developersCached);
  } catch (err) {
    console.error('Lỗi tải developers:', err);
    developersLoading.style.display = 'none';
    developersGrid.style.display = 'grid';
    developersGrid.innerHTML = `<div style="color: var(--text-muted); font-size:13px;">Không thể tải nhà phát triển.</div>`;
  }
}

function renderDeveloperCards(developers) {
  if (!developersGrid || !developersLoading) return;
  developersLoading.style.display = 'none';
  developersGrid.style.display = 'grid';
  developersGrid.innerHTML = '';

  developers.forEach(dev => {
    const card = document.createElement('div');
    card.className = 'genre-card';
    card.title = dev.name;

    card.innerHTML = `
      <img class="genre-card-bg" src="${dev.image_background || 'src/css/placeholder.svg'}" alt="${dev.name}" loading="lazy">
      <div class="genre-card-overlay">
        <div class="genre-card-name">${dev.name}</div>
        <div class="genre-card-count">${dev.games_count ? dev.games_count.toLocaleString() + ' games' : ''}</div>
      </div>
    `;

    card.addEventListener('click', () => browseByDeveloper(dev));
    developersGrid.appendChild(card);
  });
}

// ─── Creators Cloud ─────────────────────────────────────────────────────────
async function renderCreators() {
  if (!creatorsCloud || !creatorsLoading) return;

  if (state.creatorsCached) {
    renderCreatorPills(state.creatorsCached);
    return;
  }

  creatorsLoading.style.display = 'flex';
  creatorsCloud.style.display = 'none';

  try {
    const data = await window.api.getCreators(1, 30);
    state.creatorsCached = data.results || [];
    renderCreatorPills(state.creatorsCached);
  } catch (err) {
    console.error('Lỗi tải creators:', err);
    creatorsLoading.style.display = 'none';
    creatorsCloud.style.display = 'flex';
    creatorsCloud.innerHTML = `<span style="color: var(--text-muted); font-size:13px;">Không thể tải người sáng tạo.</span>`;
  }
}

function renderCreatorPills(creators) {
  if (!creatorsCloud || !creatorsLoading) return;
  creatorsLoading.style.display = 'none';
  creatorsCloud.style.display = 'flex';
  creatorsCloud.innerHTML = '';

  creators.forEach(creator => {
    const pill = document.createElement('button');
    pill.className = 'creator-pill';
    pill.dataset.creatorId = creator.id;

    const avatarImg = creator.image || 'src/css/placeholder.svg';
    pill.innerHTML = `
      <img class="creator-avatar" src="${avatarImg}" alt="${creator.name}" loading="lazy">
      ${creator.name}
      ${creator.games_count ? `<span class="creator-pill-count">${creator.games_count.toLocaleString()}</span>` : ''}
    `;

    pill.addEventListener('click', () => browseByCreator(creator, pill));
    creatorsCloud.appendChild(pill);
  });
}

// ─── Tags Cloud ──────────────────────────────────────────────────────────────
async function renderTagsCloud() {
  if (!tagsCloud || !tagsLoading) return;

  if (state.tagsCached) {
    renderTagPills(state.tagsCached);
    return;
  }

  tagsLoading.style.display = 'flex';
  tagsCloud.style.display = 'none';

  try {
    const data = await window.api.getTags(1, 30);
    state.tagsCached = data.results || [];
    renderTagPills(state.tagsCached);
  } catch (err) {
    console.error('Lỗi tải tags:', err);
    tagsLoading.style.display = 'none';
    tagsCloud.style.display = 'flex';
    tagsCloud.innerHTML = `<span style="color: var(--text-muted); font-size:13px;">Không thể tải tags.</span>`;
  }
}

function renderTagPills(tags) {
  if (!tagsCloud || !tagsLoading) return;
  tagsLoading.style.display = 'none';
  tagsCloud.style.display = 'flex';
  tagsCloud.innerHTML = '';

  tags.forEach(tag => {
    const pill = document.createElement('button');
    pill.className = 'tag-pill';
    pill.dataset.tagId = tag.id;
    pill.innerHTML = `
      ${tag.name}
      ${tag.games_count ? `<span class="tag-pill-count">${tag.games_count.toLocaleString()}</span>` : ''}
    `;
    pill.addEventListener('click', () => browseByTag(tag, pill));
    tagsCloud.appendChild(pill);
  });
}

// ─── Browse by Genre ─────────────────────────────────────────────────────────
export async function browseByGenre(genre) {
  state.browseMode = 'genre';
  state.browseGenreId = genre.id;
  state.browseTagId = null;
  state.browseDeveloperId = null;
  state.browseCreatorId = null;
  state.browsePage = 1;
  state.browseGamesCached = null;

  // Deactivate highlights
  document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.creator-pill').forEach(p => p.classList.remove('active'));

  if (browseResultsTitle) browseResultsTitle.textContent = `🎮 Genre: ${genre.name} — ${genre.games_count ? genre.games_count.toLocaleString() + ' games' : ''}`;
  await showBrowseResults(true);
}

// ─── Browse by Tag ───────────────────────────────────────────────────────────
export async function browseByTag(tag, pillEl = null) {
  state.browseMode = 'tag';
  state.browseTagId = tag.id;
  state.browseGenreId = null;
  state.browseDeveloperId = null;
  state.browseCreatorId = null;
  state.browsePage = 1;
  state.browseGamesCached = null;

  // Highlight active tag pill
  document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.creator-pill').forEach(p => p.classList.remove('active'));
  if (pillEl) {
    pillEl.classList.add('active');
  } else {
    const activePill = document.querySelector(`.tag-pill[data-tag-id="${tag.id}"]`);
    if (activePill) activePill.classList.add('active');
  }

  if (browseResultsTitle) browseResultsTitle.textContent = `🏷️ Tag: ${tag.name} — ${tag.games_count ? tag.games_count.toLocaleString() + ' games' : ''}`;
  await showBrowseResults(true);
}

// ─── Browse by Developer ─────────────────────────────────────────────────────
export async function browseByDeveloper(developer) {
  state.browseMode = 'developer';
  state.browseDeveloperId = developer.id;
  state.browseGenreId = null;
  state.browseTagId = null;
  state.browseCreatorId = null;
  state.browsePage = 1;
  state.browseGamesCached = null;

  // Deactivate highlights
  document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.creator-pill').forEach(p => p.classList.remove('active'));

  if (browseResultsTitle) browseResultsTitle.textContent = `🏢 Dev: ${developer.name} — ${developer.games_count ? developer.games_count.toLocaleString() + ' games' : ''}`;
  await showBrowseResults(true);
}

// ─── Browse by Creator ───────────────────────────────────────────────────────
export async function browseByCreator(creator, pillEl = null) {
  state.browseMode = 'creator';
  state.browseCreatorId = creator.id;
  state.browseGenreId = null;
  state.browseTagId = null;
  state.browseDeveloperId = null;
  state.browsePage = 1;
  state.browseGamesCached = null;

  // Highlight active creator pill
  document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.creator-pill').forEach(p => p.classList.remove('active'));
  if (pillEl) {
    pillEl.classList.add('active');
  } else {
    const activePill = document.querySelector(`.creator-pill[data-creator-id="${creator.id}"]`);
    if (activePill) activePill.classList.add('active');
  }

  if (browseResultsTitle) browseResultsTitle.textContent = `👤 Creator: ${creator.name} — ${creator.games_count ? creator.games_count.toLocaleString() + ' games' : ''}`;
  await showBrowseResults(true);
}

async function loadBrowseDetails() {
  if (!browseResultsDesc) return;
  try {
    let details = null;
    if (state.browseMode === 'genre' && state.browseGenreId) {
      details = await window.api.getGenreDetails(state.browseGenreId);
    } else if (state.browseMode === 'tag' && state.browseTagId) {
      details = await window.api.getTagDetails(state.browseTagId);
    } else if (state.browseMode === 'developer' && state.browseDeveloperId) {
      details = await window.api.getDeveloperDetails(state.browseDeveloperId);
    } else if (state.browseMode === 'creator' && state.browseCreatorId) {
      details = await window.api.getCreatorDetails(state.browseCreatorId);
    }

    if (details && details.description) {
      browseResultsDesc.innerHTML = details.description;
      browseResultsDesc.style.display = 'block';
    } else {
      browseResultsDesc.style.display = 'none';
    }
  } catch (err) {
    console.error('Lỗi tải chi tiết danh mục duyệt:', err);
    browseResultsDesc.style.display = 'none';
  }
}

async function showBrowseResults(reset = false) {
  if (!browseResultsSection || !browseResultsGrid) return;

  browseResultsSection.style.display = 'block';
  browseResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (reset) {
    browseResultsGrid.innerHTML = '';
    if (browseLoadMoreContainer) browseLoadMoreContainer.style.display = 'none';
    if (browseResultsDesc) {
      browseResultsDesc.style.display = 'none';
      browseResultsDesc.innerHTML = '';
    }
  }

  if (browseResultsLoading) browseResultsLoading.style.display = 'flex';

  if (reset) {
    loadBrowseDetails();
  }

  try {
    let data;
    if (state.browseMode === 'genre' && state.browseGenreId) {
      data = await window.api.getGamesByGenre(state.browseGenreId, state.browsePage);
    } else if (state.browseMode === 'tag' && state.browseTagId) {
      data = await window.api.getGamesByTag(state.browseTagId, state.browsePage);
    } else if (state.browseMode === 'developer' && state.browseDeveloperId) {
      data = await window.api.getGamesByDeveloper(state.browseDeveloperId, state.browsePage);
    } else if (state.browseMode === 'creator' && state.browseCreatorId) {
      data = await window.api.getGamesByCreator(state.browseCreatorId, state.browsePage);
    }

    if (browseResultsLoading) browseResultsLoading.style.display = 'none';

    if (data && data.results) {
      state.browseGamesCached = data;
      const rendered = renderDiscoverResults(data.results, browseResultsGrid, !reset);
      if (data.next && rendered > 0) {
        if (browseLoadMoreContainer) browseLoadMoreContainer.style.display = 'block';
      } else {
        if (browseLoadMoreContainer) browseLoadMoreContainer.style.display = 'none';
      }
      if (rendered === 0 && reset) {
        browseResultsGrid.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted); font-size:13px; padding: 20px 0;">Không có game nào phù hợp.</div>`;
      }
    }
  } catch (err) {
    console.error('Lỗi tải kết quả duyệt:', err);
    if (browseResultsLoading) browseResultsLoading.style.display = 'none';
    if (browseResultsGrid) browseResultsGrid.innerHTML = `<div style="grid-column: 1/-1; color: var(--accent-danger); font-size:13px;">⚠️ Lỗi tải dữ liệu: ${err.message}</div>`;
  }
}

export async function loadMoreBrowse() {
  state.browsePage++;
  if (btnBrowseLoadMore) {
    btnBrowseLoadMore.disabled = true;
    btnBrowseLoadMore.textContent = 'Đang tải...';
  }
  try {
    await showBrowseResults(false);
  } finally {
    if (btnBrowseLoadMore) {
      btnBrowseLoadMore.disabled = false;
      btnBrowseLoadMore.textContent = 'Xem thêm';
    }
  }
}

// ─── Trending ────────────────────────────────────────────────────────────────
async function renderTrending() {
  if (state.trendingGamesCached) {
    if (discoverTrendingLoading) discoverTrendingLoading.classList.add('hidden');
    if (discoverTrendingGrid) discoverTrendingGrid.classList.remove('hidden');
    const rendered = renderDiscoverResults(state.trendingGamesCached.results, discoverTrendingGrid);
    if (state.trendingGamesCached.next && rendered > 0) {
      if (trendingLoadMoreContainer) trendingLoadMoreContainer.classList.remove('hidden');
    }
  } else {
    if (discoverTrendingLoading) discoverTrendingLoading.classList.remove('hidden');
    if (discoverTrendingGrid) discoverTrendingGrid.classList.add('hidden');
    try {
      const data = await window.api.getTrendingGames(1);
      state.trendingGamesCached = data;
      if (discoverTrendingLoading) discoverTrendingLoading.classList.add('hidden');
      if (discoverTrendingGrid) {
        discoverTrendingGrid.classList.remove('hidden');
        const rendered = renderDiscoverResults(data.results, discoverTrendingGrid);
        if (data.next && rendered > 0) {
          if (trendingLoadMoreContainer) trendingLoadMoreContainer.classList.remove('hidden');
        }
      }
    } catch (err) {
      console.error('Lỗi tải game hot:', err);
      if (discoverTrendingGrid) {
        discoverTrendingGrid.innerHTML = `<div style="grid-column: 1/-1; color: var(--accent-danger); font-size: 13px;">⚠️ Lỗi tải dữ liệu: ${err.message}</div>`;
      }
    }
  }
}

// ─── Upcoming ─────────────────────────────────────────────────────────────────
async function renderUpcoming() {
  if (state.upcomingGamesCached) {
    if (discoverUpcomingLoading) discoverUpcomingLoading.classList.add('hidden');
    if (discoverUpcomingGrid) discoverUpcomingGrid.classList.remove('hidden');
    const rendered = renderDiscoverResults(state.upcomingGamesCached.results, discoverUpcomingGrid);
    if (state.upcomingGamesCached.next && rendered > 0) {
      if (upcomingLoadMoreContainer) upcomingLoadMoreContainer.classList.remove('hidden');
    }
  } else {
    if (discoverUpcomingLoading) discoverUpcomingLoading.classList.remove('hidden');
    if (discoverUpcomingGrid) discoverUpcomingGrid.classList.add('hidden');
    try {
      const data = await window.api.getUpcomingGames(1);
      state.upcomingGamesCached = data;
      if (discoverUpcomingLoading) discoverUpcomingLoading.classList.add('hidden');
      if (discoverUpcomingGrid) {
        discoverUpcomingGrid.classList.remove('hidden');
        const rendered = renderDiscoverResults(data.results, discoverUpcomingGrid);
        if (data.next && rendered > 0) {
          if (upcomingLoadMoreContainer) upcomingLoadMoreContainer.classList.remove('hidden');
        }
      }
    } catch (err) {
      console.error('Lỗi tải game sắp ra mắt:', err);
      if (discoverUpcomingGrid) {
        discoverUpcomingGrid.innerHTML = `<div style="grid-column: 1/-1; color: var(--accent-danger); font-size: 13px;">⚠️ Lỗi tải dữ liệu: ${err.message}</div>`;
      }
    }
  }
}

// ─── Shared: Render game cards into a grid ────────────────────────────────────
export function renderDiscoverResults(results, targetGrid, append = false) {
  if (!append) {
    targetGrid.innerHTML = '';
  }
  
  const filteredResults = (results || []).filter(game => !state.localGames.some(g => String(g.id) === String(game.id)));

  if (!append && filteredResults.length === 0) {
    targetGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">Không còn game mới hoặc đã lưu tất cả vào thư viện.</div>`;
    return 0;
  }

  filteredResults.forEach(game => {
    const card = document.createElement('div');
    card.className = `game-card glass-card`;
    card.setAttribute('data-game-id', game.id);

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
    targetGrid.appendChild(card);
  });
  
  return filteredResults.length;
}

// ─── Load More handlers ───────────────────────────────────────────────────────
export async function loadMoreTrending() {
  state.trendingPage++;
  if (btnTrendingLoadMore) {
    btnTrendingLoadMore.disabled = true;
    btnTrendingLoadMore.textContent = 'Đang tải...';
  }
  try {
    const data = await window.api.getTrendingGames(state.trendingPage);
    if (data && data.results && data.results.length > 0) {
      if (state.trendingGamesCached) {
        state.trendingGamesCached.results.push(...data.results);
        state.trendingGamesCached.next = data.next;
      }
      const rendered = renderDiscoverResults(data.results, discoverTrendingGrid, true);
      if (rendered === 0 && data.next) {
        await loadMoreTrending();
        return;
      }
      if (!data.next) {
        if (trendingLoadMoreContainer) trendingLoadMoreContainer.classList.add('hidden');
      }
    } else {
      if (trendingLoadMoreContainer) trendingLoadMoreContainer.classList.add('hidden');
    }
  } catch (err) {
    console.error('Lỗi tải thêm game hot:', err);
  } finally {
    if (btnTrendingLoadMore) {
      btnTrendingLoadMore.disabled = false;
      btnTrendingLoadMore.textContent = 'Xem thêm';
    }
  }
}

export async function loadMoreUpcoming() {
  state.upcomingPage++;
  if (btnUpcomingLoadMore) {
    btnUpcomingLoadMore.disabled = true;
    btnUpcomingLoadMore.textContent = 'Đang tải...';
  }
  try {
    const data = await window.api.getUpcomingGames(state.upcomingPage);
    if (data && data.results && data.results.length > 0) {
      if (state.upcomingGamesCached) {
        state.upcomingGamesCached.results.push(...data.results);
        state.upcomingGamesCached.next = data.next;
      }
      const rendered = renderDiscoverResults(data.results, discoverUpcomingGrid, true);
      if (rendered === 0 && data.next) {
        await loadMoreUpcoming();
        return;
      }
      if (!data.next) {
        if (upcomingLoadMoreContainer) upcomingLoadMoreContainer.classList.add('hidden');
      }
    } else {
      if (upcomingLoadMoreContainer) upcomingLoadMoreContainer.classList.add('hidden');
    }
  } catch (err) {
    console.error('Lỗi tải thêm game sắp ra mắt:', err);
  } finally {
    if (btnUpcomingLoadMore) {
      btnUpcomingLoadMore.disabled = false;
      btnUpcomingLoadMore.textContent = 'Xem thêm';
    }
  }
}
