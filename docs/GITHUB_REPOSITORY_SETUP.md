# 🔧 GitHub Repository Configuration Guide

## 📋 **Required GitHub Secrets (9 Total)**

Navigate to: **https://github.com/RobertoAraujoSilva/sua-parte/settings/secrets/actions**

### 1. Cypress Cloud Configuration

```
Name: CYPRESS_RECORD_KEY
Value: [NEW KEY FROM CYPRESS CLOUD DASHBOARD]
Description: Record key for Cypress Cloud integration
```

### 2. Supabase Configuration

```
Name: VITE_SUPABASE_URL
Value: https://nwpuurgwnnuejqinkvrh.supabase.co
Description: Supabase project URL
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak
Description: Supabase anonymous key for client authentication
```

### 3. Cypress Test Credentials - Instructor

```
Name: CYPRESS_INSTRUCTOR_EMAIL
Value: frankwebber33@hotmail.com
Description: Instructor account email for E2E testing
```

```
Name: CYPRESS_INSTRUCTOR_PASSWORD
Value: 13a21r15
Description: Instructor account password for E2E testing
```

### 4. Cypress Test Credentials - Student

```
Name: CYPRESS_STUDENT_EMAIL
Value: franklinmarceloferreiradelima@gmail.com
Description: Student account email for E2E testing
```

```
Name: CYPRESS_STUDENT_PASSWORD
Value: 13a21r15
Description: Student account password for E2E testing
```

### 5. Legacy Franklin Credentials

```
Name: FRANKLIN_EMAIL
Value: franklinmarceloferreiradelima@gmail.com
Description: Legacy Franklin account email for backward compatibility
```

```
Name: FRANKLIN_PASSWORD
Value: 13a21r15
Description: Legacy Franklin account password for backward compatibility
```

## ✅ **Verification Checklist**

After adding all secrets, verify you have:

- [ ] CYPRESS_RECORD_KEY (NEW - from Cypress Cloud dashboard)
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY
- [ ] CYPRESS_INSTRUCTOR_EMAIL
- [ ] CYPRESS_INSTRUCTOR_PASSWORD
- [ ] CYPRESS_STUDENT_EMAIL
- [ ] CYPRESS_STUDENT_PASSWORD
- [ ] FRANKLIN_EMAIL
- [ ] FRANKLIN_PASSWORD

## 🚀 **Testing the Configuration**

### Step 1: Local Testing
```bash
# Update .env with new record key first
# Then test locally
scripts\run-cypress-fixed.bat record
```

### Step 2: GitHub Actions Testing
```bash
# Commit and push to trigger workflow
git add .
git commit -m "feat: update Cypress Cloud integration with new record key"
git push origin main
```

### Step 3: Monitor Results
1. **GitHub Actions**: https://github.com/RobertoAraujoSilva/sua-parte/actions
2. **Cypress Cloud**: https://cloud.cypress.io/projects/o6ctse

## 🔍 **Workflow Trigger Events**

The workflow will automatically run on:

### Push Events
- `main` branch
- `develop` branch

### Pull Request Events
- PRs targeting `main` branch
- PRs targeting `develop` branch

### Manual Trigger
- Via GitHub Actions UI (workflow_dispatch)

## 📊 **Expected Workflow Behavior**

### Job Execution Order
1. **Install Job**: Builds application and caches dependencies
2. **Cypress Jobs**: 2 parallel containers running tests
3. **Summary Job**: Provides results summary and dashboard links

### Parallel Execution
- **Container 1**: Runs subset of tests
- **Container 2**: Runs remaining tests
- **Total Time**: ~50% faster than sequential execution

### Artifacts Generated
- **Screenshots**: On test failures (7-day retention)
- **Videos**: Always generated (7-day retention)
- **Container-specific naming**: Prevents conflicts

## 🛡️ **Security Best Practices**

### Secrets Management
- ✅ All sensitive data stored as GitHub secrets
- ✅ No credentials in source code
- ✅ Environment variables used in workflow
- ✅ Secrets not exposed in logs

### Access Control
- ✅ Repository secrets only accessible to authorized workflows
- ✅ Cypress Cloud record key has limited permissions
- ✅ Supabase keys are project-specific

## 🔧 **Troubleshooting Common Issues**

### Workflow Fails to Start
- Check if all required secrets are set
- Verify workflow file syntax
- Ensure branch protection rules allow workflows

### Build Failures
- Check Supabase environment variables
- Verify Node.js version compatibility
- Review build logs for specific errors

### Test Failures
- Check Cypress Cloud dashboard for detailed logs
- Review uploaded screenshots and videos
- Verify test credentials are correct

### Recording Issues
- Ensure new record key is valid
- Check Cypress Cloud project access
- Verify project ID matches (`o6ctse`)

## 📈 **Success Indicators**

You'll know everything is working when:

- ✅ GitHub Actions workflow completes successfully
- ✅ Tests appear in Cypress Cloud dashboard
- ✅ Parallel execution shows 2 containers
- ✅ PR status checks show test results
- ✅ Screenshots/videos available for failed tests
- ✅ GitHub integration shows test status

## 🔗 **Quick Access Links**

- **GitHub Secrets**: https://github.com/RobertoAraujoSilva/sua-parte/settings/secrets/actions
- **GitHub Actions**: https://github.com/RobertoAraujoSilva/sua-parte/actions
- **Cypress Cloud**: https://cloud.cypress.io/projects/o6ctse
- **Cypress Settings**: https://cloud.cypress.io/projects/o6ctse/settings
