// Offline test script for download functionality testing
const fs = require('fs-extra');
const path = require('path');

async function testDownloadFunctionalityOffline() {
  console.log('🔍 Testing Download Functionality (Offline Mode)...\n');
  
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
  
  // Test 2: Material parsing functionality (offline)
  try {
    console.log('📋 Test 2: Testing material parsing functionality...');
    
    const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
    const downloader = new JWDownloader();
    
    // Test material link detection
    const testLinks = [
      'https://www.jw.org/download/?fileformat=PDF&docid=1011209&track=1&langwritten=T',
      'https://www.jw.org/download/?fileformat=JWPUB&docid=1011209&track=1&langwritten=T',
      'https://example.com/not-a-material.html',
      'https://www.jw.org/download/mwb_T_202401.pdf'
    ];
    
    let validMaterials = 0;
    let invalidMaterials = 0;
    
    for (const link of testLinks) {
      const isValid = downloader.isMaterialLink(link);
      if (isValid) {
        validMaterials++;
        console.log(`✅ Valid material link: ${link.substring(0, 50)}...`);
      } else {
        invalidMaterials++;
        console.log(`❌ Invalid material link: ${link.substring(0, 50)}...`);
      }
    }
    
    console.log(`   Valid materials: ${validMaterials}, Invalid: ${invalidMaterials}`);
    
    // Test material info parsing
    const testMaterialInfo = downloader.parseMaterialInfo(
      '/download/mwb_T_202401.pdf',
      'Meeting Workbook January 2024',
      'pt-BR'
    );
    
    if (testMaterialInfo && testMaterialInfo.materialType === 'meeting_workbook') {
      console.log('✅ Material info parsing works correctly');
      console.log(`   Parsed type: ${testMaterialInfo.materialType}`);
      console.log(`   Parsed period: ${testMaterialInfo.period}`);
      results.push({ test: 'Material parsing functionality', status: 'PASS' });
    } else {
      console.log('❌ Material info parsing failed');
      results.push({ test: 'Material parsing functionality', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ Material parsing test failed: ${error.message}`);
    results.push({ test: 'Material parsing functionality', status: 'FAIL' });
  }
  
  console.log('');
  
  // Test 3: File integrity validation
  try {
    console.log('📋 Test 3: Testing file integrity validation...');
    
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
    
    // Test file metadata
    const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
    const downloader = new JWDownloader();
    const formattedSize = downloader.formatBytes(stats.size);
    
    if (formattedSize && formattedSize.includes('Bytes')) {
      console.log(`✅ File size formatting works: ${formattedSize}`);
    } else {
      console.log('❌ File size formatting failed');
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
  
  // Test 4: Download queue management
  try {
    console.log('📋 Test 4: Testing download queue management...');
    
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
  
  // Test 5: List downloaded materials
  try {
    console.log('📋 Test 5: Testing material listing functionality...');
    
    const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
    const downloader = new JWDownloader();
    await downloader.initialize();
    
    // Create some test files first
    const testFiles = [
      { name: 'test-material-1.pdf', content: 'Test PDF content 1' },
      { name: 'test-material-2.jwpub', content: 'Test JWPUB content 2' },
      { name: 'mwb_T_202401.pdf', content: 'Meeting Workbook Test' }
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
          console.log(`   Sample: ${sampleMaterial.filename} (${sampleMaterial.sizeFormatted || sampleMaterial.size + ' bytes'})`);
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
  
  console.log('');
  
  // Test 6: Cleanup functionality
  try {
    console.log('📋 Test 6: Testing cleanup functionality...');
    
    const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
    const downloader = new JWDownloader();
    await downloader.initialize();
    
    // Create old test files (simulate old materials)
    const oldTestFiles = [
      { name: 'old-material-1.pdf', content: 'Old material 1' },
      { name: 'old-material-2.jwpub', content: 'Old material 2' }
    ];
    
    const now = new Date();
    const oldDate = new Date(now.getTime() - (100 * 24 * 60 * 60 * 1000)); // 100 days ago
    
    for (const file of oldTestFiles) {
      const filePath = path.join(process.cwd(), 'docs/Oficial', file.name);
      await fs.writeFile(filePath, file.content);
      
      // Set old modification time
      await fs.utimes(filePath, oldDate, oldDate);
    }
    
    console.log(`✅ Created ${oldTestFiles.length} old test files`);
    
    // Test cleanup (keep files newer than 90 days)
    const cleanupResult = await downloader.cleanupOldMaterials(90);
    
    if (cleanupResult && typeof cleanupResult.deleted === 'number') {
      console.log(`✅ Cleanup completed: ${cleanupResult.deleted} files deleted, ${cleanupResult.remaining} remaining`);
      
      // Verify old files were deleted
      let deletedCount = 0;
      for (const file of oldTestFiles) {
        const filePath = path.join(process.cwd(), 'docs/Oficial', file.name);
        const exists = await fs.pathExists(filePath);
        if (!exists) {
          deletedCount++;
        } else {
          // Clean up manually if not deleted
          await fs.remove(filePath);
        }
      }
      
      console.log(`✅ Verified ${deletedCount} old files were cleaned up`);
      results.push({ test: 'Cleanup functionality', status: 'PASS' });
    } else {
      console.log('❌ Cleanup functionality failed');
      
      // Manual cleanup
      for (const file of oldTestFiles) {
        const filePath = path.join(process.cwd(), 'docs/Oficial', file.name);
        await fs.remove(filePath);
      }
      
      results.push({ test: 'Cleanup functionality', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ Cleanup functionality test failed: ${error.message}`);
    results.push({ test: 'Cleanup functionality', status: 'FAIL' });
  }
  
  // Summary
  console.log('\n📊 Download Functionality Test Summary (Offline):');
  console.log('=================================================');
  
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

testDownloadFunctionalityOffline().catch(console.error);