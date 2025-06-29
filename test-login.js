const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to login page...');
  await page.goto('http://localhost:3001/login');
  
  console.log('Filling login form...');
  await page.fill('input[name="email"]', 'worker@test.com');
  await page.fill('input[name="password"]', 'test1234');
  
  console.log('Submitting login...');
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForURL('http://localhost:3001/', { timeout: 10000 });
  console.log('Login successful! Redirected to home page.');
  
  // Check if we're redirected to dashboard
  await page.waitForTimeout(1000);
  const url = page.url();
  console.log('Current URL:', url);
  
  // Check if stores are loaded
  const storeSelect = await page.waitForSelector('select', { timeout: 5000 });
  const options = await page.$$eval('select option', options => 
    options.map(option => ({
      value: option.value,
      text: option.textContent
    }))
  );
  
  console.log('Available stores:', options);
  
  // Take a screenshot
  await page.screenshot({ path: 'dashboard-screenshot.png' });
  console.log('Screenshot saved as dashboard-screenshot.png');
  
  // Keep browser open for manual inspection
  console.log('Browser will remain open for inspection. Press Ctrl+C to close.');
})();