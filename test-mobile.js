const { chromium, devices } = require('playwright');

(async () => {
  // iPhone 13 디바이스 설정 사용
  const iPhone13 = devices['iPhone 13'];
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // 개발자 도구도 함께 열기
  });
  
  // 모바일 컨텍스트 생성
  const context = await browser.newContext({
    ...iPhone13,
    // 추가 옵션 설정 가능
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    permissions: ['geolocation'], // 위치 권한 허용
    geolocation: { latitude: 37.5665, longitude: 126.9780 }, // 서울 위치
  });
  
  const page = await context.newPage();
  
  console.log('Device info:', {
    viewport: iPhone13.viewport,
    userAgent: iPhone13.userAgent,
    deviceScaleFactor: iPhone13.deviceScaleFactor,
    isMobile: iPhone13.isMobile,
    hasTouch: iPhone13.hasTouch
  });
  
  console.log('Navigating to login page with mobile viewport...');
  await page.goto('http://localhost:3001/login');
  
  // 모바일 스크린샷
  await page.screenshot({ path: 'mobile-login-screenshot.png' });
  
  console.log('Filling login form...');
  await page.fill('input[name="email"]', 'worker@test.com');
  await page.fill('input[name="password"]', 'test1234');
  
  console.log('Submitting login...');
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForURL('http://localhost:3001/', { timeout: 10000 });
  console.log('Login successful! Redirected to home page.');
  
  // 대시보드 스크린샷
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'mobile-dashboard-screenshot.png' });
  
  // 매장 선택 테스트
  const storeSelect = await page.waitForSelector('select', { timeout: 5000 });
  await storeSelect.selectOption({ index: 1 }); // 첫 번째 매장 선택
  
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'mobile-store-selected-screenshot.png' });
  
  console.log('Mobile test completed! Screenshots saved.');
  console.log('Browser will remain open for inspection. Press Ctrl+C to close.');
})();