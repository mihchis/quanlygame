import axios from 'axios';
import fs from 'fs';

const API_KEY = "00634b6f9a574fca8de71fa70792dba4";
const QUERY = "Blood and Wine";

async function testSearch() {
    try {
        const response = await axios.get(`https://api.rawg.io/api/games?key=${API_KEY}&search=${QUERY}`);
        fs.writeFileSync('rawg_search_dlc.json', JSON.stringify(response.data, null, 2));
        console.log("Search test saved to rawg_search_dlc.json");
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}

testSearch();
