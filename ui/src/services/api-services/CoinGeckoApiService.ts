import {
  coinDataLocalStorageStore,
  coinsListLocalStorageStore,
  coinsMarketsListLocalStorageStore
} from '@stores/coins.store';
import ApiService from './apiService';

/**
 * CoinGeckoApiService class extends ApiService to provide specific methods for fetching
 * cryptocurrency data from the CoinGecko API.
 */
export default class CoinGeckoApiService extends ApiService {
  /**
   * @type {string} - The base URL for the CoinGecko API.
   */
  private readonly baseUrl: string = 'https://api.coingecko.com/api/v3';

  /**
   * @type {string[]} - An array of cache keys that should bypass the cache expiration check.
   */
  private readonly exeptionKeys: string[] = ['coinsList'];

  /**
   * Constructor for the CoinGeckoApiService class.
   *
   * @param {typeof fetch} fetchFunction - The fetch function reference from the browser or SvelteKit Load function.
   */
  constructor(fetchFunction: typeof fetch) {
    super(fetchFunction);
  }

  /**
   * Asynchronously fetches coin data for a specific coin ID and stores it in a local storage store.
   * The method uses the fetchWithCache method to ensure data is fetched and cached according to the caching rules.
   *
   * @param {string} coinId - The ID of the coin to fetch data for.
   * @return {Promise<void>} A Promise that resolves when the data is fetched and stored.
   */
  async getCoinData(coinId: string): Promise<void> {
    try {
      const data = await this.fetchWithCache(
        `${this.baseUrl}/coins/${coinId}?localization=false&community_data=false&developer_data=false&sparkline=true`,
        `coinData-${coinId}`
      );
      coinDataLocalStorageStore.set(data);
    } catch (e) {}
  }

  /**
   * Asynchronously fetches a list of all coins and stores it in a local storage store.
   * The method uses the fetchWithCache method to ensure data is fetched and cached according to the caching rules.
   * This method specifically utilizes `this.exeptionKeys` to bypass the cache expiration check for the 'coinsList' cache key.
   *
   * @return {Promise<void>} A Promise that resolves when the data is fetched and stored.
   */
  async getCoinsList(): Promise<void> {
    console.log('fetching coins list');

    try {
      const data = await this.fetchWithCache(
        `${this.baseUrl}/coins/list?include_platform=true`,
        'coinsList',
        this.exeptionKeys
      );
      coinsListLocalStorageStore.set(data);
    } catch (e) {}
  }

  /**
   * Asynchronously fetches coins market data and stores it in a local storage store.
   * The method uses the fetchWithCache method to ensure data is fetched and cached according to the caching rules.
   *
   * @return {Promise<void>} A Promise that resolves when the data is fetched and stored.
   */
  async getCoinsMarketData(): Promise<void> {
    try {
      const data = await this.fetchWithCache(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1`,
        'coinsMarketData'
      );
      coinsMarketsListLocalStorageStore.set(data);
    } catch (e) {}
  }
}
