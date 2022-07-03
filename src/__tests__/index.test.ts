import { axiosETAGCache, getCacheByAxiosConfig, resetCache } from '../index';
import nock from 'nock';
import { Cache } from '../Cache';
import axios from 'axios';

const USERS = [{ uuid: '123', name: 'John' }];
const TEST_ETAG_0 = '123ABC';
const TEST_ETAG_1 = '#123ABC';
const BASE_PATH = 'http://api.example.com';

function replyIfNoneMatchWithEtag(request, etag, results) {
  if (request.headers?.['if-none-match'] === etag) {
    return [200, results];
  }
  return [404, 'Invalid ETAG'];
}

function replyIfMatchEtag0(request) {
  replyIfNoneMatchWithEtag(request, TEST_ETAG_0, USERS);
}

function replyIfMatchEtag1(request) {
  replyIfNoneMatchWithEtag(request, TEST_ETAG_1, USERS);
}

function replyIfNotEtagHeaders(request) {
  if (!request.headers['if-none-match']) {
    return [200, USERS];
  }
  return [404, 'ETAG headers found'];
}

describe('Index', () => {
  describe('getCachedByAxiosConfig', () => {
    it('should returns undefined when no config url is registered', () => {
      const config = {};
      Cache.get = jest.fn();

      expect(getCacheByAxiosConfig(config)).toBeUndefined();
      expect(Cache.get).not.toBeCalled();
    });

    it('should call to the cache.get method if url is registered', () => {
      const config = { url: 'defined' };
      Cache.get = jest.fn();

      expect(getCacheByAxiosConfig(config)).toBeUndefined();
      expect(Cache.get).toBeCalled();
    });
  });

  it('should do the second request with a If-none-match header', done => {
    const call1 = nock(BASE_PATH).get('/users').reply(200, USERS, { Etag: TEST_ETAG_0 });
    const call2 = nock(BASE_PATH).get('/users').reply(200, function () {
      replyIfMatchEtag0(this.req);
    });
    axiosETAGCache(axios).get('http://api.example.com/users').then(() => {
      axiosETAGCache(axios).get('http://api.example.com/users').then(() => {
        expect(call1.isDone()).toBeTruthy();
        expect(call2.isDone()).toBeTruthy();
        done();
      }).catch(done);
    }).catch(done);
  });

  it('should works with normally when no etag is provided', done => {
    const call1 = nock(BASE_PATH).get('/actions').reply(200, USERS);
    const call2 = nock(BASE_PATH).get('/actions').reply(200, function () {
      replyIfNotEtagHeaders(this.req);
    });
    axiosETAGCache(axios).get('http://api.example.com/actions').then(() => {
      axiosETAGCache(axios).get('http://api.example.com/actions').then(() => {
        expect(call1.isDone()).toBeTruthy();
        expect(call2.isDone()).toBeTruthy();
        done();
      }).catch(done);
    }).catch(done);
  });

  it('should update the last ETAG value', done => {
    const call0 = nock(BASE_PATH).get('/actionsA').reply(200, USERS, { Etag: TEST_ETAG_0 });
    const call1 = nock(BASE_PATH).get('/actionsA').reply(200, USERS, { Etag: TEST_ETAG_1 });
    const call2 = nock(BASE_PATH).get('/actionsA').reply(200, replyIfMatchEtag1);
    axiosETAGCache(axios).get('http://api.example.com/actionsA').then(() => {
      axiosETAGCache(axios).get('http://api.example.com/actionsA').then(() => {
        axiosETAGCache(axios).get('http://api.example.com/actionsA').then(() => {
          expect(call0.isDone()).toBeTruthy();
          expect(call1.isDone()).toBeTruthy();
          expect(call2.isDone()).toBeTruthy();
          done();
        }).catch(done);
      }).catch(done);
    }).catch(done);
  });

  it('not cacheable methods should works with normally - POST', done => {
    const call1 = nock(BASE_PATH).post('/model').reply(200, USERS);
    axiosETAGCache(axios).post('http://api.example.com/model').then(() => {
      expect(call1.isDone()).toBeTruthy();
      done();
    }).catch(done);
  });

  it('should do second request without etag if cache was reset', done => {
    const call1 = nock(BASE_PATH).get('/users').reply(200, USERS, { Etag: TEST_ETAG_0 });
    const call2 = nock(BASE_PATH).get('/users').reply(200, function () {
      replyIfNotEtagHeaders(this.req);
    });
    axiosETAGCache(axios).get('http://api.example.com/users').then(() => {
      resetCache();
      axiosETAGCache(axios).get('http://api.example.com/users').then(() => {
        expect(call1.isDone()).toBeTruthy();
        expect(call2.isDone()).toBeTruthy();
        done();
      }).catch(done);
    }).catch(done);
  });
});
