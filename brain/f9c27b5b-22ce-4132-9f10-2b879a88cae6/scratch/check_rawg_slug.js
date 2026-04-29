const axios = require('axios');

const API_KEY = '00634b6f9a574fca8de71fa70792dba4';

async function checkSlug() {
    try {
        const url = `https://api.rawg.io/api/games/pragmata/screenshots?key=${API_KEY}`;
        console.log('Fetching by slug:', url);
        const response = await axios.get(url);
        console.log('Count:', response.data.count);
        console.log('Results length:', response.data.results.length);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkSlug();
