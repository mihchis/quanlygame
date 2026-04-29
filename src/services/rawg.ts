import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY;
const BASE_URL = "https://api.rawg.io/api";

const rawgApi = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
  },
});

export const searchGames = async (query: string, page = 1) => {
  const response = await rawgApi.get("/games", {
    params: {
      search: query,
      page,
      page_size: 20,
    },
  });
  return response.data;
};

export const getGameDetails = async (id: string | number) => {
  const response = await rawgApi.get(`/games/${id}`);
  return response.data;
};

export const getGameAchievements = async (id: string | number) => {
  const response = await rawgApi.get(`/games/${id}/achievements`);
  return response.data;
};

export default rawgApi;
