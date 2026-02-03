# Food Delivery App

배달 앱 플랫폼 - MVP Phase 1

## 프로젝트 구조

```
store/
├── backend/                 # FastAPI 백엔드
│   ├── routers/            # API 라우터
│   ├── main.py             # FastAPI 애플리케이션
│   ├── models.py           # 데이터베이스 모델
│   ├── schemas.py          # Pydantic 스키마
│   ├── auth.py             # JWT 인증
│   ├── config.py           # 설정
│   └── database.py         # 데이터베이스 연결
├── frontend/
│   ├── consumer-app/       # React Native 고객용 앱
│   └── admin-web/          # React 점주/관리자 웹
└── docker-compose.yml      # PostgreSQL + Redis
```

## 기능 (MVP Phase 1)

### 고객용 앱 (Consumer App)
- ✅ 로그인 / 회원가입 (JWT 인증)
- ✅ 가게 목록 조회 (카테고리별, 검색)
- ✅ 가게 상세 및 상품 목록
- ✅ 장바구니
- ✅ 주문하기
- ✅ 주문 내역 및 상태 추적

### 점주/관리자 웹 (Admin Web)
- ✅ 로그인 / 회원가입
- ✅ 가게 관리 (등록, 수정, 삭제)
- ✅ 상품 관리 (등록, 수정, 삭제, 품절 처리)
- ✅ 주문 관리 (주문 조회, 상태 업데이트)

### 백엔드 API
- ✅ 사용자 인증 (JWT)
- ✅ 가게 CRUD
- ✅ 상품 CRUD
- ✅ 주문 관리
- ✅ 실시간 주문 상태 업데이트

## 기술 스택

### Backend
- **FastAPI** - Python 웹 프레임워크
- **PostgreSQL** - 관계형 데이터베이스
- **SQLAlchemy** - ORM
- **Redis** - 캐싱 및 실시간 데이터
- **JWT** - 인증

### Frontend
- **React Native (Expo)** - 모바일 앱
- **React** - 관리자 웹
- **Material-UI** - UI 컴포넌트
- **React Navigation** - 모바일 앱 내비게이션
- **Axios** - HTTP 클라이언트

## 설치 및 실행

### 1. 사전 요구사항

- Docker & Docker Compose
- Python 3.9+
- Node.js 16+
- npm or yarn

### 2. 데이터베이스 실행

```bash
# PostgreSQL과 Redis 컨테이너 시작
docker-compose up -d

# 컨테이너 상태 확인
docker-compose ps
```

### 3. 백엔드 실행

```bash
cd backend

# 가상환경 생성 및 활성화 (선택사항)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정 (선택사항)
cp .env.example .env
# .env 파일을 편집하여 필요한 값 수정

# 서버 실행
python main.py
```

백엔드는 `http://localhost:8000` 에서 실행됩니다.

API 문서: `http://localhost:8000/docs`

### 4. 고객용 앱 실행 (React Native)

```bash
cd frontend/consumer-app

# 의존성 설치
npm install

# Expo 개발 서버 시작
npm start

# 또는 특정 플랫폼 실행
npm run android  # Android
npm run ios      # iOS (Mac만 가능)
npm run web      # 웹 브라우저
```

**참고**:
- Android/iOS 에뮬레이터가 설치되어 있거나 Expo Go 앱이 설치된 실제 기기가 필요합니다.
- API URL을 `src/services/api.js`에서 수정해야 할 수 있습니다 (localhost 대신 실제 IP).

### 5. 관리자 웹 실행 (React)

```bash
cd frontend/admin-web

# 의존성 설치
npm install

# 개발 서버 시작
npm start
```

관리자 웹은 `http://localhost:3000` 에서 실행됩니다.

## 데이터베이스 구조

### Users (사용자)
- id, email, phone, hashed_password
- full_name, role (customer/store_owner/admin)
- is_active, created_at, updated_at

### Stores (가게)
- id, owner_id, name, description, category
- address, latitude, longitude, phone
- opening_hours, delivery_fee, min_order_amount
- rating, is_active, created_at, updated_at

### Products (상품)
- id, store_id, name, description, price
- image_url, category, is_available
- created_at, updated_at

### Orders (주문)
- id, customer_id, store_id, status
- delivery_address, delivery_phone, special_requests
- subtotal, delivery_fee, total_amount
- created_at, updated_at

### OrderItems (주문 항목)
- id, order_id, product_id
- quantity, price, subtotal

## API 엔드포인트

### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 가게
- `GET /api/stores` - 가게 목록
- `GET /api/stores/{id}` - 가게 상세
- `POST /api/stores` - 가게 등록 (점주/관리자)
- `PUT /api/stores/{id}` - 가게 수정 (점주/관리자)
- `DELETE /api/stores/{id}` - 가게 삭제 (점주/관리자)
- `GET /api/stores/my/stores` - 내 가게 목록 (점주)

### 상품
- `GET /api/products` - 상품 목록
- `GET /api/products/{id}` - 상품 상세
- `POST /api/products` - 상품 등록 (점주/관리자)
- `PUT /api/products/{id}` - 상품 수정 (점주/관리자)
- `DELETE /api/products/{id}` - 상품 삭제 (점주/관리자)

### 주문
- `GET /api/orders` - 주문 목록
- `GET /api/orders/{id}` - 주문 상세
- `POST /api/orders` - 주문 생성 (고객)
- `PATCH /api/orders/{id}/status` - 주문 상태 업데이트 (점주/관리자)

## 사용 시나리오

### 1. 점주 계정 생성 및 가게 등록

1. 관리자 웹(`http://localhost:3000`)에서 회원가입
2. 역할을 "점주"로 선택
3. 로그인 후 "가게 추가" 버튼 클릭
4. 가게 정보 입력 및 저장

### 2. 상품 등록

1. 관리자 웹에서 "상품 관리" 메뉴 선택
2. 가게 선택
3. "상품 추가" 버튼 클릭
4. 상품 정보 입력 및 저장

### 3. 고객 주문 플로우

1. 고객용 앱에서 회원가입/로그인
2. 홈 화면에서 가게 검색 또는 카테고리 선택
3. 가게 선택 → 상품 선택 → 장바구니 담기
4. 장바구니에서 "주문하기" 선택
5. 배달 주소 및 연락처 입력
6. 주문 완료

### 4. 점주 주문 관리

1. 관리자 웹에서 "주문 관리" 메뉴 선택
2. 새 주문 확인
3. 주문 상세 보기
4. 주문 상태 업데이트 (주문 접수 → 조리중 → 배달중 → 완료)

## 주문 상태 흐름

```
pending (주문 접수)
  ↓
confirmed (상점 확인)
  ↓
preparing (조리중)
  ↓
ready (준비 완료)
  ↓
delivering (배달중)
  ↓
completed (완료)
```

## 환경변수 (.env)

```env
DATABASE_URL=postgresql://food_delivery:food_delivery_pass@localhost:5432/food_delivery_db
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

## Phase 2 예정 기능

- ⏳ 결제 연동 (PG사 API)
- ⏳ 푸시 알림 (FCM)
- ⏳ 배달 추적 (GPS)
- ⏳ 배달원 앱
- ⏳ 리뷰 시스템
- ⏳ 쿠폰 시스템

## 문제 해결

### 백엔드 연결 실패

- PostgreSQL과 Redis 컨테이너가 실행 중인지 확인: `docker-compose ps`
- 데이터베이스 URL이 올바른지 확인

### 모바일 앱에서 API 호출 실패

- 에뮬레이터/실제 기기에서 localhost 대신 실제 IP 주소 사용
- `frontend/consumer-app/src/services/api.js`에서 API_URL 수정:
  ```javascript
  const API_URL = 'http://192.168.x.x:8000/api';  // 실제 IP로 변경
  ```

### CORS 오류

- `backend/config.py`의 `BACKEND_CORS_ORIGINS` 설정 확인
- 필요한 origin 추가

## 라이선스

MIT

## 기여

이슈와 PR을 환영합니다!
