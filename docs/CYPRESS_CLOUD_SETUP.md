# 🌩️ Cypress Cloud Integration - Sistema Ministerial

## 📋 Overview

This guide explains how to integrate your Sistema Ministerial project with Cypress Cloud for test recording, monitoring, and analytics.

## 🔧 Configuration

### 1. Project ID
The Cypress Cloud project ID `o6ctse` has been added to `cypress.config.mjs`:

```javascript
export default defineConfig({
  projectId: 'o6ctse',
  // ... rest of configuration
})
```

### 2. Record Key Setup
The record key is stored securely in the `.env` file:

```bash
# Cypress Cloud configuration
CYPRESS_RECORD_KEY=your-record-key-here
```

**⚠️ IMPORTANT**: Replace `your-record-key-here` with your actual record key from Cypress Cloud.

### 3. Test Credentials Configuration
The following test credentials are configured for automated E2E testing:

```bash
# Instructor Account (Full Admin Access - instrutor role)
CYPRESS_INSTRUCTOR_EMAIL=frankwebber33@hotmail.com
CYPRESS_INSTRUCTOR_PASSWORD=13a21r15

# Student Account (Limited Portal Access - estudante role)
CYPRESS_STUDENT_EMAIL=franklinmarceloferreiradelima@gmail.com
CYPRESS_STUDENT_PASSWORD=13a21r15

# Legacy Franklin credentials (for existing cy.loginAsFranklin() command)
FRANKLIN_EMAIL=franklinmarceloferreiradelima@gmail.com
FRANKLIN_PASSWORD=13a21r15
```

### 4. Available Login Commands
```typescript
// New role-based login commands
cy.loginAsInstructor()  // Full admin access to dashboard and management
cy.loginAsStudent()     // Limited access to personal student portal

// Legacy command (still supported)
cy.loginAsFranklin()    // Student access (same as loginAsStudent)

// Custom credentials
cy.loginWithCredentials('email@example.com', 'password')
```

### 5. Getting Your Record Key
1. Go to [Cypress Cloud Project Settings](https://cloud.cypress.io/projects/o6ctse/settings)
2. Navigate to the "Record Keys" section
3. Copy your record key
4. Update the `.env` file with the actual key

## 🚀 Usage

### NPM Scripts for Recording

```bash
# Record all tests
npm run test:e2e:record

# Record specific tests
npm run test:audit:record          # Audit test with recording
npm run test:franklin:record       # Franklin login test with recording
npm run test:sarah:record          # Sarah registration test with recording
```

### Batch Script for Recording

```bash
# Record audit test
scripts\run-cypress-fixed.bat record

# Record all tests
scripts\run-cypress-fixed.bat record-all
```

### Manual Recording Commands

```bash
# Record all tests
npx cypress run --record

# Record specific test
npx cypress run --spec "cypress/e2e/auditoria_sistema_ministerial.cy.ts" --record

# Record with specific browser
npx cypress run --record --browser chrome
```

## 🔒 Security Best Practices

1. **Never commit the record key** to version control
2. **Keep `.env` in `.gitignore`**
3. **Use environment variables** in CI/CD pipelines
4. **Rotate record keys** if compromised

## 🌐 CI/CD Integration

For CI/CD environments, set the record key as an environment variable:

```bash
# GitHub Actions
CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}

# GitLab CI
CYPRESS_RECORD_KEY: $CYPRESS_RECORD_KEY

# Other CI providers
export CYPRESS_RECORD_KEY=your-record-key
```

## 📊 Cypress Cloud Features

Once integrated, you'll have access to:

- **Test Results Dashboard**: View test runs, failures, and trends
- **Test Replay**: Debug failed tests with video recordings
- **Parallelization**: Run tests in parallel across multiple machines
- **Smart Orchestration**: Optimize test execution order
- **Analytics**: Track test performance and flakiness
- **GitHub Integration**: See test results in pull requests

## 🔍 Troubleshooting

### Common Issues

1. **"Record key not found"**
   - Verify the record key in `.env` file
   - Ensure no extra spaces or quotes

2. **"Project not found"**
   - Verify project ID in `cypress.config.mjs`
   - Check Cypress Cloud dashboard

3. **"Authentication failed"**
   - Regenerate record key in Cypress Cloud
   - Update `.env` file with new key

### Debug Commands

```bash
# Verify configuration
npx cypress verify

# Check project info
npx cypress info

# Test without recording first
npx cypress run --spec "cypress/e2e/auditoria_sistema_ministerial.cy.ts"
```

## 📈 Next Steps

1. Set up your record key in `.env`
2. Run your first recorded test
3. Explore the Cypress Cloud dashboard
4. Configure CI/CD integration
5. Set up team notifications and integrations

## 🔗 Useful Links

- [Cypress Cloud Dashboard](https://cloud.cypress.io/projects/o6ctse)
- [Project Settings](https://cloud.cypress.io/projects/o6ctse/settings)
- [Cypress Cloud Documentation](https://docs.cypress.io/guides/cloud/introduction)
- [Record Key Management](https://docs.cypress.io/guides/cloud/projects#Record-key)
