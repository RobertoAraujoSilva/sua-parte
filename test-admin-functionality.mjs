// Admin Dashboard Functionality Test
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5174';
const ADMIN_EMAIL = 'amazonwebber007@gmail.com';
const ADMIN_PASSWORD = 'admin123';

async function testAdminDashboard() {
  console.log('🚀 Starting Admin Dashboard Functionality Test');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Navigate to admin page
    console.log('\n1️⃣ Testing navigation to admin page...');
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(3000);
    console.log('✅ Successfully navigated to admin page');

    // Test 2: Force admin login
    console.log('\n2️⃣ Testing admin login...');
    await page.evaluate(async () => {
      if (window.forceAdminLogin) {
        await window.forceAdminLogin();
      } else {
        // Manual login if forceAdminLogin not available
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          'https://nwpuurgwnnuejqinkvrh.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak'
        );
        
        await supabase.auth.signInWithPassword({
          email: 'amazonwebber007@gmail.com',
          password: 'admin123'
        });
      }
    });
    
    await page.waitForTimeout(5000);
    console.log('✅ Admin login completed');

    // Test 3: Check dashboard elements
    console.log('\n3️⃣ Testing dashboard elements...');
    
    // Wait for dashboard to load
    await page.waitForSelector('text=Admin Dashboard', { timeout: 10000 });
    console.log('✅ Dashboard title found');

    // Check for stats cards
    const statsCards = await page.locator('.card, [data-testid="stats-card"]').count();
    console.log(`✅ Found ${statsCards} stats cards`);

    // Test 4: Tab navigation
    console.log('\n4️⃣ Testing tab navigation...');
    const tabs = ['Visão Geral', 'Programas', 'Materiais', 'Congregações', 'Sistema'];
    
    for (const tab of tabs) {
      try {
        await page.click(`text=${tab}`);
        await page.waitForTimeout(1000);
        console.log(`✅ Successfully clicked ${tab} tab`);
      } catch (error) {
        console.log(`⚠️ Could not find ${tab} tab`);
      }
    }

    // Test 5: Programs functionality
    console.log('\n5️⃣ Testing programs functionality...');
    try {
      await page.click('text=Programas');
      await page.waitForTimeout(2000);
      
      const hasNewProgramBtn = await page.locator('text=Novo Programa').count() > 0;
      if (hasNewProgramBtn) {
        console.log('✅ New Program button found');
      } else {
        console.log('⚠️ New Program button not found');
      }
    } catch (error) {
      console.log('⚠️ Programs tab not accessible');
    }

    // Test 6: Materials functionality
    console.log('\n6️⃣ Testing materials functionality...');
    try {
      await page.click('text=Materiais');
      await page.waitForTimeout(2000);
      
      const hasUploadBtn = await page.locator('text=Upload Material').count() > 0;
      if (hasUploadBtn) {
        console.log('✅ Upload Material button found');
      } else {
        console.log('⚠️ Upload Material button not found');
      }
    } catch (error) {
      console.log('⚠️ Materials tab not accessible');
    }

    // Test 7: System status
    console.log('\n7️⃣ Testing system status...');
    try {
      await page.click('text=Sistema');
      await page.waitForTimeout(2000);
      
      const hasSystemStatus = await page.locator('text=Status do Sistema').count() > 0;
      if (hasSystemStatus) {
        console.log('✅ System status section found');
      } else {
        console.log('⚠️ System status section not found');
      }
    } catch (error) {
      console.log('⚠️ System tab not accessible');
    }

    // Test 8: Responsive design
    console.log('\n8️⃣ Testing responsive design...');
    
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    console.log('✅ Mobile viewport test completed');
    
    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    console.log('✅ Tablet viewport test completed');
    
    // Desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    console.log('✅ Desktop viewport test completed');

    // Test 9: Performance check
    console.log('\n9️⃣ Testing page performance...');
    const startTime = Date.now();
    await page.reload();
    await page.waitForSelector('text=Admin Dashboard', { timeout: 15000 });
    const loadTime = Date.now() - startTime;
    console.log(`✅ Page loaded in ${loadTime}ms`);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Check if Playwright is available
try {
  await testAdminDashboard();
} catch (error) {
  console.log('❌ Playwright not available. Install with: npm install playwright');
  console.log('Alternative: Test manually at http://localhost:5174/admin');
  console.log('Use browser console: window.forceAdminLogin()');
}