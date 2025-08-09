# 🚀 GitHub Actions CI/CD Setup - Sistema Ministerial

## 📋 Overview

This guide explains how to set up automated Cypress testing with GitHub Actions and Cypress Cloud integration for the Sistema Ministerial project.

## 🔧 Prerequisites

- ✅ GitHub repository for Sistema Ministerial
- ✅ Cypress Cloud project (ID: `o6ctse`)
- ✅ Cypress Cloud record key: `a0b30189-faea-475f-9aa8-89eface58524`
- ✅ Supabase project configuration

## 🔐 GitHub Secrets Configuration

### Required Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

#### 1. Cypress Cloud Configuration
```
Name: CYPRESS_RECORD_KEY
Value: a0b30189-faea-475f-9aa8-89eface58524
```

#### 2. Supabase Configuration
```
Name: VITE_SUPABASE_URL
Value: https://nwpuurgwnnuejqinkvrh.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak
```

#### 3. Cypress Test Credentials
```
Name: CYPRESS_INSTRUCTOR_EMAIL
Value: frankwebber33@hotmail.com

Name: CYPRESS_INSTRUCTOR_PASSWORD
Value: 13a21r15

Name: CYPRESS_STUDENT_EMAIL
Value: franklinmarceloferreiradelima@gmail.com

Name: CYPRESS_STUDENT_PASSWORD
Value: 13a21r15

Name: FRANKLIN_EMAIL
Value: franklinmarceloferreiradelima@gmail.com

Name: FRANKLIN_PASSWORD
Value: 13a21r15
```

## 📁 Workflow Configuration

The GitHub Actions workflow (`.github/workflows/cypress.yml`) includes:

### 🎯 Main Features
- **Automated testing** on push to `main` and `develop` branches
- **Pull request testing** for code review validation
- **Manual trigger** capability via workflow_dispatch
- **Parallel test execution** across 2 containers for faster results
- **Chrome browser testing** (matching local setup)
- **Cypress Cloud recording** for detailed analytics
- **Optimized caching** for dependencies and build artifacts

### 🏗️ Build Process
1. **Install Job**:
   - Checkout code from repository
   - Setup Node.js 18.x with npm caching
   - Install dependencies with `npm ci`
   - Build application with Vite
   - Cache build artifacts and node_modules

2. **Cypress Job** (Matrix Strategy - 2 containers):
   - Restore cached dependencies and build
   - Start preview server on port 4173
   - Run Cypress tests in parallel with recording
   - Upload artifacts (screenshots, videos)

3. **Summary Job**:
   - Check overall test results
   - Provide links to Cypress Cloud dashboard

### 🧪 Test Jobs Architecture
- **Install Job**: Builds once, caches for reuse
- **Cypress Job**: Runs tests in parallel across 2 containers
- **Test Results Job**: Summarizes results and provides dashboard links

## 🌐 Server Configuration

The workflow uses Vite's preview server:
- **Build command**: `npm run build`
- **Start command**: `npm run preview`
- **Server URL**: `http://localhost:4173`
- **Wait timeout**: 120 seconds

## 📊 Artifacts and Reports

### Automatic Uploads
- **Screenshots**: On test failures (7-day retention)
- **Videos**: Always uploaded (7-day retention)
- **Test Results**: Reports and coverage (30-day retention)

### Cypress Cloud Integration
- **Real-time dashboard** at https://cloud.cypress.io/projects/o6ctse
- **Test replay** for debugging failures
- **Performance analytics** and trends
- **GitHub integration** with PR status checks

## 🚀 Deployment Steps

### 1. Add Workflow File
The workflow file is already created at `.github/workflows/cypress.yml`

### 2. Configure GitHub Secrets
Add all the secrets listed above in your GitHub repository settings.

### 3. Update Package.json (if needed)
Ensure these scripts exist in your `package.json`:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "test:audit:record": "cypress run --spec \"cypress/e2e/auditoria_sistema_ministerial.cy.ts\" --record",
    "test:auth:record": "cypress run --spec \"cypress/e2e/authentication-roles.cy.ts\" --record"
  }
}
```

### 4. Commit and Push
```bash
git add .github/workflows/cypress.yml
git add docs/GITHUB_ACTIONS_SETUP.md
git commit -m "feat: add GitHub Actions CI/CD with Cypress Cloud integration"
git push origin main
```

## 🔍 Monitoring and Debugging

### GitHub Actions
- View workflow runs: Repository → Actions tab
- Check logs for each job step
- Download artifacts for failed tests

### Cypress Cloud
- Dashboard: https://cloud.cypress.io/projects/o6ctse
- Test recordings and screenshots
- Performance metrics and trends
- Integration with GitHub PRs

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Supabase environment variables
   - Verify Node.js version compatibility
   - Review build logs in Actions tab

2. **Test Failures**
   - Check Cypress Cloud dashboard for detailed logs
   - Review screenshots and videos in artifacts
   - Verify test credentials are correctly set

3. **Server Startup Issues**
   - Increase wait-on timeout if needed
   - Check port conflicts
   - Verify preview server configuration

### Debug Commands
```bash
# Local testing with same environment
npm run build
npm run preview
npm run test:audit:record
```

## 📈 Next Steps

1. **Monitor first workflow run** after setup
2. **Configure branch protection rules** requiring CI checks
3. **Set up Slack/Teams notifications** for test results
4. **Add performance testing** and accessibility checks
5. **Configure deployment** based on test results

## 🔗 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cypress GitHub Action](https://github.com/cypress-io/github-action)
- [Cypress Cloud Dashboard](https://cloud.cypress.io/projects/o6ctse)
- [Vite Preview Documentation](https://vitejs.dev/guide/cli.html#vite-preview)
