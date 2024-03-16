import { coinsMarketsListLocalStorageStore } from '@stores/coins.store';
import ApiService from './ApiService';
import { get } from 'svelte/store';

export default class CoinGeckoApiService extends ApiService {
  /**
   * Base URL for the Alternative API.
   * @type {string}
   */
  private readonly baseUrl: string = 'https://api.coingecko.com/api/v3';

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
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1`,
        'coinsMarketData',
        false,
        5 * 60 * 1000
      );
      coinsMarketsListLocalStorageStore.set(data);
    } catch (e) {}
  }
}
