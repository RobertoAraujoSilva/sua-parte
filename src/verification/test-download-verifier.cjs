// Simple test script for download verifier functionality
const fs = require('fs-extra');
const path = require('path');

async function testDownloadSystemComponents() {
  console.log('🔍 Testing Download System Components...\n');
  
  const results = [];
  
  // Test 1: Check mwbSources.json exists and is valid
  try {
    const mwbSourcesPath = path.join(process.cwd(), 'backend/config/mwbSources.json');
    console.log('📋 Test 1: Checking mwbSources.json configuration...');
    
    if (await fs.pathExists(mwbSourcesPath)) {
      const content = await fs.readFile(mwbSourcesPath, 'utf-8');
      const mwbSources = JSON.parse(content);
      
      const languages = Object.keys(mwbSources);
      const activeLanguages = languages.filter(lang => mwbSources[lang].active);
      
      console.log(`✅ Configuration found with ${languages.length} languages (${activeLanguages.length} active)`);
      console.log(`   Active languages: ${activeLanguages.join(', ')}`);
      
      // Validate structure
      let validStructure = true;
      const requiredFields = ['name', 'url', 'downloadPath', 'active'];
      
      for (const [language, source] of Object.entries(mwbSources)) {
        for (const field of requiredFields) {
          if (!(field in source)) {
            console.log(`❌ Missing field '${field}' in language '${language}'`);
            validStructure = false;
          }
        }
        
        // Test URL format
        try {
          new URL(source.url);
        } catch {
          console.log(`❌ Invalid URL for language '${language}': ${source.url}`);
          validStructure = false;
        }
      }
      
      if (validStructure) {
        console.log('✅ Configuration structure is valid');
        results.push({ test: 'mwbSources.json validation', status: 'PASS' });
      } else {
        console.log('❌ Configuration structure has issues');
        results.push({ test: 'mwbSources.json validation', status: 'FAIL' });
      }
    } else {
      console.log('❌ mwbSources.json not found');
      results.push({ test: 'mwbSources.json validation', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ Error checking mwbSources.json: ${error.message}`);
    results.push({ test: 'mwbSources.json validation', status: 'FAIL' });
  }
  
  console.log('');
  
  // Test 2: Check JWDownloader service exists
  try {
    console.log('📋 Test 2: Checking JWDownloader service...');
    
    const jwDownloaderPath = path.join(process.cwd(), 'backend/services/jwDownloader.js');
    
    if (await fs.pathExists(jwDownloaderPath)) {
      console.log('✅ JWDownloader service file found');
      
      // Try to require it
      const JWDownloader = require(jwDownloaderPath);
      const downloader = new JWDownloader();
      
      console.log('✅ JWDownloader service can be instantiated');
      
      // Check if it has expected methods
      const expectedMethods = ['initialize', 'checkForNewVersions', 'downloadMaterial', 'listDownloadedMaterials'];
      let hasAllMethods = true;
      
      for (const method of expectedMethods) {
        if (typeof downloader[method] !== 'function') {
          console.log(`❌ Missing method: ${method}`);
          hasAllMethods = false;
        }
      }
      
      if (hasAllMethods) {
        console.log('✅ All expected methods are present');
        results.push({ test: 'JWDownloader service', status: 'PASS' });
      } else {
        console.log('❌ Some expected methods are missing');
        results.push({ test: 'JWDownloader service', status: 'FAIL' });
      }
    } else {
      console.log('❌ JWDownloader service file not found');
      results.push({ test: 'JWDownloader service', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ Error checking JWDownloader service: ${error.message}`);
    results.push({ test: 'JWDownloader service', status: 'FAIL' });
  }
  
  console.log('');
  
  // Test 3: Check download directory structure
  try {
    console.log('📋 Test 3: Checking download directory structure...');
    
    const downloadBasePath = path.join(process.cwd(), 'docs/Oficial');
    
    if (await fs.pathExists(downloadBasePath)) {
      console.log('✅ Base download directory exists');
      
      // Check if we can create subdirectories
      const testDir = path.join(downloadBasePath, 'test-dir');
      await fs.ensureDir(testDir);
      await fs.remove(testDir);
      
      console.log('✅ Directory creation/deletion works');
      results.push({ test: 'Download directory structure', status: 'PASS' });
    } else {
      console.log('⚠️ Base download directory does not exist, creating...');
      await fs.ensureDir(downloadBasePath);
      console.log('✅ Base download directory created');
      results.push({ test: 'Download directory structure', status: 'PASS' });
    }
  } catch (error) {
    console.log(`❌ Error with download directory: ${error.message}`);
    results.push({ test: 'Download directory structure', status: 'FAIL' });
  }
  
  console.log('');
  
  // Test 4: Test file operations
  try {
    console.log('📋 Test 4: Testing file operations...');
    
    const testFilePath = path.join(process.cwd(), 'docs/Oficial/test-file.txt');
    const testContent = 'Test content for download system verification';
    
    // Write test file
    await fs.writeFile(testFilePath, testContent);
    console.log('✅ File write operation successful');
    
    // Read test file
    const readContent = await fs.readFile(testFilePath, 'utf-8');
    if (readContent === testContent) {
      console.log('✅ File read operation successful');
    } else {
      console.log('❌ File content mismatch');
    }
    
    // Get file stats
    const stats = await fs.stat(testFilePath);
    console.log(`✅ File stats retrieved (size: ${stats.size} bytes)`);
    
    // Clean up
    await fs.remove(testFilePath);
    console.log('✅ File cleanup successful');
    
    results.push({ test: 'File operations', status: 'PASS' });
  } catch (error) {
    console.log(`❌ Error with file operations: ${error.message}`);
    results.push({ test: 'File operations', status: 'FAIL' });
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  results.forEach((result, index) => {
    const emoji = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${index + 1}. ${emoji} ${result.test}`);
  });
  
  console.log(`\nTotal: ${results.length} tests, ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('\n🎉 All download system components are working correctly!');
  } else {
    console.log('\n⚠️ Some download system components need attention.');
  }
}

testDownloadSystemComponents().catch(console.error);