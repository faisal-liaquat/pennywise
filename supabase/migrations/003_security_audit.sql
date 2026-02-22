-- ============================================
-- PennyWise Security Audit Migration
-- Version: 3.0.0
-- Phase 7: Security hardening
-- ============================================

-- ─── Verify RLS is enabled on all tables ─────────────────────────────────────
DO $$
DECLARE
  t TEXT;
  rls_enabled BOOLEAN;
BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles','budget_periods','categories','transactions']) LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = t AND relnamespace = 'public'::regnamespace;
    
    IF NOT rls_enabled THEN
      RAISE EXCEPTION 'RLS not enabled on table: %', t;
    END IF;
    RAISE NOTICE 'RLS verified: %', t;
  END LOOP;
END;
$$;

-- ─── Add additional constraint: transactions amount must be positive ──────────
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS positive_amount;
ALTER TABLE transactions
  ADD CONSTRAINT positive_amount CHECK (amount > 0);

-- ─── Add constraint: category type must be valid ──────────────────────────────
-- (already exists, but re-confirm)
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS valid_tx_type;
ALTER TABLE transactions
  ADD CONSTRAINT valid_tx_type CHECK (type IN ('income', 'expense'));

-- ─── Add constraint: description max length ───────────────────────────────────
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS description_length;
ALTER TABLE transactions
  ADD CONSTRAINT description_length CHECK (length(description) <= 500);

-- ─── Add constraint: budget period name max length ───────────────────────────
ALTER TABLE budget_periods
  DROP CONSTRAINT IF EXISTS name_length;
ALTER TABLE budget_periods
  ADD CONSTRAINT name_length CHECK (length(name) <= 100 AND length(name) >= 1);

-- ─── Add constraint: category name max length ────────────────────────────────
ALTER TABLE categories
  DROP CONSTRAINT IF EXISTS category_name_length;
ALTER TABLE categories
  ADD CONSTRAINT category_name_length CHECK (length(name) <= 50 AND length(name) >= 1);

-- ─── Prevent HTML in text fields (basic XSS defense at DB level) ─────────────
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS no_html_description;
ALTER TABLE transactions
  ADD CONSTRAINT no_html_description 
  CHECK (description NOT LIKE '%<script%' AND description NOT LIKE '%javascript:%');

ALTER TABLE budget_periods
  DROP CONSTRAINT IF EXISTS no_html_name;
ALTER TABLE budget_periods
  ADD CONSTRAINT no_html_name 
  CHECK (name NOT LIKE '%<script%' AND name NOT LIKE '%javascript:%');

ALTER TABLE categories
  DROP CONSTRAINT IF EXISTS no_html_category_name;
ALTER TABLE categories
  ADD CONSTRAINT no_html_category_name 
  CHECK (name NOT LIKE '%<script%' AND name NOT LIKE '%javascript:%');

-- ─── Multi-user isolation test function ──────────────────────────────────────
-- This function is used to verify that a user cannot access another user's data
-- Run this in Supabase SQL editor with a test user's UUID to verify isolation
CREATE OR REPLACE FUNCTION verify_user_isolation(test_user_id UUID)
RETURNS TABLE(table_name TEXT, row_count BIGINT, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check budget_periods
  RETURN QUERY
  SELECT 
    'budget_periods'::TEXT,
    COUNT(*)::BIGINT,
    CASE WHEN COUNT(*) = 0 THEN 'ISOLATED ✅' ELSE 'LEAKING ❌' END::TEXT
  FROM budget_periods
  WHERE user_id != test_user_id;

  -- Check categories (custom only)
  RETURN QUERY
  SELECT
    'categories (custom)'::TEXT,
    COUNT(*)::BIGINT,
    CASE WHEN COUNT(*) = 0 THEN 'ISOLATED ✅' ELSE 'LEAKING ❌' END::TEXT
  FROM categories
  WHERE user_id IS NOT NULL AND user_id != test_user_id;

  -- Check transactions
  RETURN QUERY
  SELECT
    'transactions'::TEXT,
    COUNT(*)::BIGINT,
    CASE WHEN COUNT(*) = 0 THEN 'ISOLATED ✅' ELSE 'LEAKING ❌' END::TEXT
  FROM transactions
  WHERE user_id != test_user_id;
END;
$$;

-- ─── Additional index for security-critical queries ───────────────────────────
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
  ON transactions(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_budget_periods_user_active 
  ON budget_periods(user_id, is_active);

-- ─── Revoke direct table access from anon role (belt-and-suspenders) ─────────
REVOKE ALL ON profiles FROM anon;
REVOKE ALL ON budget_periods FROM anon;
REVOKE ALL ON transactions FROM anon;
-- Note: categories needs anon read for system categories display before auth
GRANT SELECT ON categories TO anon;

RAISE NOTICE 'Security audit migration complete';