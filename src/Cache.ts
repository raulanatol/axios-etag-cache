export abstract class BaseCache {
  private cache = {};

  get(key: string): CacheValue | undefined {
    return this.cache[key];
  }

  set(key: string, value: CacheValue) {
    this.cache[key] = value;
  }

  flushAll() {
    this.cache = {};
  }
}

export class DefaultCache extends BaseCache {

}

export interface CacheValue {
  etag: string;
  value: any;
}

export class Cache {
  static instance: Cache;
  cache: BaseCache;

  static getInstance() {
    if (!this.instance) {
      this.instance = new Cache(new DefaultCache());
    }
    return this.instance;
  }

  static get(uuid: string): CacheValue | undefined {
    return this.getInstance().cache.get(uuid);
  }

  static set(uuid: string, etag: string, value: any) {
    return this.getInstance().cache.set(uuid, { etag, value });
  }

  static reset() {
    this.getInstance().cache.flushAll();
  }

  constructor(cache: BaseCache) {
    this.cache = cache;
  }
}
