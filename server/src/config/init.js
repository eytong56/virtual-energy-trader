import "dotenv/config";
import { Client } from "pg";

const ENUMS_INIT_SQL = `
  -- Create custom ENUM types first
  DO $$ BEGIN
    CREATE TYPE bid_type AS ENUM ('buy', 'sell');
    CREATE TYPE bid_status AS ENUM ('pending', 'filled', 'rejected');
    CREATE TYPE position_type AS ENUM ('long', 'short');
    CREATE TYPE contract_status AS ENUM ('active', 'settled');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
`;

const USERS_INIT_SQL = `
  -- Users table (Trader accounts)
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Sample user
  INSERT INTO users (email)
  VALUES ('trader@test.com')
  ON CONFLICT (email) DO NOTHING;  -- Prevent duplicate email errors
`;

const BIDS_INIT_SQL = `
  -- Bids table (User bids for day-ahead market)
  CREATE TABLE IF NOT EXISTS bids (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    market_date DATE NOT NULL,                    -- Which day the energy is for
    hour_slot INTEGER NOT NULL CHECK (hour_slot >= 0 AND hour_slot <= 23), -- 0-23 for hours
    bid_type bid_type NOT NULL DEFAULT 'buy',
    price DECIMAL(10,2) NOT NULL CHECK (price > 0), -- $/MWh with 2 decimal places
    quantity INTEGER NOT NULL CHECK (quantity > 0),  -- MWh as whole numbers
    status bid_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one bid per user per hour slot per day
    UNIQUE(user_id, market_date, hour_slot)
  );
`;

const CONTRACTS_INIT_SQL = `
  -- Contracts table (Contracts from cleared bids, created once daily)
  CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    market_date DATE NOT NULL,                    -- Which day the energy is for
    hour_slot INTEGER NOT NULL CHECK (hour_slot >= 0 AND hour_slot <= 23),
    position_type position_type NOT NULL,        -- 'long' (buy) or 'short' (sell)
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    clearing_price DECIMAL(10,2) NOT NULL CHECK (clearing_price > 0), -- Day-ahead clearing price
    status contract_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique contracts per user per hour
    UNIQUE(user_id, market_date, hour_slot)
  );
`;

const SETTLEMENTS_INIT_SQL = `
  -- Settlements table (Real-time settlement records, every 5 minutes)
  CREATE TABLE IF NOT EXISTS settlements (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    settlement_time TIMESTAMP NOT NULL,           -- Exact 5-minute settlement time
    rt_price DECIMAL(10,2) NOT NULL,             -- Real-time price at settlement
    pnl_amount DECIMAL(12,2) NOT NULL,           -- P&L for this 5-minute period
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one settlement per contract per 5-minute interval
    UNIQUE(contract_id, settlement_time)
  );
`;

const CLEARING_PRICES_INIT_SQL = `
  CREATE TABLE IF NOT EXISTS clearing_prices (
    id SERIAL PRIMARY KEY,
    market_date DATE NOT NULL,
    hour_slot INTEGER NOT NULL CHECK (hour_slot >= 0 AND hour_slot <= 23),
    clearing_price DECIMAL(10,2) NOT NULL CHECK (clearing_price > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure one clearing price per hour slot per day
    UNIQUE(market_date, hour_slot)
  );
`;

async function initializeDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  await client.query(ENUMS_INIT_SQL);
  await client.query(USERS_INIT_SQL);
  await client.query(BIDS_INIT_SQL);
  await client.query(CONTRACTS_INIT_SQL);
  await client.query(SETTLEMENTS_INIT_SQL);
  await client.query(CLEARING_PRICES_INIT_SQL);
  await client.end();

  console.log("Success: database initialized");
}

export default initializeDatabase;
