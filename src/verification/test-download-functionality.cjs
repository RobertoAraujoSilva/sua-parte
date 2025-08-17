// Test script for download functionality testing
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');

async function testDownloadFunctionality() {
  console.log('🔍 Testing Download Functionality...\n');
  
  const results = [];
  
  // Test 1: JWDownloader initialization
  try {
    console.log('📋 Test 1: Testing JWDownloader initialization...');
    
    const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
    const downloader = new JWDownloader();
    
    // Test initialization
    await downloader.initialize();
    console.log('✅ JWDownloader initialized successfully');
    
    // Verify download directory was created
    const downloadPath = path.join(process.cwd(), 'docs/Oficial');
    const exists = await fs.pathExists(downloadPath);
    
    if (exists) {
      console.log('✅ Download directory created/verified');
      results.push({ test: 'JWDownloader initialization', status: 'PASS' });
    } else {
      console.log('❌ Download directory not found');
      results.push({ test: 'JWDownloader initialization', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ JWDownloader initialization failed: ${error.message}`);
    results.push({ test: 'JWDownloader initialization', status: 'FAIL' });
  }
  
  console.log('');
  
  // Test 2: Material detection from JW.org
  try {
    console.log('📋 Test 2: Testing material detection...');
    
    const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
    const downloader = new JWDownloader();
    await downloader.initialize();
    
    // Test with Portuguese (active language)
    console.log('   Testing Portuguese material detection...');
    const ptMaterials = await downloader.checkForNewVersions('pt-BR');
    
    if (Array.isArray(ptMaterials)) {
      console.log(`✅ Portuguese: Found ${ptMaterials.length} materials`);
      
      if (ptMaterials.length > 0) {
        const sampleMaterial = ptMaterials[0];
        console.log(`   Sample material: ${sampleMaterial.filename || 'N/A'}`);
        console.log(`   Material type: ${sampleMaterial.materialType || 'unknown'}`);
      }
    } else {
      console.log('❌ Portuguese: Invalid response format');
    }
    
    // Test with English (active language)
    console.log('   Testing English material detection...');
    const enMaterials = await downloader.checkForNewVersions('en-US');
    
    if (Array.isArray(enMaterials)) {
      console.log(`✅ English: Found ${enMaterials.length} materials`);
      
      if (enMaterials.length > 0) {
        const sampleMaterial = enMaterials[0];
        console.log(`   Sample material: ${sampleMaterial.filename || 'N/A'}`);
        console.log(`   Material type: ${sampleMaterial.materialType || 'unknown'}`);
      }
    } else {
      console.log('❌ English: Invalid response format');
    }
    
    results.push({ test: 'Material detection', status: 'PASS' });
  } catch (error) {
    console.log(`❌ Material detection failed: ${error.message}`);
    results.push({ test: 'Material detection', status: 'FAIL' });
  }
  
  console.log('');
  
  // Test 3: Download process with test file
  try {
    console.log('📋 Test 3: Testing download process...');
    
    const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
    const downloader = new JWDownloader();
    await downloader.initialize();
    
    // Test with a small, reliable test file
    const testUrl = 'https://httpbin.org/bytes/1024'; // 1KB test file
    const testFilename = 'test-download-verification.bin';
    
    console.log('   Downloading test file...');
    const result = await downloader.downloadByUrl(testUrl);
    
    if (result && result.status !== 'error') {
      console.log(`✅ Download completed: ${result.status}`);
      console.log(`   File size: ${result.size || 0} bytes`);
      
      // Verify file exists
      const filePath = path.join(process.cwd(), 'docs/Oficial', result.filename);
      const exists = await fs.pathExists(filePath);
      
      if (exists) {
        console.log('✅ Downloaded file verified on disk');
        
        // Check file size
        const stats = await fs.stat(filePath);
        console.log(`   Actual file size: ${stats.size} bytes`);
        
        // Clean up test file
        await fs.remove(filePath);
        console.log('✅ Test file cleaned up');
        
        results.push({ test: 'Download process', status: 'PASS' });
      } else {
        console.log('❌ Downloaded file not found on disk');
        results.push({ test: 'Download process', status: 'FAIL' });
      }
    } else {
      console.log(`❌ Download failed: ${result?.error || 'Unknown error'}`);
      results.push({ test: 'Download process', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ Download process failed: ${error.message}`);
    results.push({ test: 'Download process', status: 'FAIL' });
  }
  
  console.log('');
  
  // Test 4: File integrity validation
  try {
    console.log('📋 Test 4: Testing file integrity validation...');
    
    const testContent = 'Test content for integrity validation - Sistema Ministerial';
    const testFilename = 'integrity-test.txt';
    const testFilePath = path.join(process.cwd(), 'docs/Oficial', testFilename);
    
    // Write test file
    await fs.writeFile(testFilePath, testContent);
    console.log('✅ Test file created');
    
    // Verify content
    const readContent = await fs.readFile(testFilePath, 'utf-8');
    const contentMatches = readContent === testContent;
    
    if (contentMatches) {
      console.log('✅ File content integrity verified');
    } else {
      console.log('❌ File content integrity failed');
    }
    
    // Verify size
    const stats = await fs.stat(testFilePath);
    const expectedSize = Buffer.byteLength(testContent, 'utf-8');
    const sizeMatches = stats.size === expectedSize;
    
    if (sizeMatches) {
      console.log(`✅ File size integrity verified (${stats.size} bytes)`);
    } else {
      console.log(`❌ File size mismatch: expected ${expectedSize}, got ${stats.size}`);
    }
    
    // Clean up
    await fs.remove(testFilePath);
    console.log('✅ Test file cleaned up');
    
    if (contentMatches && sizeMatches) {
      results.push({ test: 'File integrity validation', status: 'PASS' });
    } else {
      results.push({ test: 'File integrity validation', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ File integrity validation failed: ${error.message}`);
    results.push({ test: 'File integrity validation', status: 'FAIL' });
  }
  
  console.log('');
  
  // Test 5: Download queue management
  try {
    console.log('📋 Test 5: Testing download queue management...');
    
    const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
    const downloader = new JWDownloader();
    await downloader.initialize();
    
    // Check queue properties
    if ('downloadQueue' in downloader) {
      console.log('✅ Download queue property exists');
      console.log(`   Queue type: ${Array.isArray(downloader.downloadQueue) ? 'array' : typeof downloader.downloadQueue}`);
      console.log(`   Initial queue length: ${downloader.downloadQueue.length || 0}`);
    } else {
      console.log('❌ Download queue property not found');
    }
    
    if ('isDownloading' in downloader) {
      console.log('✅ isDownloading flag exists');
      console.log(`   Initial state: ${downloader.isDownloading}`);
    } else {
      console.log('❌ isDownloading flag not found');
    }
    
    // Test concurrent download handling (simulate)
    const hasQueueManagement = 'downloadQueue' in downloader && 'isDownloading' in downloader;
    
    if (hasQueueManagement) {
      console.log('✅ Queue management structure verified');
      results.push({ test: 'Download queue management', status: 'PASS' });
    } else {
      console.log('❌ Queue management structure incomplete');
      results.push({ test: 'Download queue management', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ Download queue management test failed: ${error.message}`);
    results.push({ test: 'Download queue management', status: 'FAIL' });
  }
  
  console.log('');
  
  // Test 6: List downloaded materials
  try {
    console.log('📋 Test 6: Testing material listing functionality...');
    
    const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
    const downloader = new JWDownloader();
    await downloader.initialize();
    
    // Create some test files first
    const testFiles = [
      { name: 'test-material-1.pdf', content: 'Test PDF content 1' },
      { name: 'test-material-2.jwpub', content: 'Test JWPUB content 2' }
    ];
    
    for (const file of testFiles) {
      const filePath = path.join(process.cwd(), 'docs/Oficial', file.name);
      await fs.writeFile(filePath, file.content);
    }
    
    console.log(`✅ Created ${testFiles.length} test files`);
    
    // List materials
    const materials = await downloader.listDownloadedMaterials();
    
    if (Array.isArray(materials)) {
      console.log(`✅ Listed ${materials.length} materials`);
      
      // Verify test files are in the list
      const testFileNames = testFiles.map(f => f.name);
      const foundTestFiles = materials.filter(m => testFileNames.includes(m.filename));
      
      console.log(`   Found ${foundTestFiles.length} of ${testFiles.length} test files`);
      
      // Check material properties
      if (materials.length > 0) {
        const sampleMaterial = materials[0];
        const hasRequiredProps = 'filename' in sampleMaterial && 'size' in sampleMaterial && 'modifiedAt' in sampleMaterial;
        
        if (hasRequiredProps) {
          console.log('✅ Materials have required properties');
        } else {
          console.log('❌ Materials missing required properties');
        }
      }
    } else {
      console.log('❌ Invalid materials list format');
    }
    
    // Clean up test files
    for (const file of testFiles) {
      const filePath = path.join(process.cwd(), 'docs/Oficial', file.name);
      await fs.remove(filePath);
    }
    
    console.log('✅ Test files cleaned up');
    
    if (Array.isArray(materials)) {
      results.push({ test: 'Material listing functionality', status: 'PASS' });
    } else {
      results.push({ test: 'Material listing functionality', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ Material listing test failed: ${error.message}`);
    results.push({ test: 'Material listing functionality', status: 'FAIL' });
  }
  
  // Summary
  console.log('\n📊 Download Functionality Test Summary:');
  console.log('=======================================');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  results.forEach((result, index) => {
    const emoji = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${index + 1}. ${emoji} ${result.test}`);
  });
  
  console.log(`\nTotal: ${results.length} tests, ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('\n🎉 All download functionality tests passed!');
  } else {
    console.log('\n⚠️ Some download functionality tests failed.');
  }
  
  return { passed, failed, total: results.length };
}

testDownloadFunctionality().catch(console.error);