# 🔧 Environment Setup Guide - Sistema Ministerial

## **📋 OVERVIEW**

This guide explains how to configure the environment variables for the Sistema Ministerial application. The `.env` file contains all necessary configuration for development, testing, and production environments.

---

## **🚨 SECURITY REQUIREMENTS**

### **CRITICAL SECURITY NOTES:**
- ✅ **`.env` files are excluded from version control** via `.gitignore`
- ❌ **NEVER commit `.env` files** to GitHub or any repository
- 🔐 **Keep all tokens and credentials secure**
- 🔄 **Use different values** for development, staging, and production
- 🔑 **Rotate tokens regularly** for security

---

## **📁 ENVIRONMENT FILES STRUCTURE**

```
sistema-ministerial/
├── .env.example          # Template with placeholder values (safe to commit)
├── .env                  # Your actual environment variables (NEVER commit)
├── .env.local           # Local overrides (NEVER commit)
├── .env.development     # Development-specific (NEVER commit)
├── .env.production      # Production-specific (NEVER commit)
└── .gitignore           # Excludes all .env files from version control
```

---

## **🔧 SETUP INSTRUCTIONS**

### **Step 1: Copy Template File**
```bash
# Copy the example file to create your environment file
cp .env.example .env
```

### **Step 2: Configure Required Values**
Edit `.env` and replace placeholder values with your actual credentials:

#### **🗄️ Database Configuration (REQUIRED)**
```bash
# Get these from Supabase Dashboard > Settings > API
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-anon-key"

# Get from Supabase Dashboard > Settings > Database
DATABASE_URL="postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres"

# Get from Supabase Dashboard > Settings > API (Service Role)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key"

# Generate at: https://supabase.com/dashboard/account/tokens
SUPABASE_ACCESS_TOKEN="sbp_your-personal-access-token"
```

#### **🔧 Development Tools (OPTIONAL)**
```bash
# Generate at: https://github.com/settings/tokens
# Required scopes: repo, workflow, read:org
GITHUB_TOKEN="ghp_your-github-token"

# Get from: https://cloud.cypress.io/projects/[project-id]/settings
CYPRESS_RECORD_KEY="your-cypress-record-key"
```

---

## **🎯 ENVIRONMENT VARIABLE CATEGORIES**

### **1. 🗄️ Database & Backend Configuration**
| Variable | Purpose | Required | Where to Get |
|----------|---------|----------|--------------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ Yes | Supabase Dashboard > API |
| `VITE_SUPABASE_ANON_KEY` | Public API key | ✅ Yes | Supabase Dashboard > API |
| `DATABASE_URL` | Database connection | ✅ Yes | Supabase Dashboard > Database |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations | ✅ Yes | Supabase Dashboard > API |
| `SUPABASE_ACCESS_TOKEN` | MCP integration | ⚠️ Optional | Supabase Account > Tokens |

### **2. 🔧 Development Tools**
| Variable | Purpose | Required | Where to Get |
|----------|---------|----------|--------------|
| `GITHUB_TOKEN` | Repository operations | ⚠️ Optional | GitHub Settings > Tokens |
| `NODE_ENV` | Environment mode | ✅ Yes | Set to "development" |
| `VITE_APP_ENV` | App environment | ✅ Yes | Set to "development" |

### **3. 🧪 Testing Infrastructure**
| Variable | Purpose | Required | Where to Get |
|----------|---------|----------|--------------|
| `CYPRESS_RECORD_KEY` | Test recording | ⚠️ Optional | Cypress Cloud Dashboard |
| `TEST_INSTRUCTOR_EMAIL` | E2E test account | ⚠️ Optional | Create test user |
| `TEST_STUDENT_EMAIL` | E2E test account | ⚠️ Optional | Create test user |
| `TEST_DEVELOPER_EMAIL` | E2E test account | ⚠️ Optional | Create test user |

### **4. 🔐 Security & Authentication**
| Variable | Purpose | Required | Where to Get |
|----------|---------|----------|--------------|
| `JWT_SECRET` | Token signing | ✅ Yes | Generate random 32+ chars |
| `SESSION_SECRET` | Session security | ✅ Yes | Generate random 32+ chars |

### **5. 📁 File Storage & Uploads**
| Variable | Purpose | Required | Where to Get |
|----------|---------|----------|--------------|
| `SUPABASE_STORAGE_BUCKET` | File storage | ✅ Yes | Create in Supabase Storage |
| `MAX_FILE_SIZE` | Upload limit | ✅ Yes | Set to "10485760" (10MB) |

### **6. 🚩 Feature Flags**
| Variable | Purpose | Required | Default |
|----------|---------|----------|---------|
| `VITE_ENABLE_DEVELOPER_PANEL` | Developer features | ⚠️ Optional | "true" |
| `VITE_ENABLE_TEMPLATE_LIBRARY` | Template system | ⚠️ Optional | "true" |
| `VITE_ENABLE_DEBUG_PANEL` | Debug tools | ⚠️ Optional | "true" |

---

## **🔑 HOW TO OBTAIN CREDENTIALS**

### **Supabase Configuration**
1. **Go to**: [Supabase Dashboard](https://supabase.com/dashboard)
2. **Select your project**: `sistema-ministerial`
3. **Navigate to**: Settings > API
4. **Copy**:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### **Database URL**
1. **Go to**: Settings > Database
2. **Copy connection string**
3. **Replace `[YOUR-PASSWORD]`** with your database password

### **Personal Access Token**
1. **Go to**: [Supabase Account Tokens](https://supabase.com/dashboard/account/tokens)
2. **Generate new token**
3. **Copy** → `SUPABASE_ACCESS_TOKEN`

### **GitHub Token**
1. **Go to**: [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. **Generate new token (classic)**
3. **Select scopes**: `repo`, `workflow`, `read:org`
4. **Copy** → `GITHUB_TOKEN`

### **Cypress Cloud**
1. **Go to**: [Cypress Cloud](https://cloud.cypress.io/)
2. **Create/select project**
3. **Go to**: Project Settings
4. **Copy Record Key** → `CYPRESS_RECORD_KEY`

---

## **🧪 TEST USER SETUP**

### **Creating Test Accounts**
After setting up the environment, create test users in your Supabase database:

```sql
-- Create instructor test user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('instrutor.teste@exemplo.com', crypt('TestInstrutor123!', gen_salt('bf')), now());

-- Create student test user  
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('estudante.teste@exemplo.com', crypt('TestEstudante123!', gen_salt('bf')), now());

-- Create developer test user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('desenvolvedor.teste@exemplo.com', crypt('TestDeveloper123!', gen_salt('bf')), now());
```

### **Set User Roles**
```sql
-- Set roles in profiles table
INSERT INTO profiles (id, nome_completo, role, congregacao)
SELECT id, 'Instrutor de Teste', 'instrutor', 'Congregação Teste'
FROM auth.users WHERE email = 'instrutor.teste@exemplo.com';

INSERT INTO profiles (id, nome_completo, role, congregacao)
SELECT id, 'Estudante de Teste', 'estudante', 'Congregação Teste'
FROM auth.users WHERE email = 'estudante.teste@exemplo.com';

INSERT INTO profiles (id, nome_completo, role, congregacao)
SELECT id, 'Desenvolvedor de Teste', 'developer', 'Congregação Teste'
FROM auth.users WHERE email = 'desenvolvedor.teste@exemplo.com';
```

---

## **🔍 VALIDATION & TESTING**

### **Environment Validation**
```bash
# Check if all required variables are set
npm run env:check

# Validate Supabase connection
npm run test:connection

# Test authentication
npm run test:auth
```

### **Feature Testing**
```bash
# Test developer panel access
npm run test:developer-panel

# Test template system
npm run test:templates

# Run full E2E tests
npm run test:e2e
```

---

## **🚨 TROUBLESHOOTING**

### **Common Issues**

#### **"Supabase connection failed"**
- ✅ Check `VITE_SUPABASE_URL` format
- ✅ Verify `VITE_SUPABASE_ANON_KEY` is correct
- ✅ Ensure project is not paused

#### **"Authentication error"**
- ✅ Check `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Verify user exists in auth.users table
- ✅ Check profile role is set correctly

#### **"Developer panel access denied"**
- ✅ Ensure database migration was applied
- ✅ Check user role is 'developer'
- ✅ Verify `VITE_ENABLE_DEVELOPER_PANEL="true"`

#### **"Template system not working"**
- ✅ Apply database migration for template fields
- ✅ Check `VITE_ENABLE_TEMPLATE_LIBRARY="true"`
- ✅ Verify storage bucket exists

### **Environment Debugging**
```bash
# Show current environment variables (safe ones only)
npm run env:show

# Validate environment configuration
npm run env:validate

# Test database connection
npm run db:test
```

---

## **📊 ENVIRONMENT STATUS CHECKLIST**

### **✅ Required for Basic Functionality**
- [ ] `VITE_SUPABASE_URL` configured
- [ ] `VITE_SUPABASE_ANON_KEY` configured
- [ ] `DATABASE_URL` configured
- [ ] `JWT_SECRET` generated (32+ characters)
- [ ] `SESSION_SECRET` generated (32+ characters)

### **⚠️ Required for Full Functionality**
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configured
- [ ] `SUPABASE_ACCESS_TOKEN` configured
- [ ] Storage bucket created
- [ ] Test users created with proper roles

### **🔧 Optional for Development**
- [ ] `GITHUB_TOKEN` configured
- [ ] `CYPRESS_RECORD_KEY` configured
- [ ] Debug features enabled
- [ ] Performance monitoring enabled

---

**Status**: ✅ **Environment configuration complete**  
**Next Steps**: Apply database migration and test functionality
