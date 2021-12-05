const NodeGeocoder = require('node-geocoder')

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_KEY,
  formatter: null,
}

const geocoder = NodeGeocoder(options)

module.exports = geocoder

// ** NOTES **
// 31.1. https://www.npmjs.com/package/node-geocoder
