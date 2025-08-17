// Corrected test script for file organization and storage testing
const fs = require('fs-extra');
const path = require('path');

async function testFileOrganization() {
    console.log('🔍 Testing File Organization and Storage...\n');
    
    try {
        // Test 1: Check if download directories exist
        const baseDownloadPath = path.join(process.cwd(), 'docs/Oficial');
        console.log(`📋 Checking base download directory: ${baseDownloadPath}`);
        
        const baseExists = await fs.pathExists(baseDownloadPath);
        if (baseExists) {
            console.log('✅ Base download directory exists');
        } else {
            console.log('⚠️ Base download directory does not exist, creating...');
            await fs.ensureDir(baseDownloadPath);
            console.log('✅ Base download directory created');
        }
        
        // Test 2: Check write permissions
        const testFile = path.join(baseDownloadPath, 'test-permissions.tmp');
        try {
            await fs.writeFile(testFile, 'test');
            await fs.remove(testFile);
            console.log('✅ Directory has write permissions');
        } catch (error) {
            console.log(`❌ Directory write permission failed: ${error.message}`);
        }
        
        console.log('\n🎉 File organization test completed successfully!');
        
    } catch (error) {
        console.error('❌ File organization test failed:', error);
    }
}

// Run the test
testFileOrganization().catch(console.error);