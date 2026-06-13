// Component: Game Details Modal Manager (fetching, displaying expanded info, ratings chart, similar games, and status editing)

import { state, SUB_STATUS_OPTIONS, saveGames } from '../state.js';
import { updateLibraryStats, renderDashboard } from './dashboard.js';
import { renderListTab } from './library.js';
import { renderSpecsComparison } from './dxdiag.js';
import { switchTab } from '../app.js';
import { browseByTag, browseByGenre } from './discover.js';

// DOM elements for modal
const gameDetailModal = document.getElementById('game-detail-modal');
const modalContainer = document.querySelector('.modal-container');
const btnCloseModal = document.getElementById('btn-close-modal');
const modalCoverImg = document.getElementById('modal-cover-img');
const modalMetaScore = document.getElementById('modal-meta-score');
const modalScreenshotsContainer = document.getElementById('modal-screenshots-container');
const modalTitle = document.getElementById('modal-title');
const modalReleaseDev = document.getElementById('modal-release-dev');
const modalDescription = document.getElementById('modal-description');
const selectGameStatus = document.getElementById('select-game-status');
const btnSaveModal = document.getElementById('btn-save-modal');
const btnDeleteModal = document.getElementById('btn-delete-modal');
const rowSubstatusPlatform = document.getElementById('row-substatus-platform');
const selectGameSubstatus = document.getElementById('select-game-substatus');
const selectGamePlatform = document.getElementById('select-game-platform');

const modalGenres = document.getElementById('modal-genres');
const modalPlatforms = document.getElementById('modal-platforms');
const modalPublishers = document.getElementById('modal-publishers');
const modalEsrb = document.getElementById('modal-esrb');
const modalPlaytime = document.getElementById('modal-playtime');
const modalWebsite = document.getElementById('modal-website');
const modalTagsContainer = document.getElementById('modal-tags-container');
const modalSimilarContainer = document.getElementById('modal-similar-container');
const modalAdditionsSection = document.getElementById('modal-additions-section');
const modalAdditionsContainer = document.getElementById('modal-additions-container');
const modalTeamSection = document.getElementById('modal-team-section');
const modalTeamContainer = document.getElementById('modal-team-container');
const modalSeriesSection = document.getElementById('modal-series-section');
const modalSeriesContainer = document.getElementById('modal-series-container');
const modalParentsSection = document.getElementById('modal-parents-section');
const modalParentsContainer = document.getElementById('modal-parents-container');

// New media and achievements DOM references
const modalTrailersSection = document.getElementById('modal-trailers-section');
const modalTrailerVideo = document.getElementById('modal-trailer-video');
const modalAchievementsListSection = document.getElementById('modal-achievements-list-section');
const modalAchievementsContainer = document.getElementById('modal-achievements-container');
const modalRedditPostsSection = document.getElementById('modal-reddit-posts-section');
const modalRedditPostsContainer = document.getElementById('modal-reddit-posts-container');
const modalTwitchSection = document.getElementById('modal-twitch-section');
const modalTwitchContainer = document.getElementById('modal-twitch-container');
const modalYoutubeSection = document.getElementById('modal-youtube-section');
const modalYoutubeContainer = document.getElementById('modal-youtube-container');

// Extended metadata DOM references
const modalMetacriticDetail = document.getElementById('modal-metacritic-detail');
const modalAltNames = document.getElementById('modal-alt-names');
const modalAchievements = document.getElementById('modal-achievements');
const modalAddedCount = document.getElementById('modal-added-count');
const modalReddit = document.getElementById('modal-reddit');
const modalRatingsChartSection = document.getElementById('modal-ratings-chart-section');
const modalRatingsChart = document.getElementById('modal-ratings-chart');
const modalRatingsLegend = document.getElementById('modal-ratings-legend');

// Status specific divs & fields
const fieldsPlaying = document.getElementById('fields-playing');
const fieldsBacklog = document.getElementById('fields-backlog');
const fieldsCompleted = document.getElementById('fields-completed');

const inputPlayingHours = document.getElementById('input-playing-hours');
const inputPlayingStart = document.getElementById('input-playing-start');
const inputPlayingNotes = document.getElementById('input-playing-notes');
const selectBacklogPriority = document.getElementById('select-backlog-priority');
const inputCompletedDate = document.getElementById('input-completed-date');
const inputCompletedReview = document.getElementById('input-completed-review');
const starBtns = document.querySelectorAll('#completed-rating-stars .star-btn');

// Open Details modal and fetch raw details
export async function openGameDetails(gameId) {
  if (!gameDetailModal) return;

  // Set modal view in loading state
  gameDetailModal.classList.add('active');
  if (modalTitle) modalTitle.textContent = 'Đang tải thông tin...';
  if (modalReleaseDev) modalReleaseDev.textContent = '';
  if (modalDescription) modalDescription.innerHTML = '<div class="spinner" style="margin: 30px auto;"></div>';
  if (modalCoverImg) modalCoverImg.src = '';
  if (modalScreenshotsContainer) modalScreenshotsContainer.innerHTML = '';
  if (modalMetaScore) {
    modalMetaScore.textContent = '--';
    modalMetaScore.style.borderColor = 'var(--border-glass)';
  }
  if (selectGameStatus) selectGameStatus.value = 'none';
  if (btnDeleteModal) btnDeleteModal.classList.add('hidden');
  updateModalFieldsVisibility('none');

  if (modalGenres) modalGenres.textContent = '--';
  if (modalPlatforms) {
    modalPlatforms.textContent = '--';
    modalPlatforms.title = '';
  }
  if (modalPublishers) modalPublishers.textContent = '--';
  if (modalEsrb) modalEsrb.textContent = '--';
  if (modalPlaytime) modalPlaytime.textContent = '--';
  if (modalWebsite) {
    modalWebsite.href = '#';
    modalWebsite.style.display = 'none';
  }
  if (modalTagsContainer) modalTagsContainer.innerHTML = '';
  if (modalSimilarContainer) modalSimilarContainer.innerHTML = '<div style="color: var(--text-muted); font-size:12px;">Đang tải gợi ý...</div>';

  // Reset extended metadata fields
  if (modalMetacriticDetail) { modalMetacriticDetail.textContent = '--'; modalMetacriticDetail.title = ''; }
  if (modalAltNames) { modalAltNames.textContent = '--'; modalAltNames.title = ''; }
  if (modalAchievements) modalAchievements.textContent = '--';
  if (modalAddedCount) modalAddedCount.textContent = '--';
  if (modalReddit) { modalReddit.href = '#'; modalReddit.style.display = 'none'; }
  if (modalRatingsChartSection) modalRatingsChartSection.style.display = 'none';
  if (modalAdditionsSection) modalAdditionsSection.style.display = 'none';
  if (modalAdditionsContainer) modalAdditionsContainer.innerHTML = '';
  if (modalTeamSection) modalTeamSection.style.display = 'none';
  if (modalTeamContainer) modalTeamContainer.innerHTML = '';
  if (modalSeriesSection) modalSeriesSection.style.display = 'none';
  if (modalSeriesContainer) modalSeriesContainer.innerHTML = '';
  if (modalParentsSection) modalParentsSection.style.display = 'none';
  if (modalParentsContainer) modalParentsContainer.innerHTML = '';

  // Reset trailers and achievements list
  if (modalTrailersSection) modalTrailersSection.style.display = 'none';
  if (modalTrailerVideo) {
    modalTrailerVideo.pause();
    modalTrailerVideo.src = '';
  }
  const existingSwitcher = document.getElementById('modal-trailers-switcher-container');
  if (existingSwitcher) existingSwitcher.remove();
  if (modalAchievementsListSection) modalAchievementsListSection.style.display = 'none';
  if (modalAchievementsContainer) modalAchievementsContainer.innerHTML = '';
  if (modalRedditPostsSection) modalRedditPostsSection.style.display = 'none';
  if (modalRedditPostsContainer) modalRedditPostsContainer.innerHTML = '';
  if (modalTwitchSection) modalTwitchSection.style.display = 'none';
  if (modalTwitchContainer) modalTwitchContainer.innerHTML = '';
  if (modalYoutubeSection) modalYoutubeSection.style.display = 'none';
  if (modalYoutubeContainer) modalYoutubeContainer.innerHTML = '';

  // Check if this game is in our library and needs RAWG ID resolution
  let savedGame = state.localGames.find(g => g.id === gameId);
  if (savedGame && savedGame.needsResolution) {
    try {
      const searchData = await window.api.searchGames(savedGame.name, 1);
      if (searchData && searchData.results && searchData.results.length > 0) {
        const bestMatch = searchData.results.find(r => r.name.toLowerCase() === savedGame.name.toLowerCase()) || searchData.results[0];
        
        const oldId = savedGame.id;
        savedGame.id = bestMatch.id;
        savedGame.background_image = bestMatch.background_image || '';
        savedGame.metacritic = bestMatch.metacritic || null;
        savedGame.rawgIdResolved = true;
        delete savedGame.needsResolution;

        const idx = state.localGames.findIndex(g => g.id === oldId);
        if (idx !== -1) {
          state.localGames[idx] = savedGame;
          await saveGames(state.localGames);
        }
        
        // Point gameId to the new correct RAWG ID
        gameId = bestMatch.id;
        
        // Refresh grids and dashboard so covers update instantly
        updateLibraryStats();
        renderDashboard();
        const activeTabPane = document.getElementById(`view-${state.activeTab}`);
        if (activeTabPane && state.activeTab !== 'discover' && state.activeTab !== 'search') {
          renderListTab(state.activeTab);
        }
      }
    } catch (err) {
      console.error('Error resolving game on demand:', err);
    }
  }

  try {
    // Parallel fetches for details and screenshots
    const [details, screenData] = await Promise.all([
      window.api.getGameDetails(gameId),
      window.api.getGameScreenshots(gameId).catch(() => ({ results: [] })) // catch if fails
    ]);

    state.selectedGame = details;

    // Render dynamic blurred theme backdrop on modalContainer
    if (modalContainer && details.background_image) {
      modalContainer.style.backgroundImage = `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.98)), url(${details.background_image})`;
      modalContainer.style.backgroundSize = 'cover';
      modalContainer.style.backgroundPosition = 'center';
    } else if (modalContainer) {
      modalContainer.style.backgroundImage = 'none';
    }

    // Render title & meta
    if (modalTitle) modalTitle.textContent = details.name;
    const devs = details.developers && details.developers.length > 0 ? details.developers[0].name : 'Không rõ';
    if (modalReleaseDev) modalReleaseDev.textContent = `Ngày phát hành: ${details.released || 'Chưa rõ'} | Phát triển: ${devs}`;
    if (modalDescription) modalDescription.innerHTML = details.description || 'Không có mô tả chi tiết cho game này.';
    if (modalCoverImg) modalCoverImg.src = details.background_image || 'src/css/placeholder.svg';

    // Render details fields
    if (modalGenres) {
      modalGenres.innerHTML = '';
      if (details.genres && details.genres.length > 0) {
        details.genres.forEach((genre, idx) => {
          const span = document.createElement('span');
          span.textContent = genre.name;
          
          span.addEventListener('click', () => {
            if (gameDetailModal) gameDetailModal.classList.remove('active');
            switchTab('discover');
            browseByGenre(genre);
          });
          
          modalGenres.appendChild(span);
          if (idx < details.genres.length - 1) {
            modalGenres.appendChild(document.createTextNode(', '));
          }
        });
      } else {
        modalGenres.textContent = 'Không rõ';
      }
    }
    
    const platsText = details.platforms && details.platforms.length > 0 ? details.platforms.map(p => p.platform.name).join(', ') : 'Không rõ';
    if (modalPlatforms) {
      modalPlatforms.textContent = platsText;
      modalPlatforms.title = platsText;
    }
    
    if (modalPublishers) modalPublishers.textContent = details.publishers && details.publishers.length > 0 ? details.publishers.map(p => p.name).join(', ') : 'Không rõ';
    if (modalEsrb) modalEsrb.textContent = details.esrb_rating ? details.esrb_rating.name : 'Không phân loại';
    if (modalPlaytime) modalPlaytime.textContent = details.playtime ? `${details.playtime} giờ` : 'Chưa rõ';
    
    if (modalWebsite) {
      if (details.website) {
        modalWebsite.href = details.website;
        modalWebsite.textContent = 'Truy cập';
        modalWebsite.style.display = 'inline-block';
      } else {
        modalWebsite.style.display = 'none';
      }
    }

    // Render Extended Metadata
    // 1. Metacritic detailed platforms
    if (modalMetacriticDetail) {
      const mcPlats = details.metacritic_platforms;
      if (mcPlats && mcPlats.length > 0) {
        const text = mcPlats.map(mp => `${mp.platform.name}: ${mp.metascore}`).join(' | ');
        modalMetacriticDetail.textContent = text;
        modalMetacriticDetail.title = text;
      } else {
        modalMetacriticDetail.textContent = details.metacritic ? `Chung: ${details.metacritic}` : 'Không rõ';
      }
    }

    // 2. Alternative Names
    if (modalAltNames) {
      const alts = details.alternative_names;
      if (alts && alts.length > 0) {
        const text = alts.join(', ');
        modalAltNames.textContent = text;
        modalAltNames.title = text;
      } else {
        modalAltNames.textContent = 'Không có';
      }
    }

    // 3. Achievements Count
    if (modalAchievements) {
      modalAchievements.textContent = details.achievements_count ? `${details.achievements_count} thành tựu` : 'Không có';
    }

    // 4. Added Count
    if (modalAddedCount) {
      modalAddedCount.textContent = details.added ? `${details.added.toLocaleString()} người chơi` : 'Chưa rõ';
    }

    // 5. Reddit URL
    if (modalReddit) {
      if (details.reddit_url) {
        modalReddit.href = details.reddit_url;
        modalReddit.textContent = 'Mở Reddit';
        modalReddit.style.display = 'inline-block';
      } else {
        modalReddit.style.display = 'none';
      }
    }

    // 6. Ratings Bar Chart
    renderRatingsChart(details.ratings);

    // Render tags
    if (modalTagsContainer) {
      modalTagsContainer.innerHTML = '';
      if (details.tags && details.tags.length > 0) {
        details.tags.slice(0, 12).forEach(tag => {
          const span = document.createElement('span');
          span.className = 'tag-badge';
          span.textContent = tag.name;
          
          span.addEventListener('click', () => {
            if (gameDetailModal) gameDetailModal.classList.remove('active');
            switchTab('discover');
            browseByTag(tag);
          });
          
          modalTagsContainer.appendChild(span);
        });
      } else {
        modalTagsContainer.innerHTML = '<span style="color: var(--text-muted); font-size:12px;">Không có nhãn</span>';
      }
    }

    // Fetch and render similar/suggested games, using suggested endpoint first with fallback to tags
    const renderSimilarGames = (gamesList) => {
      if (modalSimilarContainer) {
        modalSimilarContainer.innerHTML = '';
        const filteredSim = (gamesList || []).filter(g => String(g.id) !== String(details.id) && !state.localGames.some(lg => String(lg.id) === String(g.id)));
        if (filteredSim.length > 0) {
          filteredSim.slice(0, 8).forEach(sim => {
            const item = document.createElement('div');
            item.className = 'similar-game-card';
            item.style.cssText = 'width: 100px; flex-shrink: 0; cursor: pointer; position: relative;';
            item.setAttribute('data-game-id', sim.id);

            item.innerHTML = `
              <div style="position: relative; width: 100px; height: 130px; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 1px solid var(--border-glass);">
                <img src="${sim.background_image || 'src/css/placeholder.svg'}" style="width: 100%; height: 100%; object-fit: cover;" alt="${sim.name}">
              </div>
              <div style="font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px; color: var(--text-light); text-align: center;" title="${sim.name}">${sim.name}</div>
            `;
            modalSimilarContainer.appendChild(item);
          });
        } else {
          modalSimilarContainer.innerHTML = '<span style="color: var(--text-muted); font-size:12px;">Không có gợi ý game tương tự nào hợp lệ</span>';
        }
      }
    };

    if (modalSimilarContainer) {
      modalSimilarContainer.innerHTML = '<div style="color: var(--text-muted); font-size:12px;">Đang tải gợi ý...</div>';
    }

    window.api.getGameSuggested(gameId, 15)
      .then(sugData => {
        if (sugData && sugData.results && sugData.results.length > 0) {
          renderSimilarGames(sugData.results);
        } else {
          throw new Error('No suggested games returned');
        }
      })
      .catch(() => {
        // Fallback to tags-based similarity
        if (details.tags && details.tags.length > 0) {
          const tagIds = details.tags.slice(0, 3).map(t => t.id).join(',');
          window.api.getSimilarGames(tagIds, 15)
            .then(simData => {
              renderSimilarGames(simData.results || []);
            })
            .catch(err => {
              console.error('Lỗi khi tải game tương tự bằng tag:', err);
              if (modalSimilarContainer) {
                modalSimilarContainer.innerHTML = '<span style="color: var(--text-muted); font-size:12px;">Không thể tải game tương tự</span>';
              }
            });
        } else {
          if (modalSimilarContainer) {
            modalSimilarContainer.innerHTML = '<span style="color: var(--text-muted); font-size:12px;">Không có game tương tự</span>';
          }
        }
      });

    // Fetch and render additions (DLCs, editions)
    window.api.getGameAdditions(gameId, 12)
      .then(addData => {
        if (modalAdditionsSection && modalAdditionsContainer) {
          modalAdditionsContainer.innerHTML = '';
          if (addData && addData.results && addData.results.length > 0) {
            modalAdditionsSection.style.display = 'block';
            addData.results.forEach(add => {
              const item = document.createElement('div');
              item.className = 'similar-game-card'; // Reuse identical styling
              item.style.cssText = 'width: 100px; flex-shrink: 0; cursor: pointer; position: relative;';
              item.setAttribute('data-game-id', add.id);

              item.innerHTML = `
                <div style="position: relative; width: 100px; height: 130px; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 1px solid var(--border-glass);">
                  <img src="${add.background_image || 'src/css/placeholder.svg'}" style="width: 100%; height: 100%; object-fit: cover;" alt="${add.name}">
                </div>
                <div style="font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px; color: var(--text-light); text-align: center;" title="${add.name}">${add.name}</div>
              `;
              modalAdditionsContainer.appendChild(item);
            });
          } else {
            modalAdditionsSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải game additions:', err);
        if (modalAdditionsSection) modalAdditionsSection.style.display = 'none';
      });

    // Fetch and render development team
    window.api.getGameDevelopmentTeam(gameId, 12)
      .then(teamData => {
        if (modalTeamSection && modalTeamContainer) {
          modalTeamContainer.innerHTML = '';
          if (teamData && teamData.results && teamData.results.length > 0) {
            modalTeamSection.style.display = 'block';
            teamData.results.forEach(member => {
              const item = document.createElement('div');
              item.className = 'team-member-card';
              item.style.cssText = 'width: 100px; flex-shrink: 0; text-align: center; position: relative; cursor: pointer;';
              
              item.addEventListener('click', () => {
                if (gameDetailModal) gameDetailModal.classList.remove('active');
                switchTab('discover');
                browseByCreator(member);
              });

              const roleText = member.positions && member.positions.length > 0 ? member.positions[0].name : 'Developer';

              item.innerHTML = `
                <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; margin: 0 auto 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid var(--border-glass); background-color: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center;">
                  ${member.image ? `<img src="${member.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${member.name}">` : `<svg viewBox="0 0 24 24" width="36" height="36" style="color: var(--text-muted);"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`}
                </div>
                <div style="font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-white);" title="${member.name}">${member.name}</div>
                <div style="font-size: 9px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${roleText}">${roleText}</div>
              `;
              modalTeamContainer.appendChild(item);
            });
          } else {
            modalTeamSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải game development-team:', err);
        if (modalTeamSection) modalTeamSection.style.display = 'none';
      });

    // Fetch and render game series
    window.api.getGameSeries(gameId, 12)
      .then(seriesData => {
        if (modalSeriesSection && modalSeriesContainer) {
          modalSeriesContainer.innerHTML = '';
          if (seriesData && seriesData.results && seriesData.results.length > 0) {
            modalSeriesSection.style.display = 'block';
            seriesData.results.forEach(ser => {
              const item = document.createElement('div');
              item.className = 'similar-game-card'; // Reuse identical styling
              item.style.cssText = 'width: 100px; flex-shrink: 0; cursor: pointer; position: relative;';
              item.setAttribute('data-game-id', ser.id);

              item.innerHTML = `
                <div style="position: relative; width: 100px; height: 130px; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 1px solid var(--border-glass);">
                  <img src="${ser.background_image || 'src/css/placeholder.svg'}" style="width: 100%; height: 100%; object-fit: cover;" alt="${ser.name}">
                </div>
                <div style="font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px; color: var(--text-light); text-align: center;" title="${ser.name}">${ser.name}</div>
              `;
              modalSeriesContainer.appendChild(item);
            });
          } else {
            modalSeriesSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải game series:', err);
        if (modalSeriesSection) modalSeriesSection.style.display = 'none';
      });

    // Fetch and render parent games (Base Game)
    window.api.getGameParents(gameId, 12)
      .then(parentsData => {
        if (modalParentsSection && modalParentsContainer) {
          modalParentsContainer.innerHTML = '';
          if (parentsData && parentsData.results && parentsData.results.length > 0) {
            modalParentsSection.style.display = 'block';
            parentsData.results.forEach(parent => {
              const item = document.createElement('div');
              item.className = 'similar-game-card'; // Reuse identical styling
              item.style.cssText = 'width: 100px; flex-shrink: 0; cursor: pointer; position: relative;';
              item.setAttribute('data-game-id', parent.id);

              item.innerHTML = `
                <div style="position: relative; width: 100px; height: 130px; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 1px solid var(--border-glass);">
                  <img src="${parent.background_image || 'src/css/placeholder.svg'}" style="width: 100%; height: 100%; object-fit: cover;" alt="${parent.name}">
                </div>
                <div style="font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px; color: var(--text-light); text-align: center;" title="${parent.name}">${parent.name}</div>
              `;
              modalParentsContainer.appendChild(item);
            });
          } else {
            modalParentsSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải base game:', err);
        if (modalParentsSection) modalParentsSection.style.display = 'none';
      });

    // Fetch and render purchase stores links
    window.api.getGameStores(gameId, 12)
      .then(storesData => {
        const modalStoresSection = document.getElementById('modal-stores-section');
        const modalStoresContainer = document.getElementById('modal-stores-container');
        if (modalStoresSection && modalStoresContainer) {
          modalStoresContainer.innerHTML = '';
          if (storesData && storesData.results && storesData.results.length > 0) {
            modalStoresSection.style.display = 'block';
            storesData.results.forEach(item => {
              if (item.url) {
                const storeNames = {
                  1: 'Steam',
                  2: 'Microsoft Store',
                  3: 'PlayStation Store',
                  4: 'Xbox Store',
                  5: 'App Store',
                  6: 'Google Play',
                  7: 'Xbox 360 Store',
                  8: 'Google Play',
                  9: 'itch.io',
                  11: 'Epic Games Store',
                  12: 'GOG'
                };
                
                const name = storeNames[item.store_id] || 'Cửa hàng';
                
                const link = document.createElement('a');
                link.className = 'store-link-btn';
                link.href = item.url;
                link.target = '_blank';
                link.innerHTML = `
                  <svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align: middle; margin-right: 4px;"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>
                  <span>${name}</span>
                `;
                modalStoresContainer.appendChild(link);
              }
            });
            if (modalStoresContainer.children.length === 0) {
              modalStoresSection.style.display = 'none';
            }
          } else {
            modalStoresSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải stores:', err);
        const modalStoresSection = document.getElementById('modal-stores-section');
        if (modalStoresSection) modalStoresSection.style.display = 'none';
      });

    // Hardware specifications comparison
    renderSpecsComparison(details);

    // Metacritic large score
    const metacritic = details.metacritic;
    if (modalMetaScore) {
      if (metacritic) {
        modalMetaScore.textContent = metacritic;
        if (metacritic >= 75) modalMetaScore.style.borderColor = '#ffffff';
        else if (metacritic >= 50) modalMetaScore.style.borderColor = '#a3a3a3';
        else modalMetaScore.style.borderColor = '#404040';
      } else {
        modalMetaScore.textContent = '--';
        modalMetaScore.style.borderColor = 'var(--border-glass)';
      }
    }

    // Screenshots slider
    if (modalScreenshotsContainer) {
      if (screenData.results && screenData.results.length > 0) {
        screenData.results.slice(0, 5).forEach(scr => {
          const img = document.createElement('img');
          img.src = scr.image;
          img.className = 'screenshot-thumbnail';
          img.addEventListener('click', () => {
            if (modalCoverImg) modalCoverImg.src = scr.image;
          });
          modalScreenshotsContainer.appendChild(img);
        });
      } else {
        modalScreenshotsContainer.innerHTML = '<span style="color: var(--text-muted); font-size:12px;">Không có screenshot</span>';
      }
    }

    // Fetch and render trailers
    window.api.getGameTrailers(gameId, 3)
      .then(trailerData => {
        if (modalTrailersSection && modalTrailerVideo) {
          modalTrailerVideo.src = '';
          modalTrailerVideo.pause();
          
          const existingSwitcher = document.getElementById('modal-trailers-switcher-container');
          if (existingSwitcher) existingSwitcher.remove();

          if (trailerData && trailerData.results && trailerData.results.length > 0) {
            modalTrailersSection.style.display = 'block';
            
            const switcherContainer = document.createElement('div');
            switcherContainer.id = 'modal-trailers-switcher-container';
            switcherContainer.style.cssText = 'display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;';
            modalTrailersSection.appendChild(switcherContainer);
            
            const setTrailer = (trailer, btnEl) => {
              const videoUrl = trailer.data ? (trailer.data.max || trailer.data['480']) : null;
              if (videoUrl) {
                modalTrailerVideo.src = videoUrl;
                modalTrailerVideo.poster = trailer.preview || '';
                switcherContainer.querySelectorAll('button').forEach(btn => {
                  btn.style.borderColor = 'var(--border-glass)';
                  btn.style.background = 'rgba(255,255,255,0.05)';
                });
                if (btnEl) {
                  btnEl.style.borderColor = 'var(--accent-purple)';
                  btnEl.style.background = 'rgba(139, 92, 246, 0.1)';
                }
              }
            };
            
            if (trailerData.results.length > 1) {
              trailerData.results.forEach((trailer, index) => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-secondary';
                btn.style.cssText = 'padding: 4px 8px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1px solid var(--border-glass); border-radius: 4px; background: rgba(255,255,255,0.05); color: var(--text-light); cursor: pointer; transition: all 0.2s;';
                btn.innerHTML = `
                  <svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                  <span>Video ${index + 1}</span>
                `;
                btn.addEventListener('click', () => setTrailer(trailer, btn));
                switcherContainer.appendChild(btn);
              });
              
              setTrailer(trailerData.results[0], switcherContainer.firstChild);
            } else {
              setTrailer(trailerData.results[0], null);
              switcherContainer.remove();
            }
          } else {
            modalTrailersSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải trailers:', err);
        if (modalTrailersSection) modalTrailersSection.style.display = 'none';
      });

    // Fetch and render achievements list
    window.api.getGameAchievements(gameId, 12)
      .then(achData => {
        if (modalAchievementsListSection && modalAchievementsContainer) {
          modalAchievementsContainer.innerHTML = '';
          if (achData && achData.results && achData.results.length > 0) {
            modalAchievementsListSection.style.display = 'block';
            achData.results.forEach(ach => {
              const item = document.createElement('div');
              item.className = 'achievement-card';
              item.style.cssText = 'width: 120px; flex-shrink: 0; text-align: center; position: relative; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: space-between;';

              const imgUrl = ach.image || 'src/css/placeholder.svg';
              const name = ach.name || 'Thành tựu';
              const desc = ach.description || 'Không có mô tả';
              const percent = ach.percent !== undefined ? `${parseFloat(ach.percent).toFixed(1)}%` : 'Chưa rõ';

              item.innerHTML = `
                <div style="width: 54px; height: 54px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); border: 1px solid var(--border-glass); background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
                  <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${name}">
                </div>
                <div style="font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-white); width: 100%; margin-bottom: 2px;" title="${name}">${name}</div>
                <div style="font-size: 9px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; margin-bottom: 6px;" title="${desc}">${desc}</div>
                <div style="font-size: 9px; font-weight: 700; color: var(--accent-purple); background: rgba(139, 92, 246, 0.15); padding: 2px 6px; border-radius: 4px; display: inline-block;">
                  🏆 ${percent}
                </div>
              `;
              modalAchievementsContainer.appendChild(item);
            });
          } else {
            modalAchievementsListSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải achievements:', err);
        if (modalAchievementsListSection) modalAchievementsListSection.style.display = 'none';
      });

    // Fetch and render Reddit posts
    window.api.getGameRedditPosts(gameId, 5)
      .then(redditData => {
        if (modalRedditPostsSection && modalRedditPostsContainer) {
          modalRedditPostsContainer.innerHTML = '';
          if (redditData && redditData.results && redditData.results.length > 0) {
            modalRedditPostsSection.style.display = 'block';
            
            redditData.results.forEach(post => {
              const card = document.createElement('div');
              card.className = 'reddit-post-card';
              card.style.cssText = 'background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-glass); border-radius: 8px; padding: 12px; display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px;';

              let dateStr = '';
              if (post.created) {
                try {
                  const date = new Date(post.created);
                  dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                } catch(e) {}
              }

              let cleanText = post.text ? post.text.replace(/<[^>]*>/g, '').trim() : '';
              if (cleanText.length > 180) {
                cleanText = cleanText.substring(0, 180) + '...';
              }

              const leftContent = `
                <div style="flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0;">
                  <div style="display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--text-muted);">
                    <svg viewBox="0 0 24 24" width="12" height="12" style="color: var(--text-light); flex-shrink: 0;"><path fill="currentColor" d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.75-1.64-5.99-1.72l1.27-3.99 4.14.88c.02.69.58 1.25 1.27 1.25 1.1 0 2-.9 2-2s-.9-2-2-2c-.93 0-1.7.64-1.92 1.5l-4.63-1c-.24-.04-.47.1-.53.33l-1.46 4.62c-2.32.06-4.52.7-6.2 1.72-.56-.75-1.46-1.24-2.42-1.24-1.65 0-3 1.35-3 3 0 1.05.54 1.97 1.37 2.51-.04.29-.07.58-.07.87 0 4.14 4.93 7.5 11 7.5s11-3.36 11-7.5c0-.29-.03-.58-.07-.87.83-.54 1.37-1.46 1.37-2.51zm-18 1c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm10.7 4.9c-.83.83-2.4 1.1-3.2 1.1s-2.37-.27-3.2-1.1c-.2-.2-.2-.51 0-.71.2-.2.51-.2.71 0 .6.6 1.7.8 2.49.8s1.89-.2 2.49-.8c.2-.2.51-.2.71 0 .2.2.2.51 0 .71zm-.7-3.4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                    <span>Đăng bởi <strong>u/${post.username || 'ẩn danh'}</strong></span>
                    ${dateStr ? `<span>•</span> <span>${dateStr}</span>` : ''}
                  </div>
                  <a href="${post.url}" target="_blank" style="font-size: 13px; font-weight: 700; color: var(--text-white); text-decoration: none; line-height: 1.3; word-break: break-word;" class="reddit-title-link">
                    ${post.name || 'Bài viết không có tiêu đề'}
                  </a>
                  ${cleanText ? `<p style="font-size: 11px; color: var(--text-light); line-height: 1.4; margin: 0; word-break: break-word;">${cleanText}</p>` : ''}
                </div>
              `;

              const rightContent = post.image ? `
                <a href="${post.url}" target="_blank" style="flex-shrink: 0; width: 70px; height: 70px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-glass);">
                  <img src="${post.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="Reddit thumbnail">
                </a>
              ` : '';

              card.innerHTML = leftContent + rightContent;
              modalRedditPostsContainer.appendChild(card);
            });

            // Add custom hover styles for title links if not already there
            const customStylesId = 'reddit-custom-styles';
            if (!document.getElementById(customStylesId)) {
              const style = document.createElement('style');
              style.id = customStylesId;
              style.textContent = `
                .reddit-title-link:hover {
                  color: var(--accent-purple) !important;
                  text-decoration: underline !important;
                }
              `;
              document.head.appendChild(style);
            }
          } else {
            modalRedditPostsSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải reddit posts:', err);
        if (modalRedditPostsSection) modalRedditPostsSection.style.display = 'none';
      });

    // Fetch and render Twitch streams
    window.api.getGameTwitch(gameId, 5)
      .then(twitchData => {
        if (modalTwitchSection && modalTwitchContainer) {
          modalTwitchContainer.innerHTML = '';
          if (twitchData && twitchData.results && twitchData.results.length > 0) {
            modalTwitchSection.style.display = 'block';
            twitchData.results.forEach(stream => {
              const item = document.createElement('a');
              item.href = stream.url || `https://www.twitch.tv/${stream.user_name || stream.name}`;
              item.target = '_blank';
              item.className = 'twitch-stream-card';
              item.style.cssText = 'width: 150px; flex-shrink: 0; text-decoration: none; display: flex; flex-direction: column; gap: 4px; cursor: pointer;';

              const viewText = stream.view_count !== undefined ? `👁️ ${stream.view_count.toLocaleString()}` : '';

              item.innerHTML = `
                <div style="position: relative; width: 150px; height: 85px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-glass); background: #000;">
                  ${viewText ? `<div style="position: absolute; bottom: 4px; left: 4px; background: rgba(0,0,0,0.8); color: #fff; font-size: 8px; padding: 2px 4px; border-radius: 3px; font-weight: bold;">${viewText}</div>` : ''}
                  <div style="position: absolute; top: 4px; right: 4px; background: #3f3f46; color: #fff; font-size: 8px; padding: 2px 4px; border-radius: 3px; font-weight: bold; text-transform: uppercase;">Live</div>
                </div>
                <div style="font-size: 11px; font-weight: 700; color: var(--text-white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;" title="${stream.name}">${stream.name}</div>
                <div style="font-size: 9px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${stream.user_name || 'Streamer'}</div>
              `;
              modalTwitchContainer.appendChild(item);
            });
          } else {
            modalTwitchSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải Twitch streams:', err);
        if (modalTwitchSection) modalTwitchSection.style.display = 'none';
      });

    // Fetch and render YouTube videos
    window.api.getGameYoutube(gameId, 5)
      .then(youtubeData => {
        if (modalYoutubeSection && modalYoutubeContainer) {
          modalYoutubeContainer.innerHTML = '';
          if (youtubeData && youtubeData.results && youtubeData.results.length > 0) {
            modalYoutubeSection.style.display = 'block';
            youtubeData.results.forEach(video => {
              const item = document.createElement('a');
              item.href = `https://www.youtube.com/watch?v=${video.external_id}`;
              item.target = '_blank';
              item.className = 'youtube-video-card';
              item.style.cssText = 'width: 150px; flex-shrink: 0; text-decoration: none; display: flex; flex-direction: column; gap: 4px; cursor: pointer;';

              const thumbUrl = video.thumbnails && video.thumbnails.high ? video.thumbnails.high.url : 
                               (video.thumbnails && video.thumbnails.medium ? video.thumbnails.medium.url : 
                                (video.thumbnails && video.thumbnails.default ? video.thumbnails.default.url : 'src/css/placeholder.svg'));

              item.innerHTML = `
                <div style="position: relative; width: 150px; height: 85px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-glass); background: #000;">
                  <img src="${thumbUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${video.name}">
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 28px; height: 28px; background: rgba(239, 68, 68, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">
                    <svg viewBox="0 0 24 24" width="14" height="14" style="color: #fff; margin-left: 2px;"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div style="font-size: 11px; font-weight: 700; color: var(--text-white); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 28px; line-height: 1.3;" title="${video.name}">${video.name}</div>
                <div style="font-size: 9px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">${video.channel_title || 'YouTube'}</div>
              `;
              modalYoutubeContainer.appendChild(item);
            });
          } else {
            modalYoutubeSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải YouTube videos:', err);
        if (modalYoutubeSection) modalYoutubeSection.style.display = 'none';
      });

    // Check if this game is already saved in our local catalog
    const saved = state.localGames.find(g => g.id === gameId);
    if (saved) {
      if (selectGameStatus) selectGameStatus.value = saved.status;
      if (btnDeleteModal) btnDeleteModal.classList.remove('hidden');
      updateModalFieldsVisibility(saved.status);

      if (rowSubstatusPlatform) rowSubstatusPlatform.classList.remove('hidden');
      updateSubstatusDropdown(saved.status, saved.subStatus || 'none');
      updatePlatformDropdown(details, saved);

      // Populate status specific fields
      if (saved.status === 'playing') {
        if (inputPlayingHours) inputPlayingHours.value = saved.playingHours || 0;
        if (inputPlayingStart) inputPlayingStart.value = saved.startDate || '';
        if (inputPlayingNotes) inputPlayingNotes.value = saved.notes || '';
      } else if (saved.status === 'backlog') {
        if (selectBacklogPriority) selectBacklogPriority.value = saved.priority || 'medium';
      } else if (saved.status === 'completed') {
        setModalStarRating(saved.rating || 0);
        if (inputCompletedDate) inputCompletedDate.value = saved.endDate || '';
        if (inputCompletedReview) inputCompletedReview.value = saved.review || '';
      }
    } else {
      // Default placeholder fields
      if (selectGameStatus) selectGameStatus.value = 'none';
      if (btnDeleteModal) btnDeleteModal.classList.add('hidden');
      if (rowSubstatusPlatform) rowSubstatusPlatform.classList.add('hidden');
      updateModalFieldsVisibility('none');
      updateSubstatusDropdown('none', 'none');
      updatePlatformDropdown(details, null);
      
      if (inputPlayingHours) inputPlayingHours.value = 0;
      if (inputPlayingStart) inputPlayingStart.value = new Date().toISOString().split('T')[0];
      if (inputPlayingNotes) inputPlayingNotes.value = '';
      if (selectBacklogPriority) selectBacklogPriority.value = 'medium';
      setModalStarRating(0);
      if (inputCompletedDate) inputCompletedDate.value = new Date().toISOString().split('T')[0];
      if (inputCompletedReview) inputCompletedReview.value = '';
    }

  } catch (err) {
    console.error('Lỗi lấy chi tiết game:', err);
    if (modalTitle) modalTitle.textContent = 'Lỗi tải thông tin game';
    if (modalDescription) {
      modalDescription.innerHTML = `<p style="color: var(--accent-danger)">Có lỗi xảy ra: ${err.message}. Đảm bảo kết nối mạng và API Key của bạn đang hoạt động bình thường.</p>`;
    }
  }
}

// Render ratings distribution bar chart dynamically
function renderRatingsChart(ratings) {
  if (!modalRatingsChartSection || !modalRatingsChart || !modalRatingsLegend) return;
  
  modalRatingsChart.innerHTML = '';
  modalRatingsLegend.innerHTML = '';
  
  if (ratings && ratings.length > 0) {
    modalRatingsChartSection.style.display = 'block';
    
    const order = ['exceptional', 'recommended', 'meh', 'skip'];
    const sorted = [...ratings].sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
    
    const colors = {
      exceptional: '#ffffff', // White
      recommended: '#d1d5db', // Light Gray
      meh: '#9ca3af',         // Gray
      skip: '#4b5563'         // Dark Gray
    };
    
    const labels = {
      exceptional: '🏆 Siêu phẩm',
      recommended: '👍 Khuyên chơi',
      meh: '😐 Tạm được',
      skip: '👎 Bỏ qua'
    };

    sorted.forEach(rating => {
      const pct = rating.percent;
      if (pct > 0) {
        // Create bar segment
        const segment = document.createElement('div');
        segment.className = 'rating-bar-segment';
        segment.style.width = `${pct}%`;
        segment.style.height = '100%';
        segment.style.backgroundColor = colors[rating.title] || '#ccc';
        segment.style.transition = 'width 0.3s ease';
        segment.title = `${labels[rating.title] || rating.title}: ${pct.toFixed(1)}% (${rating.count} vote)`;
        modalRatingsChart.appendChild(segment);
        
        // Create legend item
        const legendItem = document.createElement('div');
        legendItem.className = 'rating-legend-item';
        legendItem.style.cssText = 'display: flex; align-items: center; gap: 5px; font-size: 11px; margin-right: 12px; margin-bottom: 6px;';
        legendItem.innerHTML = `
          <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${colors[rating.title] || '#ccc'}; display: inline-block;"></span>
          <span style="font-weight: 500; color: var(--text-white);">${labels[rating.title] || rating.title}:</span>
          <span style="color: var(--text-muted);">${pct.toFixed(1)}%</span>
        `;
        modalRatingsLegend.appendChild(legendItem);
      }
    });
  } else {
    modalRatingsChartSection.style.display = 'none';
  }
}

// Update substatus options dynamically based on status selection
export function updateSubstatusDropdown(mainStatus, selectedVal = 'none') {
  if (!selectGameSubstatus) return;
  selectGameSubstatus.innerHTML = '';
  const options = SUB_STATUS_OPTIONS[mainStatus] || SUB_STATUS_OPTIONS.none;
  options.forEach(opt => {
    const el = document.createElement('option');
    el.value = opt.value;
    el.textContent = opt.label;
    selectGameSubstatus.appendChild(el);
  });
  selectGameSubstatus.value = selectedVal;
}

// Update platform selector options
export function updatePlatformDropdown(gameDetails, savedGame = null) {
  if (!selectGamePlatform) return;
  selectGamePlatform.innerHTML = '<option value="none">Chưa chọn hệ máy</option>';
  
  let platformsList = [];
  if (gameDetails && gameDetails.platforms) {
    platformsList = gameDetails.platforms.map(p => p.platform.name);
  }
  
  if (platformsList.length === 0) {
    platformsList = ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X|S', 'Nintendo Switch', 'Android', 'iOS', 'macOS'];
  }

  const uniquePlatforms = [...new Set(platformsList)];
  uniquePlatforms.forEach(plat => {
    const el = document.createElement('option');
    el.value = plat;
    el.textContent = plat;
    selectGamePlatform.appendChild(el);
  });
  
  if (savedGame && savedGame.platform) {
    selectGamePlatform.value = savedGame.platform;
  } else {
    selectGamePlatform.value = 'none';
  }
}

// Show/hide status input blocks in Modal
export function updateModalFieldsVisibility(status) {
  if (fieldsPlaying) fieldsPlaying.classList.add('hidden');
  if (fieldsBacklog) fieldsBacklog.classList.add('hidden');
  if (fieldsCompleted) fieldsCompleted.classList.add('hidden');

  if (status === 'playing') {
    if (fieldsPlaying) fieldsPlaying.classList.remove('hidden');
  } else if (status === 'backlog') {
    if (fieldsBacklog) fieldsBacklog.classList.remove('hidden');
  } else if (status === 'completed') {
    if (fieldsCompleted) fieldsCompleted.classList.remove('hidden');
  }
}

// Modal star rating visualizer helper
export function setModalStarRating(ratingVal) {
  state.currentRating = ratingVal;
  starBtns.forEach(btn => {
    const val = parseInt(btn.getAttribute('data-value'));
    if (val <= ratingVal) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

export function closeModal() {
  if (gameDetailModal) gameDetailModal.classList.remove('active');
  state.selectedGame = null;
  if (modalContainer) {
    modalContainer.style.backgroundImage = 'none';
  }
  if (modalTrailerVideo) {
    modalTrailerVideo.pause();
    modalTrailerVideo.src = '';
  }

  // Deep DOM cleanup of list containers to prevent memory leaks and release reference handlers instantly
  if (modalScreenshotsContainer) modalScreenshotsContainer.innerHTML = '';
  if (modalTagsContainer) modalTagsContainer.innerHTML = '';
  if (modalSimilarContainer) modalSimilarContainer.innerHTML = '';
  if (modalAdditionsContainer) modalAdditionsContainer.innerHTML = '';
  if (modalTeamContainer) modalTeamContainer.innerHTML = '';
  if (modalSeriesContainer) modalSeriesContainer.innerHTML = '';
  if (modalParentsContainer) modalParentsContainer.innerHTML = '';
  if (modalAchievementsContainer) modalAchievementsContainer.innerHTML = '';
  if (modalRedditPostsContainer) modalRedditPostsContainer.innerHTML = '';
  if (modalTwitchContainer) modalTwitchContainer.innerHTML = '';
  if (modalYoutubeContainer) modalYoutubeContainer.innerHTML = '';

  const modalStoresContainer = document.getElementById('modal-stores-container');
  if (modalStoresContainer) modalStoresContainer.innerHTML = '';

  const existingSwitcher = document.getElementById('modal-trailers-switcher-container');
  if (existingSwitcher) existingSwitcher.remove();
}

// Save or Update Game state
export async function saveModalGame() {
  if (!state.selectedGame) return;

  const status = selectGameStatus.value;
  const gameId = state.selectedGame.id;

  if (status === 'none') {
    // If set to none, delete if existed, or just close
    await deleteModalGame(true);
    return;
  }

  // Build the game data to save
  const genres = state.selectedGame.genres ? state.selectedGame.genres.map(g => g.name) : [];
  
  const gameRecord = {
    id: state.selectedGame.id,
    name: state.selectedGame.name,
    background_image: state.selectedGame.background_image,
    genres: genres,
    released: state.selectedGame.released,
    metacritic: state.selectedGame.metacritic,
    status: status,
    subStatus: selectGameSubstatus.value,
    platform: selectGamePlatform.value,
    updatedAt: Date.now()
  };

  // Add specific fields based on status
  if (status === 'playing') {
    gameRecord.playingHours = parseFloat(inputPlayingHours.value) || 0;
    gameRecord.startDate = inputPlayingStart.value;
    gameRecord.notes = inputPlayingNotes.value.trim();
  } else if (status === 'backlog') {
    gameRecord.priority = selectBacklogPriority.value;
  } else if (status === 'completed') {
    gameRecord.rating = state.currentRating;
    gameRecord.endDate = inputCompletedDate.value;
    gameRecord.review = inputCompletedReview.value.trim();
  }

  const existingIdx = state.localGames.findIndex(g => g.id === gameId);
  if (existingIdx !== -1) {
    gameRecord.createdAt = state.localGames[existingIdx].createdAt || Date.now();
    state.localGames[existingIdx] = gameRecord;
  } else {
    gameRecord.createdAt = Date.now();
    state.localGames.push(gameRecord);
  }

  // Save to disk
  const success = await saveGames(state.localGames);
  if (success) {
    updateLibraryStats();
    renderDashboard();
    
    // Refresh library tab if we are currently inside library view
    if (state.activeTab !== 'discover' && state.activeTab !== 'search' && state.activeTab !== 'dashboard') {
      renderListTab(state.activeTab);
    } else if (state.activeTab === 'discover' || state.activeTab === 'search') {
      // Re-trigger render of current page search/discover grid to hide/update states
      const activeTabPane = document.getElementById(`view-${state.activeTab}`);
      if (activeTabPane) {
        if (state.activeTab === 'search') {
          // If we had a query, re-render cached results or trending initial
          const query = document.getElementById('rawg-search-input').value.trim();
          const grid = document.getElementById('search-game-grid');
          if (grid) {
            grid.innerHTML = '';
            if (query === state.searchQueryCached && state.searchGamesCached) {
              const searchResults = (state.searchGamesCached.results || []).filter(g => !state.localGames.some(lg => String(lg.id) === String(g.id)));
              if (searchResults.length > 0) {
                searchResults.forEach(game => {
                  const card = document.createElement('div');
                  card.className = `game-card glass-card`;
                  card.addEventListener('click', () => openGameDetails(game.id));
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
                  grid.appendChild(card);
                });
              } else {
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-size:14px;">Không tìm thấy game nào phù hợp.</div>`;
              }
            } else if (!query && state.popularGamesCached) {
              const popResults = (state.popularGamesCached.results || []).filter(g => !state.localGames.some(lg => String(lg.id) === String(g.id)));
              popResults.forEach(game => {
                const card = document.createElement('div');
                card.className = `game-card glass-card`;
                card.addEventListener('click', () => openGameDetails(game.id));
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
                grid.appendChild(card);
              });
            }
          }
        } else if (state.activeTab === 'discover') {
          // Re-render Discover Trending and Upcoming grids
          const trendingGrid = document.getElementById('discover-trending-grid');
          const upcomingGrid = document.getElementById('discover-upcoming-grid');
          
          if (trendingGrid && state.trendingGamesCached) {
            trendingGrid.innerHTML = '';
            const tResults = (state.trendingGamesCached.results || []).filter(g => !state.localGames.some(lg => String(lg.id) === String(g.id)));
            tResults.forEach(game => {
              const card = document.createElement('div');
              card.className = `game-card glass-card`;
              card.addEventListener('click', () => openGameDetails(game.id));
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
              trendingGrid.appendChild(card);
            });
          }

          if (upcomingGrid && state.upcomingGamesCached) {
            upcomingGrid.innerHTML = '';
            const uResults = (state.upcomingGamesCached.results || []).filter(g => !state.localGames.some(lg => String(lg.id) === String(g.id)));
            uResults.forEach(game => {
              const card = document.createElement('div');
              card.className = `game-card glass-card`;
              card.addEventListener('click', () => openGameDetails(game.id));
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
              upcomingGrid.appendChild(card);
            });
          }
        }
      }
    }
    closeModal();
  } else {
    alert('Lỗi khi lưu game vào cơ sở dữ liệu cục bộ!');
  }
}

// Delete Game from library
export async function deleteModalGame(silent = false) {
  if (!state.selectedGame) return;
  
  const gameId = state.selectedGame.id;
  const existingIdx = state.localGames.findIndex(g => g.id === gameId);

  if (existingIdx !== -1) {
    if (!silent) {
      const confirmDelete = confirm(`Bạn có chắc muốn xóa "${state.selectedGame.name}" khỏi thư viện?`);
      if (!confirmDelete) return;
    }

    state.localGames.splice(existingIdx, 1);
    const success = await saveGames(state.localGames);
    
    if (success) {
      updateLibraryStats();
      renderDashboard();
      
      // Refresh library tab if we are currently inside library view
      if (state.activeTab !== 'discover' && state.activeTab !== 'search' && state.activeTab !== 'dashboard') {
        renderListTab(state.activeTab);
      }
      closeModal();
    } else {
      alert('Lỗi khi cập nhật cơ sở dữ liệu!');
    }
  } else {
    closeModal();
  }
}
