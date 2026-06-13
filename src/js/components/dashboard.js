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

const dbPlayingSpotlight = document.getElementById('dashboard-playing-spotlight');
const dbBacklogRoulette = document.getElementById('dashboard-backlog-roulette');
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
export function renderDashboard() {
  const playingGames = state.localGames.filter(g => g.status === 'playing');
  const backlogGames = state.localGames.filter(g => g.status === 'backlog');

  // Spotlight - Game currently being played (latest updated playing game)
  if (dbPlayingSpotlight) {
    if (playingGames.length > 0) {
      // Sort by updated time (newest first)
      const sortedPlaying = [...playingGames].sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      const latest = sortedPlaying[0];
      
      dbPlayingSpotlight.innerHTML = `
        <div class="spotlight-game">
          <div class="spotlight-cover-wrapper">
            <img src="${latest.background_image || 'src/css/placeholder.svg'}" class="spotlight-cover" alt="${latest.name}">
          </div>
          <div class="spotlight-meta">
            <h4 class="spotlight-title">${latest.name}</h4>
            <span class="spotlight-playtime">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm3.3 14.3L11 12.8V7h1.5v4.9l3.7 2.2-.7 1.2z"/></svg>
              ${parseFloat(latest.playingHours || 0).toFixed(1)} giờ chơi tích lũy
            </span>
            <p class="spotlight-notes">${latest.notes || 'Không có ghi chú nào. Hãy mở chi tiết để cập nhật hành trình!'}</p>
            <button class="btn btn-secondary btn-sm" style="width: fit-content; margin-top: 8px; padding: 6px 12px; font-size:12px;" onclick="openGameDetails(${latest.id})">Cập nhật tiến trình</button>
          </div>
        </div>
      `;
    } else {
      dbPlayingSpotlight.innerHTML = `
        <div class="no-game-placeholder">
          <p>Bạn không có game nào đang chơi dở dang. Hãy chuyển game trong danh sách hoặc tìm game mới!</p>
        </div>
      `;
    }
  }

  // Backlog Roulette - Choose a random game to recommend
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
              <button class="btn btn-secondary btn-sm" style="padding: 6px 12px; font-size:12px;" onclick="openGameDetails(${chosen.id})">Xem chi tiết</button>
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
}
