# PennyWise Security Documentation

## Phase 7 Security Audit — Summary

### 1. Input Validation

All user inputs are validated at two layers:

**Layer 1 — Client-side (src/lib/utils/validators.js)**

- Email format validation (RFC 5322)
- Password strength (minimum 8 chars, max 128)
- Amount validation (positive, max 2 decimal places, max 999,999,999)
- Date range validation (2000–2100)
- Text length limits (names ≤100 chars, descriptions ≤500 chars)
- HTML/script injection detection

**Layer 2 — Database constraints (migration 003)**

- `amount > 0` constraint on transactions
- `length(description) <= 500` constraint
- `name BETWEEN 1 AND 100 chars` on budget_periods
- `type IN ('income', 'expense')` constraint
- No `<script` or `javascript:` in text fields

### 2. XSS Protection (src/lib/utils/sanitize.js)

- All text inputs are stripped of HTML tags before DB insert
- Hex color values are validated against `/^#[0-9A-Fa-f]{6}$/`
- Amount values are parsed as floats, discarding any non-numeric characters
- Svelte templates use `{text}` (auto-escaped) — `{@html}` is only used in AppLayout for trusted SVG icons

### 3. SQL Injection Prevention

PennyWise uses Supabase's parameterized query API — no raw SQL strings are ever constructed from user input. All database operations use `.eq()`, `.insert()`, `.update()` chained methods which are internally parameterized.

### 4. Authentication & Session Security

- Supabase Auth handles all password hashing (bcrypt)
- JWT tokens are managed by `@supabase/supabase-js`
- Anon key is used (not service_role) — cannot bypass RLS
- Password reset flow uses Supabase's secure token mechanism

### 5. Row Level Security (RLS)

All four tables have RLS enabled with policies that restrict each user to their own data:

| Table          | SELECT               | INSERT               | UPDATE               | DELETE               |
| -------------- | -------------------- | -------------------- | -------------------- | -------------------- |
| profiles       | own row only         | own row only         | own row only         | —                    |
| budget_periods | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() |
| categories     | own + system         | own only             | own only             | own only             |
| transactions   | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() |

### 6. Rate Limiting (src/lib/utils/rateLimiter.js)

Client-side rate limiting protects against accidental rapid submissions:

| Action          | Limit            |
| --------------- | ---------------- |
| Login attempts  | 5 per 5 minutes  |
| Registration    | 3 per 10 minutes |
| Add transaction | 20 per minute    |

Note: Server-side rate limiting is handled by Supabase's built-in Auth rate limiting.

### 7. Multi-User Isolation Testing

Run this in Supabase SQL Editor after signing in as a test user to verify isolation:

```sql
SELECT * FROM verify_user_isolation('your-test-user-uuid-here');
```

Expected output: All rows show `ISOLATED ✅` with count = 0.

### 8. Environment Variables

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are the only secrets
- `.env` is in `.gitignore` — never committed
- Service role key is never used in the browser

### 9. Known Limitations & Future Improvements

- CSRF protection: Not applicable for SPA with JWT auth (no cookies by default)
- Content Security Policy: Can be added via server/hosting headers in production
- Brute force protection server-side: Handled by Supabase Auth (not configurable per free tier)
