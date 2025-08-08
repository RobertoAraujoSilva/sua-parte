#!/usr/bin/env node

console.log('🧪 Testing Logout Functionality');
console.log('============================================================');

console.log('🔍 Checking Header component logout implementation...');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the Header component
const headerPath = path.join(__dirname, '..', 'src', 'components', 'Header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf8');

console.log('\n📋 Checking logout implementation:');

// Check for handleSignOut function
const hasHandleSignOut = headerContent.includes('const handleSignOut = async () => {');
console.log(`1. Has handleSignOut function: ${hasHandleSignOut ? '✅' : '❌'}`);

// Check for proper error handling
const hasErrorHandling = headerContent.includes('const { error } = await signOut();');
console.log(`2. Has proper error handling: ${hasErrorHandling ? '✅' : '❌'}`);

// Check for toast notifications
const hasToastImport = headerContent.includes('import { toast } from "@/hooks/use-toast"');
const hasToastUsage = headerContent.includes('toast({');
console.log(`3. Has toast notifications: ${hasToastImport && hasToastUsage ? '✅' : '❌'}`);

// Check for navigation
const hasNavigate = headerContent.includes('navigate(\'/\');');
console.log(`4. Has navigation to home: ${hasNavigate ? '✅' : '❌'}`);

// Check for debug logging
const hasDebugLogging = headerContent.includes('console.log(\'🚪 Header logout button clicked\');');
console.log(`5. Has debug logging: ${hasDebugLogging ? '✅' : '❌'}`);

// Check for dropdown menu item
const hasDropdownMenuItem = headerContent.includes('DropdownMenuItem');
const hasLogoutClick = headerContent.includes('onClick={(e) => {') || headerContent.includes('onClick={handleSignOut}');
console.log(`6. Has dropdown menu item with click: ${hasDropdownMenuItem && hasLogoutClick ? '✅' : '❌'}`);

// Check for test button
const hasTestButton = headerContent.includes('Test Logout');
console.log(`7. Has test button for debugging: ${hasTestButton ? '✅' : '❌'}`);

console.log('\n==================================================');

const allChecks = [
  hasHandleSignOut,
  hasErrorHandling,
  hasToastImport && hasToastUsage,
  hasNavigate,
  hasDebugLogging,
  hasDropdownMenuItem && hasLogoutClick,
  hasTestButton
];

const passedChecks = allChecks.filter(check => check).length;
const totalChecks = allChecks.length;

console.log(`📊 Overall Status: ${passedChecks}/${totalChecks} checks passed`);

if (passedChecks === totalChecks) {
  console.log('🎉 All logout functionality checks passed!');
  console.log('\n🧪 Testing Instructions:');
  console.log('1. Go to http://localhost:5173/dashboard');
  console.log('2. Look for a red "Test Logout" button in the header');
  console.log('3. Click the "Test Logout" button to test direct function call');
  console.log('4. Check browser console for debug messages');
  console.log('5. If test button works, try the dropdown "Sair" button');
  console.log('6. Expected: Toast notification + redirect to home page');
} else {
  console.log('❌ Some logout functionality checks failed');
  console.log('🔧 Please review the implementation');
}

console.log('\n🔍 Debug Tips:');
console.log('• Open browser console (F12) to see debug messages');
console.log('• Look for "🚪 Header logout button clicked" message');
console.log('• Check for any JavaScript errors in console');
console.log('• Verify toast notifications appear');
console.log('• Confirm redirect to home page occurs');

console.log('\n============================================================');
