import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { InstalledCell, ActionHash, Record, AgentPubKey, EntryHash, AppAgentClient, DnaHash } from '@holochain/client';
import { consume } from '@lit-labs/context';
import '@material/mwc-button';
import '@material/mwc-snackbar';
import { Snackbar } from '@material/mwc-snackbar';

import { clientContext } from '../../contexts';
import { Coin } from './types';

@customElement('create-coin')
export class CreateCoin extends LitElement {
  @consume({ context: clientContext })
  client!: AppAgentClient;

  @property()
  id!: string;
  @property()
  name!: string;
  @property()
  symbol!: string;
  @property()
  image!: Array<number>;


  
  firstUpdated() {
    if (this.id === undefined) {
      throw new Error(`The id input is required for the create-coin element`);
    }
    if (this.name === undefined) {
      throw new Error(`The name input is required for the create-coin element`);
    }
    if (this.symbol === undefined) {
      throw new Error(`The symbol input is required for the create-coin element`);
    }
    if (this.image === undefined) {
      throw new Error(`The image input is required for the create-coin element`);
    }
  }

  isCoinValid() {
    return true;
  }

  async createCoin() {
    const coin: Coin = { 
        id: this.id,
        name: this.name,
        symbol: this.symbol,
        image: this.image,
    };

    try {
      const record: Record = await this.client.callZome({
        cap_secret: null,
        role_name: 'crypto_portfolio',
        zome_name: 'coins',
        fn_name: 'create_coin',
        payload: coin,
      });

      this.dispatchEvent(new CustomEvent('coin-created', {
        composed: true,
        bubbles: true,
        detail: {
          coinHash: record.signed_action.hashed.hash
        }
      }));
    } catch (e: any) {
      const errorSnackbar = this.shadowRoot?.getElementById('create-error') as Snackbar;
      errorSnackbar.labelText = `Error creating the coin: ${e.data.data}`;
      errorSnackbar.show();
    }
  }

  render() {
    return html`
      <mwc-snackbar id="create-error" leading>
      </mwc-snackbar>

      <div style="display: flex; flex-direction: column">
        <span style="font-size: 18px">Create Coin</span>


        <mwc-button 
          raised
          label="Create Coin"
          .disabled=${!this.isCoinValid()}
          @click=${() => this.createCoin()}
        ></mwc-button>
    </div>`;
  }
}
