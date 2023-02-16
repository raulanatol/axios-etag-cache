
import { axiosETAGCacheOptions, getHeaderCaseInsensitive } from './utils';
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {DefaultCache, getCacheInstance} from './Cache';

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

export const getCacheByAxiosConfig = (config: AxiosRequestConfig) => {
  const url = getUrlByAxiosConfig(config);
  if (url) {
    return Cache.get(url);
  }
  return undefined;
};

function requestInterceptor(config: AxiosRequestConfig) {
  if (isCacheableMethod(config)) {
    const url = getUrlByAxiosConfig(config);
    if (!url) {
      return undefined;
    }
    const lastCachedResult = Cache.get(url);
    if (lastCachedResult) {
      config.headers = { ...config.headers, 'If-None-Match': lastCachedResult.etag };
    }
  }
  return config;
}

function responseInterceptor(response: AxiosResponse) {
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

function responseErrorInterceptor(error: AxiosError) {
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

export function resetCache() {
  Cache.reset();
}

export function axiosETAGCache(axiosInstance: AxiosInstance, options?: axiosETAGCacheOptions): AxiosInstance {
  if (options?.cacheClass) {
    Cache = getCacheInstance(options.cacheClass);
  } else {
    Cache = getCacheInstance(DefaultCache);
  }

  axiosInstance.interceptors.request.use(requestInterceptor);
  axiosInstance.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

  return axiosInstance;
}
