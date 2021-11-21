# axios-etag-cache

Axios etag interceptor to enable If-None-Match request with ETAG support

## Basic use:

```js
const axios = require('axios');
const { axiosETAGCache } = require('axios-etag-cache');

axiosETAGCache(axios)
  .get('http://example.com')
  .then(console.log)
  .catch(console.error);
```
