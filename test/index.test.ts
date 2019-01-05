import axiosETAGCache from '../src';
import * as nock from 'nock';

const USERS = [{ uuid: '123', name: 'John' }];
const TEST_ETAG_0 = '123ABC';
const TEST_ETAG_1 = '#123ABC';
const BASE_PATH = 'http://api.example.com';

function replyIfNoneMatchWithEtag(request, etag, results) {
  if (request.headers['if-none-match'] === etag) {
    return [200, results];
  }
  return [404, 'Invalid ETAG'];
}

function replyIfMatchEtag0() {
  replyIfNoneMatchWithEtag(this.req, TEST_ETAG_0, USERS);
}

function replyIfMatchEtag1() {
  replyIfNoneMatchWithEtag(this.req, TEST_ETAG_1, USERS);
}

function replyIfNotEtagHeaders() {
  if (!this.req.headers['if-none-match']) {
    return [200, USERS];
  }
  return [404, 'ETAG headers found'];
}

describe('Index', () => {
  test('should do the second request with a If-none-match header', done => {
    const call1 = nock(BASE_PATH).get('/users').reply(200, USERS, { Etag: TEST_ETAG_0 });
    const call2 = nock(BASE_PATH).get('/users').reply(200, replyIfMatchEtag0);
    axiosETAGCache().get('http://api.example.com/users').then(() => {
      axiosETAGCache().get('http://api.example.com/users').then(() => {
        expect(call1.isDone()).toBeTruthy();
        expect(call2.isDone()).toBeTruthy();
        done();
      }).catch(done);
    }).catch(done);
  });

  test('should works with normally when no etag is provided', done => {
    const call1 = nock(BASE_PATH).get('/actions').reply(200, USERS);
    const call2 = nock(BASE_PATH).get('/actions').reply(200, replyIfNotEtagHeaders);
    axiosETAGCache().get('http://api.example.com/actions').then(() => {
      axiosETAGCache().get('http://api.example.com/actions').then(() => {
        expect(call1.isDone()).toBeTruthy();
        expect(call2.isDone()).toBeTruthy();
        done();
      }).catch(done);
    }).catch(done);
  });

  test('should update the last ETAG value', done => {
    const call0 = nock(BASE_PATH).get('/actionsA').reply(200, USERS, { Etag: TEST_ETAG_0 });
    const call1 = nock(BASE_PATH).get('/actionsA').reply(200, USERS, { Etag: TEST_ETAG_1 });
    const call2 = nock(BASE_PATH).get('/actionsA').reply(200, replyIfMatchEtag1);
    axiosETAGCache().get('http://api.example.com/actionsA').then(() => {
      axiosETAGCache().get('http://api.example.com/actionsA').then(() => {
        axiosETAGCache().get('http://api.example.com/actionsA').then(() => {
          expect(call0.isDone()).toBeTruthy();
          expect(call1.isDone()).toBeTruthy();
          expect(call2.isDone()).toBeTruthy();
          done();
        }).catch(done);
      }).catch(done);
    }).catch(done);
  });

  test('not cacheable methods should works with normally - POST', done => {
    const call1 = nock(BASE_PATH).post('/model').reply(200, USERS);
    axiosETAGCache().post('http://api.example.com/model').then(() => {
      expect(call1.isDone()).toBeTruthy();
      done();
    }).catch(done);
  });
});
