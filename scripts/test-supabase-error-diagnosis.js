#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 TESTING SUPABASE ERROR DIAGNOSIS SYSTEM');
console.log('============================================================');

// Check AuthContext.tsx enhanced error logging
console.log('\n📋 Checking AuthContext.tsx error diagnosis...');
const authContextPath = path.join(__dirname, '..', 'src', 'contexts', 'AuthContext.tsx');
const authContextContent = fs.readFileSync(authContextPath, 'utf8');

const authContextChecks = [
  {
    name: 'Enhanced error logging with JSON.stringify',
    check: authContextContent.includes('JSON.stringify(error, null, 2)'),
    required: true
  },
  {
    name: 'Logs error type',
    check: authContextContent.includes('typeof error'),
    required: true
  },
  {
    name: 'Logs error message',
    check: authContextContent.includes('error?.message'),
    required: true
  },
  {
    name: 'Logs error code',
    check: authContextContent.includes('error?.code'),
    required: true
  },
  {
    name: 'Logs error status',
    check: authContextContent.includes('error?.status'),
    required: true
  },
  {
    name: 'Logs current user context',
    check: authContextContent.includes('Current user before signOut:'),
    required: true
  },
  {
    name: 'Logs current session context',
    check: authContextContent.includes('Current session before signOut:'),
    required: true
  },
  {
    name: 'Pre-signOut session check',
    check: authContextContent.includes('getSession()') && authContextContent.includes('before signOut'),
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

// Check supabaseHealthCheck.ts utility
console.log('\n📋 Checking supabaseHealthCheck.ts utility...');
const healthCheckPath = path.join(__dirname, '..', 'src', 'utils', 'supabaseHealthCheck.ts');
const healthCheckExists = fs.existsSync(healthCheckPath);

let healthCheckPassed = 0;
let healthCheckChecks = [];

if (healthCheckExists) {
  const healthCheckContent = fs.readFileSync(healthCheckPath, 'utf8');
  
  healthCheckChecks = [
    {
      name: 'Has performHealthCheck function',
      check: healthCheckContent.includes('export const performHealthCheck'),
      required: true
    },
    {
      name: 'Tests connection',
      check: healthCheckContent.includes('connection: boolean'),
      required: true
    },
    {
      name: 'Tests auth service',
      check: healthCheckContent.includes('auth: boolean'),
      required: true
    },
    {
      name: 'Tests database',
      check: healthCheckContent.includes('database: boolean'),
      required: true
    },
    {
      name: 'Measures latency',
      check: healthCheckContent.includes('latency:'),
      required: true
    },
    {
      name: 'Has testAuthOperations function',
      check: healthCheckContent.includes('testAuthOperations'),
      required: true
    },
    {
      name: 'Has console access functions',
      check: healthCheckContent.includes('window.supabaseHealth'),
      required: true
    }
  ];

  healthCheckChecks.forEach(check => {
    const status = check.check ? '✅' : (check.required ? '❌' : '⚠️');
    console.log(`${status} ${check.name}`);
    if (check.check) healthCheckPassed++;
  });

  console.log(`\n📊 supabaseHealthCheck.ts: ${healthCheckPassed}/${healthCheckChecks.length} checks passed`);
} else {
  console.log('❌ supabaseHealthCheck.ts file not found');
}

// Check DebugPanel.tsx health check integration
console.log('\n📋 Checking DebugPanel.tsx health check integration...');
const debugPanelPath = path.join(__dirname, '..', 'src', 'components', 'DebugPanel.tsx');
const debugPanelContent = fs.readFileSync(debugPanelPath, 'utf8');

const debugPanelChecks = [
  {
    name: 'Imports performHealthCheck',
    check: debugPanelContent.includes('import { performHealthCheck }'),
    required: true
  },
  {
    name: 'Has handleHealthCheck function',
    check: debugPanelContent.includes('const handleHealthCheck'),
    required: true
  },
  {
    name: 'Has Health Check button',
    check: debugPanelContent.includes('🏥 Health Check'),
    required: true
  },
  {
    name: 'Button has Activity icon',
    check: debugPanelContent.includes('<Activity'),
    required: true
  },
  {
    name: 'Shows health check results',
    check: debugPanelContent.includes('result.isHealthy') && debugPanelContent.includes('alert'),
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

// Check App.tsx health check import
console.log('\n📋 Checking App.tsx health check import...');
const appPath = path.join(__dirname, '..', 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

const appChecks = [
  {
    name: 'Imports supabaseHealthCheck',
    check: appContent.includes('@/utils/supabaseHealthCheck'),
    required: true
  }
];

let appPassed = 0;
appChecks.forEach(check => {
  const status = check.check ? '✅' : (check.required ? '❌' : '⚠️');
  console.log(`${status} ${check.name}`);
  if (check.check) appPassed++;
});

console.log(`\n📊 App.tsx: ${appPassed}/${appChecks.length} checks passed`);

// Overall summary
console.log('\n==================================================');
console.log('📊 SUPABASE ERROR DIAGNOSIS SYSTEM STATUS');
console.log('==================================================');

const totalChecks = authContextChecks.length + healthCheckChecks.length + debugPanelChecks.length + appChecks.length;
const totalPassed = authContextPassed + healthCheckPassed + debugPanelPassed + appPassed;

console.log(`✅ Total checks passed: ${totalPassed}/${totalChecks}`);

if (totalPassed === totalChecks) {
  console.log('\n🎉 SUPABASE ERROR DIAGNOSIS SYSTEM SUCCESSFULLY IMPLEMENTED!');
  
  console.log('\n🔍 Enhanced error logging now includes:');
  console.log('1. ✅ Detailed error object inspection (JSON.stringify)');
  console.log('2. ✅ Error type, message, code, and status logging');
  console.log('3. ✅ Current user and session context');
  console.log('4. ✅ Pre-signOut session state check');
  console.log('5. ✅ Comprehensive health check utility');
  console.log('6. ✅ Debug panel health check button');
  
  console.log('\n🧪 Testing instructions:');
  console.log('1. Refresh: http://localhost:5174/dashboard');
  console.log('2. Open browser console (F12)');
  console.log('3. Click Debug panel "🏥 Health Check" button');
  console.log('4. Try logout and observe detailed error logs');
  console.log('5. Use console commands for additional diagnosis:');
  console.log('   - window.supabaseHealth.quickCheck()');
  console.log('   - window.supabaseHealth.testAuth()');
  
  console.log('\n🎯 Expected detailed error information:');
  console.log('• Exact Supabase error message and code');
  console.log('• Error object structure and type');
  console.log('• Current user and session state');
  console.log('• Supabase service health status');
  console.log('• Network connectivity test results');
  
  console.log('\n📊 What to look for in console:');
  console.log('• "❌ SignOut error details:" with full JSON');
  console.log('• "🔄 Current session before signOut:" with session info');
  console.log('• "🏥 Health check completed:" with service status');
  console.log('• Specific error codes (timeout, network, auth, etc.)');
  
} else {
  console.log('\n❌ Some implementations failed. Please review.');
}

console.log('\n============================================================');
console.log('🔗 This enhanced system will help identify:');
console.log('- Specific Supabase error codes and messages');
console.log('- Network connectivity issues');
console.log('- Authentication service problems');
console.log('- Session state inconsistencies');
console.log('- Service availability and latency');
console.log('============================================================');
