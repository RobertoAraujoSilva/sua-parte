import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

console.log('Testing Cypress setup...');

// Simple test to check if we can run basic verification
async function test() {
  try {
    console.log('Starting test...');
    
    // Check if Cypress is installed
    const execAsync = promisify(exec);
    
    try {
      const { stdout } = await execAsync('npx cypress version');
      console.log('✅ Cypress is installed');
      console.log('Version info:', stdout.split('\n')[0]);
    } catch (error) {
      console.log('❌ Cypress not installed or not accessible');
      console.log('Error:', error.message);
    }
    
    // Check if config exists
    const configFiles = ['cypress.config.js', 'cypress.config.mjs', 'cypress.config.ts'];
    
    for (const configFile of configFiles) {
      if (fs.existsSync(configFile)) {
        console.log(`✅ Config file found: ${configFile}`);
        break;
      }
    }
    
    // Check test directory
    if (fs.existsSync('cypress/e2e')) {
      console.log('✅ Test directory exists');
      
      // List test files
      const testFiles = fs.readdirSync('cypress/e2e');
      console.log(`Found ${testFiles.length} test files:`);
      testFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    } else {
      console.log('❌ Test directory not found');
    }
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();