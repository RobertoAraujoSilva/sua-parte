# Missing Tables Fix Guide

## Problem Description

Your application is experiencing 404 errors because several database tables are missing from your Supabase instance:

- `workbook_versions` - For tracking official JW workbook materials
- `global_programming` - For admin-managed global programming
- `congregacoes` - For congregation management

## Error Messages

You're seeing these errors in the browser console:

```
❌ Error in loadProfile: Error: Profile loading timeout after 15000ms
Failed to load resource: the server responded with a status of 404 ()
❌ Erro ao buscar apostilas: Object
❌ Erro ao buscar programação: Object
❌ Erro ao salvar workbook: Could not find the table 'public.workbook_versions' in the schema cache
```

## Root Cause

The application code expects these tables to exist, but they were never created in your database. The tables are defined in utility files but the migration scripts were never executed.

## Solutions

### Option 1: Browser Console Fix (Recommended)

1. **Open your application** in the browser and make sure you're logged in
2. **Open the browser console** (F12 → Console tab)
3. **Run this command**:

```javascript
window.applyGlobalProgrammingSchema()
```

4. **Wait for completion** - you should see success messages
5. **Refresh the page** to see the changes

### Option 2: HTML Fix Tool

1. **Open the fix tool**: Open `fix-missing-tables.html` in your browser
2. **Make sure you're logged into your application** in another tab
3. **Click "Fix Missing Tables"** button
4. **Wait for completion** and refresh your application

### Option 3: Node.js Script

1. **Set environment variables**:
   ```bash
   export VITE_SUPABASE_URL="your-supabase-url"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

2. **Run the migration script**:
   ```bash
   node scripts/apply-missing-tables-migration.js
   ```

### Option 4: Supabase CLI Migration

1. **Apply the migration file**:
   ```bash
   supabase db push
   ```

2. **Or run the specific migration**:
   ```bash
   supabase migration up --include-all
   ```

## What the Fix Does

The fix creates the following tables:

### 1. `global_programming` Table
- Stores admin-managed global programming data
- Links to local programs and assignments
- Includes week information, meeting types, and part details

### 2. `workbook_versions` Table
- Tracks official JW workbook materials
- Stores parsing status and content
- Manages file uploads and processing

### 3. `congregacoes` Table
- Manages congregation information
- Links to students and instructors
- Includes location and contact details

## Verification

After running the fix, you can verify it worked by:

1. **Checking the browser console** - no more 404 errors
2. **Testing functionality** - material upload, programming, etc.
3. **Running verification queries**:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('global_programming', 'workbook_versions', 'congregacoes');

-- Check table structure
\d global_programming
\d workbook_versions
\d congregacoes
```

## Troubleshooting

### If the fix doesn't work:

1. **Check permissions**: Make sure you have admin access to the database
2. **Verify Supabase connection**: Ensure your environment variables are correct
3. **Check RLS policies**: The tables have Row Level Security enabled
4. **Review console errors**: Look for specific error messages

### Common Issues:

- **Permission denied**: You need the service role key, not the anon key
- **Function not found**: Make sure you're on the application page
- **RLS blocking access**: Check that your user has the right role

## Prevention

To prevent this issue in the future:

1. **Always run migrations** when setting up a new environment
2. **Use Supabase CLI** for database management
3. **Test database schema** in development before production
4. **Monitor migration status** in your deployment process

## Files Created

- `supabase/migrations/20250118000000_create_missing_tables.sql` - Migration file
- `scripts/apply-missing-tables-migration.js` - Node.js script
- `scripts/fix-missing-tables.js` - Browser script
- `fix-missing-tables.html` - HTML fix tool

## Support

If you continue to have issues:

1. Check the browser console for specific error messages
2. Verify your Supabase project settings
3. Ensure all environment variables are set correctly
4. Contact your database administrator if needed
