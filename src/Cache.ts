import * as NodeCache from 'node-cache';

export interface CacheValue {
  etag: string;
  value: any;
}

export class Cache {
  static instance: Cache;
  cache: NodeCache;

  static getInstance() {
    if (!this.instance) {
      this.instance = new Cache();
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

  constructor() {
    this.cache = new NodeCache();
  }
}
