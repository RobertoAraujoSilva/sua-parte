# 🔐 GitHub Secrets Setup Script

## Quick Copy-Paste Guide for GitHub Repository Secrets

Navigate to: **Your Repository → Settings → Secrets and variables → Actions → New repository secret**

### 1. Cypress Cloud Configuration

```
Name: CYPRESS_RECORD_KEY
Value: a0b30189-faea-475f-9aa8-89eface58524
```

### 2. Supabase Configuration

```
Name: VITE_SUPABASE_URL
Value: https://nwpuurgwnnuejqinkvrh.supabase.co
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak
```

### 3. Cypress Test Credentials - Instructor

```
Name: CYPRESS_INSTRUCTOR_EMAIL
Value: frankwebber33@hotmail.com
```

```
Name: CYPRESS_INSTRUCTOR_PASSWORD
Value: 13a21r15
```

### 4. Cypress Test Credentials - Student

```
Name: CYPRESS_STUDENT_EMAIL
Value: franklinmarceloferreiradelima@gmail.com
```

```
Name: CYPRESS_STUDENT_PASSWORD
Value: 13a21r15
```

### 5. Legacy Franklin Credentials

```
Name: FRANKLIN_EMAIL
Value: franklinmarceloferreiradelima@gmail.com
```

```
Name: FRANKLIN_PASSWORD
Value: 13a21r15
```

## ✅ Verification Checklist

After adding all secrets, verify you have:

- [ ] CYPRESS_RECORD_KEY
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY
- [ ] CYPRESS_INSTRUCTOR_EMAIL
- [ ] CYPRESS_INSTRUCTOR_PASSWORD
- [ ] CYPRESS_STUDENT_EMAIL
- [ ] CYPRESS_STUDENT_PASSWORD
- [ ] FRANKLIN_EMAIL
- [ ] FRANKLIN_PASSWORD

## 🚀 Next Steps

1. Add all secrets above to your GitHub repository
2. Commit and push the workflow file
3. Check the Actions tab for the first workflow run
4. Monitor Cypress Cloud dashboard for test results

## 🔗 Quick Links

- [GitHub Repository Secrets](https://github.com/RobertoAraujoSilva/sua-parte/settings/secrets/actions)
- [Cypress Cloud Dashboard](https://cloud.cypress.io/projects/o6ctse)
- [GitHub Actions](https://github.com/RobertoAraujoSilva/sua-parte/actions)
