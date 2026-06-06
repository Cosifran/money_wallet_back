-- Migration: Create transactions table for PostgreSQL
-- Run this in Supabase SQL Editor

-- 1. Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    id_original UUID DEFAULT gen_random_uuid() UNIQUE,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    asunto TEXT,
    tipo_de_transferencia TEXT,
    tipo TEXT,
    name TEXT,
    cantidad DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy: users can only see their own transactions
CREATE POLICY "users_own_transactions_select" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_own_transactions_insert" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_transactions_update" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_own_transactions_delete" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_id_original ON transactions(id_original);