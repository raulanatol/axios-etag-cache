import { axiosETAGCache } from 'axios-etag-cache';
import axios from 'axios';

axiosETAGCache(axios)
  .get('https://example.com')
  .then(console.log)
  .catch(console.error);
