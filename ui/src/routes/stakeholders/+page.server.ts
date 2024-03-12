import stakeholderModel from '@models/stakeholder.model';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({}) => {
  return {
    stakeholders: stakeholderModel.getAllStakeholders()
  };
};

export const actions: Actions = {
  createStakeholder: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name') as string;

    const result = stakeholderModel.createStakeholder(name);

    return {
      status: 200,
      result
    };
  },
  renameStakeholder: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;

    const result = stakeholderModel.renameStakeholder(id, name);

    return {
      status: 200,
      result
    };
  },
  deleteStakeholder: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    const result = stakeholderModel.deleteStakeholder(id);

    return {
      status: 200,
      result
    };
  }
};
