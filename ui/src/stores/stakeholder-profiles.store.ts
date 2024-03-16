import { writable } from 'svelte/store';
import hc from '@services/HolochainClientService';
import type { ActionHash, AgentPubKey, Link, Record } from '@holochain/client';
import { decodeRecords } from '@utils';

export const agentStakeholderProfiles = writable<StakeholderProfile[]>([]);
export const allStakeholderProfiles = writable<StakeholderProfile[]>([]);

export type StakeholderProfile = {
  name: string;
};

const zomeName = 'portfolio';

export async function createStakeholderProfile(stakeholderName: string): Promise<Record> {
  return await hc.callZome(zomeName, 'create_stakeholder_profile', {
    name: stakeholderName
  });
}

export async function getLatestStakeholderProfileRecord(
  original_stakeholder_profile_hash: ActionHash
): Promise<Record | null> {
  return await hc.callZome(
    zomeName,
    'get_latest_stakeholder_profile',
    original_stakeholder_profile_hash
  );
}

export async function getLatestStakeholderProfile(
  original_stakeholder_profile_hash: ActionHash
): Promise<StakeholderProfile | null> {
  const record = await getLatestStakeholderProfileRecord(original_stakeholder_profile_hash);

  return record ? decodeRecords([record])[0] : null;
}

export async function getAgentStakeholderProfilesRecord(agent: AgentPubKey): Promise<Record[]> {
  const agentStakeholderProfileLinks: Link[] = await hc.callZome(
    zomeName,
    'get_agent_stakeholder_profiles',
    agent
  );

  let agentProfileRecords: Record[] = [];
  for (const profileLink of agentStakeholderProfileLinks) {
    const profileRecord = await getLatestStakeholderProfileRecord(profileLink.target);
    if (profileRecord) agentProfileRecords.push(profileRecord);
  }
  return agentProfileRecords;
}

export async function storeAgentStakeholderProfiles(): Promise<void> {
  const agentPubKey = (await hc.getAppInfo())!.agent_pub_key;
  const agentStakeholderProfilesRecord = await getAgentStakeholderProfilesRecord(agentPubKey);

  agentStakeholderProfiles.set(
    decodeRecords(agentStakeholderProfilesRecord) as StakeholderProfile[]
  );
}

export async function getAllStakeholderProfilesLinks(): Promise<Link[]> {
  return hc.callZome(zomeName, 'get_all_stakeholder_profiles', null);
}

export async function getAllStakeholderProfilesRecords(): Promise<Record[]> {
  const profilesLinks: Link[] = await getAllStakeholderProfilesLinks();

  let profilesRecords: Record[] = [];

  for (const profileLink of profilesLinks) {
    const record = await getLatestStakeholderProfileRecord(profileLink.target);
    if (record) profilesRecords.push(record);
  }

  return profilesRecords;
}

export async function storeAllStakeholderProfiles(): Promise<void> {
  const profilesRecords: Record[] = await getAllStakeholderProfilesRecords();

  allStakeholderProfiles.set(decodeRecords(profilesRecords));
}

export async function updateStakeholderProfile(
  agent: AgentPubKey,
  updated_stakeholder_profile: StakeholderProfile
): Promise<Record> {
  const agentProfileLinks: Link[] = await hc.callZome(
    zomeName,
    'get_agent_stakeholder_profile',
    agent
  );

  if (agentProfileLinks.length === 0) throw new Error('Agent has no profile');

  const original_stakeholder_profile_hash = agentProfileLinks[0].target;
  const previous_stakeholder_profile_hash = (
    await getLatestStakeholderProfileRecord(original_stakeholder_profile_hash)
  )?.signed_action.hashed.hash;

  const newStakeholderProfileRecord = await hc.callZome(zomeName, 'update_stakeholder_profile', {
    original_stakeholder_profile_hash,
    previous_stakeholder_profile_hash,
    updated_stakeholder_profile
  });

  return newStakeholderProfileRecord;
}
