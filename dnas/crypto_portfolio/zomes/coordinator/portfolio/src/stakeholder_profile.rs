use hdk::prelude::*;
use portfolio_integrity::*;

use crate::error;

#[hdk_extern]
pub fn create_stakeholder_profile(stakeholder: StakeholderProfile) -> ExternResult<Record> {
    let stakeholder_hash = create_entry(&EntryTypes::Stakeholder(stakeholder.clone()))?;
    let record = get(stakeholder_hash.clone(), GetOptions::default())?
        .ok_or(error("Could not find the newly created Stakeholder"))?;
    let path = Path::from("all_stakeholder_profiles");
    create_link(
        path.path_entry_hash()?,
        stakeholder_hash.clone(),
        LinkTypes::AllStakeholdersProfiles,
        (),
    )?;
    create_link(
        agent_info()?.agent_latest_pubkey,
        stakeholder_hash.clone(),
        LinkTypes::StakeholderProfile,
        (),
    )?;
    Ok(record)
}

#[hdk_extern]
pub fn get_latest_stakeholder_profile(
    original_stakeholder_profile_hash: ActionHash,
) -> ExternResult<Option<Record>> {
    let links = get_links(
        original_stakeholder_profile_hash.clone(),
        LinkTypes::StakeholderProfileUpdates,
        None,
    )?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_stakeholder_profile_hash = match latest_link {
        Some(link) => link
            .target
            .clone()
            .into_action_hash()
            .ok_or(error("No action hash associated with link"))?,
        None => original_stakeholder_profile_hash.clone(),
    };
    get(latest_stakeholder_profile_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_original_stakeholder_profile(
    original_stakeholder_profile_hash: ActionHash,
) -> ExternResult<Option<Record>> {
    let Some(details) = get_details(original_stakeholder_profile_hash, GetOptions::default())?
    else {
        return Ok(None);
    };
    match details {
        Details::Record(details) => Ok(Some(details.record)),
        _ => Err(error("Malformed get details response")),
    }
}

#[hdk_extern]
pub fn get_all_revisions_for_stakeholder_profile(
    original_stakeholder_profile_hash: ActionHash,
) -> ExternResult<Vec<Record>> {
    let Some(original_record) =
        get_original_stakeholder_profile(original_stakeholder_profile_hash.clone())?
    else {
        return Ok(vec![]);
    };
    let links = get_links(
        original_stakeholder_profile_hash.clone(),
        LinkTypes::StakeholderProfileUpdates,
        None,
    )?;
    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| {
            Ok(GetInput::new(
                link.target
                    .into_action_hash()
                    .ok_or(error("No action hash associated with link"))?
                    .into(),
                GetOptions::default(),
            ))
        })
        .collect::<ExternResult<Vec<GetInput>>>()?;
    let records = HDK.with(|hdk| hdk.borrow().get(get_input))?;
    let mut records: Vec<Record> = records.into_iter().filter_map(|r| r).collect();
    records.insert(0, original_record);
    Ok(records)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateStakeholderInput {
    pub original_stakeholder_profile_hash: ActionHash,
    pub previous_stakeholder_profile_hash: ActionHash,
    pub updated_stakeholder_profile: StakeholderProfile,
}

#[hdk_extern]
pub fn update_stakeholder_profile(input: UpdateStakeholderInput) -> ExternResult<Record> {
    let updated_stakeholder_profile_hash = update_entry(
        input.previous_stakeholder_profile_hash.clone(),
        &input.updated_stakeholder_profile,
    )?;
    create_link(
        input.original_stakeholder_profile_hash.clone(),
        updated_stakeholder_profile_hash.clone(),
        LinkTypes::StakeholderProfileUpdates,
        (),
    )?;
    let record = get(
        updated_stakeholder_profile_hash.clone(),
        GetOptions::default(),
    )?
    .ok_or(error("Could not find the newly updated Stakeholder"))?;
    Ok(record)
}

#[hdk_extern]
pub fn delete_stakeholder_profile(
    original_stakeholder_profile_hash: ActionHash,
) -> ExternResult<ActionHash> {
    let details = get_details(
        original_stakeholder_profile_hash.clone(),
        GetOptions::default(),
    )?
    .ok_or(error("{pascal_entry_def_name} not found"))?;
    let record = match details {
        Details::Record(details) => Ok(details.record),
        _ => Err(error("Malformed get details response")),
    }?;
    let path = Path::from("all_stakeholder_profiles");
    let links = get_links(
        path.path_entry_hash()?,
        LinkTypes::AllStakeholdersProfiles,
        None,
    )?;
    for link in links {
        if let Some(hash) = link.target.into_action_hash() {
            if hash.eq(&original_stakeholder_profile_hash) {
                delete_link(link.create_link_hash)?;
            }
        }
    }
    let links = get_links(
        record.action().author().clone(),
        LinkTypes::StakeholderProfile,
        None,
    )?;
    for link in links {
        if let Some(hash) = link.target.into_action_hash() {
            if hash.eq(&original_stakeholder_profile_hash) {
                delete_link(link.create_link_hash)?;
            }
        }
    }
    delete_entry(original_stakeholder_profile_hash)
}

#[hdk_extern]
pub fn get_all_deletes_for_stakeholder_profile(
    original_stakeholder_profile_hash: ActionHash,
) -> ExternResult<Option<Vec<SignedActionHashed>>> {
    let Some(details) = get_details(original_stakeholder_profile_hash, GetOptions::default())?
    else {
        return Ok(None);
    };
    match details {
        Details::Entry(_) => Err(error("Malformed details")),
        Details::Record(record_details) => Ok(Some(record_details.deletes)),
    }
}

#[hdk_extern]
pub fn get_oldest_delete_for_stakeholder_profile(
    original_stakeholder_profile_hash: ActionHash,
) -> ExternResult<Option<SignedActionHashed>> {
    let Some(mut deletes) =
        get_all_deletes_for_stakeholder_profile(original_stakeholder_profile_hash)?
    else {
        return Ok(None);
    };
    deletes.sort_by(|delete_a, delete_b| {
        delete_a
            .action()
            .timestamp()
            .cmp(&delete_b.action().timestamp())
    });
    Ok(deletes.first().cloned())
}

#[hdk_extern]
pub fn get_all_stakeholder_profiles(_: ()) -> ExternResult<Vec<Link>> {
    let path = Path::from("all_stakeholder_profiles");
    get_links(
        path.path_entry_hash()?,
        LinkTypes::AllStakeholdersProfiles,
        None,
    )
}

#[hdk_extern]
pub fn get_agent_stakeholder_profiles(author: AgentPubKey) -> ExternResult<Vec<Link>> {
    get_links(author, LinkTypes::StakeholderProfile, None)
}
