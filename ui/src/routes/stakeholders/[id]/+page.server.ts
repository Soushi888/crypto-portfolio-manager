import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  return {
    // stakeholder: stakeholderModel.getStakeholder(params.id)
  };
};
