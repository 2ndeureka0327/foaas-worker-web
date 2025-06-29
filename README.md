# FOAAS Worker Web

모바일 웹 버전의 FOAAS Worker 앱입니다.

## 시작하기

### 1. 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```
# Supabase (백엔드와 동일한 값 사용)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

백엔드 서버가 포트 3000에서 실행 중이어야 합니다.

```bash
# 백엔드 서버 실행 (../foaas 디렉토리에서)
npm run dev

# 프론트엔드 서버 실행 (이 디렉토리에서)
npm run dev
```

프론트엔드는 http://localhost:3001 에서 실행됩니다.

## 기능

- 작업자 로그인/로그아웃
- 출퇴근 관리
- 매장 선택 (위치 기반 자동 감지)
- 작업 수행
  - 사진 촬영 (전/후)
  - 텍스트 입력
  - 체크리스트
  - 선택 항목
- PWA 지원
  - 오프라인 모드
  - 홈 화면 추가
  - 자동 데이터 동기화

## 모바일 테스트

Chrome DevTools를 사용하여 모바일 디바이스를 시뮬레이션할 수 있습니다:

1. Chrome에서 http://localhost:3001 열기
2. F12를 눌러 DevTools 열기
3. 디바이스 툴바 토글 (Ctrl+Shift+M)
4. 모바일 디바이스 선택

## Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경변수 설정 (Vercel 대시보드에서)
3. 백엔드 CORS 설정에 프로덕션 URL 추가