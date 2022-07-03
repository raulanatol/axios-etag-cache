class BaseCache {
    constructor() {
        this.cache = {};
    }
    get(key) {
        return this.cache[key];
    }
    set(key, value) {
        this.cache[key] = value;
    }
    flushAll() {
        this.cache = {};
    }
}
class DefaultCache extends BaseCache {
}
class Cache {
    constructor(cache) {
        this.cache = cache;
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new Cache(new DefaultCache());
        }
        return this.instance;
    }
    static get(uuid) {
        return this.getInstance().cache.get(uuid);
    }
    static set(uuid, etag, value) {
        return this.getInstance().cache.set(uuid, { etag, value });
    }
    static reset() {
        this.getInstance().cache.flushAll();
    }
}

const byLowerCase = toFind => value => toLowerCase(value) === toFind;
const toLowerCase = value => value.toLowerCase();
const getKeys = headers => Object.keys(headers);
const getHeaderCaseInsensitive = (headerName, headers = {}) => {
    const key = getKeys(headers).find(byLowerCase(headerName));
    return key ? headers[key] : undefined;
};

function isCacheableMethod(config) {
    if (!config.method) {
        return false;
    }
    return ~['GET', 'HEAD'].indexOf(config.method.toUpperCase());
}
function getUrlByAxiosConfig(config) {
    return config.url;
}
const getCacheByAxiosConfig = (config) => {
    const url = getUrlByAxiosConfig(config);
    if (url) {
        return Cache.get(url);
    }
    return undefined;
};
function requestInterceptor(config) {
    if (isCacheableMethod(config)) {
        const url = getUrlByAxiosConfig(config);
        if (!url) {
            return undefined;
        }
        const lastCachedResult = Cache.get(url);
        if (lastCachedResult) {
            config.headers = Object.assign(Object.assign({}, config.headers), { 'If-None-Match': lastCachedResult.etag });
        }
    }
    return config;
}
function responseInterceptor(response) {
    if (isCacheableMethod(response.config)) {
        const responseETAG = getHeaderCaseInsensitive('etag', response.headers);
        if (responseETAG) {
            const url = getUrlByAxiosConfig(response.config);
            if (!url) {
                return null;
            }
            Cache.set(url, responseETAG, response.data);
        }
    }
    return response;
}
function responseErrorInterceptor(error) {
    if (error.response && error.response.status === 304) {
        const getCachedResult = getCacheByAxiosConfig(error.response.config);
        if (!getCachedResult) {
            return Promise.reject(error);
        }
        const newResponse = error.response;
        newResponse.status = 200;
        newResponse.data = getCachedResult.value;
        return Promise.resolve(newResponse);
    }
    return Promise.reject(error);
}
function resetCache() {
    Cache.reset();
}
function axiosETAGCache(axiosInstance) {
    axiosInstance.interceptors.request.use(requestInterceptor);
    axiosInstance.interceptors.response.use(responseInterceptor, responseErrorInterceptor);
    return axiosInstance;
}

export { BaseCache, Cache, DefaultCache, axiosETAGCache, getCacheByAxiosConfig, resetCache };
//# sourceMappingURL=index.esm.js.map
