import { CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeActionHash, fakeAgentPubKey, fakeEntryHash, fakeDnaHash } from '@holochain/client';



export async function sampleCoin(cell: CallableCell, partialCoin = {}) {
    return {
        ...{
	  id: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
	  name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
	  symbol: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
	  image: [10],
        },
        ...partialCoin
    };
}

export async function createCoin(cell: CallableCell, coin = undefined): Promise<Record> {
    return cell.callZome({
      zome_name: "coins",
      fn_name: "create_coin",
      payload: coin || await sampleCoin(cell),
    });
}

