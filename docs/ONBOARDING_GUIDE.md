# Onboarding Guide for Sistema Ministerial

## Overview

This guide helps new developers understand and set up the Sistema Ministerial project, a comprehensive platform for managing ministerial assignments for Jehovah's Witnesses congregations.

---

## Project Structure

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js with Supabase integration
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Testing:** Cypress for end-to-end tests
- **Deployment:** Vite for frontend build, Node.js backend server

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project
- PostgreSQL database

### Clone and Install

```bash
git clone https://github.com/RobertoAraujoSilva/sua-parte.git
cd sua-parte
npm install
```

### Environment Variables

Create `.env.local` and configure:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_connection_string
```

### Database Setup

Run Supabase migrations:

```bash
npx supabase db push
```

Ensure the following trigger exists to auto-create user profiles:

```sql
-- Create profiles table if not exists
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null default 'instrutor',
  display_name text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger function to insert profile on new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, coalesce((new.raw_user_meta_data->>'role'), 'instrutor'))
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Create trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

---

## Running the Project

### Start Backend and Frontend

```bash
npm run dev:all
```

- Backend runs on port 3000
- Frontend runs on port 8080

### Access Admin Dashboard

Open [http://localhost:8080/admin](http://localhost:8080/admin)

---

## Authentication Flow Fixes

To avoid infinite login loops:

1. Ensure user profiles exist in `profiles` table.
2. Adjust `AuthContext` to only redirect to onboarding if profile exists and onboarding is incomplete.
3. Fix `ProtectedRoute` to lock role metadata after timeout to prevent repeated redirects.
4. Update `BemVindo.tsx` to consume `AuthContext` instead of calling `supabase.auth.getUser()` on mount.

---

## Development Tips

- Use the provided Cypress tests for end-to-end validation.
- Follow the AGENTS.md orchestrator guidelines for workflow.
- Use the `scripts/` folder for automation tasks.
- Keep dependencies updated and monitor bundle size.

---

## Support

- GitHub Issues: https://github.com/RobertoAraujoSilva/sua-parte/issues
- Contact: amazonwebber007@gmail.com

---

## References

- [Project Documentation](README.md)
- [AGENTS.md Orchestrator](AGENTS.md)
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://reactjs.org/docs/getting-started.html)

---

Welcome to the Sistema Ministerial development team! Follow this guide to get started quickly and contribute effectively.
