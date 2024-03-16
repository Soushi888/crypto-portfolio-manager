import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { EntryHash, Record, ActionHash, AppAgentClient, DnaHash } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { Task } from '@lit-labs/task';
import { decode } from '@msgpack/msgpack';
import '@material/mwc-circular-progress';
import '@material/mwc-icon-button';
import '@material/mwc-snackbar';
import { Snackbar } from '@material/mwc-snackbar';

import './edit-coin';

import { clientContext } from '../../contexts';
import { Coin } from './types';

@customElement('coin-detail')
export class CoinDetail extends LitElement {
  @consume({ context: clientContext })
  client!: AppAgentClient;

  @property({
    hasChanged: (newVal: ActionHash, oldVal: ActionHash) => newVal?.toString() !== oldVal?.toString()
  })
  coinHash!: ActionHash;

  _fetchRecord = new Task(this, ([coinHash]) => this.client.callZome({
      cap_secret: null,
      role_name: 'crypto_portfolio',
      zome_name: 'coins',
      fn_name: 'get_latest_coin',
      payload: coinHash,
  }) as Promise<Record | undefined>, () => [this.coinHash]);

  @state()
  _editing = false;
  
  firstUpdated() {
    if (this.coinHash === undefined) {
      throw new Error(`The coinHash property is required for the coin-detail element`);
    }
  }

  async deleteCoin() {
    try {
      await this.client.callZome({
        cap_secret: null,
        role_name: 'crypto_portfolio',
        zome_name: 'coins',
        fn_name: 'delete_coin',
        payload: this.coinHash,
      });
      this.dispatchEvent(new CustomEvent('coin-deleted', {
        bubbles: true,
        composed: true,
        detail: {
          coinHash: this.coinHash
        }
      }));
      this._fetchRecord.run();
    } catch (e: any) {
      const errorSnackbar = this.shadowRoot?.getElementById('delete-error') as Snackbar;
      errorSnackbar.labelText = `Error deleting the coin: ${e.data.data}`;
      errorSnackbar.show();
    }
  }

  renderDetail(record: Record) {
    const coin = decode((record.entry as any).Present.entry) as Coin;

    return html`
      <mwc-snackbar id="delete-error" leading>
      </mwc-snackbar>

      <div style="display: flex; flex-direction: column">
      	<div style="display: flex; flex-direction: row">
      	  <span style="flex: 1"></span>
      	
          <mwc-icon-button style="margin-left: 8px" icon="edit" @click=${() => { this._editing = true; } }></mwc-icon-button>
          <mwc-icon-button style="margin-left: 8px" icon="delete" @click=${() => this.deleteCoin()}></mwc-icon-button>
        </div>

      </div>
    `;
  }
  
  renderCoin(maybeRecord: Record | undefined) {
    if (!maybeRecord) return html`<span>The requested coin was not found.</span>`;
    
    if (this._editing) {
    	return html`<edit-coin
    	  .originalCoinHash=${this.coinHash}
    	  .currentRecord=${maybeRecord}
    	  @coin-updated=${async () => {
    	    this._editing = false;
    	    await this._fetchRecord.run();
    	  } }
    	  @edit-canceled=${() => { this._editing = false; } }
    	  style="display: flex; flex: 1;"
    	></edit-coin>`;
    }

    return this.renderDetail(maybeRecord);
  }

  render() {
    return this._fetchRecord.render({
      pending: () => html`<div style="display: flex; flex: 1; align-items: center; justify-content: center">
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`,
      complete: (maybeRecord) => this.renderCoin(maybeRecord),
      error: (e: any) => html`<span>Error fetching the coin: ${e.data.data}</span>`
    });
  }
}
