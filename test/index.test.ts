import axiosETAGCache from '../src';
import axios from 'axios';
import * as nock from 'nock';

const USERS = [{ uuid: '123', name: 'John' }];
const TEST_ETAG = '123ABC';
const BASE_PATH = 'http://api.example.com';

function replyIfMatchEtag() {
  if (this.req.headers['if-none-match'] === TEST_ETAG) {
    return [200, USERS];
  }
  return [404, 'Invalid ETAG'];
}

function replyIfNotEtagHeaders() {
  if (!this.req.headers['if-none-match']) {
    return [200, USERS];
  }
  return [404, 'ETAG headers found'];
}

describe('Index', () => {
  test('should do the second request with a If-none-match header', done => {
    const call1 = nock(BASE_PATH).get('/users').reply(200, USERS, { Etag: TEST_ETAG });
    const call2 = nock(BASE_PATH).get('/users').reply(200, replyIfMatchEtag);
    axiosETAGCache(axios).get('http://api.example.com/users').then(() => {
      axiosETAGCache(axios).get('http://api.example.com/users').then(() => {
        expect(call1.isDone()).toBeTruthy();
        expect(call2.isDone()).toBeTruthy();
        done();
      }).catch(done);
    }).catch(done);
  });

  test('should works with normally when no etag is provided', done => {
    const call1 = nock(BASE_PATH).get('/actions').reply(200, USERS);
    const call2 = nock(BASE_PATH).get('/actions').reply(200, replyIfNotEtagHeaders);
    axiosETAGCache(axios).get('http://api.example.com/actions').then(() => {
      axiosETAGCache(axios).get('http://api.example.com/actions').then(() => {
        expect(call1.isDone()).toBeTruthy();
        expect(call2.isDone()).toBeTruthy();
        done();
      }).catch(done);
    }).catch(done);
  });

  test('not cacheable methods should works with normally - POST', done => {
    const call1 = nock(BASE_PATH).post('/model').reply(200, USERS);
    axiosETAGCache(axios).post('http://api.example.com/model').then(() => {
      expect(call1.isDone()).toBeTruthy();
      done();
    }).catch(done);
  });
});
