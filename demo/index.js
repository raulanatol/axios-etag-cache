const { axiosETAGCache } = require('../dist/main.js');
const axios = require('axios');

axiosETAGCache(axios)
  .get('http://example.com')
  .then(console.log)
  .catch(console.error);
