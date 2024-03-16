import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { ActionHash, EntryHash, AgentPubKey, Record, AppAgentClient, DnaHash } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { decode } from '@msgpack/msgpack';
import '@material/mwc-button';
import '@material/mwc-snackbar';
import { Snackbar } from '@material/mwc-snackbar';

import { clientContext } from '../../contexts';
import { Coin } from './types';

@customElement('edit-coin')
export class EditCoin extends LitElement {

  @consume({ context: clientContext })
  client!: AppAgentClient;
  
  @property({
      hasChanged: (newVal: ActionHash, oldVal: ActionHash) => newVal?.toString() !== oldVal?.toString()
  })
  originalCoinHash!: ActionHash;

  
  @property()
  currentRecord!: Record;
 
  get currentCoin() {
    return decode((this.currentRecord.entry as any).Present.entry) as Coin;
  }
 

  isCoinValid() {
    return true;
  }
  
  connectedCallback() {
    super.connectedCallback();
    if (this.currentRecord === undefined) {
      throw new Error(`The currentRecord property is required for the edit-coin element`);
    }

    if (this.originalCoinHash === undefined) {
      throw new Error(`The originalCoinHash property is required for the edit-coin element`);
    }
    
  }

  async updateCoin() {
    const coin: Coin = { 
      id: this.currentCoin.id,
      name: this.currentCoin.name,
      symbol: this.currentCoin.symbol,
      image: this.currentCoin.image,
    };

    try {
      const updateRecord: Record = await this.client.callZome({
        cap_secret: null,
        role_name: 'crypto_portfolio',
        zome_name: 'coins',
        fn_name: 'update_coin',
        payload: {
          original_coin_hash: this.originalCoinHash,
          previous_coin_hash: this.currentRecord.signed_action.hashed.hash,
          updated_coin: coin
        },
      });
  
      this.dispatchEvent(new CustomEvent('coin-updated', {
        composed: true,
        bubbles: true,
        detail: {
          originalCoinHash: this.originalCoinHash,
          previousCoinHash: this.currentRecord.signed_action.hashed.hash,
          updatedCoinHash: updateRecord.signed_action.hashed.hash
        }
      }));
    } catch (e: any) {
      const errorSnackbar = this.shadowRoot?.getElementById('update-error') as Snackbar;
      errorSnackbar.labelText = `Error updating the coin: ${e.data.data}`;
      errorSnackbar.show();
    }
  }

  render() {
    return html`
      <mwc-snackbar id="update-error" leading>
      </mwc-snackbar>

      <div style="display: flex; flex-direction: column">
        <span style="font-size: 18px">Edit Coin</span>


        <div style="display: flex; flex-direction: row">
          <mwc-button
            outlined
            label="Cancel"
            @click=${() => this.dispatchEvent(new CustomEvent('edit-canceled', {
              bubbles: true,
              composed: true
            }))}
            style="flex: 1; margin-right: 16px"
          ></mwc-button>
          <mwc-button 
            raised
            label="Save"
            .disabled=${!this.isCoinValid()}
            @click=${() => this.updateCoin()}
            style="flex: 1;"
          ></mwc-button>
        </div>
      </div>`;
  }
}
