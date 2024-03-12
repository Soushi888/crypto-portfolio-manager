import { localStorageStore } from '@skeletonlabs/skeleton';

type Coin = {
  id: string;
  name: string;
  symbol: string;
};

// Based on the CoinGecko API v3 endpoint : /coins/markets?vs_currency=usd
type CoinMarketData = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null;
  last_updated: string;
};

// Based on the CoinGecko API v3 endpoint : /coins/${coinId}?localization=false&community_data=false&developer_data=false&sparkline=true
type CoinData = {
  id: string;
  symbol: string;
  name: string;
  web_slug: string;
  asset_platform_id: string;
  platforms: { [key: string]: string };
  detail_platforms: {
    [key: string]: {
      decimal_places?: number;
      contract_address?: string;
    };
  };
  block_time_in_minutes: number;
  hashing_algorithm: string;
  categories: string[];
  description: { [key: string]: string };
  links: any;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  genesis_date: string;
  market_cap_rank: number;
  market_data: any;
};

export const coinDataLocalStorageStore = localStorageStore<CoinData | {}>('coinData', {});
export const coinsListLocalStorageStore = localStorageStore<Coin[]>('coinsList', []);
export const coinsMarketsListLocalStorageStore = localStorageStore<CoinMarketData[]>(
  'coinsMarketsList',
  []
);
