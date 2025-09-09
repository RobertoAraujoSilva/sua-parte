# 🔑 Cypress Cloud Record Key Generation Guide

## 🎯 **Step-by-Step Process**

### Step 1: Access Cypress Cloud Dashboard
1. Go to: https://cloud.cypress.io/projects/o6ctse/settings
2. Log in with your Cypress Cloud account
3. Navigate to the "Record Keys" section

### Step 2: Generate New Record Key
1. Click "Create New Key" button
2. Give it a descriptive name (e.g., "Sistema Ministerial CI/CD")
3. Copy the generated key (it will look like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Step 3: Update Local Configuration
Replace the key in your `.env` file:
```bash
# OLD (invalid)
CYPRESS_RECORD_KEY=a0b30189-faea-475f-9aa8-89eface58524

# NEW (replace with your generated key)
CYPRESS_RECORD_KEY=your-new-record-key-here
```

### Step 4: Test Locally
```bash
# Test without recording first
scripts\run-cypress-fixed.bat audit

# Test with recording using new key
scripts\run-cypress-fixed.bat record
```

### Step 5: Update GitHub Secrets
1. Go to: https://github.com/RobertoAraujoSilva/sua-parte/settings/secrets/actions
2. Find `CYPRESS_RECORD_KEY` secret
3. Click "Update" and paste the new key
4. Save the changes

## 🔍 **Verification Steps**

### Local Verification
```bash
# Should show successful recording
scripts\run-cypress-fixed.bat record
```

Expected output should include:
```
✔ Recorded Run: https://cloud.cypress.io/projects/o6ctse/runs/xxxxx
```

### GitHub Actions Verification
1. Push changes to trigger workflow
2. Check Actions tab for successful run
3. Verify results appear in Cypress Cloud dashboard

## 🚨 **Troubleshooting**

### If New Key Still Fails
1. **Check Project Access**: Ensure you have admin access to project `o6ctse`
2. **Verify Organization**: Confirm you're in the correct Cypress Cloud organization
3. **Key Permissions**: Ensure the key has recording permissions
4. **Project ID**: Double-check the project ID is `o6ctse`

### Common Error Messages
- "Record key not valid": Key was not copied correctly or has wrong permissions
- "Project not found": Project ID mismatch or access issue
- "Organization access denied": User not part of the organization

## 📋 **Quick Reference**

### Required Information
- **Project ID**: `o6ctse`
- **Dashboard URL**: https://cloud.cypress.io/projects/o6ctse
- **Settings URL**: https://cloud.cypress.io/projects/o6ctse/settings

### Files to Update
1. `.env` file (local development)
2. GitHub repository secrets (CI/CD)

### Test Commands
```bash
# Local test without recording
scripts\run-cypress-fixed.bat audit

# Local test with recording
scripts\run-cypress-fixed.bat record

# GitHub Actions test
git push origin main
```

## ✅ **Success Indicators**

You'll know the new key works when:
- ✅ Local recording test completes successfully
- ✅ Cypress Cloud dashboard shows new test runs
- ✅ GitHub Actions workflow runs without authentication errors
- ✅ Test results appear in Cypress Cloud with GitHub integration

## 🔗 **Next Steps After Key Generation**

1. Update `.env` file with new key
2. Test locally with recording
3. Update GitHub repository secrets
4. Push changes to test GitHub Actions
5. Monitor Cypress Cloud dashboard for results
