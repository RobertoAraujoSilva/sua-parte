# Scripts - Sistema Ministerial Cypress Tests

## 🎯 ES Module Compatible Scripts for Windows 11

This directory contains scripts specifically designed to work with the ES module configuration of the Sistema Ministerial project on Windows 11.

## 📁 Available Scripts

### 🔧 **setup-and-test-cypress.bat** (Recommended)
**Comprehensive setup and test script with interactive menu**

```cmd
scripts\setup-and-test-cypress.bat
```

**Features:**
- ✅ Automatic dependency installation
- ✅ Cypress binary verification
- ✅ Interactive test menu
- ✅ Multiple execution methods
- ✅ Error handling and troubleshooting

### 🧪 **test-sarah-cypress.bat**
**Simple script to run Sarah's registration tests**

```cmd
# Run Sarah's test
scripts\test-sarah-cypress.bat

# Interactive mode
scripts\test-sarah-cypress.bat --open

# Show help
scripts\test-sarah-cypress.bat --help
```

### 💻 **test-sarah-cypress.ps1**
**PowerShell script with advanced features**

```powershell
# Run Sarah's test
.\scripts\test-sarah-cypress.ps1

# Interactive mode
.\scripts\test-sarah-cypress.ps1 -Open

# Show help
.\scripts\test-sarah-cypress.ps1 -Help
```

### 🔍 **diagnose-cypress.bat**
**Diagnostic script to check Cypress setup**

```cmd
scripts\diagnose-cypress.bat
```

**Checks:**
- ✅ Node.js and npm versions
- ✅ Project directory and files
- ✅ Cypress installation
- ✅ ES module configuration
- ✅ Test files existence

## 🚀 Quick Start

### **Option 1: One-Click Setup and Test**
```cmd
scripts\setup-and-test-cypress.bat
```

### **Option 2: NPM Scripts**
```bash
npm run test:sarah
npm run cypress:open
```

### **Option 3: Direct Binary**
```cmd
node_modules\.bin\cypress.cmd run --spec "cypress/e2e/sarah-student-registration.cy.ts"
```

## 🎂 Sarah's Test Details

### **Test User Profile**
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
1. **Complete Registration**: Form with birth date validation
2. **Age Calculation**: Real-time age display (14 years)
3. **Database Storage**: Birth date saved in profiles table
4. **Portal Display**: Birth date and age in student portal
5. **Edge Cases**: Invalid dates, age limits

## 🔧 Troubleshooting

### **If scripts don't work:**

1. **Check directory:**
   ```cmd
   # Make sure you're in the project root
   dir package.json
   ```

2. **Run diagnostics:**
   ```cmd
   scripts\diagnose-cypress.bat
   ```

3. **Install dependencies:**
   ```cmd
   npm install
   ```

4. **Use setup script:**
   ```cmd
   scripts\setup-and-test-cypress.bat
   ```

### **Common Issues:**

#### **"cypress is not recognized"**
- Use: `scripts\setup-and-test-cypress.bat`
- Or: `node_modules\.bin\cypress.cmd open`

#### **"exports is not defined"**
- Fixed in updated `cypress.config.ts`
- Use ES module compatible scripts

#### **"require is not defined"**
- Use batch/PowerShell scripts instead of .js scripts
- Or use npm scripts: `npm run test:sarah`

## 📊 Expected Results

### **Successful Test Run:**
```
🧪 Testing Sarah's Student Registration with Birth Date Feature
👤 Student: Sarah Rackel Ferreira Lima
🎂 Birth Date: 2009-09-25 (Expected Age: 14)

✅ Registration form accepts data
✅ Birth date validation passes
✅ Age calculation shows "14 anos"
✅ Account created successfully
✅ Profile stored with birth date
✅ Portal displays birth date and age

3 passing (2m 15s)
```

## 💡 Pro Tips

### **For Best Results:**
1. **Use the setup script first**: `scripts\setup-and-test-cypress.bat`
2. **Run diagnostics if issues**: `scripts\diagnose-cypress.bat`
3. **Use interactive mode for debugging**: Add `--open` or `-Open`
4. **Check the troubleshooting guide**: `docs\CYPRESS_TROUBLESHOOTING.md`

### **Script Execution Order:**
1. `scripts\diagnose-cypress.bat` (check setup)
2. `scripts\setup-and-test-cypress.bat` (setup and test)
3. `npm run test:sarah` (quick test)

## 🎯 Files Overview

```
scripts/
├── setup-and-test-cypress.bat    # Main setup and test script
├── test-sarah-cypress.bat         # Simple test script
├── test-sarah-cypress.ps1         # PowerShell script
├── test-sarah-cypress.js          # ES module compatible (backup)
├── diagnose-cypress.bat           # Diagnostic script
└── README.md                      # This file
```

## 📞 Quick Help

```cmd
# Show help for any script
scripts\setup-and-test-cypress.bat
scripts\test-sarah-cypress.bat --help
.\scripts\test-sarah-cypress.ps1 -Help

# Run diagnostics
scripts\diagnose-cypress.bat

# Check npm scripts
npm run
```

---

**Status**: ✅ **ES MODULE COMPATIBLE**  
**Platform**: ✅ **WINDOWS 11 OPTIMIZED**  
**Ready for**: ✅ **IMMEDIATE USE**
