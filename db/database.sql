-- Database Initialization Configuration Mapping Schema
-- Target: Netlify Serverless Postgres Module Engine

-- 1. Profiles Table Ledger
CREATE TABLE IF NOT EXISTS platform_user_profiles (
    discord_id VARCHAR(100) PRIMARY KEY DEFAULT '1512209739629461554',
    username VARCHAR(150) NOT NULL DEFAULT 'nobodyknows34',
    pounds_balance NUMERIC(14, 2) NOT NULL DEFAULT 750.00,
    benjis_ordered INTEGER NOT NULL DEFAULT 14
);

-- 2. Client Orders Table Database
CREATE TABLE IF NOT EXISTS system_client_orders (
    order_primary_key SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(150) NOT NULL,
    product_title VARCHAR(255) NOT NULL,
    timestamp_log VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' -- Values: 'pending', 'sent'
);

-- 3. Supply Chain Worker Material Tracking Dropoffs
CREATE TABLE IF NOT EXISTS supply_chain_resource_tickets (
    ticket_serial_id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    worker_code VARCHAR(50) NOT NULL,
    worker_role VARCHAR(50) NOT NULL,
    commodity_type VARCHAR(50) NOT NULL, -- Values: 'Fish', 'Salt', 'Crops'
    batch_quantity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' -- Values: 'pending', 'Done'
);

-- 4. Dividend Transfer Verification Audit Ledger
CREATE TABLE IF NOT EXISTS corporate_transfer_tickets (
    transfer_serial_id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    allocated_amount NUMERIC(14, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' -- Values: 'pending', 'Complete'
);

-- Initialize the user database map index entry tracking context parameters
INSERT INTO platform_user_profiles (discord_id, username, pounds_balance, benjis_ordered)
VALUES ('1512209739629461554', 'nobodyknows34', 750.00, 14)
ON CONFLICT (discord_id) DO NOTHING;