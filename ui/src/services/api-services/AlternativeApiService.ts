import { coinsMarketsListLocalStorageStore } from '@stores/coins.store';
import ApiService from './ApiService';

/**
 * AltrenativeApiService class extends ApiService to provide specific functionality
 * for fetching cryptocurrency market data from the Alternative API.
 * This class utilizes caching to reduce the number of API calls.
 */
export default class AltrenativeApiService extends ApiService {
  /**
   * Base URL for the Alternative API.
   * @type {string}
   */
  private readonly baseUrl: string = 'https://api.alternative.me/v2';

  /**
   * Constructor for the AltrenativeApiService class.
   * Initializes the base URL and passes the fetch function to the superclass.
   *
   * @param {typeof fetch} fetchFunction - The fetch function reference from the browser or SvelteKit Load function.
   */
  constructor(fetchFunction: typeof fetch) {
    super(fetchFunction);
  }

  /**
   * Fetches and caches cryptocurrency market data from the Alternative API.
   * The data is stored in the local storage under the key 'coinsMarketData'.
   *
   * @returns {Promise<void>} A promise that resolves when the data fetching and caching are complete.
   */
  async getCoinsMarketData(): Promise<void> {
    try {
      const data = await this.fetchWithCache(
        `${this.baseUrl}/ticker/?limit=100`,
        'coinsMarketData',
        [],
        5 * 60 * 1000
      );
      coinsMarketsListLocalStorageStore.set(Object.values(data.data));
    } catch (e) {}
  }
}
