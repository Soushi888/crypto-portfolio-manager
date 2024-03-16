/**
 * ApiService class for handling API requests with caching functionality.
 * This class provides a mechanism to fetch data from a specified URL,
 * with the option to cache the response for a specified duration.
 */
export default class ApiService {
  /**
   * Reference to the fetch function, which can be either the browser's fetch API
   * or the SvelteKit Load function. This is used to make the actual HTTP requests.
   * @type {typeof fetch}
   */
  private fetch: typeof fetch;

  /**
   * Timestamp of the last fetch operation, used to enforce rate limits.
   * @type {number}
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
   * Fetches data from a specified URL with optional caching functionality.
   * If the data is already cached and the cache is still valid, it returns the cached data.
   * Otherwise, it makes a new fetch request and caches the response.
   *
   * @param {string} url - The URL to fetch data from.
   * @param {string} cacheKey - The key used to store and retrieve the cached data.
   * @param {string[]} [exeptionKeys=[]] - An array of cache keys that should bypass the cache and always fetch fresh data.
   * @param {number} [timeLimit=60000] - The time limit in milliseconds for which the cached data is considered valid.
   * @returns {Promise<any>} A promise that resolves with the fetched data.
   * @throws {Error} If the API call rate limit is exceeded or if the fetch request fails.
   */
  async fetchWithCache(
    url: string,
    cacheKey: string,
    exeptionKeys: string[] = [],
    timeLimit: number = 60 * 1000
  ): Promise<any> {
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
    const response = await this.fetch(url);
    console.log(`Fetched data from ${url}`);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
    return data;
  }
}
