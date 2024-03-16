import { assert, test } from "vitest";
import {
  runScenario,
  dhtSync,
  CallableCell,
  Scenario,
  Player,
} from "@holochain/tryorama";
import {
  NewEntryAction,
  ActionHash,
  Record,
  AppBundleSource,
  fakeDnaHash,
  fakeActionHash,
  fakeAgentPubKey,
  fakeEntryHash,
  Link,
} from "@holochain/client";
import {
  createStakeholderProfile,
  decodeOutputs,
  getAgentStakeholderProfiles,
  getAllStakeholderProfiles,
  getLatestStakeholderProfile,
  getOriginalStakeholderProfile,
  sampleStakeholder,
  updateStakeholderProfile,
} from "./common.js";

const hAppPath = process.cwd() + "/../workdir/crypto-portfolio-manager.happ";
console.log("hAppPath", hAppPath);

const appSource = { appBundleSource: { path: hAppPath } };

async function runScenarioWithTwoAgents(
  callback: (scenario: Scenario, alice: Player, bob: Player) => Promise<void>
) {
  await runScenario(async (scenario) => {
    const [alice, bob] = await scenario.addPlayersWithApps([
      appSource,
      appSource,
    ]);
    await scenario.shareAllAgents();

    await callback(scenario, alice, bob);
  });
}

test("create and read Stakeholder profile", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    console.log("create and read Stakeholder profile");

    let sample = sampleStakeholder("Alice");

    // Alice creates a Stakeholder
    let record: Record = await createStakeholderProfile(alice.cells[0], sample);
    assert.ok(record);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets the created Stakeholder
    const createReadOutput: Record = await getOriginalStakeholderProfile(
      bob.cells[0],
      record.signed_action.hashed.hash
    );
    assert.deepEqual(sample, decodeOutputs([createReadOutput])[0]);

    // Alice get her Stakeholder profile
    const aliceProfiles: Link[] = await getAgentStakeholderProfiles(
      alice.cells[0],
      alice.agentPubKey
    );
    assert.deepEqual(
      aliceProfiles[0].target,
      createReadOutput.signed_action.hashed.hash
    );

    // Bob create a Stakeholder profile
    sample = sampleStakeholder("Bob");

    record = await createStakeholderProfile(bob.cells[0], sample);
    assert.ok(record);

    await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

    // Verify get_all_stakeholder_profiles
    const allStakeholderProfiles: Link[] = await getAllStakeholderProfiles(
      alice.cells[0]
    );

    assert.deepEqual(allStakeholderProfiles.length, 2);
  });
});

test("create and update Stakeholder profile", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    const sample = sampleStakeholder();

    // Alice creates a Stakeholder
    const record: Record = await createStakeholderProfile(
      alice.cells[0],
      sample
    );
    assert.ok(record);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Alice updates her Stakeholder profile
    const updateReadOutput: Record = await updateStakeholderProfile(
      alice.cells[0],
      record.signed_action.hashed.hash,
      record.signed_action.hashed.hash,
      { name: "Alicia" }
    );

    assert.ok(updateReadOutput);

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets the updated Stakeholder
    const aliceProfile: Record = await getLatestStakeholderProfile(
      bob.cells[0],
      record.signed_action.hashed.hash
    );

    assert.deepEqual(decodeOutputs([aliceProfile])[0], { name: "Alicia" });
  });
});
