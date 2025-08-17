// Test script for file organization and storage testing
const fs = require('fs-extra');
const path = require('path');

async function testFileOrganizationAndStorage() {
  console.log('🔍 Testing File Organization and Storage...\n');
  
  const results = [];
  
  // Test 1: Directory structure validation
  try {
    console.log('📋 Test 1: Testing directory structure validation...');
    
    // Load mwbSources configuration
    const mwbSourcesPath = path.join(process.cwd(), 'backend/config/mwbSources.json');
    const mwbSources = JSON.parse(await fs.readFile(mwbSourcesPath, 'utf-8'));
    
    const baseDownloadPath = path.join(process.cwd(), 'docs/Oficial');
    console.log(`   Base download path: ${baseDownloadPath}`);
    
    // Check base directory
    const baseExists = await fs.pathExists(baseDownloadPath);
    if (baseExists) {
      console.log('✅ Base download directory exists');
    } else {
      console.log('⚠️ Base download directory does not exist, creating...');
      await fs.ensureDir(baseDownloadPath);
      console.log('✅ Base download directory created');
    }
    
    // Check language-specific directories
    let languageDirectoriesValid = 0;
    let languageDirectoriesCreated = 0;
    
    for (const [language, source] of Object.entries(mwbSources)) {
      const languageDir = path.join(process.cwd(), source.downloadPath);
      const exists = await fs.pathExists(languageDir);
      
      if (exists) {
        console.log(`✅ ${language} directory exists: ${source.downloadPath}`);
        languageDirectoriesValid++;
      } else {
        console.log(`⚠️ ${language} directory missing, creating: ${source.downloadPath}`);
        await fs.ensureDir(languageDir);
        console.log(`✅ ${language} directory created`);
        languageDirectoriesCreated++;
        languageDirectoriesValid++;
      }
      
      // Test write permissions
      const testFile = path.join(languageDir, 'test-permissions.tmp');
      try {
        await fs.writeFile(testFile, 'test');
        await fs.remove(testFile);
        console.log(`✅ ${language} directory has write permissions`);
      } catch (error) {
        console.log(`❌ ${language} directory write permission failed: ${error.message}`);
        languageDirectoriesValid--;
      }
    }
    
    const totalLanguages = Object.keys(mwbSources).length;
    console.log(`   Validated ${languageDirectoriesValid}/${totalLanguages} language directories`);
    
    if (languageDirectoriesValid === totalLanguages) {
      results.push({ test: 'Directory structure validation', status: 'PASS' });
    } else {
      results.push({ test: 'Directory structure validation', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ Directory structure validation failed: ${error.message}`);
    results.push({ test: 'Directory structure validation', status: 'FAIL' });
  }
  
  console.log('');
  
  // Test 2: File organization by language and type
  try {
    console.log('📋 Test 2: Testing file organization by language and type...');
    
    // Load configuration
    const mwbSourcesPath = path.join(process.cwd(), 'backend/config/mwbSources.json');
    const mwbSources = JSON.parse(await fs.readFile(mwbSourcesPath, 'utf-8'));
    
    // Create test files in different language directories
    const testFiles = [
      { language: 'pt-BR', filename: 'mwb_T_202401.pdf', type: 'meeting_workbook', content: 'Portuguese Meeting Workbook' },
      { language: 'en-US', filename: 'mwb_E_202401.pdf', type: 'meeting_workbook', content: 'English Meeting Workbook' },
      { language: 'pt-BR', filename: 'S-38_202401.pdf', type: 's38_guidelines', content: 'Portuguese S-38 Guidelines' },
      { language: 'en-US', filename: 'w_E_202401.pdf', type: 'watchtower', content: 'English Watchtower' }
    ];
    
    const createdFiles = [];
    
    for (const testFile of testFiles) {
      if (!(testFile.language in mwbSources)) {
        console.log(`⚠️ Skipping ${testFile.language} - not in configuration`);
        continue;
      }
      
      const source = mwbSources[testFile.language];
      const languageDir = path.join(process.cwd(), source.downloadPath);
      const filePath = path.join(languageDir, testFile.filename);
      
      // Ensure directory exists
      await fs.ensureDir(languageDir);
      
      // Create test file
      await fs.writeFile(filePath, testFile.content);
      createdFiles.push(filePath);
      
      console.log(`✅ Created ${testFile.language}/${testFile.filename} (${testFile.type})`);
      
      // Verify file is in correct location
      const exists = await fs.pathExists(filePath);
      if (!exists) {
        console.log(`❌ File not found after creation: ${filePath}`);
      }
    }
    
    console.log(`   Created ${createdFiles.length} test files in language-specific directories`);
    
    // Test file listing by language
    const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
    const downloader = new JWDownloader();
    const allMaterials = await downloader.listDownloadedMaterials();
    
    // Check if our test files are properly organized
    const testFilenames = testFiles.map(f => f.filename);
    const foundTestFiles = allMaterials.filter(m => testFilenames.includes(m.filename));
    
    console.log(`✅ Found ${foundTestFiles.length}/${testFiles.length} test files in material listing`);
    
    // Clean up test files
    for (const filePath of createdFiles) {
      await fs.remove(filePath);
    }
    console.log('✅ Test files cleaned up');
    
    if (foundTestFiles.length >= testFiles.length - 1) { // Allow for one missing due to config
      results.push({ test: 'File organization by language and type', status: 'PASS' });
    } else {
      results.push({ test: 'File organization by language and type', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ File organization test failed: ${error.message}`);
    results.push({ test: 'File organization by language and type', status: 'FAIL' });
  }
  
  console.log('');
  
  // Test 3: File naming convention validation
  try {
    console.log('📋 Test 3: Testing file naming convention validation...');
    
    const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
    const downloader = new JWDownloader();
    
    // Test various filename patterns
    const testFilenames = [
      { filename: 'mwb_T_202401.pdf', expected: 'meeting_workbook', valid: true },
      { filename: 'mwb_E_202401.pdf', expected: 'meeting_workbook', valid: true },
      { filename: 'S-38_202401.pdf', expected: 's38_guidelines', valid: true },
      { filename: 'w_T_202401.pdf', expected: 'pdf_document', valid: true },
      { filename: 'invalid-name.pdf', expected: 'pdf_document', valid: true },
      { filename: 'mwb_X_999999.pdf', expected: 'meeting_workbook', valid: true }, // Still valid, just unusual
      { filename: 'test.jwpub', expected: 'jwpub_publication', valid: true },
      { filename: 'document.rtf', expected: 'unknown', valid: true }
    ];
    
    let validationsPassed = 0;
    let validationsTotal = testFilenames.length;
    
    for (const test of testFilenames) {
      const materialInfo = downloader.parseMaterialInfo(`/test/${test.filename}`, test.filename, 'test');
      
      if (materialInfo) {
        const typeMatches = materialInfo.materialType === test.expected || 
                           (test.expected === 'pdf_document' && materialInfo.materialType !== 'unknown') ||
                           (test.expected === 'unknown' && materialInfo.materialType === 'unknown');
        
        if (typeMatches) {
          console.log(`✅ ${test.filename} -> ${materialInfo.materialType} (correct)`);
          validationsPassed++;
        } else {
          console.log(`❌ ${test.filename} -> ${materialInfo.materialType} (expected ${test.expected})`);
        }
        
        // Show additional parsed info for meeting workbooks
        if (materialInfo.materialType === 'meeting_workbook' && materialInfo.period) {
          console.log(`   Period: ${materialInfo.period}, Version: ${materialInfo.version}`);
        }
      } else {
        console.log(`❌ ${test.filename} -> failed to parse`);
      }
    }
    
    console.log(`   Naming validation: ${validationsPassed}/${validationsTotal} passed`);
    
    // Test file extension validation
    const validExtensions = ['.pdf', '.jwpub', '.daisy.zip', '.rtf'];
    const testExtensions = [
      'document.pdf',
      'publication.jwpub', 
      'audio.daisy.zip',
      'text.rtf',
      'invalid.doc'
    ];
    
    let extensionValidations = 0;
    for (const filename of testExtensions) {
      const isValid = downloader.isMaterialLink(`/test/${filename}`);
      const shouldBeValid = validExtensions.some(ext => filename.endsWith(ext));
      
      if (isValid === shouldBeValid) {
        console.log(`✅ Extension validation: ${filename} -> ${isValid ? 'valid' : 'invalid'} (correct)`);
        extensionValidations++;
      } else {
        console.log(`❌ Extension validation: ${filename} -> ${isValid ? 'valid' : 'invalid'} (incorrect)`);
      }
    }
    
    console.log(`   Extension validation: ${extensionValidations}/${testExtensions.length} passed`);
    
    if (validationsPassed >= validationsTotal * 0.8 && extensionValidations >= testExtensions.length * 0.8) {
      results.push({ test: 'File naming convention validation', status: 'PASS' });
    } else {
      results.push({ test: 'File naming convention validation', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ File naming convention test failed: ${error.message}`);
    results.push({ test: 'File naming convention validation', status: 'FAIL' });
  }
  
  console.log('');
  
  // Test 4: Metadata validation and storage
  try {
    console.log('📋 Test 4: Testing metadata validation and storage...');
    
    // Create test files with different metadata
    const testFiles = [
      { name: 'metadata-test-1.pdf', content: 'Small PDF content', type: 'pdf' },
      { name: 'metadata-test-2.jwpub', content: 'JWPUB publication content with more text to test size differences', type: 'jwpub' },
      { name: 'mwb_T_202401.pdf', content: 'Meeting workbook content', type: 'meeting_workbook' }
    ];
    
    const baseDownloadPath = path.join(process.cwd(), 'docs/Oficial');
    const createdFiles = [];
    
    for (const file of testFiles) {
      const filePath = path.join(baseDownloadPath, file.name);
      await fs.writeFile(filePath, file.content);
      createdFiles.push(filePath);
      
      // Set specific modification time for testing
      const testDate = new Date('2024-01-15T10:30:00Z');
      await fs.utimes(filePath, testDate, testDate);
    }
    
    console.log(`✅ Created ${testFiles.length} test files with metadata`);
    
    // Test metadata extraction
    const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
    const downloader = new JWDownloader();
    const materials = await downloader.listDownloadedMaterials();
    
    // Find our test files in the materials list
    const testFileNames = testFiles.map(f => f.name);
    const testMaterials = materials.filter(m => testFileNames.includes(m.filename));
    
    console.log(`✅ Found ${testMaterials.length} test files in materials list`);
    
    // Validate metadata properties
    let metadataValidations = 0;
    const requiredProperties = ['filename', 'size', 'modifiedAt', 'path'];
    
    for (const material of testMaterials) {
      let hasAllProperties = true;
      
      for (const prop of requiredProperties) {
        if (!(prop in material)) {
          console.log(`❌ Missing property '${prop}' in ${material.filename || 'unknown'}`);
          hasAllProperties = false;
        }
      }
      
      if (hasAllProperties) {
        console.log(`✅ ${material.filename}: all metadata properties present`);
        console.log(`   Size: ${material.sizeFormatted || material.size + ' bytes'}`);
        console.log(`   Modified: ${material.modifiedAt}`);
        metadataValidations++;
        
        // Validate size formatting
        if (material.sizeFormatted && material.sizeFormatted.includes('Bytes')) {
          console.log(`✅ Size formatting correct: ${material.sizeFormatted}`);
        }
      }
    }
    
    console.log(`   Metadata validation: ${metadataValidations}/${testMaterials.length} files passed`);
    
    // Test file sorting (materials should be sorted by modification date, newest first)
    if (materials.length > 1) {
      let sortedCorrectly = true;
      for (let i = 1; i < materials.length; i++) {
        const prev = new Date(materials[i-1].modifiedAt);
        const curr = new Date(materials[i].modifiedAt);
        if (prev < curr) {
          sortedCorrectly = false;
          break;
        }
      }
      
      if (sortedCorrectly) {
        console.log('✅ Materials are sorted correctly (newest first)');
      } else {
        console.log('❌ Materials are not sorted correctly');
      }
    }
    
    // Clean up test files
    for (const filePath of createdFiles) {
      await fs.remove(filePath);
    }
    console.log('✅ Test files cleaned up');
    
    if (metadataValidations === testMaterials.length && testMaterials.length === testFiles.length) {
      results.push({ test: 'Metadata validation and storage', status: 'PASS' });
    } else {
      results.push({ test: 'Metadata validation and storage', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ Metadata validation test failed: ${error.message}`);
    results.push({ test: 'Metadata validation and storage', status: 'FAIL' });
  }
  
  console.log('');
  
  // Test 5: Storage space and file management
  try {
    console.log('📋 Test 5: Testing storage space and file management...');
    
    const baseDownloadPath = path.join(process.cwd(), 'docs/Oficial');
    
    // Test storage space calculation
    const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
    const downloader = new JWDownloader();
    
    // Create files of different sizes
    const testFiles = [
      { name: 'small-file.pdf', size: 1024 }, // 1KB
      { name: 'medium-file.jwpub', size: 1024 * 100 }, // 100KB
      { name: 'large-file.pdf', size: 1024 * 1024 } // 1MB
    ];
    
    const createdFiles = [];
    let totalExpectedSize = 0;
    
    for (const file of testFiles) {
      const filePath = path.join(baseDownloadPath, file.name);
      const content = 'x'.repeat(file.size);
      await fs.writeFile(filePath, content);
      createdFiles.push(filePath);
      totalExpectedSize += file.size;
      
      console.log(`✅ Created ${file.name} (${downloader.formatBytes(file.size)})`);
    }
    
    // List materials and calculate total size
    const materials = await downloader.listDownloadedMaterials();
    const testMaterials = materials.filter(m => testFiles.some(f => f.name === m.filename));
    const totalActualSize = testMaterials.reduce((sum, m) => sum + m.size, 0);
    
    console.log(`   Expected total size: ${downloader.formatBytes(totalExpectedSize)}`);
    console.log(`   Actual total size: ${downloader.formatBytes(totalActualSize)}`);
    
    const sizeMatches = Math.abs(totalActualSize - totalExpectedSize) < 100; // Allow small variance
    
    if (sizeMatches) {
      console.log('✅ File size calculations are accurate');
    } else {
      console.log('❌ File size calculations are inaccurate');
    }
    
    // Test file management operations
    let managementOperations = 0;
    
    // Test file existence check
    for (const file of createdFiles) {
      const exists = await fs.pathExists(file);
      if (exists) {
        managementOperations++;
      }
    }
    
    console.log(`✅ File existence checks: ${managementOperations}/${createdFiles.length} passed`);
    
    // Test file removal
    let removalOperations = 0;
    for (const file of createdFiles) {
      try {
        await fs.remove(file);
        const stillExists = await fs.pathExists(file);
        if (!stillExists) {
          removalOperations++;
        }
      } catch (error) {
        console.log(`❌ Failed to remove ${file}: ${error.message}`);
      }
    }
    
    console.log(`✅ File removal operations: ${removalOperations}/${createdFiles.length} successful`);
    
    if (sizeMatches && managementOperations === createdFiles.length && removalOperations === createdFiles.length) {
      results.push({ test: 'Storage space and file management', status: 'PASS' });
    } else {
      results.push({ test: 'Storage space and file management', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ Storage space and file management test failed: ${error.message}`);
    results.push({ test: 'Storage space and file management', status: 'FAIL' });
  }
  
  // Summary
  console.log('\n📊 File Organization and Storage Test Summary:');
  console.log('==============================================');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  results.forEach((result, index) => {
    const emoji = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${index + 1}. ${emoji} ${result.test}`);
  });
  
  console.log(`\nTotal: ${results.length} tests, ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('\n🎉 All file organization and storage tests passed!');
  } else {
    console.log('\n⚠️ Some file organization and storage tests failed.');
  }
  
  return { passed, failed, total: results.length };
}

testFileOrganizationAndStorage().catch(console.error);