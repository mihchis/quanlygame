// Component: Dashboard renderer and library statistics updates

import { state, saveGames } from '../state.js';
import { switchTab } from '../app.js';

// DOM elements
const badgePlaying = document.getElementById('badge-playing');
const badgeBacklog = document.getElementById('badge-backlog');
const badgeCompleted = document.getElementById('badge-completed');

const statTotal = document.getElementById('stat-total-games');
const statPlaying = document.getElementById('stat-playing-games');
const statBacklog = document.getElementById('stat-backlog-games');
const statCompleted = document.getElementById('stat-completed-games');

const dbProgressBar = document.getElementById('dashboard-progress-bar');
const quickTotalHours = document.getElementById('quick-total-hours');

// Update library stats and badges
export function updateLibraryStats() {
  const playingGames = state.localGames.filter(g => g.status === 'playing');
  const backlogGames = state.localGames.filter(g => g.status === 'backlog');
  const completedGames = state.localGames.filter(g => g.status === 'completed');

  // Update badges
  if (badgePlaying) badgePlaying.textContent = playingGames.length;
  if (badgeBacklog) badgeBacklog.textContent = backlogGames.length;
  if (badgeCompleted) badgeCompleted.textContent = completedGames.length;

  // Update stats on Dashboard cards
  if (statTotal) statTotal.textContent = state.localGames.length;
  if (statPlaying) statPlaying.textContent = playingGames.length;
  if (statBacklog) statBacklog.textContent = backlogGames.length;
  if (statCompleted) statCompleted.textContent = completedGames.length;

  // Calculate total hours
  let totalHours = 0;
  playingGames.forEach(g => {
    totalHours += parseFloat(g.playingHours || 0);
  });
  
  if (quickTotalHours) {
    quickTotalHours.textContent = `${totalHours.toFixed(1)} giờ chơi`;
  }

  // Update progress bar
  const total = state.localGames.length;
  if (dbProgressBar) {
    if (total > 0) {
      const playPct = (playingGames.length / total) * 100;
      const backPct = (backlogGames.length / total) * 100;
      const compPct = (completedGames.length / total) * 100;

      dbProgressBar.children[0].style.width = `${playPct}%`;
      dbProgressBar.children[1].style.width = `${backPct}%`;
      dbProgressBar.children[2].style.width = `${compPct}%`;
    } else {
      dbProgressBar.children[0].style.width = '0%';
      dbProgressBar.children[1].style.width = '0%';
      dbProgressBar.children[2].style.width = '0%';
    }
  }
}

// Render Dashboard View
export async function renderDashboard() {
  const playingGames = state.localGames.filter(g => g.status === 'playing');
  const backlogGames = state.localGames.filter(g => g.status === 'backlog');

  // 1. Cinematic Hero Banner - Game currently being played (latest updated playing game)
  const dbHeroBanner = document.getElementById('dashboard-hero-banner');
  if (dbHeroBanner) {
    if (playingGames.length > 0) {
      // Sort by updated time (newest first)
      const sortedPlaying = [...playingGames].sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      const latest = sortedPlaying[0];
      
      dbHeroBanner.innerHTML = `
        <img src="${latest.background_image || 'src/css/placeholder.svg'}" class="hero-banner-image-bg" alt="${latest.name}">
        <div class="dashboard-hero-banner-content">
          <div class="hero-banner-cover-wrapper">
            <img src="${latest.background_image || 'src/css/placeholder.svg'}" class="hero-banner-cover" alt="${latest.name}">
          </div>
          <div class="hero-banner-meta">
            <span class="hero-banner-status-badge">Đang chơi gần đây</span>
            <h2 class="hero-banner-title" data-game-id="${latest.id}">${latest.name}</h2>
            <span class="hero-banner-playtime">
              <svg viewBox="0 0 24 24" width="16" height="16" style="vertical-align: middle; margin-right: 4px;"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm3.3 14.3L11 12.8V7h1.5v4.9l3.7 2.2-.7 1.2z"/></svg>
              ${parseFloat(latest.playingHours || 0).toFixed(1)} giờ chơi tích lũy
            </span>
            <p class="hero-banner-notes">${latest.notes || 'Không có ghi chú nào. Hãy mở chi tiết để cập nhật hành trình!'}</p>
            <button class="btn btn-secondary btn-sm" style="width: fit-content; margin-top: 8px; padding: 6px 12px; font-size:12px;" data-game-id="${latest.id}">Cập nhật tiến trình</button>
          </div>
        </div>
      `;
    } else {
      dbHeroBanner.innerHTML = `
        <div class="no-game-placeholder" style="height: 200px; width: 100%;">
          <p>Bạn không có game nào đang chơi dở dang. Hãy chuyển game trong danh sách hoặc tìm game mới để bắt đầu hành trình!</p>
        </div>
      `;
    }
  }

  // 2. Playtime Leaderboard
  const dbPlaytimeLeaderboard = document.getElementById('dashboard-playtime-leaderboard');
  if (dbPlaytimeLeaderboard) {
    const gamesWithHours = state.localGames.filter(g => parseFloat(g.playingHours || 0) > 0);
    if (gamesWithHours.length > 0) {
      const sorted = [...gamesWithHours].sort((a, b) => parseFloat(b.playingHours || 0) - parseFloat(a.playingHours || 0)).slice(0, 3);
      const maxHours = parseFloat(sorted[0].playingHours || 1);
      
      dbPlaytimeLeaderboard.innerHTML = sorted.map((game, idx) => {
        const pct = (parseFloat(game.playingHours || 0) / maxHours) * 100;
        return `
          <div class="playtime-leaderboard-item">
            <div class="leaderboard-rank">#${idx + 1}</div>
            <div class="leaderboard-bar-wrapper">
              <span class="leaderboard-title" data-game-id="${game.id}">${game.name}</span>
              <div class="leaderboard-bar-bg">
                <div class="leaderboard-bar-fill" style="width: ${pct}%"></div>
              </div>
            </div>
            <div class="leaderboard-hours">${parseFloat(game.playingHours || 0).toFixed(1)}h</div>
          </div>
        `;
      }).join('');
    } else {
      dbPlaytimeLeaderboard.innerHTML = `
        <div class="no-game-placeholder" style="height: 100px; font-size:12px;">
          <p>Chưa tích lũy giờ chơi cho game nào. Hãy cập nhật giờ chơi ở danh sách "Đang chơi"!</p>
        </div>
      `;
    }
  }

  // 3. Genre Breakdown
  const dbGenreBreakdown = document.getElementById('dashboard-genre-breakdown');
  if (dbGenreBreakdown) {
    const genreCounts = {};
    state.localGames.forEach(game => {
      if (game.genres && Array.isArray(game.genres)) {
        game.genres.forEach(genre => {
          const name = typeof genre === 'object' ? genre.name : genre;
          genreCounts[name] = (genreCounts[name] || 0) + 1;
        });
      }
    });

    const sortedGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    if (sortedGenres.length > 0) {
      const totalGenreInstances = Object.values(genreCounts).reduce((a, b) => a + b, 0);
      const colors = ['var(--accent-purple)', 'var(--accent-blue)', 'var(--accent-orange)', 'var(--accent-green)'];
      
      dbGenreBreakdown.innerHTML = sortedGenres.map(([name, count], idx) => {
        const pct = (count / totalGenreInstances) * 100;
        const color = colors[idx % colors.length];
        return `
          <div class="genre-item">
            <div class="genre-header">
              <span class="genre-name">${name}</span>
              <span class="genre-count">${count} game</span>
            </div>
            <div class="genre-bar-bg">
              <div class="genre-bar-fill" style="width: ${pct}%; background-color: ${color};"></div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      dbGenreBreakdown.innerHTML = `
        <div class="no-game-placeholder" style="height: 100px; font-size:12px;">
          <p>Thêm game vào thư viện để hiển thị phân bố thể loại!</p>
        </div>
      `;
    }
  }

  // 4. Backlog Roulette - Choose a random game to recommend
  const dbBacklogRoulette = document.getElementById('dashboard-backlog-roulette');
  if (dbBacklogRoulette) {
    if (backlogGames.length > 0) {
      // Select one randomly based on dates
      const randomIndex = Math.floor(Math.random() * backlogGames.length);
      const chosen = backlogGames[randomIndex];
      
      dbBacklogRoulette.innerHTML = `
        <div class="roulette-game">
          <img src="${chosen.background_image || 'src/css/placeholder.svg'}" class="roulette-cover" alt="${chosen.name}">
          <div class="roulette-info">
            <h4 class="roulette-title">${chosen.name}</h4>
            <div style="display:flex; gap: 8px; align-items:center; margin-top: 4px;">
              <span class="priority-tag ${chosen.priority || 'medium'}">
                Ưu tiên: ${chosen.priority === 'high' ? 'Cao' : chosen.priority === 'low' ? 'Thấp' : 'Thường'}
              </span>
              <span style="font-size: 11px; color: var(--text-muted);">Metacritic: ${chosen.metacritic || '--'}</span>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <button class="btn btn-primary btn-sm" style="padding: 6px 12px; font-size:12px;" id="btn-roulette-play">Bắt đầu chơi ngay</button>
              <button class="btn btn-secondary btn-sm" style="padding: 6px 12px; font-size:12px;" data-game-id="${chosen.id}">Xem chi tiết</button>
            </div>
          </div>
        </div>
      `;

      const playBtn = document.getElementById('btn-roulette-play');
      if (playBtn) {
        playBtn.addEventListener('click', async () => {
          // Switch status to playing
          const gameIdx = state.localGames.findIndex(g => g.id === chosen.id);
          if (gameIdx !== -1) {
            state.localGames[gameIdx].status = 'playing';
            state.localGames[gameIdx].updatedAt = Date.now();
            state.localGames[gameIdx].startDate = new Date().toISOString().split('T')[0];
            
            await saveGames(state.localGames);
            updateLibraryStats();
            switchTab('playing');
          }
        });
      }
    } else {
      dbBacklogRoulette.innerHTML = `
        <div class="no-game-placeholder">
          <p>Backlog của bạn đang trống. Chọn thêm game trong tab Tìm Kiếm nhé!</p>
        </div>
      `;
    }
  }

  // 5. Hardware Specs Widget
  const dbSpecsWidget = document.getElementById('dashboard-specs-widget');
  if (dbSpecsWidget) {
    const specs = state.appConfig.systemSpecs;
    if (specs) {
      dbSpecsWidget.innerHTML = `
        <div class="specs-widget-grid">
          <div class="spec-widget-item">
            <span class="spec-widget-label">Hệ điều hành</span>
            <span class="spec-widget-val" title="${specs.os || 'Không rõ'}">${specs.os || 'Không rõ'}</span>
          </div>
          <div class="spec-widget-item">
            <span class="spec-widget-label">Bộ nhớ RAM</span>
            <span class="spec-widget-val" title="${specs.ram || 'Không rõ'}">${specs.ram || 'Không rõ'}</span>
          </div>
          <div class="spec-widget-item">
            <span class="spec-widget-label">Vi xử lý CPU</span>
            <span class="spec-widget-val" title="${specs.cpu || 'Không rõ'}">${specs.cpu || 'Không rõ'}</span>
          </div>
          <div class="spec-widget-item">
            <span class="spec-widget-label">Card đồ họa GPU</span>
            <span class="spec-widget-val" title="${specs.gpu || 'Không rõ'}">${specs.gpu || 'Không rõ'}</span>
          </div>
        </div>
      `;
    } else {
      dbSpecsWidget.innerHTML = `
        <div class="no-game-placeholder" style="height: 100px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
          <p style="font-size:12px; margin:0;">Chưa tải lên cấu hình phần cứng.</p>
          <button class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 10px;" onclick="switchTab('settings')">Tải lên DxDiag</button>
        </div>
      `;
    }
  }

  // 6. Recent Activity Log
  const dbActivityLog = document.getElementById('dashboard-activity-log');
  if (dbActivityLog) {
    const recentlyUpdated = [...state.localGames]
      .filter(g => g.updatedAt)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 4);

    if (recentlyUpdated.length > 0) {
      dbActivityLog.innerHTML = recentlyUpdated.map(game => {
        let icon = 'create';
        let desc = '';
        let statusClass = game.status;
        
        const timeString = new Date(game.updatedAt).toLocaleDateString('vi-VN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        if (game.status === 'playing') {
          icon = 'playing';
          desc = game.playingHours > 0 
            ? `Đã tích lũy thêm <strong style="color:var(--accent-blue);">${parseFloat(game.playingHours).toFixed(1)}h</strong> chơi game`
            : `Bắt đầu cày game`;
        } else if (game.status === 'backlog') {
          icon = 'backlog';
          desc = `Đã lưu game vào hàng chờ muốn chơi (Backlog)`;
        } else if (game.status === 'completed') {
          icon = 'completed';
          desc = `Đã phá đảo cốt truyện game (${game.rating || 5}★)`;
        }

        let svg = '';
        if (icon === 'playing') {
          svg = `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>`;
        } else if (icon === 'backlog') {
          svg = `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>`;
        } else if (icon === 'completed') {
          svg = `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
        } else {
          svg = `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`;
        }

        return `
          <div class="activity-log-item">
            <div class="activity-icon-wrapper ${statusClass}">
              ${svg}
            </div>
            <div class="activity-info">
              <span class="activity-title">
                ${desc} <span class="activity-game-name" data-game-id="${game.id}">${game.name}</span>
               </span>
              <span class="activity-time">${timeString}</span>
            </div>
          </div>
        `;
      }).join('');
    } else {
      dbActivityLog.innerHTML = `
        <div class="no-game-placeholder" style="height: 150px;">
          <p>Chưa có hoạt động nào được ghi lại gần đây.</p>
        </div>
      `;
    }
  }

  // 7. Completed Showcase / Hall of Fame
  const dbHallOfFame = document.getElementById('dashboard-hall-of-fame');
  if (dbHallOfFame) {
    const completedGames = state.localGames.filter(g => g.status === 'completed');
    if (completedGames.length > 0) {
      const sortedShowcase = [...completedGames].sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
      
      dbHallOfFame.innerHTML = sortedShowcase.map(game => {
        const stars = '★'.repeat(game.rating || 5) + '☆'.repeat(5 - (game.rating || 5));
        const comment = game.review || game.notes || 'Không có bình luận nào.';
        return `
          <div class="completed-showcase-item" data-game-id="${game.id}">
            <img src="${game.background_image || 'src/css/placeholder.svg'}" class="showcase-cover" alt="${game.name}">
            <h4 class="showcase-title" title="${game.name}">${game.name}</h4>
            <div class="showcase-rating">${stars}</div>
            <p class="showcase-comment" title="${comment}">${comment}</p>
          </div>
        `;
      }).join('');
    } else {
      dbHallOfFame.innerHTML = `
        <div class="no-game-placeholder" style="width: 100%; height: 120px;">
          <p>Hãy phá đảo một game và đánh giá để vinh danh trò chơi tại đây!</p>
        </div>
      `;
    }
  }

  // 8. RAWG Recommendations
  const dbRecsLoading = document.getElementById('dashboard-recommendations-loading');
  const dbRecsGrid = document.getElementById('dashboard-recommendations-grid');
  
  if (dbRecsLoading && dbRecsGrid) {
    if (!state.appConfig.apiKey) {
      dbRecsLoading.style.display = 'none';
      dbRecsGrid.style.display = 'flex';
      dbRecsGrid.innerHTML = `
        <div class="no-game-placeholder" style="width: 100%; height: 120px; grid-column: span 3;">
          <p>Hãy cấu hình RAWG API Key trong tab Cài Đặt để nhận gợi ý game tự động!</p>
        </div>
      `;
    } else {
      dbRecsLoading.style.display = 'flex';
      dbRecsGrid.style.display = 'none';
      
      try {
        const data = await window.api.getPopularGames(1, 6);
        dbRecsLoading.style.display = 'none';
        dbRecsGrid.style.display = 'grid';
        
        if (data && data.results && data.results.length > 0) {
          const localIds = new Set(state.localGames.map(g => g.id));
          const filtered = data.results.filter(r => !localIds.has(r.id)).slice(0, 3);
          const finalRecs = filtered.length > 0 ? filtered : data.results.slice(0, 3);
          
          dbRecsGrid.innerHTML = finalRecs.map(game => `
            <div class="rec-card" data-game-id="${game.id}">
              <img src="${game.background_image || 'src/css/placeholder.svg'}" class="rec-cover" alt="${game.name}">
              <div class="rec-info">
                <h4 class="rec-title">${game.name}</h4>
                <span class="rec-score">⭐ Metacritic: ${game.metacritic || '--'}</span>
              </div>
            </div>
          `).join('');
        } else {
          dbRecsGrid.innerHTML = `
            <div class="no-game-placeholder" style="width: 100%; height: 120px; grid-column: span 3;">
              <p>Không tải được game gợi ý. Vui lòng kiểm tra lại kết nối mạng!</p>
            </div>
          `;
        }
      } catch (err) {
        console.error('Error loading dashboard recommendations:', err);
        dbRecsLoading.style.display = 'none';
        dbRecsGrid.style.display = 'flex';
        dbRecsGrid.innerHTML = `
          <div class="no-game-placeholder" style="width: 100%; height: 120px; grid-column: span 3;">
            <p>Không tải được game gợi ý (Có lỗi xảy ra hoặc API key chưa chính xác).</p>
          </div>
        `;
      }
    }
  }
}

