const { chromium } = require('playwright');

// 커스텀 모바일 뷰포트 설정
const customMobileConfigs = [
  { name: '작은 모바일 (360x640)', width: 360, height: 640 },
  { name: '일반 모바일 (375x812)', width: 375, height: 812 },
  { name: '큰 모바일 (414x896)', width: 414, height: 896 },
  { name: '태블릿 세로 (768x1024)', width: 768, height: 1024 },
  { name: '태블릿 가로 (1024x768)', width: 1024, height: 768 },
];

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-position=0,0'] // 창 위치 고정
  });

  console.log('커스텀 뷰포트로 테스트를 시작합니다...\n');

  for (const config of customMobileConfigs) {
    console.log(`테스트 중: ${config.name}`);
    
    const context = await browser.newContext({
      viewport: { width: config.width, height: config.height },
      deviceScaleFactor: 2, // Retina 디스플레이 시뮬레이션
      isMobile: config.width < 768, // 768px 미만은 모바일로 처리
      hasTouch: true, // 터치 이벤트 활성화
      locale: 'ko-KR',
    });
    
    const page = await context.newPage();
    
    // 로그인 페이지 테스트
    await page.goto('http://localhost:3001/login');
    console.log(`  - 로그인 페이지 로드 완료`);
    
    // 뷰포트 정보 표시
    const dimensions = await page.evaluate(() => {
      return {
        window: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screen: {
          width: window.screen.width,
          height: window.screen.height
        }
      }
    });
    console.log(`  - 실제 뷰포트: ${dimensions.window.width}x${dimensions.window.height}`);
    
    // 로그인
    await page.fill('input[name="email"]', 'worker@test.com');
    await page.fill('input[name="password"]', 'test1234');
    await page.click('button[type="submit"]');
    
    // 대시보드 확인
    await page.waitForURL('http://localhost:3001/', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // 반응형 디자인 확인을 위한 요소 체크
    const isResponsive = await page.evaluate(() => {
      const header = document.querySelector('header');
      const main = document.querySelector('main');
      return {
        headerWidth: header?.offsetWidth,
        mainPadding: window.getComputedStyle(main).padding,
        fontSize: window.getComputedStyle(document.body).fontSize
      };
    });
    console.log(`  - 반응형 스타일:`, isResponsive);
    
    await context.close();
    console.log(`  ✓ ${config.name} 테스트 완료\n`);
  }
  
  console.log('모든 뷰포트 테스트가 완료되었습니다.');
  console.log('브라우저를 열어둡니다. Ctrl+C로 종료하세요.');
})();