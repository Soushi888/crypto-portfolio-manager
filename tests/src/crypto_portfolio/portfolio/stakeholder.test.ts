import { assert, test } from "vitest";

import { runScenario, dhtSync, CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeDnaHash, fakeActionHash, fakeAgentPubKey, fakeEntryHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

import { createStakeholder, sampleStakeholder } from './common.js';

test('create Stakeholder', async () => {
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

    // Alice creates a Stakeholder
    const record: Record = await createStakeholder(alice.cells[0]);
    assert.ok(record);
  });
});

test('create and read Stakeholder', async () => {
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

    const sample = await sampleStakeholder(alice.cells[0]);

    // Alice creates a Stakeholder
    const record: Record = await createStakeholder(alice.cells[0], sample);
    assert.ok(record);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets the created Stakeholder
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "portfolio",
      fn_name: "get_original_stakeholder",
      payload: record.signed_action.hashed.hash,
    });
    assert.deepEqual(sample, decode((createReadOutput.entry as any).Present.entry) as any);

  });
});

test('create and update Stakeholder', async () => {
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

    // Alice creates a Stakeholder
    const record: Record = await createStakeholder(alice.cells[0]);
    assert.ok(record);
        
    const originalActionHash = record.signed_action.hashed.hash;
 
    // Alice updates the Stakeholder
    let contentUpdate: any = await sampleStakeholder(alice.cells[0]);
    let updateInput = {
      original_stakeholder_hash: originalActionHash,
      previous_stakeholder_hash: originalActionHash,
      updated_stakeholder: contentUpdate,
    };

    let updatedRecord: Record = await alice.cells[0].callZome({
      zome_name: "portfolio",
      fn_name: "update_stakeholder",
      payload: updateInput,
    });
    assert.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
        
    // Bob gets the updated Stakeholder
    const readUpdatedOutput0: Record = await bob.cells[0].callZome({
      zome_name: "portfolio",
      fn_name: "get_latest_stakeholder",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    assert.deepEqual(contentUpdate, decode((readUpdatedOutput0.entry as any).Present.entry) as any);

    // Alice updates the Stakeholder again
    contentUpdate = await sampleStakeholder(alice.cells[0]);
    updateInput = { 
      original_stakeholder_hash: originalActionHash,
      previous_stakeholder_hash: updatedRecord.signed_action.hashed.hash,
      updated_stakeholder: contentUpdate,
    };

    updatedRecord = await alice.cells[0].callZome({
      zome_name: "portfolio",
      fn_name: "update_stakeholder",
      payload: updateInput,
    });
    assert.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
        
    // Bob gets the updated Stakeholder
    const readUpdatedOutput1: Record = await bob.cells[0].callZome({
      zome_name: "portfolio",
      fn_name: "get_latest_stakeholder",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    assert.deepEqual(contentUpdate, decode((readUpdatedOutput1.entry as any).Present.entry) as any);

    // Bob gets all the revisions for Stakeholder
    const revisions: Record[] = await bob.cells[0].callZome({
      zome_name: "portfolio",
      fn_name: "get_all_revisions_for_stakeholder",
      payload: originalActionHash,
    });
    assert.equal(revisions.length, 3);
    assert.deepEqual(contentUpdate, decode((revisions[2].entry as any).Present.entry) as any);
  });
});

test('create and delete Stakeholder', async () => {
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

    const sample = await sampleStakeholder(alice.cells[0]);

    // Alice creates a Stakeholder
    const record: Record = await createStakeholder(alice.cells[0], sample);
    assert.ok(record);

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);


    // Alice deletes the Stakeholder
    const deleteActionHash = await alice.cells[0].callZome({
      zome_name: "portfolio",
      fn_name: "delete_stakeholder",
      payload: record.signed_action.hashed.hash,
    });
    assert.ok(deleteActionHash);

    // Wait for the entry deletion to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets the oldest delete for the Stakeholder
    const oldestDeleteForStakeholder = await bob.cells[0].callZome({
      zome_name: "portfolio",
      fn_name: "get_oldest_delete_for_stakeholder",
      payload: record.signed_action.hashed.hash,
    });
    assert.ok(oldestDeleteForStakeholder);
        
    // Bob gets the deletions for Stakeholder
    const deletesForStakeholder = await bob.cells[0].callZome({
      zome_name: "portfolio",
      fn_name: "get_all_deletes_for_stakeholder",
      payload: record.signed_action.hashed.hash,
    });
    assert.equal(deletesForStakeholder.length, 1);


  });
});
