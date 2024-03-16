import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  // const portfolioCoinsList = coinModel.getAllPortfolioCoins(params.id);
  // const stakeholders = portfolioModel
  // .getPortfolioStakeholders(params.id)
  // .map((stakeholder) => stakeholder.name);
  return { portfolio: {}, stakeholders: [], coinsList: [] };
};

export const actions: Actions = {
  addCoin: async ({ request }) => {
    const formData = await request.formData();
    const portfolioId = formData.get('portfolio_id') as string;
    const coinName = formData.get('coin_name') as string;

    // const result = coinModel.addCoin({
    //   name: coinName,
    //   symbol: coinName,
    //   portfolio_id: portfolioId
    // });

    return {
      status: 200
      // result
    };
  },
  deleteCoin: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    // const result = coinModel.deleteCoin(id);

    return {
      status: 200
      // result
    };
  }
};
