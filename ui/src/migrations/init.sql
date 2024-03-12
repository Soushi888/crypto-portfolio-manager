-- Create a table to log migrations. This table will track which migrations have been applied.
CREATE TABLE IF NOT EXISTS "MigrationLog" (
    migration_name TEXT PRIMARY KEY, -- The name of the migration. Used as the primary key.
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- The timestamp when the migration was applied. Defaults to the current timestamp.
);

INSERT INTO "MigrationLog" (migration_name) VALUES ('init');

-- Create a table for stakeholders. Each stakeholder has a unique ID, a name, and an optional email.
CREATE TABLE IF NOT EXISTS "stakeholder" (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each stakeholder. Auto-increments with each new stakeholder.
    name TEXT NOT NULL -- The name of the stakeholder. Cannot be NULL.
);

-- Create a table for portfolios. Each portfolio has a unique ID, a name, and an optional description.
CREATE TABLE IF NOT EXISTS "portfolio" (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each portfolio. Auto-increments with each new portfolio.
    name TEXT NOT NULL, -- The name of the portfolio. Cannot be NULL.
    current_value REAL DEFAULT 0, -- The current value of the portfolio.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- The timestamp when the portfolio was created. Defaults to the current timestamp.
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- The timestamp when the portfolio was last updated. Defaults to the current timestamp.
    );

-- Create a junction table to represent the many-to-many relationship between stakeholders and portfolios.
CREATE TABLE IF NOT EXISTS "portfolio_stakeholder" (
    stakeholder_id INTEGER NOT NULL, -- Foreign key referencing the stakeholder ID. Cannot be NULL.
    portfolio_id INTEGER NOT NULL, -- Foreign key referencing the portfolio ID. Cannot be NULL.
    PRIMARY KEY (stakeholder_id, portfolio_id), -- Composite primary key consisting of stakeholder_id and portfolio_id.
    FOREIGN KEY (stakeholder_id) REFERENCES "stakeholder" (id), -- Foreign key constraint linking to the stakeholder table.
    FOREIGN KEY (portfolio_id) REFERENCES "portfolio" (id) ON DELETE CASCADE -- Foreign key constraint linking to the portfolio table.
);

CREATE TABLE IF NOT EXISTS "coin" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    image TEXT
);

CREATE TABLE IF NOT EXISTS "portfolio_coin" (
    portfolio_id INTEGER NOT NULL,
    coin_id INTEGER NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    PRIMARY KEY (portfolio_id, coin_id),
    FOREIGN KEY (portfolio_id) REFERENCES "portfolio" (id) ON DELETE CASCADE,
    FOREIGN KEY (coin_id) REFERENCES "coin" (id)
);

CREATE TABLE IF NOT EXISTS "transaction" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stakeholder_id INTEGER NOT NULL,
    portfolio_id INTEGER NOT NULL,
    coin_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    price REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES "portfolio" (id) ON DELETE CASCADE,
    FOREIGN KEY (coin_id) REFERENCES "coin" (id)
)