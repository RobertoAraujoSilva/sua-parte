import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

console.log('🧪 Testing Cypress Test Execution Verification...\n');

async function getTestFiles() {
  try {
    console.log('📋 Getting Test Files');
    console.log('=' .repeat(50));

    const testDir = 'cypress/e2e';
    const files = await fs.readdir(testDir);
    
    // Filter for test files and prioritize the main ones mentioned in requirements
    const priorityTests = [
      'admin-dashboard-integration.cy.ts',
      'authentication-roles.cy.ts', 
      'sistema-ministerial-e2e.cy.ts',
      'pdf-upload-functionality.cy.ts'
    ];

    const allTestFiles = files.filter(file => 
      file.endsWith('.cy.ts') || file.endsWith('.cy.js')
    );

    // Return priority tests first, then others
    const orderedTests = [
      ...priorityTests.filter(test => allTestFiles.includes(test)),
      ...allTestFiles.filter(test => !priorityTests.includes(test))
    ];

    console.log(`✓ Found ${allTestFiles.length} total test files`);
    console.log(`✓ Priority tests found: ${priorityTests.filter(test => allTestFiles.includes(test)).length}`);

    console.log('\nPriority Test Files:');
    priorityTests.forEach(test => {
      const exists = allTestFiles.includes(test);
      console.log(`  ${exists ? '✅' : '❌'} ${test}`);
    });

    console.log('\nAll Test Files:');
    orderedTests.forEach(test => {
      console.log(`  📄 ${test}`);
    });

    return orderedTests;

  } catch (error) {
    console.error('Failed to get test files:', error);
    return [];
  }
}

async function testSingleTestExecution(testFile) {
  const startTime = Date.now();
  
  try {
    console.log(`\n📋 Testing Single Test Execution: ${testFile}`);
    console.log('=' .repeat(50));

    // Check if we can run a dry-run or validation of the test
    console.log('Attempting to validate test file...');
    
    // First, let's just check if the test file exists and is readable
    try {
      const testContent = await fs.readFile(`cypress/e2e/${testFile}`, 'utf-8');
      console.log(`✓ Test file is readable (${testContent.length} characters)`);
      
      // Basic syntax validation - check for common Cypress patterns
      const hasDescribe = testContent.includes('describe(') || testContent.includes('context(');
      const hasIt = testContent.includes('it(') || testContent.includes('test(');
      const hasCyCommands = testContent.includes('cy.');
      
      console.log(`✓ Has test structure: ${hasDescribe ? 'describe/context' : 'none'}`);
      console.log(`✓ Has test cases: ${hasIt ? 'it/test' : 'none'}`);
      console.log(`✓ Has Cypress commands: ${hasCyCommands ? 'yes' : 'no'}`);
      
      if (!hasDescribe || !hasIt || !hasCyCommands) {
        console.log('⚠️  Test file may have structural issues');
      }
      
    } catch (readError) {
      console.log(`❌ Cannot read test file: ${readError.message}`);
      return false;
    }

    // Try to run cypress info to see if it can detect the test
    try {
      console.log('Checking Cypress test detection...');
      const { stdout } = await execAsync('npx cypress info');
      console.log('✓ Cypress is accessible for test execution');
    } catch (infoError) {
      console.log(`⚠️  Cypress info failed: ${infoError.message}`);
    }

    // For now, we'll simulate test execution since running actual tests requires the app to be running
    const duration = Date.now() - startTime;
    
    console.log(`\n📊 Test Validation Summary for ${testFile}:`);
    console.log(`Duration: ${duration}ms`);
    console.log('Status: ✅ VALIDATED (not executed)');
    console.log('Note: Actual test execution requires running application');

    return true;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ Test validation failed for ${testFile}: ${error.message}`);
    console.log(`Duration: ${duration}ms`);
    return false;
  }
}

async function analyzeTestStructure() {
  try {
    console.log('\n📋 Analyzing Test Suite Structure');
    console.log('=' .repeat(50));

    const testFiles = await getTestFiles();
    const analysis = {
      totalFiles: testFiles.length,
      priorityFiles: 0,
      validFiles: 0,
      issues: []
    };

    const priorityTests = [
      'admin-dashboard-integration.cy.ts',
      'authentication-roles.cy.ts', 
      'sistema-ministerial-e2e.cy.ts',
      'pdf-upload-functionality.cy.ts'
    ];

    for (const testFile of testFiles) {
      try {
        const testContent = await fs.readFile(`cypress/e2e/${testFile}`, 'utf-8');
        
        // Check if it's a priority test
        if (priorityTests.includes(testFile)) {
          analysis.priorityFiles++;
        }

        // Basic validation
        const hasDescribe = testContent.includes('describe(') || testContent.includes('context(');
        const hasIt = testContent.includes('it(') || testContent.includes('test(');
        const hasCyCommands = testContent.includes('cy.');
        
        if (hasDescribe && hasIt && hasCyCommands) {
          analysis.validFiles++;
        } else {
          analysis.issues.push(`${testFile}: Missing required test structure`);
        }

      } catch (error) {
        analysis.issues.push(`${testFile}: Cannot read file - ${error.message}`);
      }
    }

    console.log('📊 Test Suite Analysis:');
    console.log(`Total test files: ${analysis.totalFiles}`);
    console.log(`Priority test files: ${analysis.priorityFiles}/4`);
    console.log(`Valid test files: ${analysis.validFiles}/${analysis.totalFiles}`);
    
    if (analysis.issues.length > 0) {
      console.log('\n⚠️  Issues found:');
      analysis.issues.forEach(issue => {
        console.log(`  • ${issue}`);
      });
    } else {
      console.log('\n✅ All test files appear to be valid');
    }

    return analysis;

  } catch (error) {
    console.error('Failed to analyze test structure:', error);
    return null;
  }
}

async function checkTestExecutionRequirements() {
  try {
    console.log('\n📋 Checking Test Execution Requirements');
    console.log('=' .repeat(50));

    const requirements = {
      cypressInstalled: false,
      configExists: false,
      testDirExists: false,
      appRunning: false,
      envVarsSet: false
    };

    // Check Cypress installation
    try {
      await execAsync('npx cypress version');
      requirements.cypressInstalled = true;
      console.log('✅ Cypress is installed');
    } catch (error) {
      console.log('❌ Cypress not installed');
    }

    // Check config
    const configFiles = ['cypress.config.js', 'cypress.config.mjs', 'cypress.config.ts'];
    for (const configFile of configFiles) {
      try {
        await fs.access(configFile);
        requirements.configExists = true;
        console.log(`✅ Config file exists: ${configFile}`);
        break;
      } catch (error) {
        // Continue checking
      }
    }

    if (!requirements.configExists) {
      console.log('❌ No Cypress config file found');
    }

    // Check test directory
    try {
      await fs.access('cypress/e2e');
      requirements.testDirExists = true;
      console.log('✅ Test directory exists');
    } catch (error) {
      console.log('❌ Test directory not found');
    }

    // Check if app might be running (basic check)
    try {
      const response = await fetch('http://localhost:8080');
      requirements.appRunning = true;
      console.log('✅ Application appears to be running on localhost:8080');
    } catch (error) {
      console.log('⚠️  Application not running on localhost:8080 (tests may fail)');
    }

    // Check environment variables
    const requiredEnvVars = [
      'CYPRESS_INSTRUCTOR_EMAIL',
      'CYPRESS_INSTRUCTOR_PASSWORD',
      'CYPRESS_STUDENT_EMAIL',
      'CYPRESS_STUDENT_PASSWORD'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    requirements.envVarsSet = missingEnvVars.length === 0;

    if (requirements.envVarsSet) {
      console.log('✅ All required environment variables are set');
    } else {
      console.log(`⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`);
    }

    const readyForExecution = Object.values(requirements).every(req => req === true);

    console.log('\n📊 Execution Readiness Summary:');
    console.log(`Overall Status: ${readyForExecution ? '✅ READY' : '⚠️  NOT READY'}`);
    
    Object.entries(requirements).forEach(([req, status]) => {
      console.log(`  ${status ? '✅' : '❌'} ${req}`);
    });

    return requirements;

  } catch (error) {
    console.error('Failed to check test execution requirements:', error);
    return null;
  }
}

async function runFullAnalysis() {
  try {
    console.log('🎯 Running Full Test Execution Analysis\n');

    const testFiles = await getTestFiles();
    const structure = await analyzeTestStructure();
    const requirements = await checkTestExecutionRequirements();

    // Test a few individual files for validation
    console.log('\n📋 Testing Individual File Validation');
    console.log('=' .repeat(50));

    const priorityTests = [
      'admin-dashboard-integration.cy.ts',
      'authentication-roles.cy.ts', 
      'sistema-ministerial-e2e.ts',
      'pdf-upload-functionality.cy.ts'
    ].filter(test => testFiles.includes(test));

    let validatedTests = 0;
    for (const testFile of priorityTests.slice(0, 3)) { // Test first 3 priority tests
      const isValid = await testSingleTestExecution(testFile);
      if (isValid) validatedTests++;
    }

    console.log('\n🎉 Test Execution Analysis Complete!\n');

    console.log('📊 Final Summary:');
    console.log('=' .repeat(50));
    console.log(`Total test files: ${testFiles.length}`);
    console.log(`Priority tests available: ${priorityTests.length}/4`);
    console.log(`Tests validated: ${validatedTests}/${priorityTests.slice(0, 3).length}`);
    
    if (structure) {
      console.log(`Valid test structure: ${structure.validFiles}/${structure.totalFiles}`);
    }

    if (requirements) {
      const readyCount = Object.values(requirements).filter(req => req === true).length;
      console.log(`Execution requirements met: ${readyCount}/${Object.keys(requirements).length}`);
    }

    const overallReady = requirements && Object.values(requirements).every(req => req === true);
    console.log(`\nOverall Status: ${overallReady ? '✅ READY FOR TEST EXECUTION' : '⚠️  SETUP REQUIRED'}`);

    if (!overallReady) {
      console.log('\n🔧 Next Steps:');
      if (requirements && !requirements.appRunning) {
        console.log('  1. Start the application (npm run dev:all)');
      }
      if (requirements && !requirements.envVarsSet) {
        console.log('  2. Set required environment variables for test credentials');
      }
      console.log('  3. Run: npm run cypress:run to execute tests');
    }

    return overallReady;

  } catch (error) {
    console.error('❌ Analysis failed:', error);
    return false;
  }
}

// Run the analysis
runFullAnalysis().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Analysis execution failed:', error);
  process.exit(1);
});