# Cypress Troubleshooting Guide - Sistema Ministerial
## ES Module Compatibility & Windows 11 Solutions

## 🚨 ES Module Specific Issues and Solutions

### Issue 1: "cypress is not recognized as an internal or external command"

#### **Problem**
```
'cypress' não é reconhecido como um comando interno ou externo
```

#### **Root Cause**
- Windows PATH issues with ES module projects
- npm scripts not finding Cypress binary
- Node.js v22+ ES module compatibility

#### **✅ Solutions (Multiple Options)**

**Option 1: Use Direct Binary Path**
```cmd
# Use the direct path to Cypress binary
node_modules\.bin\cypress.cmd open
node_modules\.bin\cypress.cmd run --spec "cypress/e2e/sarah-student-registration.cy.ts"
```

**Option 2: Use Setup Script**
```cmd
# Run comprehensive setup and test script
scripts\setup-and-test-cypress.bat
```

**Option 3: Use npm scripts (Updated)**
```bash
# Updated npm scripts that work with ES modules
npm run test:sarah
npm run cypress:open
npm run test:setup
```

**Option 4: PowerShell Script**
```powershell
# ES module compatible PowerShell script
.\scripts\test-sarah-cypress.ps1 -Open
```

#### **Verification**
```cmd
# Check if Cypress is installed and working
scripts\diagnose-cypress.bat
```

---

### Issue 2: "ReferenceError: exports is not defined in ES module scope"

#### **Problem**
```
ReferenceError: exports is not defined in ES module scope at cypress.config.ts:2:23
```

#### **Root Cause**
- cypress.config.ts not compatible with ES modules
- Incorrect export syntax for Node.js v22+ with ES modules

#### **✅ Solution**
The cypress.config.ts has been updated to use proper ES module syntax:

```typescript
import { defineConfig } from 'cypress'

const config = defineConfig({
  // ... configuration
})

export default config  // ES module export
```

### Issue 3: "ReferenceError: require is not defined in ES module scope"

#### **Problem**
```
ReferenceError: require is not defined in ES module scope
```

#### **Root Cause**
- Project is configured as ES module (type: "module" in package.json)
- Scripts use CommonJS syntax (require/module.exports)

#### **✅ Solution**
Use the ES module compatible scripts:

```cmd
# Windows batch script (recommended)
scripts\setup-and-test-cypress.bat

# PowerShell script
.\scripts\test-sarah-cypress.ps1 -Open

# Direct npm scripts
npm run test:sarah
npm run cypress:open
```

---

### Issue 3: Node.js/npm Path Issues on Windows

#### **Problem**
- Commands not found in PowerShell
- Permission errors

#### **✅ Solution**
```powershell
# 1. Verify Node.js installation
node --version
npm --version

# 2. Check if npx is available
npx --version

# 3. If issues persist, reinstall Node.js
# Download from: https://nodejs.org/

# 4. Restart PowerShell after installation
```

---

## 🚀 Correct Commands for Sarah's Tests

### **Quick Start Commands**

#### **Option 1: NPM Scripts (Recommended)**
```bash
# Run Sarah's registration test
npm run test:sarah

# Run birth date feature tests
npm run test:birth-date

# Open Cypress interactive mode
npm run cypress:open

# Run all E2E tests
npm run test:e2e
```

#### **Option 2: Direct npx Commands**
```bash
# Run specific Sarah test
npx cypress run --spec "cypress/e2e/sarah-student-registration.cy.ts"

# Open interactive mode
npx cypress open

# Run all tests
npx cypress run
```

#### **Option 3: Windows Scripts**
```powershell
# PowerShell script (recommended for Windows)
.\scripts\test-sarah-cypress.ps1

# Interactive mode
.\scripts\test-sarah-cypress.ps1 -Open

# Batch script
scripts\test-sarah-cypress.bat

# Interactive mode
scripts\test-sarah-cypress.bat --open
```

---

## 🔧 Installation Verification

### **Step 1: Verify Project Setup**
```bash
# Navigate to project directory
cd C:\Users\frank.MONITORE-MAFRA\Documents\GitHub\sua-parte

# Verify package.json exists
dir package.json

# Check if node_modules exists
dir node_modules
```

### **Step 2: Install Dependencies**
```bash
# Install all dependencies (including Cypress)
npm install

# Verify Cypress installation
npx cypress --version
```

### **Step 3: Test Basic Cypress**
```bash
# Open Cypress to verify installation
npx cypress open

# Should open Cypress Test Runner GUI
```

---

## 🎯 Sarah's Test Execution Guide

### **Test User Details**
```json
{
  "name": "Sarah Rackel Ferreira Lima",
  "email": "franklima.flm@gmail.com",
  "password": "test@123",
  "birthDate": "2009-09-25",
  "age": "14 years",
  "congregation": "Market Harborough",
  "role": "Publicador Não Batizado"
}
```

### **Test Scenarios**
1. **Complete Registration**: Full form with birth date
2. **Age Validation**: Real-time calculation (14 years)
3. **Login & Portal**: Authentication and portal access
4. **Edge Cases**: Invalid birth dates, age limits

### **Expected Results**
```
✅ Registration form accepts Sarah's data
✅ Birth date validation passes (14 years old)
✅ Age calculation shows "14 anos"
✅ Account created successfully
✅ Profile stored with birth date
✅ Login works with credentials
✅ Portal displays birth date and age
```

---

## 🐛 Debugging Steps

### **If Tests Fail**

#### **1. Check Application Status**
```bash
# Verify app is running
curl https://sua-parte.lovable.app/auth
# Should return HTML content
```

#### **2. Check Network Connectivity**
```bash
# Test internet connection
ping google.com

# Test Supabase connection
ping nwpuurgwnnuejqinkvrh.supabase.co
```

#### **3. Clear Browser Data**
```javascript
// In Cypress test
cy.clearLocalStorage()
cy.clearCookies()
```

#### **4. Check Console Errors**
- Open browser developer tools
- Look for JavaScript errors
- Check network tab for failed requests

#### **5. Verify Database**
- Check if birth date field exists in profiles table
- Verify trigger function is working
- Test manual registration

---

## 📊 Test Execution Examples

### **Successful Test Run**
```
🧪 Testing Sarah's Student Registration with Birth Date Feature
👤 Student: Sarah Rackel Ferreira Lima
📧 Email: franklima.flm@gmail.com
🎂 Birth Date: 2009-09-25 (Expected Age: 14)

📍 Step 1: Navigating to registration form ✅
🎭 Step 2: Selecting student account type ✅
👤 Step 3: Filling personal information ✅
🎂 Step 4: Testing birth date field ✅
📊 Step 5: Verifying age calculation ✅
🚀 Step 6: Submitting registration ✅
✅ Step 7: Verifying successful registration ✅
🎂 Step 8: Verifying birth date in portal ✅

3 passing (2m 15s)
```

### **Failed Test Troubleshooting**
```
❌ Test failed at Step 4: Birth date field not found

Possible causes:
1. Birth date feature not deployed
2. Form selectors changed
3. JavaScript errors preventing form load
4. Network timeout

Solutions:
1. Verify birth date implementation
2. Update selectors in test
3. Check browser console
4. Increase timeouts
```

---

## 💡 Pro Tips

### **For Windows Users**
1. **Use PowerShell** instead of Command Prompt
2. **Run as Administrator** if permission issues
3. **Use npx** prefix for all npm packages
4. **Check PATH** environment variable

### **For Cypress Tests**
1. **Use cy.log()** for debugging
2. **Add cy.wait()** for slow elements
3. **Use data-testid** attributes for reliable selectors
4. **Run in interactive mode** for debugging

### **For Birth Date Feature**
1. **Test age calculation** manually first
2. **Verify database schema** has date_of_birth column
3. **Check trigger function** is working
4. **Test with different birth dates**

---

## 📞 Quick Help Commands

```bash
# Show help for PowerShell script
.\scripts\test-sarah-cypress.ps1 -Help

# Show help for batch script
scripts\test-sarah-cypress.bat --help

# Cypress help
npx cypress --help

# Check npm scripts
npm run
```

---

**Status**: ✅ **TROUBLESHOOTING GUIDE COMPLETE**  
**Platform**: ✅ **WINDOWS OPTIMIZED**  
**Scripts**: ✅ **MULTIPLE OPTIONS PROVIDED**
