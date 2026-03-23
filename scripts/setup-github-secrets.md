# 🔐 GitHub Secrets Setup Script

## Quick Copy-Paste Guide for GitHub Repository Secrets

Navigate to: **Your Repository → Settings → Secrets and variables → Actions → New repository secret**

### Required Secrets

| Secret Name | Description |
|-------------|-------------|
| `CYPRESS_RECORD_KEY` | Your Cypress Cloud record key |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |
| `CYPRESS_INSTRUCTOR_EMAIL` | Test instructor email |
| `CYPRESS_INSTRUCTOR_PASSWORD` | Test instructor password |
| `CYPRESS_STUDENT_EMAIL` | Test student email |
| `CYPRESS_STUDENT_PASSWORD` | Test student password |

> ⚠️ **Security Note**: Never commit actual credentials to version control. Obtain the values from your team's secure credential store.

## ✅ Verification Checklist

After adding all secrets, verify you have:

- [ ] CYPRESS_RECORD_KEY
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY
- [ ] CYPRESS_INSTRUCTOR_EMAIL
- [ ] CYPRESS_INSTRUCTOR_PASSWORD
- [ ] CYPRESS_STUDENT_EMAIL
- [ ] CYPRESS_STUDENT_PASSWORD

## 🚀 Next Steps

1. Add all secrets above to your GitHub repository
2. Commit and push the workflow file
3. Check the Actions tab for the first workflow run
4. Monitor Cypress Cloud dashboard for test results
