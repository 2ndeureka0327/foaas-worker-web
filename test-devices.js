const { chromium, devices } = require('playwright');

// 테스트할 디바이스 목록
const testDevices = [
  { name: 'iPhone 13', device: devices['iPhone 13'] },
  { name: 'iPhone SE', device: devices['iPhone SE'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'Galaxy S21', device: devices['Galaxy S9+'] }, // S21이 없어서 S9+ 사용
  { name: 'iPad Pro', device: devices['iPad Pro'] },
];

(async () => {
  for (const { name, device } of testDevices) {
    console.log(`\n=== Testing on ${name} ===`);
    
    const browser = await chromium.launch({ 
      headless: true // 여러 디바이스 테스트시에는 headless로
    });
    
    const context = await browser.newContext({
      ...device,
      locale: 'ko-KR',
      timezoneId: 'Asia/Seoul',
    });
    
    const page = await context.newPage();
    
    // 로그인 페이지
    await page.goto('http://localhost:3001/login');
    await page.screenshot({ path: `screenshots/${name.replace(' ', '-')}-login.png` });
    
    // 로그인
    await page.fill('input[name="email"]', 'worker@test.com');
    await page.fill('input[name="password"]', 'test1234');
    await page.click('button[type="submit"]');
    
    // 대시보드
    await page.waitForURL('http://localhost:3001/', { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `screenshots/${name.replace(' ', '-')}-dashboard.png` });
    
    console.log(`✓ ${name} test completed`);
    
    await browser.close();
  }
  
  console.log('\nAll device tests completed!');
})();