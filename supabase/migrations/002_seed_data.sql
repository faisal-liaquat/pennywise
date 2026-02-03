-- ============================================
-- PennyWise Seed Data
-- Version: 1.0.0
-- Description: System categories
-- ============================================

-- ============================================
-- System Categories: Expenses
-- ============================================
INSERT INTO categories (name, type, color, icon, is_system, user_id) VALUES
    ('Housing', 'expense', '#EF4444', '🏠', TRUE, NULL),
    ('Food & Dining', 'expense', '#F59E0B', '🍔', TRUE, NULL),
    ('Transportation', 'expense', '#3B82F6', '🚗', TRUE, NULL),
    ('Utilities', 'expense', '#8B5CF6', '💡', TRUE, NULL),
    ('Healthcare', 'expense', '#EC4899', '🏥', TRUE, NULL),
    ('Entertainment', 'expense', '#10B981', '🎬', TRUE, NULL),
    ('Shopping', 'expense', '#F97316', '🛍️', TRUE, NULL),
    ('Education', 'expense', '#06B6D4', '📚', TRUE, NULL),
    ('Personal Care', 'expense', '#D946EF', '💅', TRUE, NULL),
    ('Insurance', 'expense', '#6366F1', '🛡️', TRUE, NULL),
    ('Debt Payment', 'expense', '#DC2626', '💳', TRUE, NULL),
    ('Savings', 'expense', '#059669', '🏦', TRUE, NULL),
    ('Gifts & Donations', 'expense', '#DB2777', '🎁', TRUE, NULL),
    ('Other', 'expense', '#6B7280', '💰', TRUE, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- System Categories: Income
-- ============================================
INSERT INTO categories (name, type, color, icon, is_system, user_id) VALUES
    ('Salary', 'income', '#10B981', '💼', TRUE, NULL),
    ('Freelance', 'income', '#3B82F6', '💻', TRUE, NULL),
    ('Investment', 'income', '#8B5CF6', '📈', TRUE, NULL),
    ('Business', 'income', '#F59E0B', '🏢', TRUE, NULL),
    ('Gift', 'income', '#EC4899', '🎁', TRUE, NULL),
    ('Refund', 'income', '#06B6D4', '↩️', TRUE, NULL),
    ('Other Income', 'income', '#6B7280', '💵', TRUE, NULL)
ON CONFLICT DO NOTHING;