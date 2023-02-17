import {axiosETAGCacheOptions, cyrb53, getHeaderCaseInsensitive} from './utils';
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { DefaultCache, getCacheInstance } from './Cache';

let Cache;
let cacheableMethods = ['GET', 'HEAD'];

function isCacheableMethod(config: AxiosRequestConfig) {
  if (!config.method) {
    return false;
  }
  return ~cacheableMethods.indexOf(config.method.toUpperCase());
}

function getUrlByAxiosConfig(config: AxiosRequestConfig) {
  return config.url;
}

export const getCacheByAxiosConfig = async (config: AxiosRequestConfig) => {
  const url = getUrlByAxiosConfig(config);
  if (url) {
    if (config.data) {
      const hash = cyrb53(config.data);
      return await Cache.get(hash + url);
    } else {
      return await Cache.get(url);
    }
  }
  return undefined;
};

async function requestInterceptor(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
  if (isCacheableMethod(config)) {
    const url = getUrlByAxiosConfig(config);
    if (!url) {
      return Promise.reject(config);
    }
    let lastCachedResult;
    if (config.data) {
      try {
        const hash = cyrb53(JSON.stringify(config.data));
        lastCachedResult = await Cache.get(hash + url);
      } catch (e) {
        console.error(e);
      }
    } else {
      lastCachedResult = await Cache.get(url);
    }

    if (lastCachedResult) {
      config.headers = { ...config.headers, 'If-None-Match': lastCachedResult.etag };
    }
  }
  return Promise.resolve(config);
}

async function responseInterceptor(response: AxiosResponse): Promise<AxiosResponse> {
  if (isCacheableMethod(response.config)) {
    const responseETAG = getHeaderCaseInsensitive('etag', response.headers);
    if (responseETAG) {
      const url = getUrlByAxiosConfig(response.config);
      if (!url) {
        return Promise.reject(null);
      }
      if (response.config.data) {
        try {
          const hash = cyrb53(response.config.data);
          Cache.set(hash + url, responseETAG, response.data);
        } catch (e) {
          console.error(e);
        }
      } else {
        Cache.set(url, responseETAG, response.data);
      }

    }
  }
  return Promise.resolve(response);
}

async function responseErrorInterceptor(error: AxiosError): Promise<AxiosError|AxiosResponse> {
  if (error.response && error.response.status === 304) {
    const getCachedResult = await getCacheByAxiosConfig(error.response.config);
    if (!getCachedResult) {
      return Promise.reject(error);
    }
    const newResponse: AxiosResponse = error.response;
    newResponse.status = 200;
    newResponse.data = getCachedResult.value;
    return Promise.resolve(newResponse);
  }
  return Promise.reject(error);
}

export async function resetCache() {
  await Cache.reset();
}

export function axiosETAGCache(axiosInstance: AxiosInstance, options?: axiosETAGCacheOptions): AxiosInstance {
  if (options?.cacheClass) {
    Cache = getCacheInstance(options.cacheClass);
  } else {
    Cache = getCacheInstance(DefaultCache);
  }

  if (options?.enablePost === true) {
    cacheableMethods.push('POST');
  }

  axiosInstance.interceptors.request.use(requestInterceptor);
  axiosInstance.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

  return axiosInstance;
}
