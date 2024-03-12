import { coinDataLocalStorageStore, coinsListLocalStorageStore } from '@stores/coins.store';

/**
 * ApiService class for handling API requests with caching functionality.
 */
export default class ApiService {
  /**
   * @type {RequestInit} - The default request options for fetch requests.
   */
  private readonly requestInit: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      mode: 'no-cors'
    }
  };
  /**
   * @type {typeof fetch} - The fetch function reference from the browser or SvelteKit Load function.
   */
  private fetch: typeof fetch;

  /**
   * @type {number} - Timestamp of the last fetch operation.
   */
  private lastFetchTime: number = 0;

  /**
   * Constructor for the ApiService class.
   *
   * @param {typeof fetch} fetchFunction - The fetch function reference from the browser or SvelteKit Load function.
   */
  constructor(fetchFunction: typeof fetch) {
    this.fetch = fetchFunction;
  }

  /**
   * Fetches data from a given URL with caching functionality.
   *
   * @param {string} url - The URL to fetch data from.
   * @param {string} cacheKey - The key to use for caching the fetched data.
   * @param {string[]} exeptionKeys - An array of cache keys that should bypass the cache expiration check.
   * @returns {Promise<any>} - A promise that resolves with the fetched data.
   * @throws {Error} - Throws an error if the fetch operation fails or if the API call rate limit is exceeded.
   */
  async fetchWithCache(url: string, cacheKey: string, exeptionKeys: string[] = []): Promise<any> {
    const timeLimit = 60 * 1000;
    const now = Date.now();
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      console.log(`Cached data found for ${url}`);
      console.log(JSON.parse(cachedData));

      if (now - timestamp < timeLimit || exeptionKeys.includes(cacheKey)) {
        console.log(`Using cached data for ${url}`);
        return data;
      }
    }

    if (!cachedData && now - this.lastFetchTime < timeLimit) {
      return Promise.reject(new Error('API call rate limit exceeded'));
    }

    this.lastFetchTime = now;
    const response = await this.fetch(url, this.requestInit);
    console.log(`Fetched data from ${url}`);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
    return data;
  }
}
