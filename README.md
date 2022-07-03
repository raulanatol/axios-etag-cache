# axios-etag-cache

Axios etag interceptor to enable If-None-Match request with ETAG support

## Basic use:

```js
const axios = require('axios');
const { axiosETAGCache } = require('axios-etag-cache');

// Apply the axios ETAG interceptor
const axiosWithETAGCache = axiosETAGCache(axios);

axiosWithETAGCache
  .get('http://example.com')
  .then(console.log)
  .catch(console.error);
```
