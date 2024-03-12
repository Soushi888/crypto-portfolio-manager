import portfolioModel from '@models/portfolio.model';
import type { Actions, PageServerLoad } from './$types';
import stakeholderModel from '@models/stakeholder.model';

export const load: PageServerLoad = async () => {
  const portfolios = portfolioModel.getAllPortfolios();
  const stakeholders = stakeholderModel.getAllStakeholders();

  portfolios.forEach((portfolio) => {
    const portfolioStackholders = portfolioModel.getPortfolioStakeholders(portfolio.id!);
    portfolio.stakeholders = portfolioStackholders.map((stakeholder) => stakeholder.name);
  });

  return {
    portfolios,
    stakeholders
  };
};

export const actions: Actions = {
  async createPortfolio({ request }) {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const stakeholderId = formData.get('stakeholder') as string;

    const result = portfolioModel.createPortfolio(name, stakeholderId);

    return {
      status: 200,
      result
    };
  },
  async renamePortfolio({ request }) {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;

    const result = portfolioModel.renamePortfolio(id, name);

    return {
      status: 200,
      result
    };
  },
  async deletePortfolio({ request }) {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    const result = portfolioModel.deletePortfolio(id);

    return {
      status: 200,
      result
    };
  }
};
