#!/usr/bin/env node

/**
 * Environment Validation Script for Sistema Ministerial
 * Validates that all required environment variables are properly configured
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Environment variable definitions
const envVars = {
  required: {
    'Database & Backend': [
      { name: 'VITE_SUPABASE_URL', pattern: /^https:\/\/.*\.supabase\.co$/, description: 'Supabase project URL' },
      { name: 'VITE_SUPABASE_ANON_KEY', pattern: /^eyJ/, description: 'Supabase anonymous key (JWT)' },
      { name: 'DATABASE_URL', pattern: /^postgresql:\/\//, description: 'PostgreSQL connection string' },
      { name: 'JWT_SECRET', minLength: 32, description: 'JWT signing secret (32+ chars)' },
      { name: 'SESSION_SECRET', minLength: 32, description: 'Session secret (32+ chars)' }
    ],
    'Application': [
      { name: 'NODE_ENV', values: ['development', 'staging', 'production'], description: 'Node environment' },
      { name: 'VITE_APP_ENV', values: ['development', 'staging', 'production'], description: 'App environment' },
      { name: 'VITE_APP_URL', pattern: /^https?:\/\//, description: 'Application URL' }
    ]
  },
  optional: {
    'Development Tools': [
      { name: 'GITHUB_TOKEN', pattern: /^ghp_/, description: 'GitHub personal access token' },
      { name: 'SUPABASE_ACCESS_TOKEN', pattern: /^sbp_/, description: 'Supabase personal access token' },
      { name: 'SUPABASE_SERVICE_ROLE_KEY', pattern: /^eyJ/, description: 'Supabase service role key' }
    ],
    'Testing': [
      { name: 'CYPRESS_RECORD_KEY', description: 'Cypress Cloud record key' },
      { name: 'TEST_INSTRUCTOR_EMAIL', pattern: /^.+@.+\..+$/, description: 'Test instructor email' },
      { name: 'TEST_STUDENT_EMAIL', pattern: /^.+@.+\..+$/, description: 'Test student email' },
      { name: 'TEST_DEVELOPER_EMAIL', pattern: /^.+@.+\..+$/, description: 'Test developer email' }
    ],
    'Storage & Features': [
      { name: 'SUPABASE_STORAGE_BUCKET', description: 'Supabase storage bucket name' },
      { name: 'MAX_FILE_SIZE', pattern: /^\d+$/, description: 'Maximum file size in bytes' },
      { name: 'VITE_ENABLE_DEVELOPER_PANEL', values: ['true', 'false'], description: 'Enable developer panel' },
      { name: 'VITE_ENABLE_TEMPLATE_LIBRARY', values: ['true', 'false'], description: 'Enable template library' }
    ]
  }
};

// Validation functions
function validateEnvVar(envVar, value) {
  const issues = [];

  if (!value) {
    return ['Variable is not set'];
  }

  if (envVar.pattern && !envVar.pattern.test(value)) {
    issues.push(`Does not match expected pattern: ${envVar.pattern}`);
  }

  if (envVar.minLength && value.length < envVar.minLength) {
    issues.push(`Too short (${value.length} chars, minimum ${envVar.minLength})`);
  }

  if (envVar.values && !envVar.values.includes(value)) {
    issues.push(`Invalid value. Expected one of: ${envVar.values.join(', ')}`);
  }

  if (value.includes('placeholder') || value.includes('your-') || value.includes('example')) {
    issues.push('Contains placeholder value - needs to be replaced with actual value');
  }

  return issues;
}

function printSection(title, color = colors.cyan) {
  console.log(`\n${color}${'='.repeat(60)}${colors.reset}`);
  console.log(`${color}${title}${colors.reset}`);
  console.log(`${color}${'='.repeat(60)}${colors.reset}`);
}

function printResult(name, status, message = '', indent = 0) {
  const spaces = ' '.repeat(indent);
  const statusColor = status === 'PASS' ? colors.green : 
                     status === 'WARN' ? colors.yellow : colors.red;
  const statusSymbol = status === 'PASS' ? '✅' : 
                      status === 'WARN' ? '⚠️' : '❌';
  
  console.log(`${spaces}${statusSymbol} ${statusColor}${status}${colors.reset} ${name}`);
  if (message) {
    console.log(`${spaces}   ${colors.white}${message}${colors.reset}`);
  }
}

// Main validation function
function validateEnvironment() {
  console.log(`${colors.magenta}🔧 Sistema Ministerial - Environment Validation${colors.reset}`);
  console.log(`${colors.white}Checking environment configuration...${colors.reset}\n`);

  let totalChecks = 0;
  let passedChecks = 0;
  let warnings = 0;
  let errors = 0;

  // Check if .env file exists
  try {
    readFileSync('.env', 'utf8');
    printResult('.env file', 'PASS', 'Environment file found');
  } catch (error) {
    printResult('.env file', 'FAIL', 'Environment file not found. Copy .env.example to .env');
    return;
  }

  // Validate required variables
  printSection('Required Environment Variables');
  
  Object.entries(envVars.required).forEach(([category, vars]) => {
    console.log(`\n${colors.blue}${category}:${colors.reset}`);
    
    vars.forEach(envVar => {
      totalChecks++;
      const value = process.env[envVar.name];
      const issues = validateEnvVar(envVar, value);
      
      if (issues.length === 0) {
        printResult(envVar.name, 'PASS', envVar.description, 2);
        passedChecks++;
      } else {
        printResult(envVar.name, 'FAIL', `${envVar.description} - ${issues.join(', ')}`, 2);
        errors++;
      }
    });
  });

  // Validate optional variables
  printSection('Optional Environment Variables');
  
  Object.entries(envVars.optional).forEach(([category, vars]) => {
    console.log(`\n${colors.blue}${category}:${colors.reset}`);
    
    vars.forEach(envVar => {
      totalChecks++;
      const value = process.env[envVar.name];
      
      if (!value) {
        printResult(envVar.name, 'WARN', `${envVar.description} - Not configured (optional)`, 2);
        warnings++;
      } else {
        const issues = validateEnvVar(envVar, value);
        
        if (issues.length === 0) {
          printResult(envVar.name, 'PASS', envVar.description, 2);
          passedChecks++;
        } else {
          printResult(envVar.name, 'WARN', `${envVar.description} - ${issues.join(', ')}`, 2);
          warnings++;
        }
      }
    });
  });

  // Security checks
  printSection('Security Validation');
  
  const securityChecks = [
    {
      name: 'JWT_SECRET strength',
      check: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) return { status: 'FAIL', message: 'JWT_SECRET not set' };
        if (secret.length < 32) return { status: 'FAIL', message: 'JWT_SECRET too short (< 32 chars)' };
        if (!/[A-Z]/.test(secret) || !/[a-z]/.test(secret) || !/[0-9]/.test(secret)) {
          return { status: 'WARN', message: 'JWT_SECRET should contain uppercase, lowercase, and numbers' };
        }
        return { status: 'PASS', message: 'Strong JWT secret' };
      }
    },
    {
      name: 'Environment file security',
      check: () => {
        try {
          const gitignore = readFileSync('.gitignore', 'utf8');
          if (gitignore.includes('.env')) {
            return { status: 'PASS', message: '.env files are excluded from version control' };
          } else {
            return { status: 'FAIL', message: '.env files not in .gitignore - security risk!' };
          }
        } catch (error) {
          return { status: 'WARN', message: 'Could not check .gitignore file' };
        }
      }
    },
    {
      name: 'Production readiness',
      check: () => {
        const env = process.env.NODE_ENV;
        if (env === 'production') {
          const debugEnabled = process.env.VITE_ENABLE_DEBUG_PANEL === 'true';
          if (debugEnabled) {
            return { status: 'WARN', message: 'Debug panel enabled in production' };
          }
          return { status: 'PASS', message: 'Production configuration looks good' };
        }
        return { status: 'PASS', message: `Development environment (${env})` };
      }
    }
  ];

  securityChecks.forEach(check => {
    totalChecks++;
    const result = check.check();
    printResult(check.name, result.status, result.message, 2);
    
    if (result.status === 'PASS') passedChecks++;
    else if (result.status === 'WARN') warnings++;
    else errors++;
  });

  // Summary
  printSection('Validation Summary');
  
  console.log(`${colors.white}Total checks: ${totalChecks}${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${passedChecks}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${warnings}${colors.reset}`);
  console.log(`${colors.red}❌ Errors: ${errors}${colors.reset}`);

  const successRate = Math.round((passedChecks / totalChecks) * 100);
  console.log(`\n${colors.white}Success Rate: ${successRate}%${colors.reset}`);

  if (errors > 0) {
    console.log(`\n${colors.red}❌ Environment validation failed!${colors.reset}`);
    console.log(`${colors.white}Please fix the errors above before proceeding.${colors.reset}`);
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`\n${colors.yellow}⚠️  Environment validation passed with warnings.${colors.reset}`);
    console.log(`${colors.white}Consider addressing the warnings for optimal functionality.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}✅ Environment validation passed!${colors.reset}`);
    console.log(`${colors.white}Your environment is properly configured.${colors.reset}`);
  }

  // Next steps
  printSection('Next Steps');
  
  if (errors === 0) {
    console.log(`${colors.white}1. Apply database migration: npm run db:migrate${colors.reset}`);
    console.log(`${colors.white}2. Create test users: npm run db:seed${colors.reset}`);
    console.log(`${colors.white}3. Start development server: npm run dev${colors.reset}`);
    console.log(`${colors.white}4. Run tests: npm run test${colors.reset}`);
  } else {
    console.log(`${colors.white}1. Fix environment variable errors above${colors.reset}`);
    console.log(`${colors.white}2. Run validation again: npm run env:validate${colors.reset}`);
    console.log(`${colors.white}3. Refer to ENVIRONMENT_SETUP_GUIDE.md for help${colors.reset}`);
  }
}

// Run validation
validateEnvironment();
