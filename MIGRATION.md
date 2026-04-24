# Migration Guide: Google Sheets → PostgreSQL

## Overview

This migration replaces Google Sheets storage with PostgreSQL (Supabase) as the database backend. Authentication remains Supabase-based.

## Changes

- **Database**: PostgreSQL (Supabase) instead of Google Sheets
- **Auth**: Email/password (Supabase Auth) — Google OAuth removed
- **Data model**: Transactions stored in `transactions` table with RLS policies

## Setup Instructions

### 1. Run the Migration SQL

In Supabase SQL Editor, run the migration file:

```sql
-- File: migrations/001_create_transactions.sql
-- This creates:
--   - transactions table
--   - Row Level Security (RLS) policies
--   - Required indexes
```

### 2. Update Environment Variables

Copy `.env.example` to `.env` and update:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

> **Note**: The old Google Sheets variables are deprecated and no longer needed.

### 3. Enable Supabase Auth (Email/Password)

In Supabase Dashboard:

1. Go to **Authentication** → **Providers** → **Email**
2. Enable **Email provider**
3. Configure settings as needed (email confirmations, password min length, etc.)

### 4. Test the API

Verify the endpoints work:

```bash
# Login (will use Supabase Auth directly from your frontend)
# The backend already validates JWTs via checkAuth middleware

# GET /api/transacciones - Get all transactions (requires JWT)
# POST /api/transacciones - Create transaction (requires JWT)
# PUT /api/transacciones/:id - Update transaction (requires JWT)
# DELETE /api/transacciones/:id - Delete transaction (requires JWT)
```

## Files Changed

| File | Change |
|------|--------|
| `migrations/001_create_transactions.sql` | **New** - Database schema |
| `src/services/dbService.js` | **New** - PostgreSQL CRUD service |
| `src/controllers/transactionController.js` | Updated to use dbService |
| `.env` | Removed deprecated Google variables |
| `.env.example` | Updated template |

## Files to Delete (Optional)

After verifying everything works, you can remove the obsolete Google Sheets code:

```bash
rm src/services/sheetService.js
rm src/config/googleSheets.js
rm src/config/oauth2.js
rm src/services/supabaseTokenService.js
rm src/controllers/authController.js  # (if no other auth routes needed)
rm src/routes/authRoutes.js            # (if no other auth routes needed)
```

## API Response Format

The API response format remains the same for backwards compatibility:

```json
{
  "IdOriginal": "uuid",
  "Fecha": "2026-04-23T10:00:00.000Z",
  "Asunto": "Transaction description",
  "Tipo_de_transferencia": "income",
  "Tipo": "card",
  "Name": "Payment",
  "Cantidad": 100.00
}
```