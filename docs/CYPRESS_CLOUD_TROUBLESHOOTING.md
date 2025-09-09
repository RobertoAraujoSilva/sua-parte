# 🔧 Cypress Cloud Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Issue 1: "Record Key is not valid with this projectId"

**Error Message:**
```
Your Record Key a0b30...8524 is not valid with this projectId: o6ctse
It may have been recently revoked by you or another user.
```

**Possible Causes:**
1. Record key was revoked or regenerated
2. Project ID mismatch
3. Permissions issue with Cypress Cloud account

**Solutions:**

#### Option A: Generate New Record Key
1. Go to [Cypress Cloud Project Settings](https://cloud.cypress.io/projects/o6ctse/settings)
2. Navigate to "Record Keys" section
3. Click "Create New Key"
4. Copy the new key
5. Update your `.env` file:
   ```bash
   CYPRESS_RECORD_KEY=new-key-here
   ```
6. Update GitHub repository secrets with the new key

#### Option B: Verify Project Access
1. Ensure you're logged into the correct Cypress Cloud account
2. Verify you have access to project `o6ctse`
3. Check if you're a member of the organization

#### Option C: Test Without Recording First
```bash
# Test locally without recording
scripts\run-cypress-fixed.bat audit

# Test with recording after fixing key
scripts\run-cypress-fixed.bat record
```

### Issue 2: PowerShell Spawn Error

**Error Message:**
```
spawn powershell.exe ENOENT
```

**Solution:**
Use the fixed batch script instead of npm commands directly:
```bash
# Instead of: npm run cypress:run
# Use: scripts\run-cypress-fixed.bat audit
```

### Issue 3: Server Connection Issues

**Error Message:**
```
cy.visit() failed trying to load: http://localhost:8080/auth
```

**Solutions:**
1. Ensure development server is running:
   ```bash
   npm run dev
   ```
2. Check if the correct port is configured
3. Verify Supabase environment variables are set

### Issue 4: GitHub Actions Workflow Failures

**Common Causes:**
1. Missing GitHub secrets
2. Build failures due to environment variables
3. Server startup timeout

**Solutions:**

#### Check Required GitHub Secrets
Ensure all these secrets are set in your repository:
- `CYPRESS_RECORD_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `CYPRESS_INSTRUCTOR_EMAIL`
- `CYPRESS_INSTRUCTOR_PASSWORD`
- `CYPRESS_STUDENT_EMAIL`
- `CYPRESS_STUDENT_PASSWORD`
- `FRANKLIN_EMAIL`
- `FRANKLIN_PASSWORD`

#### Debug GitHub Actions
1. Check workflow logs in Actions tab
2. Look for specific error messages
3. Verify environment variables are being passed correctly

## 🔍 Diagnostic Commands

### Local Testing
```bash
# Test Cypress installation
npx cypress verify

# Test without recording
npm run test:audit

# Test with recording (requires valid key)
npm run test:audit:record

# Use batch script (recommended)
scripts\run-cypress-fixed.bat audit
```

### Environment Verification
```bash
# Check if Supabase variables are loaded
echo $VITE_SUPABASE_URL

# Check Cypress configuration
npx cypress info
```

### GitHub Actions Testing
```bash
# Test build locally
npm run build
npm run preview

# Test the same commands used in CI
npm ci
npm run build
npm run preview &
npx wait-on http://localhost:4173
```

## 📋 Verification Checklist

### Before Running Tests
- [ ] Development server is running (`npm run dev`)
- [ ] Supabase environment variables are set
- [ ] Cypress is installed and verified
- [ ] Record key is valid (if using recording)

### Before Pushing to GitHub
- [ ] All GitHub secrets are configured
- [ ] Workflow file is committed
- [ ] Local tests pass without recording
- [ ] Build process works locally

### After GitHub Actions Run
- [ ] Check workflow logs for errors
- [ ] Verify test results in Cypress Cloud
- [ ] Review artifacts (screenshots, videos)
- [ ] Check PR status checks

## 🔗 Useful Links

- **Cypress Cloud Dashboard**: https://cloud.cypress.io/projects/o6ctse
- **Project Settings**: https://cloud.cypress.io/projects/o6ctse/settings
- **GitHub Repository**: https://github.com/RobertoAraujoSilva/sua-parte
- **GitHub Actions**: https://github.com/RobertoAraujoSilva/sua-parte/actions
- **GitHub Secrets**: https://github.com/RobertoAraujoSilva/sua-parte/settings/secrets/actions

## 🆘 Getting Help

If you continue to experience issues:

1. **Check Cypress Cloud Status**: https://status.cypress.io/
2. **Review Cypress Documentation**: https://docs.cypress.io/guides/cloud/introduction
3. **GitHub Actions Documentation**: https://docs.github.com/en/actions
4. **Contact Support**: Use Cypress Cloud support if needed

## 📝 Next Steps After Resolving Issues

1. **Generate new record key** if needed
2. **Update all environment variables** and secrets
3. **Test locally** before pushing to GitHub
4. **Monitor first GitHub Actions run** carefully
5. **Set up notifications** for future test failures
