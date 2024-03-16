use coins_integrity::*;
use hdk::prelude::*;

#[hdk_extern]
pub fn create_coin(coin: Coin) -> ExternResult<Record> {
    let coin_hash = create_entry(&EntryTypes::Coin(coin.clone()))?;
    let record = get(coin_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest(String::from("Could not find the newly created Coin"))
    ))?;
    Ok(record)
}

#[hdk_extern]
pub fn get_latest_coin(original_coin_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links(original_coin_hash.clone(), LinkTypes::CoinUpdates, None)?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_coin_hash = match latest_link {
        Some(link) => {
            link.target
                .clone()
                .into_action_hash()
                .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
                    "No action hash associated with link"
                ))))?
        }
        None => original_coin_hash.clone(),
    };
    get(latest_coin_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_original_coin(original_coin_hash: ActionHash) -> ExternResult<Option<Record>> {
    let Some(details) = get_details(original_coin_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Record(details) => Ok(Some(details.record)),
        _ => Err(wasm_error!(WasmErrorInner::Guest(String::from(
            "Malformed get details response"
        )))),
    }
}

#[hdk_extern]
pub fn get_all_revisions_for_coin(original_coin_hash: ActionHash) -> ExternResult<Vec<Record>> {
    let Some(original_record) = get_original_coin(original_coin_hash.clone())? else {
        return Ok(vec![]);
    };
    let links = get_links(original_coin_hash.clone(), LinkTypes::CoinUpdates, None)?;
    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| {
            Ok(GetInput::new(
                link.target
                    .into_action_hash()
                    .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
                        "No action hash associated with link"
                    ))))?
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
pub struct UpdateCoinInput {
    pub original_coin_hash: ActionHash,
    pub previous_coin_hash: ActionHash,
    pub updated_coin: Coin,
}
#[hdk_extern]
pub fn update_coin(input: UpdateCoinInput) -> ExternResult<Record> {
    let updated_coin_hash = update_entry(input.previous_coin_hash.clone(), &input.updated_coin)?;
    create_link(
        input.original_coin_hash.clone(),
        updated_coin_hash.clone(),
        LinkTypes::CoinUpdates,
        (),
    )?;
    let record = get(updated_coin_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest(String::from("Could not find the newly updated Coin"))
    ))?;
    Ok(record)
}

#[hdk_extern]
pub fn delete_coin(original_coin_hash: ActionHash) -> ExternResult<ActionHash> {
    let details =
        get_details(original_coin_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
            WasmErrorInner::Guest(String::from("{pascal_entry_def_name} not found"))
        ))?;
    let record = match details {
        Details::Record(details) => Ok(details.record),
        _ => Err(wasm_error!(WasmErrorInner::Guest(String::from(
            "Malformed get details response"
        )))),
    }?;
    delete_entry(original_coin_hash)
}

#[hdk_extern]
pub fn get_all_deletes_for_coin(
    original_coin_hash: ActionHash,
) -> ExternResult<Option<Vec<SignedActionHashed>>> {
    let Some(details) = get_details(original_coin_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Entry(_) => Err(wasm_error!(WasmErrorInner::Guest(
            "Malformed details".into()
        ))),
        Details::Record(record_details) => Ok(Some(record_details.deletes)),
    }
}

#[hdk_extern]
pub fn get_oldest_delete_for_coin(
    original_coin_hash: ActionHash,
) -> ExternResult<Option<SignedActionHashed>> {
    let Some(mut deletes) = get_all_deletes_for_coin(original_coin_hash)? else {
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
pub fn fetch_coins_from_coin_gecko(_: ()) -> ExternResult<Vec<Coin>> {
    unimplemented!("Fetch coins from CoinGecko")
}
