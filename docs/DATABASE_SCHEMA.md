# PennyWise Database Schema

## Overview

This document describes the database schema for PennyWise personal finance tracker.

## Tables

### 1. profiles

Extended user profile information beyond Supabase Auth.

```sql
profiles
├── id (uuid, PK, FK to auth.users)
├── email (text, unique)
├── full_name (text)
├── avatar_url (text, nullable)
├── currency (text, default 'USD')
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### 2. budget_periods

Tracks budget periods (monthly, custom, etc.)

```sql
budget_periods
├── id (uuid, PK)
├── user_id (uuid, FK to profiles)
├── name (text)
├── start_date (date)
├── end_date (date)
├── total_budget (decimal)
├── is_active (boolean)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### 3. categories

Expense and income categories

```sql
categories
├── id (uuid, PK)
├── user_id (uuid, FK to profiles, nullable)
├── name (text)
├── type (text: 'income' | 'expense')
├── color (text)
├── icon (text, nullable)
├── is_system (boolean)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### 4. transactions

All financial transactions (income and expenses)

```sql
transactions
├── id (uuid, PK)
├── user_id (uuid, FK to profiles)
├── budget_period_id (uuid, FK to budget_periods, nullable)
├── category_id (uuid, FK to categories)
├── amount (decimal)
├── type (text: 'income' | 'expense')
├── description (text)
├── date (date)
├── is_recurring (boolean)
├── recurrence_pattern (jsonb, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

## Relationships

```
auth.users (Supabase Auth)
    ↓
profiles (1:1)
    ↓
    ├── budget_periods (1:many)
    │       ↓
    │   transactions (many:1)
    │
    ├── categories (1:many)
    │       ↓
    │   transactions (many:1)
    │
    └── transactions (1:many)
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

1. **profiles**: Users can only read/update their own profile
2. **budget_periods**: Users can only CRUD their own budget periods
3. **categories**: Users can read system categories and CRUD their own
4. **transactions**: Users can only CRUD their own transactions

## Indexes

- `profiles.email` (unique)
- `budget_periods.user_id`
- `budget_periods.is_active`
- `categories.user_id`
- `categories.is_system`
- `transactions.user_id`
- `transactions.budget_period_id`
- `transactions.category_id`
- `transactions.date`

## Default Data

### System Categories (Expenses)

- 🏠 Housing
- 🍔 Food & Dining
- 🚗 Transportation
- 💡 Utilities
- 🏥 Healthcare
- 🎬 Entertainment
- 🛍️ Shopping
- 📚 Education
- 💰 Other

### System Categories (Income)

- 💼 Salary
- 📈 Investment
- 🎁 Gift
- 💵 Other Income
