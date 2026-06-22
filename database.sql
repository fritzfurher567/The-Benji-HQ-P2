-- 1. Platform User Profiles (Discord Map)
CREATE TABLE IF NOT EXISTS platform_user_profiles (
    discord_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    pounds_balance NUMERIC(14, 2) DEFAULT 0.00,
    benjis_ordered INTEGER DEFAULT 0
);

-- 2. System Clients
CREATE TABLE IF NOT EXISTS system_clients (
    client_id SERIAL PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active'
);

-- 3. Supply Chain Worker Material Tracker
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
CREATE TABLE IF NOT EXISTS corporate_treasury (
    transfer_serial_id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    allocated_amount NUMERIC(14, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending'
);

-- Initialize the user database map
INSERT INTO platform_user_profiles (discord_id, username, pounds_balance, benjis_ordered)
VALUES ('1512209739629461554', 'nobodyknows34', 750.00, 14)
ON CONFLICT (discord_id) DO NOTHING;

-- Initialize all 100 Supply Chain Workers
INSERT INTO supply_chain_workers (ticket_id, worker_code, worker_role, commodity_type, batch_quantity, status)
VALUES
-- Management / Admin (20)
('TKT_MGMT_01', 'W_MGMT_01', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_02', 'W_MGMT_02', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_03', 'W_MGMT_03', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_04', 'W_MGMT_04', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_05', 'W_MGMT_05', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_06', 'W_MGMT_06', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_07', 'W_MGMT_07', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_08', 'W_MGMT_08', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_09', 'W_MGMT_09', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_10', 'W_MGMT_10', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_11', 'W_MGMT_11', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_12', 'W_MGMT_12', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_13', 'W_MGMT_13', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_14', 'W_MGMT_14', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_15', 'W_MGMT_15', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_16', 'W_MGMT_16', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_17', 'W_MGMT_17', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_18', 'W_MGMT_18', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_19', 'W_MGMT_19', 'Management', 'Admin', 0, 'Active'),
('TKT_MGMT_20', 'W_MGMT_20', 'Management', 'Admin', 0, 'Active'),

-- Logistics Coordinator (20)
('TKT_LOGI_01', 'W_LOGI_01', 'Logistics Coordinator', 'Transport', 0, 'Active'),
('TKT_LOGI_02', 'W_LOGI_02', 'Logistics Coordinator', 'Transport', 0, 'Active'),
('TKT_LOGI_03', 'W_LOGI_03', 'Logistics Coordinator', 'Transport', 0, 'Active'),
('TKT_LOGI_04', 'W_LOGI_04', 'Logistics Coordinator', 'Transport', 0, 'Active'),
('TKT_LOGI_05', 'W_LOGI_05', 'Logistics Coordinator', 'Transport', 0, 'Active'),
('TKT_LOGI_06', 'W_LOGI_06', 'Logistics Coordinator', 'Transport', 0, 'Active'),
('TKT_LOGI_07', 'W_LOGI_07', 'Logistics Coordinator', 'Transport', 0, 'Active'),
('TKT_LOGI_08', 'W_LOGI_08', 'Logistics Coordinator', 'Transport', 0, 'Active'),
('TKT_LOGI_09', 'W_LOGI_09', 'Logistics Coordinator', 'Transport', 0, 'Active'),
('TKT_LOGI_10', 'W_LOGI_10', 'Logistics Coordinator', 'Transport', 0, 'Active'),
('TKT_LOGI_11', 'W_LOGI_11', 'Logistics Coordinator', 'Transport', 0, 'Active'),
('TKT_LOGI_12', 'W_LOGI_12', 'Logistics Coordinator', 'Transport', 0, 'Active'),
('TKT_LOGI_13', 'W_LOGI_13', 'Logistics Coordinator', 'Transport', 0, 'Active'),
('TKT_LOG
ON CONFLICT (discord_id) DO NOTHING;