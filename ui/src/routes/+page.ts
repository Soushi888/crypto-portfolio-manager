import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { coinsMarketsListLocalStorageStore } from '@stores/coins.store';
import CoinGeckoApiService from '@services/api-services/CoinGeckoApiService';

export const load: PageLoad = async ({ fetch }) => {
  const coinGeckoApiService = new CoinGeckoApiService(fetch); //
  await coinGeckoApiService.getCoinsMarketData();

  return {
    coinsList: get(coinsMarketsListLocalStorageStore)
  };
};
