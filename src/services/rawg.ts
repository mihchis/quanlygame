import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY;
const BASE_URL = "https://api.rawg.io/api";

if (!API_KEY) {
  console.warn("⚠️ RAWG API Key is missing! Check your .env.local file.");
} else {
  console.log(`✅ RAWG API Key detected (Length: ${API_KEY.length}):`, API_KEY.substring(0, 5) + "...");
}

const rawgApi = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
  },
});

// Add response interceptor to handle 401 globally
rawgApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("🚨 RAWG API 401 ERROR: API Key không hợp lệ. Vui lòng kiểm tra lại NEXT_PUBLIC_RAWG_API_KEY trong .env.local");
    }
    return Promise.reject(error);
  }
);

export const getTrendingGames = async (page = 1) => {
  const now = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(now.getMonth() - 1);
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  const response = await rawgApi.get("/games", {
    params: {
      dates: `${formatDate(lastMonth)},${formatDate(now)}`,
      ordering: "-added",
      page,
      page_size: 10,
    },
  });
  return response.data;
};

export const searchGames = async (query: string, page = 1, filters?: { genres?: string, platforms?: string }) => {
  const response = await rawgApi.get("/games", {
    params: {
      search: query,
      page,
      page_size: 15,
      ...(filters?.genres && { genres: filters.genres }),
      ...(filters?.platforms && { platforms: filters.platforms }),
    },
  });
  return response.data;
};

export const getGenres = async () => {
  const response = await rawgApi.get("/genres");
  return response.data;
};

export const getPlatforms = async () => {
  const response = await rawgApi.get("/platforms");
  return response.data;
};

export const getGameDetails = async (id: string | number) => {
  const response = await rawgApi.get(`/games/${id}`);
  return response.data;
};

export const getGameAchievements = async (id: string | number) => {
  let allResults: any[] = [];
  let page = 1;
  let hasNext = true;

  // Loop to fetch up to 1000 achievements (RAWG max page_size is usually 40)
  while (hasNext && allResults.length < 1000) {
    try {
      const response = await rawgApi.get(`/games/${id}/achievements`, {
        params: { page, page_size: 40 }
      });
      
      const results = response.data.results || [];
      if (results.length === 0) break;

      allResults = [...allResults, ...results];
      hasNext = !!response.data.next;
      page++;
      
      // Safety break to prevent infinite loops
      if (page > 25) break; 
    } catch (error) {
      console.error(`Error fetching achievements page ${page}:`, error);
      break;
    }
  }

  return { results: allResults };
};

export const getSuggestedGames = async (id: string | number) => {
  const response = await rawgApi.get(`/games/${id}/suggested`);
  return response.data;
};

export const getGameScreenshots = async (id: string | number) => {
  const response = await rawgApi.get(`/games/${id}/screenshots`, {
    params: { page_size: 100 }
  });
  return response.data;
};

export const getGameTrailers = async (id: string | number) => {
  const response = await rawgApi.get(`/games/${id}/movies`);
  return response.data;
};

export const getGameStores = async (id: string | number) => {
  const response = await rawgApi.get(`/games/${id}/stores`);
  return response.data;
};

export const getGameSeries = async (id: string | number) => {
  const response = await rawgApi.get(`/games/${id}/game-series`);
  return response.data;
};

export const getGameAdditions = async (id: string | number) => {
  const response = await rawgApi.get(`/games/${id}/additions`);
  return response.data;
};

export default rawgApi;
