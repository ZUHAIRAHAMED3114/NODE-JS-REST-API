const nodeGeoCoder = require('node-geocoder');

const option = {
    provider: process.env.GEOCODER_PROVIDER,
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}

const geoCoder = nodeGeoCoder(option);
module.exports = geoCoder;