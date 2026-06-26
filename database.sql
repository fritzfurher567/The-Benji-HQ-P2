-- 1. Platform User Profiles (Discord Map)
-- WHAT IT DOES: Saves the user's bank account, so when they load pounds, it stays here forever.
CREATE TABLE IF NOT EXISTS platform_user_profiles (
    discord_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    pounds_balance NUMERIC(14, 2) DEFAULT 0.00,
    benjis_ordered INTEGER DEFAULT 0
);

-- 2. System Clients
-- WHAT IT DOES: A simple list to track your active VIPs or business partners.
CREATE TABLE IF NOT EXISTS system_clients (
    client_id SERIAL PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active'
);

-- 3. Supply Chain Worker Material Tracker
-- WHAT IT DOES: The master spreadsheet for the Owner Panel. Tracks who is hired and what they are moving.
CREATE TABLE IF NOT EXISTS supply_chain_workers (
    ticket_serial_id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    worker_code VARCHAR(50) NOT NULL,
    worker_role VARCHAR(50) NOT NULL,
    commodity_type VARCHAR(50) NOT NULL,
    batch_quantity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active'
);

-- 4. Dividend Transfer Verification
-- WHAT IT DOES: Tracks payouts and profit splits from the treasury.
CREATE TABLE IF NOT EXISTS corporate_treasury (
    transfer_serial_id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    allocated_amount NUMERIC(14, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending'
);

-- ==========================================
-- INITIAL DATA INSERTS
-- ==========================================

-- Initialize the user database map
INSERT INTO platform_user_profiles (discord_id, username, pounds_balance, benjis_ordered)
VALUES ('1512209739629461554', 'nobodyknows34', 750.00, 14)
ON CONFLICT (discord_id) DO NOTHING;

-- Initialize Supply Chain Workers
INSERT INTO supply_chain_workers (ticket_id, worker_code, worker_role, commodity_type, batch_quantity, status)
VALUES
-- Managers (20)
('TKT_MGMT_01', 'W_MGMT_01', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_02', 'W_MGMT_02', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_03', 'W_MGMT_03', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_04', 'W_MGMT_04', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_05', 'W_MGMT_05', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_06', 'W_MGMT_06', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_07', 'W_MGMT_07', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_08', 'W_MGMT_08', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_09', 'W_MGMT_09', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_10', 'W_MGMT_10', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_11', 'W_MGMT_11', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_12', 'W_MGMT_12', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_13', 'W_MGMT_13', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_14', 'W_MGMT_14', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_15', 'W_MGMT_15', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_16', 'W_MGMT_16', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_17', 'W_MGMT_17', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_18', 'W_MGMT_18', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_19', 'W_MGMT_19', 'Manager', 'Admin', 0, 'Active'),
('TKT_MGMT_20', 'W_MGMT_20', 'Manager', 'Admin', 0, 'Active'),

-- Sellers (20)
('TKT_SELL_01', 'W_SELL_01', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_02', 'W_SELL_02', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_03', 'W_SELL_03', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_04', 'W_SELL_04', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_05', 'W_SELL_05', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_06', 'W_SELL_06', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_07', 'W_SELL_07', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_08', 'W_SELL_08', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_09', 'W_SELL_09', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_10', 'W_SELL_10', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_11', 'W_SELL_11', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_12', 'W_SELL_12', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_13', 'W_SELL_13', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_14', 'W_SELL_14', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_15', 'W_SELL_15', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_16', 'W_SELL_16', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_17', 'W_SELL_17', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_18', 'W_SELL_18', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_19', 'W_SELL_19', 'Seller', 'Sales', 0, 'Active'),
('TKT_SELL_20', 'W_SELL_20', 'Seller', 'Sales', 0, 'Active'),

-- Chefs (20)
('TKT_CHEF_01', 'W_CHEF_01', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_02', 'W_CHEF_02', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_03', 'W_CHEF_03', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_04', 'W_CHEF_04', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_05', 'W_CHEF_05', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_06', 'W_CHEF_06', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_07', 'W_CHEF_07', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_08', 'W_CHEF_08', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_09', 'W_CHEF_09', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_10', 'W_CHEF_10', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_11', 'W_CHEF_11', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_12', 'W_CHEF_12', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_13', 'W_CHEF_13', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_14', 'W_CHEF_14', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_15', 'W_CHEF_15', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_16', 'W_CHEF_16', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_17', 'W_CHEF_17', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_18', 'W_CHEF_18', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_19', 'W_CHEF_19', 'Chef', 'Food', 0, 'Active'),
('TKT_CHEF_20', 'W_CHEF_20', 'Chef', 'Food', 0, 'Active'),

-- Fishers (20)
('TKT_FISH_01', 'W_FISH_01', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_02', 'W_FISH_02', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_03', 'W_FISH_03', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_04', 'W_FISH_04', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_05', 'W_FISH_05', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_06', 'W_FISH_06', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_07', 'W_FISH_07', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_08', 'W_FISH_08', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_09', 'W_FISH_09', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_10', 'W_FISH_10', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_11', 'W_FISH_11', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_12', 'W_FISH_12', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_13', 'W_FISH_13', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_14', 'W_FISH_14', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_15', 'W_FISH_15', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_16', 'W_FISH_16', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_17', 'W_FISH_17', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_18', 'W_FISH_18', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_19', 'W_FISH_19', 'Fisher', 'Marine', 0, 'Active'),
('TKT_FISH_20', 'W_FISH_20', 'Fisher', 'Marine', 0, 'Active'),

-- Gatherers (20)
('TKT_GATH_01', 'W_GATH_01', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_02', 'W_GATH_02', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_03', 'W_GATH_03', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_04', 'W_GATH_04', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_05', 'W_GATH_05', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_06', 'W_GATH_06', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_07', 'W_GATH_07', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_08', 'W_GATH_08', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_09', 'W_GATH_09', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_10', 'W_GATH_10', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_11', 'W_GATH_11', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_12', 'W_GATH_12', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_13', 'W_GATH_13', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_14', 'W_GATH_14', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_15', 'W_GATH_15', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_16', 'W_GATH_16', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_17', 'W_GATH_17', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_18', 'W_GATH_18', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_19', 'W_GATH_19', 'Gatherer', 'Resources', 0, 'Active'),
('TKT_GATH_20', 'W_GATH_20', 'Gatherer', 'Resources', 0, 'Active')
ON CONFLICT (ticket_id) DO NOTHING;