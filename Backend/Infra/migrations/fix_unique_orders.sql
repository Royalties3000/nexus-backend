-- Run this in your database console to ensure the table can handle re-runs
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_id ON maintenance_orders(order_id);