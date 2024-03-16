import { localStorageStore } from '@skeletonlabs/skeleton';

type Coin = {
  id: string;
  name: string;
  symbol: string;
};

// Based on the Alternative API v2 endpoint : /ticker
export type CoinMarketData = {
  id: number;
  name: string;
  symbol: string;
  image: string;
  website_slug: string;
  rank: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  quotes: {
    USD: {
      price: number;
      volume_24h: number;
      market_cap: number;
      percentage_change_1h: number;
      percentage_change_24h: number;
      percentage_change_7d: number;
    };
  };
  last_updated: string;
};

// export const coinDataLocalStorageStore = localStorageStore<CoinData | {}>('coinData', {});
export const coinsListLocalStorageStore = localStorageStore<Coin[]>('coinsList', []);
export const coinsMarketsListLocalStorageStore = localStorageStore<CoinMarketData[]>(
  'coinsMarketsList',
  []
);
