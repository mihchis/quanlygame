const axios = require('axios');

const API_KEY = '00634b6f9a574fca8de71fa70792dba4';
const PRAGMATA_ID = 452636;

async function checkMoreData() {
    try {
        // Check main details
        const detailsUrl = `https://api.rawg.io/api/games/${PRAGMATA_ID}?key=${API_KEY}`;
        console.log('Fetching Details:', detailsUrl);
        const details = await axios.get(detailsUrl);
        console.log('Short Screenshots in Details:', details.data.short_screenshots ? details.data.short_screenshots.length : 'N/A');

        // Check search results (some games have more in search)
        const searchUrl = `https://api.rawg.io/api/games?key=${API_KEY}&search=Pragmata`;
        console.log('Fetching Search:', searchUrl);
        const search = await axios.get(searchUrl);
        const pragmata = search.data.results.find(r => r.id === PRAGMATA_ID);
        if (pragmata) {
            console.log('Short Screenshots in Search:', pragmata.short_screenshots ? pragmata.short_screenshots.length : 'N/A');
            console.log('Search Results Names:', search.data.results.map(r => r.name));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkMoreData();
