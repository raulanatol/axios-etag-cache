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

## Allow POST requests

```js
const axiosWithETAGCache = axiosETAGCache(axios, {enablePost: true});

```



## External Storage
Example implementation using RXDB
```js
import { axiosETAGCache, BaseCache, CacheValue } from "axios-etag-cache";

const cacheSchema = {
  title: "response cache schema",
  version: 4,
  primaryKey: {
    key: "url",    
    fields: ["url"],     
    separator: "|",
  },
  type: "object",
  properties: {
    url: {
      type: "string", maxLength: 100, 
    }, 
    etag: {type: "string"},
    lastHitAt: {type: "number"}, 
    createdAt: {type: "number"}, 
    value: {type: "object"}
  },
  required: ["url", "etag", "value"],
  indexes: ["url"]
}

class RxDBStorageCache extends BaseCache {
  flushAll(): any {
  }

  async get(key: string): Promise<CacheValue | undefined> {
    const cache = (
      await db["responseCache"].findOne({
        selector: {url: key},
      }).exec())?.toJSON();
    if (cache) {
      const payload: CacheValue = {
        value: cache.value,
        etag: cache.etag,
        createdAt: cache.createdAt,
        lastHitAt: cache.lastHitAt
      } as CacheValue;
      return payload;
    }
    return undefined;
  }

  set(key: string, value: CacheValue): any {
    db["responseCache"].upsert({
      url: key,
      value: value.value,
      etag: value.etag,
      createdAt: value.createdAt,
      lastHitAt: value.lastHitAt,
    });
  }
}

const axiosWithETAGCache = axiosETAGCache(axios, {cacheClass: RxDBStorageCache});

```
