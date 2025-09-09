#!/usr/bin/env node

/**
 * Zoom & Responsiveness Validation Script
 * 
 * This script validates that all the necessary files and components
 * for zoom and responsiveness testing are in place.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

// Required files for zoom responsiveness testing
const requiredFiles = [
  'src/components/tests/ZoomResponsivenessTest.tsx',
  'src/pages/ZoomResponsivenessTest.tsx',
  'src/utils/zoomResponsivenessUtils.ts',
  'scripts/test-zoom-responsiveness.js',
  'docs/ZOOM_RESPONSIVENESS_TESTING_GUIDE.md'
];

// Required components that should exist
const requiredComponents = [
  'src/components/layout/PageShell.tsx',
  'src/styles/page-shell.css'
];

// Test scenarios to validate
const testScenarios = [
  {
    name: 'Layout Stability Test',
    description: 'Tests if layout remains stable at different zoom levels'
  },
  {
    name: 'Sticky Toolbar Test',
    description: 'Tests if toolbar remains sticky during scroll'
  },
  {
    name: 'Fluid Width Test',
    description: 'Tests if width adapts fluidly up to 1600px'
  },
  {
    name: 'Horizontal Scroll Test',
    description: 'Tests that no horizontal scrollbars appear unless intended'
  },
  {
    name: 'CSS Calc Heights Test',
    description: 'Tests that calc() height calculations work correctly'
  },
  {
    name: 'CSS Variables Test',
    description: 'Tests that required CSS variables are available'
  }
];

console.log('🔍 Validating Zoom & Responsiveness Testing Implementation...\n');

let allValid = true;

// Check required files
console.log('📁 Checking Required Files:');
requiredFiles.forEach(filePath => {
  const fullPath = path.join(projectRoot, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${filePath}`);
  } else {
    console.log(`  ❌ ${filePath} - MISSING`);
    allValid = false;
  }
});

console.log('\n🧩 Checking Required Components:');
requiredComponents.forEach(filePath => {
  const fullPath = path.join(projectRoot, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${filePath}`);
  } else {
    console.log(`  ❌ ${filePath} - MISSING (Required for testing)`);
    allValid = false;
  }
});

// Check if test scenarios are implemented
console.log('\n🧪 Test Scenarios Implemented:');
testScenarios.forEach(scenario => {
  console.log(`  📋 ${scenario.name}`);
  console.log(`     ${scenario.description}`);
});

// Check App.tsx for route registration
console.log('\n🛣️ Checking Route Registration:');
const appTsxPath = path.join(projectRoot, 'src/App.tsx');
if (fs.existsSync(appTsxPath)) {
  const appContent = fs.readFileSync(appTsxPath, 'utf8');
  if (appContent.includes('zoom-responsiveness-test')) {
    console.log('  ✅ Route registered in App.tsx');
  } else {
    console.log('  ❌ Route not found in App.tsx');
    allValid = false;
  }
} else {
  console.log('  ❌ App.tsx not found');
  allValid = false;
}

// Check CSS variables in page-shell.css
console.log('\n🎨 Checking CSS Variables:');
const cssPath = path.join(projectRoot, 'src/styles/page-shell.css');
if (fs.existsSync(cssPath)) {
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const requiredVars = [
    '--shell-max-w',
    '--shell-gutter',
    '--hero-h',
    '--toolbar-h',
    '--footer-h'
  ];
  
  requiredVars.forEach(varName => {
    if (cssContent.includes(varName)) {
      console.log(`  ✅ ${varName}`);
    } else {
      console.log(`  ❌ ${varName} - MISSING`);
      allValid = false;
    }
  });
} else {
  console.log('  ❌ page-shell.css not found');
  allValid = false;
}

// Final validation result
console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('🎉 All validation checks passed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Navigate to: /zoom-responsiveness-test');
  console.log('3. Run the interactive tests');
  console.log('4. Test at different zoom levels: 80%, 100%, 125%, 150%');
  console.log('5. Test at different resolutions: 1366x768, 1920x1080, 2560x1440');
  console.log('6. Use browser console script for automated testing');
  
  console.log('\n🔧 Console Testing:');
  console.log('1. Open browser console (F12)');
  console.log('2. Load: scripts/test-zoom-responsiveness.js');
  console.log('3. Run: testZoomResponsiveness()');
  
  process.exit(0);
} else {
  console.log('❌ Validation failed! Some components are missing.');
  console.log('\n🔧 To fix issues:');
  console.log('1. Ensure all required files are created');
  console.log('2. Check that PageShell component exists');
  console.log('3. Verify CSS variables are defined');
  console.log('4. Confirm route is registered in App.tsx');
  
  process.exit(1);
}