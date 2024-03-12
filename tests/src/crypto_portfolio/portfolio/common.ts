import { CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeActionHash, fakeAgentPubKey, fakeEntryHash, fakeDnaHash } from '@holochain/client';



export async function sampleStakeholder(cell: CallableCell, partialStakeholder = {}) {
    return {
        ...{
	  name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
        ...partialStakeholder
    };
}

export async function createStakeholder(cell: CallableCell, stakeholder = undefined): Promise<Record> {
    return cell.callZome({
      zome_name: "portfolio",
      fn_name: "create_stakeholder",
      payload: stakeholder || await sampleStakeholder(cell),
    });
}

