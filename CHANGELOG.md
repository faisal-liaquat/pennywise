# Changelog

## [0.3.0] - 2026-02-03

### Added

- Complete authentication system with Supabase
- Login and registration pages
- Password reset flow via email
- Protected routes with auth guards
- Session persistence across page refreshes
- Reusable form components (Input, Button, ProtectedRoute)
- Dashboard with user information display
- Database trigger for automatic profile creation

### Security

- Row Level Security on all database tables
- Secure password handling via Supabase Auth
- Protected route implementation
- Session token management

## [0.2.0] - 2026-02-02

### Added

- Database schema with profiles, budget_periods, categories, transactions
- Row Level Security policies
- System categories pre-populated
- Helper functions and triggers

## [0.1.0] - 2026-02-01

### Added

- Initial project setup with Svelte + Vite
- Supabase integration
- Tailwind CSS configuration
