import { CallableCell } from "@holochain/tryorama";
import {
  NewEntryAction,
  ActionHash,
  Record,
  AppBundleSource,
  fakeActionHash,
  fakeAgentPubKey,
  fakeEntryHash,
  fakeDnaHash,
  AgentPubKey,
  Link,
} from "@holochain/client";
import { decode } from "@msgpack/msgpack";

export type StakeholderProfile = {
  name: string;
};

export function decodeOutputs(records: Record[]): unknown[] {
  return records.map((r) => decode((r.entry as any).Present.entry));
}

export function sampleStakeholder(name: string = "Carol"): StakeholderProfile {
  return {
    name: name,
  };
}

export async function createStakeholderProfile(
  cell: CallableCell,
  stakeholder = undefined
): Promise<Record> {
  return cell.callZome({
    zome_name: "portfolio",
    fn_name: "create_stakeholder_profile",
    payload: stakeholder,
  });
}

export async function getLatestStakeholderProfile(
  cell: CallableCell,
  original_stakeholder_profile_hash: ActionHash
): Promise<Record> {
  return cell.callZome({
    zome_name: "portfolio",
    fn_name: "get_latest_stakeholder_profile",
    payload: original_stakeholder_profile_hash,
  });
}

export async function getOriginalStakeholderProfile(
  cell: CallableCell,
  original_stakeholder_profile_hash: ActionHash
): Promise<Record> {
  return cell.callZome({
    zome_name: "portfolio",
    fn_name: "get_original_stakeholder_profile",
    payload: original_stakeholder_profile_hash,
  });
}

export async function getAgentStakeholderProfiles(
  cell: CallableCell,
  author: AgentPubKey
): Promise<Link[]> {
  return cell.callZome({
    zome_name: "portfolio",
    fn_name: "get_agent_stakeholder_profiles",
    payload: author,
  });
}

export async function getAllStakeholderProfiles(
  cell: CallableCell
): Promise<Link[]> {
  return cell.callZome({
    zome_name: "portfolio",
    fn_name: "get_all_stakeholder_profiles",
    payload: null,
  });
}

export async function updateStakeholderProfile(
  cell: CallableCell,
  original_stakeholder_profile_hash: ActionHash,
  previous_stakeholder_profile_hash: ActionHash,
  updated_stakeholder_profile: StakeholderProfile
): Promise<Record> {
  return cell.callZome({
    zome_name: "portfolio",
    fn_name: "update_stakeholder_profile",
    payload: {
      original_stakeholder_profile_hash,
      previous_stakeholder_profile_hash,
      updated_stakeholder_profile,
    },
  });
}
