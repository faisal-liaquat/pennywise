# PennyWise

A modern personal finance tracking application built with Svelte, Supabase, and Tailwind CSS.

## Project Status

### Completed Phases

- ✅ **Phase 1:** Project Setup & Configuration
- ✅ **Phase 2:** Database Design & Setup

### In Progress

- ⏳ **Phase 3:** Authentication UI
- ⏳ **Phase 4:** Dashboard & Budget Management
- ⏳ **Phase 5:** Transaction Management
- ⏳ **Phase 6:** Analytics & Reports

## Features

- Track income and expenses
- Budget management with custom periods
- Financial insights and analytics
- Secure authentication with Row Level Security
- System and custom categories (21 pre-configured)
- Real-time data synchronization

## Tech Stack

- **Frontend:** Svelte 5 + Vite 7
- **Styling:** Tailwind CSS 3
- **Backend:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL with Row Level Security (RLS)

## Database Schema

### Tables

- **profiles** - Extended user information
- **budget_periods** - Budget tracking periods
- **categories** - Transaction categories (21 system + custom)
- **transactions** - Financial transactions (income & expenses)

📖 See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for detailed schema documentation.

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or pnpm
- Supabase account (free tier)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/pennywise.git
cd pennywise
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
copy .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

**Important:** Use the **anon public** key, NOT the service_role key!

4. Set up the database:

Run these SQL files in Supabase SQL Editor:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_seed_data.sql`

5. Run development server:

```bash
npm run dev
```

## Project Structure

```
pennywise/
├── docs/
│   └── DATABASE_SCHEMA.md        # Database documentation
├── src/
│   ├── lib/
│   │   ├── supabaseClient.js     # Supabase client
│   │   └── dbTest.js             # Database test utilities
│   ├── App.svelte                # Main app component
│   ├── DatabaseTest.svelte       # Database test component
│   ├── app.css                   # Global styles
│   └── main.js                   # App entry point
├── supabase/
│   └── migrations/                # Database migrations
│       ├── 001_initial_schema.sql
│       └── 002_seed_data.sql
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment template
└── package.json
```

## Database Features

### Row Level Security (RLS)

✅ All tables protected with RLS policies  
✅ Users can only access their own data  
✅ System categories are read-only

### System Categories

- **Expenses (14):** Housing, Food & Dining, Transportation, Utilities, Healthcare, Entertainment, Shopping, Education, Personal Care, Insurance, Debt Payment, Savings, Gifts & Donations, Other
- **Income (7):** Salary, Freelance, Investment, Business, Gift, Refund, Other Income

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

To verify database setup, temporarily update `src/App.svelte`:

```svelte
<script>
  import DatabaseTest from './DatabaseTest.svelte'
</script>

<DatabaseTest />
```

Then run `npm run dev` and check all tests pass.

## Security

- All database tables use Row Level Security (RLS)
- Passwords handled by Supabase Auth
- API keys in environment variables (never commit .env file)
- User data isolated and protected
- NEVER use service_role key in browser code

## License

MIT

---

Built with ❤️ using Svelte and Supabase
