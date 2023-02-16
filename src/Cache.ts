export interface ConstructableCache<T> {
  new(...args: any): T;
}

export abstract class BaseCache {
  abstract get(key: string): CacheValue | undefined

  abstract set(key: string, value: CacheValue)

  abstract flushAll()

}

export class DefaultCache extends BaseCache {
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

export class LocalStorageCache extends BaseCache {
  flushAll() {
    for (let i = 0; i < localStorage.length; i++){
      const key = localStorage.key(i);
      if (key !== null && key.startsWith('aec-')) {
        localStorage.removeItem(key);
      }
    }
  }

  get(key: string): CacheValue | undefined {
    try {
      const payload: string | null = localStorage.getItem('aec-' + key);
      if (payload !== null) {
        return JSON.parse(payload);
      } else {
        return undefined;
      }
    } catch (e) {
      return undefined;
    }
  }

  set(key: string, value: CacheValue) {
    try {
      const payload = JSON.stringify(value);
      localStorage.setItem('aec-' + key, payload);
    } catch (e) {
      console.log(e);
    }
  }

}

export interface CacheValue {
  etag: string;
  value: any;
}

/**
 * The only instance of our Singleton
 */
let instance: ReturnType<typeof makeSingleton>;

let cache: BaseCache;

/**
 * Singleton supplies accessors using Revealing Module
 * pattern and we use generics, since we could reuse
 * this across multiple singletons
 *
 * Note: Object.freeze() not required due to type narrowing!
 */
const makeSingleton = (cacheClass: ConstructableCache<BaseCache>) => {
  /** Closure of the singleton's value to keep it private */
  cache = new cacheClass();
  /** Only the accessors are returned */
  return {
    get(uuid: string): CacheValue | undefined {
      return cache.get(uuid);
    },
    set(uuid: string, etag: string, value: any) {
      return cache.set(uuid, { etag, value });
    },
    reset() {
      cache.flushAll();
    }
  };
};

/**
 * Retrieves the only instance of the Singleton
 * and allows a once-only initialisation
 * (additional changes require the setValue accessor)
 */
export const getCacheInstance = (cacheClass: ConstructableCache<BaseCache>) => {
  if (!instance) {
    instance = makeSingleton(cacheClass);
    return instance;
  }
  return instance;
};
