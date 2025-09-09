/**
 * Phone Validation Test Suite
 * 
 * This file contains test cases to verify the international phone validation
 * and formatting functionality for Brazilian and UK phone numbers.
 */

import { 
  validatePhone, 
  formatPhone, 
  detectPhoneCountry, 
  validateBrazilianPhone, 
  validateUKPhone,
  formatBrazilianPhone,
  formatUKPhone
} from '@/types/family';

// Test cases for phone validation and formatting
export const phoneTestCases = {
  brazilian: {
    valid: [
      '(11) 99999-9999',  // Formatted mobile
      '(11) 9999-9999',   // Formatted landline
      '11999999999',      // Raw mobile
      '1199999999',       // Raw landline
    ],
    invalid: [
      '(11) 999-9999',    // Too short
      '(11) 99999-99999', // Too long
      '999999999',        // Too short
      '119999999999',     // Too long
      'abc123',           // Non-numeric
    ]
  },
  uk: {
    valid: [
      '+447386797715',    // International format
      '+44 7386 797715',  // International formatted
      '07386797715',      // Domestic format
      '07386 797715',     // Domestic formatted
      '7386797715',       // Raw number
    ],
    invalid: [
      '+44123',           // Too short
      '+4473867977159',   // Too long
      '0123',             // Too short domestic
      'abc123',           // Non-numeric
    ]
  }
};

// Test function to validate all test cases
export const runPhoneValidationTests = (): { passed: number; failed: number; results: any[] } => {
  const results: any[] = [];
  let passed = 0;
  let failed = 0;

  console.log('🧪 Running Phone Validation Tests...\n');

  // Test Brazilian phone validation
  console.log('📱 Testing Brazilian Phone Numbers:');
  phoneTestCases.brazilian.valid.forEach(phone => {
    const isValid = validatePhone(phone);
    const country = detectPhoneCountry(phone);
    const formatted = formatPhone(phone);
    
    const result = {
      phone,
      expected: true,
      isValid,
      country,
      formatted,
      passed: isValid === true
    };
    
    results.push(result);
    if (result.passed) {
      passed++;
      console.log(`✅ ${phone} → Valid (${country}) → ${formatted}`);
    } else {
      failed++;
      console.log(`❌ ${phone} → Expected valid, got invalid`);
    }
  });

  phoneTestCases.brazilian.invalid.forEach(phone => {
    const isValid = validatePhone(phone);
    const country = detectPhoneCountry(phone);
    
    const result = {
      phone,
      expected: false,
      isValid,
      country,
      passed: isValid === false
    };
    
    results.push(result);
    if (result.passed) {
      passed++;
      console.log(`✅ ${phone} → Invalid (as expected)`);
    } else {
      failed++;
      console.log(`❌ ${phone} → Expected invalid, got valid`);
    }
  });

  // Test UK phone validation
  console.log('\n📱 Testing UK Phone Numbers:');
  phoneTestCases.uk.valid.forEach(phone => {
    const isValid = validatePhone(phone);
    const country = detectPhoneCountry(phone);
    const formatted = formatPhone(phone);
    
    const result = {
      phone,
      expected: true,
      isValid,
      country,
      formatted,
      passed: isValid === true
    };
    
    results.push(result);
    if (result.passed) {
      passed++;
      console.log(`✅ ${phone} → Valid (${country}) → ${formatted}`);
    } else {
      failed++;
      console.log(`❌ ${phone} → Expected valid, got invalid`);
    }
  });

  phoneTestCases.uk.invalid.forEach(phone => {
    const isValid = validatePhone(phone);
    const country = detectPhoneCountry(phone);
    
    const result = {
      phone,
      expected: false,
      isValid,
      country,
      passed: isValid === false
    };
    
    results.push(result);
    if (result.passed) {
      passed++;
      console.log(`✅ ${phone} → Invalid (as expected)`);
    } else {
      failed++;
      console.log(`❌ ${phone} → Expected invalid, got valid`);
    }
  });

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  return { passed, failed, results };
};

// Test specific formatting functions
export const testPhoneFormatting = () => {
  console.log('\n🎨 Testing Phone Formatting:');
  
  const testCases = [
    { input: '11999999999', expected: '(11) 99999-9999', type: 'Brazilian Mobile' },
    { input: '1199999999', expected: '(11) 9999-9999', type: 'Brazilian Landline' },
    { input: '+447386797715', expected: '+44 7386 797715', type: 'UK International' },
    { input: '07386797715', expected: '07386 797715', type: 'UK Domestic' },
  ];

  testCases.forEach(({ input, expected, type }) => {
    const formatted = formatPhone(input);
    const passed = formatted === expected;
    
    if (passed) {
      console.log(`✅ ${type}: ${input} → ${formatted}`);
    } else {
      console.log(`❌ ${type}: ${input} → ${formatted} (expected: ${expected})`);
    }
  });
};

// Test country detection
export const testCountryDetection = () => {
  console.log('\n🌍 Testing Country Detection:');
  
  const testCases = [
    { phone: '(11) 99999-9999', expected: 'BR' },
    { phone: '11999999999', expected: 'BR' },
    { phone: '+447386797715', expected: 'UK' },
    { phone: '07386797715', expected: 'UK' },
    { phone: '7386797715', expected: 'UK' },
    { phone: '123456789', expected: 'UNKNOWN' },
  ];

  testCases.forEach(({ phone, expected }) => {
    const detected = detectPhoneCountry(phone);
    const passed = detected === expected;
    
    if (passed) {
      console.log(`✅ ${phone} → ${detected}`);
    } else {
      console.log(`❌ ${phone} → ${detected} (expected: ${expected})`);
    }
  });
};

// Run all tests
export const runAllPhoneTests = () => {
  console.log('🚀 Starting Comprehensive Phone Validation Tests\n');
  
  const validationResults = runPhoneValidationTests();
  testPhoneFormatting();
  testCountryDetection();
  
  console.log('\n🎯 Summary:');
  console.log(`Total validation tests: ${validationResults.passed + validationResults.failed}`);
  console.log(`Passed: ${validationResults.passed}`);
  console.log(`Failed: ${validationResults.failed}`);
  console.log(`Success rate: ${((validationResults.passed / (validationResults.passed + validationResults.failed)) * 100).toFixed(1)}%`);
  
  return validationResults;
};
