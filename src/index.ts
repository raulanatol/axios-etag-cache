import { Cache } from './Cache';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

function isCacheableMethod(config: AxiosRequestConfig) {
  return ~['GET', 'HEAD'].indexOf(config.method.toUpperCase());
}

function getUUIDByAxiosConfig(config: AxiosRequestConfig) {
  return config.url;
}

function getCacheByAxiosConfig(config: AxiosRequestConfig) {
  return Cache.get(getUUIDByAxiosConfig(config));
}

function requestInterceptor(config: AxiosRequestConfig) {
  if (isCacheableMethod(config)) {
    const uuid = getUUIDByAxiosConfig(config);
    const lastCachedResult = Cache.get(uuid);
    if (lastCachedResult) {
      config.headers = { ...config.headers, 'If-None-Match': lastCachedResult.etag };
    }
  }
  return config;
}

function responseInterceptor(response: AxiosResponse) {
  if (isCacheableMethod(response.config)) {
    const responseETAG = response.headers.etag;
    if (responseETAG) {
      Cache.set(getUUIDByAxiosConfig(response.config), responseETAG, response.data);
    }
  }
  return response;
}

function responseErrorInterceptor(error: AxiosError) {
  if (error.response.status === 304) {
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

export default function axiosETAGCache() {
  axios.interceptors.request.use(requestInterceptor);
  axios.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

  return axios;
}
