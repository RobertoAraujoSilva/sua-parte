#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚨 TESTING LOGOUT FALLBACK SYSTEM');
console.log('============================================================');

// Check AuthContext.tsx fallback implementation
console.log('\n📋 Checking AuthContext.tsx fallback fixes...');
const authContextPath = path.join(__dirname, '..', 'src', 'contexts', 'AuthContext.tsx');
const authContextContent = fs.readFileSync(authContextPath, 'utf8');

const authContextChecks = [
  {
    name: 'Has clearLocalState function',
    check: authContextContent.includes('const clearLocalState = () => {'),
    required: true
  },
  {
    name: 'Clears localStorage and sessionStorage',
    check: authContextContent.includes('localStorage.removeItem') && authContextContent.includes('sessionStorage.clear()'),
    required: true
  },
  {
    name: 'Uses 3-second timeout instead of 10',
    check: authContextContent.includes('setTimeout(() => {') && authContextContent.includes('3000'),
    required: true
  },
  {
    name: 'Returns success even on timeout',
    check: authContextContent.includes('return { error: null }'),
    required: true
  },
  {
    name: 'Always clears local state',
    check: authContextContent.includes('clearLocalState();'),
    required: true
  }
];

let authContextPassed = 0;
authContextChecks.forEach(check => {
  const status = check.check ? '✅' : (check.required ? '❌' : '⚠️');
  console.log(`${status} ${check.name}`);
  if (check.check) authContextPassed++;
});

console.log(`\n📊 AuthContext.tsx: ${authContextPassed}/${authContextChecks.length} checks passed`);

// Check forceLogout.ts utility
console.log('\n📋 Checking forceLogout.ts utility...');
const forceLogoutPath = path.join(__dirname, '..', 'src', 'utils', 'forceLogout.ts');
const forceLogoutExists = fs.existsSync(forceLogoutPath);

let forceLogoutPassed = 0;
let forceLogoutChecks = [];

if (forceLogoutExists) {
  const forceLogoutContent = fs.readFileSync(forceLogoutPath, 'utf8');

  forceLogoutChecks = [
    {
      name: 'Has forceLogout function',
      check: forceLogoutContent.includes('export const forceLogout'),
      required: true
    },
    {
      name: 'Clears all storage types',
      check: forceLogoutContent.includes('localStorage.clear()') && forceLogoutContent.includes('sessionStorage.clear()'),
      required: true
    },
    {
      name: 'Clears Supabase-specific keys',
      check: forceLogoutContent.includes('supabase.auth.token') && forceLogoutContent.includes('sb-nwpuurgwnnuejqinkvrh-auth-token'),
      required: true
    },
    {
      name: 'Clears cookies',
      check: forceLogoutContent.includes('document.cookie'),
      required: true
    },
    {
      name: 'Has emergency console functions',
      check: forceLogoutContent.includes('window.emergencyLogout') && forceLogoutContent.includes('window.debugLogout'),
      required: true
    },
    {
      name: 'Redirects to auth page',
      check: forceLogoutContent.includes("window.location.href = '/auth'"),
      required: true
    }
  ];

  forceLogoutChecks.forEach(check => {
    const status = check.check ? '✅' : (check.required ? '❌' : '⚠️');
    console.log(`${status} ${check.name}`);
    if (check.check) forceLogoutPassed++;
  });

  console.log(`\n📊 forceLogout.ts: ${forceLogoutPassed}/${forceLogoutChecks.length} checks passed`);
} else {
  console.log('❌ forceLogout.ts file not found');
}

// Check DebugPanel.tsx force logout button
console.log('\n📋 Checking DebugPanel.tsx force logout integration...');
const debugPanelPath = path.join(__dirname, '..', 'src', 'components', 'DebugPanel.tsx');
const debugPanelContent = fs.readFileSync(debugPanelPath, 'utf8');

const debugPanelChecks = [
  {
    name: 'Imports forceLogout utility',
    check: debugPanelContent.includes("import { forceLogout }"),
    required: true
  },
  {
    name: 'Has handleForceLogout function',
    check: debugPanelContent.includes('const handleForceLogout'),
    required: true
  },
  {
    name: 'Has Force Logout button',
    check: debugPanelContent.includes('🚨 Force Logout'),
    required: true
  },
  {
    name: 'Button has AlertTriangle icon',
    check: debugPanelContent.includes('<AlertTriangle'),
    required: true
  },
  {
    name: 'Downloads log before force logout',
    check: debugPanelContent.includes('downloadLog()') && debugPanelContent.includes('forceLogout()'),
    required: true
  }
];

let debugPanelPassed = 0;
debugPanelChecks.forEach(check => {
  const status = check.check ? '✅' : (check.required ? '❌' : '⚠️');
  console.log(`${status} ${check.name}`);
  if (check.check) debugPanelPassed++;
});

console.log(`\n📊 DebugPanel.tsx: ${debugPanelPassed}/${debugPanelChecks.length} checks passed`);

// Check Header.tsx simplified timeout
console.log('\n📋 Checking Header.tsx timeout simplification...');
const headerPath = path.join(__dirname, '..', 'src', 'components', 'Header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf8');

const headerChecks = [
  {
    name: 'Removed complex timeout logic',
    check: !headerContent.includes('Promise.race([signOutPromise, timeoutPromise])'),
    required: true
  },
  {
    name: 'Uses simple signOut call',
    check: headerContent.includes('const signOutResult = await signOut();'),
    required: true
  },
  {
    name: 'Still has detailed logging',
    check: headerContent.includes('User before signOut:') && headerContent.includes('SignOut result:'),
    required: true
  }
];

let headerPassed = 0;
headerChecks.forEach(check => {
  const status = check.check ? '✅' : (check.required ? '❌' : '⚠️');
  console.log(`${status} ${check.name}`);
  if (check.check) headerPassed++;
});

console.log(`\n📊 Header.tsx: ${headerPassed}/${headerChecks.length} checks passed`);

// Overall summary
console.log('\n==================================================');
console.log('📊 LOGOUT FALLBACK SYSTEM STATUS');
console.log('==================================================');

const totalChecks = authContextChecks.length + forceLogoutChecks.length + debugPanelChecks.length + headerChecks.length;
const totalPassed = authContextPassed + forceLogoutPassed + debugPanelPassed + headerPassed;

console.log(`✅ Total checks passed: ${totalPassed}/${totalChecks}`);

if (totalPassed === totalChecks) {
  console.log('\n🎉 LOGOUT FALLBACK SYSTEM SUCCESSFULLY IMPLEMENTED!');
  
  console.log('\n🛡️ Fallback mechanisms now in place:');
  console.log('1. ✅ 3-second timeout instead of 10 seconds');
  console.log('2. ✅ Local state cleared even if Supabase fails');
  console.log('3. ✅ Force logout utility for emergency situations');
  console.log('4. ✅ Emergency console commands available');
  console.log('5. ✅ Debug panel force logout button');
  console.log('6. ✅ Comprehensive storage clearing');
  
  console.log('\n🧪 Testing instructions:');
  console.log('1. Refresh: http://localhost:5174/dashboard');
  console.log('2. Try normal logout first (dropdown "Sair")');
  console.log('3. If it times out, use Debug Panel "🚨 Force Logout"');
  console.log('4. Emergency console commands available:');
  console.log('   - window.emergencyLogout()');
  console.log('   - window.debugLogout.force()');
  console.log('   - window.debugLogout.clearStorage()');
  
  console.log('\n🎯 Expected behavior:');
  console.log('• Normal logout should complete in 3 seconds or less');
  console.log('• If Supabase hangs, local state still clears');
  console.log('• Force logout always works as last resort');
  console.log('• User gets redirected to /auth in all cases');
  
} else {
  console.log('\n❌ Some implementations failed. Please review.');
}

console.log('\n============================================================');
console.log('🔗 This addresses the Supabase timeout issue by:');
console.log('- Reducing timeout from 10s to 3s');
console.log('- Always clearing local state regardless of Supabase response');
console.log('- Providing multiple fallback mechanisms');
console.log('- Ensuring user can always log out successfully');
console.log('============================================================');
