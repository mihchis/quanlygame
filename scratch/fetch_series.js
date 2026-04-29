import axios from 'axios';
import fs from 'fs';

const API_KEY = "00634b6f9a574fca8de71fa70792dba4";
const GAME_ID = 28; // Red Dead Redemption 2

async function fetchSeries() {
    try {
        const response = await axios.get(`https://api.rawg.io/api/games/${GAME_ID}/game-series?key=${API_KEY}`);
        fs.writeFileSync('rawg_series_sample.json', JSON.stringify(response.data, null, 2));
        console.log("Series sample saved to rawg_series_sample.json");
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}

fetchSeries();
