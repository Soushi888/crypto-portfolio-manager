import Database from 'better-sqlite3';
import fs from 'fs';

export default class DbService {
  private static instance: DbService;
  db: Database.Database;

  constructor() {
    this.db = new Database('./db.sqlite', { verbose: console.log });

    try {
      this.db.prepare('PRAGMA table_info(MigrationLog)').all();
      this.runMigration('init');
    } catch (error) {
      this.createMigrationLogTable();
      this.runMigration('init');
    }
  }

  public static getInstance(): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService();
    }
    return DbService.instance;
  }

  private createMigrationLogTable() {
    this.db
      .prepare(
        'CREATE TABLE IF NOT EXISTS MigrationLog (migration_name TEXT, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
      )
      .run();
  }

  private runMigration(migrationName: string) {
    const migrationLog = this.db
      .prepare('SELECT * FROM MigrationLog WHERE migration_name = ?')
      .get(migrationName);

    if (!migrationLog) {
      const migrationPath = `./src/migrations/${migrationName}.sql`;
      // Read the migration file
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      // Execute the migration
      this.db.exec(migrationSQL);

      // Log the migration as applied
      this.db.prepare('INSERT INTO MigrationLog (migration_name) VALUES (?)').run(migrationName);

      console.log('Initial migration completed successfully.');
    } else {
      console.log('Initial migration has already been applied.');
    }
  }
}
