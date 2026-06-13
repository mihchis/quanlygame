const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// Paths for persistent data
const USER_DATA_PATH = app.getPath('userData');
const CONFIG_FILE = path.join(USER_DATA_PATH, 'config.json');

// Auto-detect OneDrive Documents path or fall back to system Documents
function getDatabaseDir() {
  // 1. Check if the default Documents folder is already in OneDrive
  const defaultDocs = app.getPath('documents');
  if (defaultDocs.toLowerCase().includes('onedrive')) {
    const gameVaultPath = path.join(defaultDocs, 'GameVault');
    if (!fs.existsSync(gameVaultPath)) {
      try {
        fs.mkdirSync(gameVaultPath, { recursive: true });
      } catch (err) {
        console.error('Error creating GameVault directory in OneDrive Documents:', err);
      }
    }
    return gameVaultPath;
  }

  // 2. If not, check OneDrive environment variables
  const oneDriveRoot = process.env.OneDrive || process.env.OneDriveConsumer || process.env.OneDriveCommercial;
  if (oneDriveRoot && fs.existsSync(oneDriveRoot)) {
    // Try 'Documents' first
    let docsPath = path.join(oneDriveRoot, 'Documents');
    if (!fs.existsSync(docsPath)) {
      // Try 'Tài liệu'
      const vnDocsPath = path.join(oneDriveRoot, 'Tài liệu');
      if (fs.existsSync(vnDocsPath)) {
        docsPath = vnDocsPath;
      }
    }

    if (fs.existsSync(docsPath)) {
      const gameVaultPath = path.join(docsPath, 'GameVault');
      if (!fs.existsSync(gameVaultPath)) {
        try {
          fs.mkdirSync(gameVaultPath, { recursive: true });
        } catch (err) {
          console.error('Error creating GameVault directory in OneDrive subfolder:', err);
          return path.join(defaultDocs, 'GameVault');
        }
      }
      return gameVaultPath;
    }

    // Fallback: OneDrive root
    const gameVaultPath = path.join(oneDriveRoot, 'GameVault');
    if (!fs.existsSync(gameVaultPath)) {
      try {
        fs.mkdirSync(gameVaultPath, { recursive: true });
      } catch (err) {
        console.error('Error creating GameVault directory in OneDrive root:', err);
      }
    }
    return gameVaultPath;
  }

  // 3. Fallback to default local Documents folder
  const gameVaultPath = path.join(defaultDocs, 'GameVault');
  if (!fs.existsSync(gameVaultPath)) {
    try {
      fs.mkdirSync(gameVaultPath, { recursive: true });
    } catch (err) {
      console.error('Error creating GameVault directory in local Documents:', err);
      return USER_DATA_PATH;
    }
  }
  return gameVaultPath;
}

const DB_DIR = getDatabaseDir();
const GAMES_FILE = path.join(DB_DIR, 'games.json');

// Load environment variables from .env if it exists
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const parts = trimmed.split('=');
          if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
            process.env[key] = val;
          }
        }
      });
    } catch (err) {
      console.error('Error loading .env file:', err);
    }
  }
}

// Simple CSV Parser for importing playing.csv
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (i + 1 < line.length && line[i+1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function importCSVGames() {
  const csvPath = path.join(__dirname, 'tham khảo', 'playing.csv');
  if (!fs.existsSync(csvPath)) return [];

  const importedGames = [];
  try {
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    if (lines.length <= 1) return []; // Only header or empty
    
    const headers = parseCSVLine(lines[0]);
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < headers.length) continue;
      
      const gameObj = {};
      headers.forEach((header, idx) => {
        gameObj[header.trim()] = values[idx];
      });

      if (!gameObj.game) continue;

      // Clean release date
      let released = '';
      if (gameObj.release_date) {
        try {
          const dates = JSON.parse(gameObj.release_date.replace(/""/g, '"'));
          if (dates && dates.length > 0) {
            // Match date string like "Oct 27, 2009"
            const match = dates[0].match(/([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/);
            if (match) {
              const d = new Date(match[1]);
              if (!isNaN(d.getTime())) {
                released = d.toISOString().split('T')[0];
              }
            }
          }
        } catch (e) {
          released = '';
        }
      }

      // Clean genres
      let genres = [];
      if (gameObj.genres) {
        try {
          genres = JSON.parse(gameObj.genres.replace(/""/g, '"'));
        } catch (e) {
          genres = [];
        }
      }

      // Add to imported list
      importedGames.push({
        id: parseInt(gameObj.id) || (100000 + i),
        name: gameObj.game,
        background_image: '',
        genres: genres,
        released: released,
        metacritic: gameObj.rating ? Math.round(parseFloat(gameObj.rating) * 10) : null,
        status: 'playing',
        playingHours: 0,
        startDate: new Date().toISOString().split('T')[0],
        notes: 'Được nhập tự động từ playing.csv',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  } catch (err) {
    console.error('Error parsing playing.csv:', err);
  }
  return importedGames;
}

// Initialize files if they don't exist
function initStorage() {
  loadEnv();

  if (!fs.existsSync(USER_DATA_PATH)) {
    fs.mkdirSync(USER_DATA_PATH, { recursive: true });
  }

  // Set API Key from env if config doesn't exist
  if (!fs.existsSync(CONFIG_FILE)) {
    const defaultKey = process.env.RAWG_API_KEY || '';
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ apiKey: defaultKey }, null, 2), 'utf-8');
  }

  // Migrate existing games.json from userData to OneDrive/Documents if needed
  const localGamesFile = path.join(USER_DATA_PATH, 'games.json');
  if (DB_DIR !== USER_DATA_PATH) {
    if (!fs.existsSync(GAMES_FILE) && fs.existsSync(localGamesFile)) {
      try {
        fs.copyFileSync(localGamesFile, GAMES_FILE);
        console.log('Successfully migrated games.json to OneDrive/Documents at:', GAMES_FILE);
      } catch (err) {
        console.error('Error migrating games.json to OneDrive/Documents:', err);
      }
    }
  }

  if (!fs.existsSync(GAMES_FILE) || fs.readFileSync(GAMES_FILE, 'utf-8').trim() === '[]') {
    // Populate with playing.csv games if available
    const csvGames = importCSVGames();
    fs.writeFileSync(GAMES_FILE, JSON.stringify(csvGames, null, 2), 'utf-8');
  }
}

function readConfig() {
  let config = { apiKey: '' };
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      config = JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading config file:', err);
  }

  // Always override with .env key if present
  if (process.env.RAWG_API_KEY && process.env.RAWG_API_KEY.trim() !== '') {
    config.apiKey = process.env.RAWG_API_KEY.trim();
  }

  return config;
}

function writeConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing config file:', err);
    return false;
  }
}

function readGames() {
  try {
    const data = fs.readFileSync(GAMES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading games file:', err);
    return [];
  }
}

function writeGames(games) {
  try {
    fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing games file:', err);
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1250,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0f172a',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('get-config', () => {
  const config = readConfig();
  return {
    ...config,
    isEnvLoaded: !!process.env.RAWG_API_KEY
  };
});

ipcMain.handle('save-config', (event, config) => {
  return writeConfig(config);
});

ipcMain.handle('get-games', () => {
  return readGames();
});

ipcMain.handle('save-games', (event, games) => {
  return writeGames(games);
});

ipcMain.handle('fetch-rawg', async (event, endpoint, params = {}) => {
  const config = readConfig();
  if (!config.apiKey || config.apiKey.trim() === '') {
    throw new Error('API_KEY_MISSING');
  }

  const url = new URL(`https://api.rawg.io/api/${endpoint}`);
  url.searchParams.append('key', config.apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      if (response.status === 401) {
        // Free-tier RAWG API keys do not have access to suggested, twitch, youtube, or movies endpoints.
        // Return empty results gracefully instead of throwing API_KEY_INVALID to avoid breaking the UI.
        const restrictedSuffixes = ['/suggested', '/twitch', '/youtube', '/movies'];
        if (restrictedSuffixes.some(suffix => endpoint.endsWith(suffix))) {
          console.warn(`RAWG endpoint '${endpoint}' is restricted on free-tier keys. Returning empty results.`);
          return { results: [], count: 0 };
        }
        throw new Error('API_KEY_INVALID');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`RAWG fetch error (${endpoint}):`, error.message);
    throw error;
  }
});

app.whenReady().then(() => {
  initStorage();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
