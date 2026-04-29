const axios = require('axios');

const API_KEY = '00634b6f9a574fca8de71fa70792dba4';
const PRAGMATA_ID = 452636;

async function checkScreenshots() {
    try {
        const url = `https://api.rawg.io/api/games/${PRAGMATA_ID}/screenshots?key=${API_KEY}&page_size=100`;
        console.log('Fetching:', url);
        const response = await axios.get(url);
        console.log('Count:', response.data.count);
        console.log('Results length:', response.data.results.length);
        console.log('Results:', response.data.results.map(r => r.id));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkScreenshots();
