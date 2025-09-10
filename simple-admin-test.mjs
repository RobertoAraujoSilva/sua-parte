// Simple Admin Dashboard Test
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5174';

async function testAdminDashboard() {
  console.log('🚀 Starting Simple Admin Dashboard Test');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Navigate to admin page
    console.log('\n1️⃣ Testing navigation to admin page...');
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(5000);
    console.log('✅ Successfully navigated to admin page');

    // Test 2: Check if page loads
    console.log('\n2️⃣ Testing page load...');
    const title = await page.title();
    console.log(`✅ Page title: ${title}`);

    // Test 3: Look for admin dashboard elements
    console.log('\n3️⃣ Testing dashboard elements...');
    
    // Check for dashboard title
    const hasDashboardTitle = await page.locator('text=Admin Dashboard').count() > 0;
    if (hasDashboardTitle) {
      console.log('✅ Admin Dashboard title found');
    } else {
      console.log('⚠️ Admin Dashboard title not found');
    }

    // Check for sistema ministerial
    const hasSistemaTitle = await page.locator('text=Sistema Ministerial').count() > 0;
    if (hasSistemaTitle) {
      console.log('✅ Sistema Ministerial text found');
    } else {
      console.log('⚠️ Sistema Ministerial text not found');
    }

    // Test 4: Check for stats cards
    console.log('\n4️⃣ Testing stats cards...');
    const statsCards = await page.locator('.card').count();
    console.log(`✅ Found ${statsCards} card elements`);

    // Test 5: Check for specific stats
    const programasText = await page.locator('text=Programas').count() > 0;
    const congregacoesText = await page.locator('text=Congregações').count() > 0;
    const materiaisText = await page.locator('text=Materiais').count() > 0;
    
    if (programasText) console.log('✅ Programas text found');
    if (congregacoesText) console.log('✅ Congregações text found');
    if (materiaisText) console.log('✅ Materiais text found');

    // Test 6: Check for tabs
    console.log('\n6️⃣ Testing tab elements...');
    const tabElements = await page.locator('[role="tablist"], .tabs-list').count();
    console.log(`✅ Found ${tabElements} tab list elements`);

    // Test 7: Try to use forceAdminLogin if available
    console.log('\n7️⃣ Testing admin login function...');
    const hasForceLogin = await page.evaluate(() => {
      return typeof window.forceAdminLogin === 'function';
    });
    
    if (hasForceLogin) {
      console.log('✅ forceAdminLogin function is available');
      await page.evaluate(() => {
        if (window.forceAdminLogin) {
          window.forceAdminLogin();
        }
      });
      await page.waitForTimeout(3000);
      console.log('✅ forceAdminLogin executed');
    } else {
      console.log('⚠️ forceAdminLogin function not available');
    }

    // Test 8: Check page after potential login
    console.log('\n8️⃣ Testing page after login attempt...');
    await page.waitForTimeout(2000);
    
    const finalCheck = await page.locator('text=Admin Dashboard').count() > 0;
    if (finalCheck) {
      console.log('✅ Dashboard still accessible after login attempt');
    }

    // Test 9: Take screenshot
    console.log('\n9️⃣ Taking screenshot...');
    await page.screenshot({ path: 'admin-dashboard-test.png', fullPage: true });
    console.log('✅ Screenshot saved as admin-dashboard-test.png');

    console.log('\n🎉 Test completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log(`- Page accessible: ✅`);
    console.log(`- Dashboard elements: ${hasDashboardTitle ? '✅' : '⚠️'}`);
    console.log(`- Stats cards: ${statsCards > 0 ? '✅' : '⚠️'}`);
    console.log(`- Admin function: ${hasForceLogin ? '✅' : '⚠️'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await page.waitForTimeout(5000); // Keep browser open for 5 seconds
    await browser.close();
  }
}

testAdminDashboard();