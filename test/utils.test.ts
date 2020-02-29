import { getHeaderCaseInsensitive } from '../src/utils';

describe('utils', () => {
  describe('getHeaderCaseInsensitive', () => {
    test('should return the header with no case sensitive', () => {
      const headers = { etag: 10 };
      expect(getHeaderCaseInsensitive('etag', headers)).toBe(10);
    });

    test('should return the header with no case sensitive', () => {
      const headers = { eTag: 10 };
      expect(getHeaderCaseInsensitive('etag', headers)).toBe(10);
    });

    test('should return the header with no case sensitive', () => {
      const headers = { ETAG: 10 };
      expect(getHeaderCaseInsensitive('etag', headers)).toBe(10);
    });

    test('should return undefined is not header found', () => {
      const headers = { ETAG: 10 };
      expect(getHeaderCaseInsensitive('etga', headers)).toBeUndefined();
    });

    test('should return undefined is not headers', () => {
      const headers = undefined;
      expect(getHeaderCaseInsensitive('etga', headers)).toBeUndefined();
    });
  });
});
