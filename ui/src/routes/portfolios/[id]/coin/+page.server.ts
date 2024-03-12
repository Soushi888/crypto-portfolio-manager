import coinModel from '@models/coin.model';
import type { PageServerLoad } from './$types';
import portfolioModel from '@models/portfolio.model';

export const load: PageServerLoad = async (request) => {
  const coinId = request.url.searchParams.get('coin_id');

  return {
    coin: coinId ? coinModel.getCoin(coinId) : null,
    portfolio: portfolioModel.getPortfolio(request.params.id)
  };
};
