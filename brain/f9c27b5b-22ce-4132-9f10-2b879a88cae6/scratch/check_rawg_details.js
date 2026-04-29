const axios = require('axios');

const API_KEY = '00634b6f9a574fca8de71fa70792dba4';

async function checkDetails() {
    try {
        const url = `https://api.rawg.io/api/games/pragmata?key=${API_KEY}`;
        const response = await axios.get(url);
        console.log('Keys:', Object.keys(response.data));
        if (response.data.short_screenshots) {
            console.log('short_screenshots length:', response.data.short_screenshots.length);
        }
        // Sometimes screenshots are in 'results' of a nested object? No.
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkDetails();
