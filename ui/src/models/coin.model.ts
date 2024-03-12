import DbService from '@services/DbService';

export type Coin = {
  id?: string;
  symbol: string;
  name: string;
  image?: string;
  portfolio_id: string;
  amount?: number;
};

export class CoinModel extends DbService {
  private readonly tableName = 'coin';
  private readonly junctionTableName = 'portfolio_coin';

  constructor() {
    super();
  }

  addCoin(coin: Coin) {
    this.db.transaction(() => {
      let stmt = this.db.prepare(
        `INSERT INTO ${this.tableName} (symbol, name, image) VALUES (?, ?, ?)`
      );
      const coinId = stmt.run(coin.symbol, coin.name, coin.image).lastInsertRowid;

      stmt = this.db.prepare(
        `INSERT INTO ${this.junctionTableName} (portfolio_id, coin_id) VALUES (?, ?)`
      );
      stmt.run(coin.portfolio_id, coinId);
    })();
  }

  getAllPortfolioCoins(portfolioId: string): Coin[] {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.junctionTableName} JOIN ${this.tableName} ON ${this.junctionTableName}.coin_id = ${this.tableName}.id WHERE ${this.junctionTableName}.portfolio_id = ?`
    );
    return stmt.all(portfolioId) as Coin[];
  }

  getCoin(id: string): Coin {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    return stmt.get(id) as Coin;
  }

  deleteCoin(id: string) {
    this.db.transaction(() => {
      let stmt = this.db.prepare(`DELETE FROM ${this.junctionTableName} WHERE coin_id = ?`);
      stmt.run(id);

      stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
      stmt.run(id);

      console.log('Coin deleted successfully');
    })();
  }
}

const coinModel = new CoinModel();
export default coinModel;
