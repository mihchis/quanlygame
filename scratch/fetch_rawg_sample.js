import axios from 'axios';
import fs from 'fs';

const API_KEY = "00634b6f9a574fca8de71fa70792dba4";
const GAME_ID = 28; // Red Dead Redemption 2

async function fetchSample() {
    try {
        const response = await axios.get(`https://api.rawg.io/api/games/${GAME_ID}?key=${API_KEY}`);
        fs.writeFileSync('rawg_sample_response.json', JSON.stringify(response.data, null, 2));
        console.log("Sample saved to rawg_sample_response.json");
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}

fetchSample();
