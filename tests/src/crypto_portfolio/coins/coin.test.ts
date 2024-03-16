import { assert, test } from "vitest";

import { runScenario, dhtSync, CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeDnaHash, fakeActionHash, fakeAgentPubKey, fakeEntryHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

import { createCoin, sampleCoin } from './common.js';

test('create Coin', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/crypto-portfolio-manager.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Alice creates a Coin
    const record: Record = await createCoin(alice.cells[0]);
    assert.ok(record);
  });
});

test('create and read Coin', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/crypto-portfolio-manager.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    const sample = await sampleCoin(alice.cells[0]);

    // Alice creates a Coin
    const record: Record = await createCoin(alice.cells[0], sample);
    assert.ok(record);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets the created Coin
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "coins",
      fn_name: "get_original_coin",
      payload: record.signed_action.hashed.hash,
    });
    assert.deepEqual(sample, decode((createReadOutput.entry as any).Present.entry) as any);

  });
});

test('create and update Coin', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/crypto-portfolio-manager.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Alice creates a Coin
    const record: Record = await createCoin(alice.cells[0]);
    assert.ok(record);
        
    const originalActionHash = record.signed_action.hashed.hash;
 
    // Alice updates the Coin
    let contentUpdate: any = await sampleCoin(alice.cells[0]);
    let updateInput = {
      original_coin_hash: originalActionHash,
      previous_coin_hash: originalActionHash,
      updated_coin: contentUpdate,
    };

    let updatedRecord: Record = await alice.cells[0].callZome({
      zome_name: "coins",
      fn_name: "update_coin",
      payload: updateInput,
    });
    assert.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
        
    // Bob gets the updated Coin
    const readUpdatedOutput0: Record = await bob.cells[0].callZome({
      zome_name: "coins",
      fn_name: "get_latest_coin",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    assert.deepEqual(contentUpdate, decode((readUpdatedOutput0.entry as any).Present.entry) as any);

    // Alice updates the Coin again
    contentUpdate = await sampleCoin(alice.cells[0]);
    updateInput = { 
      original_coin_hash: originalActionHash,
      previous_coin_hash: updatedRecord.signed_action.hashed.hash,
      updated_coin: contentUpdate,
    };

    updatedRecord = await alice.cells[0].callZome({
      zome_name: "coins",
      fn_name: "update_coin",
      payload: updateInput,
    });
    assert.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
        
    // Bob gets the updated Coin
    const readUpdatedOutput1: Record = await bob.cells[0].callZome({
      zome_name: "coins",
      fn_name: "get_latest_coin",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    assert.deepEqual(contentUpdate, decode((readUpdatedOutput1.entry as any).Present.entry) as any);

    // Bob gets all the revisions for Coin
    const revisions: Record[] = await bob.cells[0].callZome({
      zome_name: "coins",
      fn_name: "get_all_revisions_for_coin",
      payload: originalActionHash,
    });
    assert.equal(revisions.length, 3);
    assert.deepEqual(contentUpdate, decode((revisions[2].entry as any).Present.entry) as any);
  });
});

test('create and delete Coin', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/crypto-portfolio-manager.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    const sample = await sampleCoin(alice.cells[0]);

    // Alice creates a Coin
    const record: Record = await createCoin(alice.cells[0], sample);
    assert.ok(record);

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);


    // Alice deletes the Coin
    const deleteActionHash = await alice.cells[0].callZome({
      zome_name: "coins",
      fn_name: "delete_coin",
      payload: record.signed_action.hashed.hash,
    });
    assert.ok(deleteActionHash);

    // Wait for the entry deletion to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets the oldest delete for the Coin
    const oldestDeleteForCoin = await bob.cells[0].callZome({
      zome_name: "coins",
      fn_name: "get_oldest_delete_for_coin",
      payload: record.signed_action.hashed.hash,
    });
    assert.ok(oldestDeleteForCoin);
        
    // Bob gets the deletions for Coin
    const deletesForCoin = await bob.cells[0].callZome({
      zome_name: "coins",
      fn_name: "get_all_deletes_for_coin",
      payload: record.signed_action.hashed.hash,
    });
    assert.equal(deletesForCoin.length, 1);


  });
});
