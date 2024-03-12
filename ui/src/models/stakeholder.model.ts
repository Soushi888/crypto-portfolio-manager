import DbService from '@services/DbService';
import type { Portfolio } from './portfolio.model';

export type Stakeholder = {
  id?: string;
  name: string;
};

class StakeholderModel extends DbService {
  private readonly tableName = 'stakeholder';
  private readonly junctionTableName = 'portfolio_stakeholder';

  constructor() {
    super();
  }

  createStakeholder(name: string) {
    let stmt = this.db.prepare(`INSERT INTO ${this.tableName} (name) VALUES (?)`);
    return stmt.run(name);
  }

  getAllStakeholders(): Stakeholder[] {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName}`);
    return stmt.all() as Stakeholder[];
  }

  getStakeholder(id: string): Stakeholder {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    return stmt.get(id) as Stakeholder;
  }

  getStakeholderPortfolios(stakeholderId: string): Portfolio[] {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} JOIN ${this.junctionTableName} ON ${this.tableName}.id = ${this.junctionTableName}.portfolio_id WHERE ${this.junctionTableName}.stakeholder_id = ?`
    );
    return stmt.all(stakeholderId) as Portfolio[];
  }
  renameStakeholder(id: string, newName: string) {
    const stmt = this.db.prepare(`UPDATE ${this.tableName} SET name = ? WHERE id = ?`);
    return stmt.run(newName, id);
  }

  deleteStakeholder(id: string) {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
    return stmt.run(id);
  }
}

const stakeholderModel = new StakeholderModel();
export default stakeholderModel;
