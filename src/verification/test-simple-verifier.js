import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

console.log('🧪 Testing Cypress Setup Verification (Simple Version)...\n');

async function validateCypressSetup() {
  try {
    console.log('📋 Validating Cypress Setup');
    console.log('=' .repeat(50));

    const checks = {
      cypressInstalled: false,
      configExists: false,
      configValid: false,
      testDirectoryExists: false,
      supportFilesExist: false,
      dependencies: false
    };

    const issues = [];

    // Check if Cypress is installed
    try {
      await execAsync('npx cypress version');
      checks.cypressInstalled = true;
      console.log('✓ Cypress is installed');
    } catch (error) {
      checks.cypressInstalled = false;
      issues.push('Cypress not installed');
      console.log('✗ Cypress not installed');
    }

    // Check if cypress.config.js/mjs exists
    const configPaths = ['cypress.config.js', 'cypress.config.mjs', 'cypress.config.ts'];
    let configPath = null;
    
    for (const configFile of configPaths) {
      try {
        await fs.access(configFile);
        configPath = configFile;
        checks.configExists = true;
        console.log(`✓ Cypress config found: ${configFile}`);
        break;
      } catch (error) {
        // Continue checking other config files
      }
    }

    if (!checks.configExists) {
      issues.push('Cypress configuration file not found');
      console.log('✗ Cypress configuration file not found');
    }

    // Validate configuration content
    if (configPath) {
      try {
        const configContent = await fs.readFile(configPath, 'utf-8');
        
        // Check for required configuration properties
        const requiredProps = ['baseUrl', 'e2e', 'specPattern'];
        const hasRequiredProps = requiredProps.every(prop => 
          configContent.includes(prop)
        );

        if (hasRequiredProps) {
          checks.configValid = true;
          console.log('✓ Cypress configuration is valid');
        } else {
          issues.push('Cypress configuration missing required properties');
          console.log('✗ Cypress configuration invalid');
        }
      } catch (error) {
        issues.push('Failed to read Cypress configuration');
        console.log('✗ Failed to read Cypress configuration:', error.message);
      }
    }

    // Check test directory structure
    try {
      await fs.access('cypress/e2e');
      checks.testDirectoryExists = true;
      console.log('✓ Cypress test directory exists');
    } catch (error) {
      checks.testDirectoryExists = false;
      issues.push('Cypress test directory not found');
      console.log('✗ Cypress test directory not found');
    }

    // Check support files
    const supportFiles = ['cypress/support/e2e.ts', 'cypress/support/e2e.js'];
    for (const supportFile of supportFiles) {
      try {
        await fs.access(supportFile);
        checks.supportFilesExist = true;
        console.log(`✓ Support file found: ${supportFile}`);
        break;
      } catch (error) {
        // Continue checking other support files
      }
    }

    if (!checks.supportFilesExist) {
      issues.push('Cypress support files not found');
      console.log('✗ Cypress support files not found');
    }

    // Check package.json dependencies
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
      const hasCypress = packageJson.devDependencies?.cypress || packageJson.dependencies?.cypress;
      
      if (hasCypress) {
        checks.dependencies = true;
        console.log('✓ Cypress dependency found in package.json');
      } else {
        issues.push('Cypress not found in package.json dependencies');
        console.log('✗ Cypress not found in package.json');
      }
    } catch (error) {
      issues.push('Failed to read package.json');
      console.log('✗ Failed to read package.json:', error.message);
    }

    const isValid = Object.values(checks).every(check => check === true);
    
    console.log('\n📊 Summary:');
    console.log(`Overall Status: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (issues.length > 0) {
      console.log('\nIssues Found:');
      issues.forEach(issue => {
        console.log(`  ⚠️  ${issue}`);
      });
    }

    console.log('\nDetailed Checks:');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${check}`);
    });

    return {
      isValid,
      message: isValid ? 'Cypress setup is valid' : `Issues found: ${issues.join(', ')}`,
      checks,
      issues,
      configPath
    };

  } catch (error) {
    console.error('Failed to validate Cypress setup:', error);
    return {
      isValid: false,
      message: `Validation failed: ${error.message}`,
      checks: {},
      issues: [error.message],
      configPath: null
    };
  }
}

async function validateTestEnvironment() {
  try {
    console.log('\n📋 Validating Test Environment');
    console.log('=' .repeat(50));

    const checks = {
      environmentVariables: false,
      testData: false,
      baseUrlAccessible: false,
      testCredentials: false
    };

    const issues = [];
    const warnings = [];

    // Check environment variables
    const requiredEnvVars = [
      'CYPRESS_INSTRUCTOR_EMAIL',
      'CYPRESS_INSTRUCTOR_PASSWORD',
      'CYPRESS_STUDENT_EMAIL',
      'CYPRESS_STUDENT_PASSWORD'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length === 0) {
      checks.environmentVariables = true;
      console.log('✓ All required environment variables are set');
    } else {
      issues.push(`Missing environment variables: ${missingEnvVars.join(', ')}`);
      console.log(`✗ Missing environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Check test data and fixtures
    try {
      await fs.access('cypress/fixtures');
      checks.testData = true;
      console.log('✓ Test fixtures directory exists');
    } catch (error) {
      warnings.push('Test fixtures directory not found');
      console.log('⚠ Test fixtures directory not found');
    }

    // Validate test credentials (if environment allows)
    if (checks.environmentVariables) {
      checks.testCredentials = true;
      console.log('✓ Test credentials are configured');
    }

    const isValid = checks.environmentVariables && checks.testCredentials;
    const hasWarnings = warnings.length > 0;

    console.log('\n📊 Environment Summary:');
    console.log(`Status: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (hasWarnings) {
      console.log('Warnings:');
      warnings.forEach(warning => {
        console.log(`  ⚠️  ${warning}`);
      });
    }

    console.log('\nEnvironment Variables:');
    requiredEnvVars.forEach(envVar => {
      const exists = !!process.env[envVar];
      console.log(`  ${exists ? '✅' : '❌'} ${envVar}`);
    });

    return {
      isValid,
      message: isValid 
        ? (hasWarnings ? `Environment valid with warnings: ${warnings.join(', ')}` : 'Test environment is properly configured')
        : `Environment issues: ${issues.join(', ')}`,
      checks,
      issues,
      warnings
    };

  } catch (error) {
    console.error('Failed to validate test environment:', error);
    return {
      isValid: false,
      message: `Environment validation failed: ${error.message}`,
      checks: {},
      issues: [error.message],
      warnings: []
    };
  }
}

async function checkBrowserCompatibility() {
  try {
    console.log('\n📋 Checking Browser Compatibility');
    console.log('=' .repeat(50));

    const browsers = [];
    const issues = [];

    // Check if browsers are available
    try {
      const { stdout } = await execAsync('npx cypress info');
      const browserSection = stdout.split('Browsers found on your system are:')[1];
      
      if (browserSection) {
        const browserLines = browserSection.split('\n').filter(line => line.trim());
        
        for (const line of browserLines) {
          if (line.includes('- ')) {
            const browserInfo = line.trim().replace('- ', '');
            browsers.push(browserInfo);
          }
        }
      }

      if (browsers.length > 0) {
        console.log(`✓ Found ${browsers.length} compatible browsers`);
        browsers.forEach(browser => {
          console.log(`  🌐 ${browser}`);
        });
      } else {
        issues.push('No compatible browsers found');
        console.log('✗ No compatible browsers found');
      }

    } catch (error) {
      issues.push('Failed to check browser compatibility');
      console.log('✗ Failed to check browsers:', error.message);
    }

    const isValid = browsers.length > 0;

    console.log('\n📊 Browser Summary:');
    console.log(`Status: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

    return {
      isValid,
      message: isValid 
        ? `Found ${browsers.length} compatible browsers` 
        : 'No compatible browsers available',
      browsers
    };

  } catch (error) {
    console.error('Browser compatibility check failed:', error);
    return {
      isValid: false,
      message: `Browser check failed: ${error.message}`,
      browsers: []
    };
  }
}

async function runFullTest() {
  try {
    console.log('🎯 Running Full Cypress Setup Verification\n');

    const setupResult = await validateCypressSetup();
    const envResult = await validateTestEnvironment();
    const browserResult = await checkBrowserCompatibility();

    console.log('\n🎉 Cypress Setup Verification Complete!\n');

    // Overall summary
    const allValid = setupResult.isValid && envResult.isValid && browserResult.isValid;
    
    console.log('📊 Final Summary:');
    console.log('=' .repeat(50));
    console.log(`Overall Status: ${allValid ? '✅ ALL SYSTEMS GO' : '❌ ISSUES FOUND'}`);
    console.log(`Cypress Setup: ${setupResult.isValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test Environment: ${envResult.isValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Browser Compatibility: ${browserResult.isValid ? '✅ PASS' : '❌ FAIL'}`);

    if (!allValid) {
      console.log('\n🔧 Remediation Required:');
      
      if (!setupResult.isValid) {
        console.log('\nCypress Setup Issues:');
        setupResult.issues.forEach(issue => {
          console.log(`  • ${issue}`);
        });
      }
      
      if (!envResult.isValid) {
        console.log('\nEnvironment Issues:');
        envResult.issues.forEach(issue => {
          console.log(`  • ${issue}`);
        });
      }
      
      if (!browserResult.isValid) {
        console.log('\nBrowser Issues:');
        console.log(`  • ${browserResult.message}`);
      }
    }

    return allValid;

  } catch (error) {
    console.error('❌ Full test failed:', error);
    return false;
  }
}

// Run the test
runFullTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});