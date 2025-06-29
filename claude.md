# FOAAS Worker Web Project Guidelines

## Testing Guidelines

### 테스트 실행 규칙

#### 테스트 중단 명령
- **"테스트 중단"** 이라고 말하면 즉시 모든 백그라운드 프로세스를 정리합니다
- 정리 대상:
  - Next.js 개발 서버 (프론트엔드, 백엔드)
  - Playwright 테스트 프로세스
  - Chromium 브라우저 인스턴스
- 프로세스 정리 명령:
  ```bash
  # Next.js 서버 종료
  pkill -f "next dev"
  # 테스트 프로세스 종료
  pkill -f "node.*test"
  # Chromium 종료
  pkill -f "chromium"
  ```
1. **테스트는 항상 Playwright를 사용합니다**
   - E2E 테스트로 실제 사용자 시나리오를 검증
   - `playwright` 패키지가 설치되어 있어야 함

2. **테스트 시작 시 백엔드 자동 실행**
   - 테스트 시작 전에 백엔드 프로젝트(`../foaas`)를 백그라운드에서 실행
   - 백엔드 포트: 3000
   - 프론트엔드 포트: 3001

3. **테스트 종료 후 서버 정리**
   - 테스트가 완료되면 반드시 모든 서버 프로세스를 종료
   - 백엔드 서버와 프론트엔드 서버 모두 종료 필요

### 테스트 계정 정보
- Email: `worker@test.com`
- Password: `test1234`
- Role: Worker
- 할당된 매장: 강남역점, 홍대입구점

### 테스트 스크립트 예시
```javascript
// 테스트 시작 전 백엔드 실행
const { exec } = require('child_process');
exec('cd ../foaas && npm run dev', { detached: true });

// Playwright 테스트 실행
const { chromium } = require('playwright');
// ... 테스트 코드 ...

// 프로세스 정리 (테스트 실패 시에도 실행)
process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('uncaughtException', cleanup);

function cleanup() {
  exec('pkill -f "next dev"');
  process.exit();
}

// 테스트 종료 후 서버 정리
process.on('exit', () => {
  exec('pkill -f "next dev"');
});
```

### 주의사항
- 테스트 중 Rate Limiting 에러가 발생하면 서버를 재시작해야 함
- 테스트 계정이 없으면 Edge Function을 통해 생성 필요
- CORS 설정이 올바른지 확인 (백엔드 middleware.ts)

## API 엔드포인트 현황

### 구현된 엔드포인트
- `/api/auth/login` - 로그인
- `/api/auth/logout` - 로그아웃
- `/api/auth/me` - 현재 사용자 정보
- `/api/stores/assigned` - 할당된 매장 목록
- `/api/stores/[id]/workflows` - 매장별 워크플로우 (params await 필요)

### 미구현 엔드포인트
- `/api/attendance/current` - 현재 출근 상태
- `/api/attendance/check-in` - 출근 체크인
- `/api/attendance/check-out` - 퇴근 체크아웃
- `/api/visits/*` - 방문 관련 API

## 환경 변수 설정
```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://cylsrkwliwzxhcukqfgl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 모바일 테스트

### Playwright 모바일 뷰포트 테스트
```javascript
const { chromium, devices } = require('playwright');

// iPhone 13 디바이스 에뮬레이션
const iPhone13 = devices['iPhone 13'];
const context = await browser.newContext({
  ...iPhone13,
  locale: 'ko-KR',
  timezoneId: 'Asia/Seoul',
  permissions: ['geolocation'],
  geolocation: { latitude: 37.5665, longitude: 126.9780 },
});
```

### 지원 디바이스
- iPhone 13, iPhone SE
- Pixel 5, Galaxy S9+
- iPad Pro
- 커스텀 뷰포트 (360x640, 375x812, 414x896 등)

## 개발 서버 실행
```bash
# 백엔드와 프론트엔드 동시 실행
npm run dev:all

# 개별 실행
npm run dev:backend  # 백엔드만
npm run dev         # 프론트엔드만
```