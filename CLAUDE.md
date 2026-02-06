# CLAUDE.md

## Project Overview

Food delivery MVP platform with a Python/FastAPI backend and three frontend clients (admin web, consumer web, consumer mobile app). The project supports three user roles: **Customer**, **Store Owner**, and **Admin**. The UI is in Korean.

## Repository Structure

```
store/
├── backend/                    # FastAPI Python backend
│   ├── main.py                 # App entry point, CORS, router registration
│   ├── models.py               # SQLAlchemy ORM models
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── auth.py                 # JWT authentication & password hashing
│   ├── config.py               # Pydantic settings (DB, Redis, JWT, CORS)
│   ├── database.py             # SQLAlchemy engine & session setup
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variable template
│   └── routers/                # API route handlers
│       ├── auth.py             # /api/auth/ - signup, login, me
│       ├── stores.py           # /api/stores/ - CRUD, search, filtering
│       ├── products.py         # /api/products/ - CRUD, store/category filter
│       └── orders.py           # /api/orders/ - create, list, status updates
├── frontend/
│   ├── admin-web/              # React (CRA) + MUI admin dashboard
│   ├── consumer-web/           # React (Vite) + MUI customer web app
│   └── consumer-app/           # React Native (Expo) mobile app
├── docker-compose.yml          # PostgreSQL 15 + Redis 7
├── test_app.py                 # Integration test (requests-based)
├── web_demo.py                 # Full flow demonstration script
└── README.md                   # Project docs (Korean)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3, FastAPI 0.109, Uvicorn |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic 2.5 |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Database | SQLite (dev default), PostgreSQL 15 (production) |
| Cache | Redis 7 (optional) |
| Admin Web | React 18 + react-scripts (CRA), MUI 5, React Router 6 |
| Consumer Web | React 18 + Vite 5, MUI 5, React Router 6 |
| Consumer Mobile | React Native 0.73, Expo 50, React Navigation 6, React Native Paper 5 |
| HTTP Client | Axios (all frontends) |

## Development Commands

### Backend

```bash
# Install dependencies
cd backend && pip install -r requirements.txt

# Run the server (default: http://localhost:8000)
cd backend && uvicorn main:app --reload

# Or directly
cd backend && python main.py

# API docs available at http://localhost:8000/docs (Swagger UI)
```

### Admin Web (port 3000)

```bash
cd frontend/admin-web
npm install
npm start        # Dev server
npm run build    # Production build
npm test         # Run tests (react-scripts test)
```

### Consumer Web (Vite, port 5173)

```bash
cd frontend/consumer-web
npm install
npm run dev      # Dev server
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Consumer Mobile App

```bash
cd frontend/consumer-app
npm install
npm start        # Expo dev server
npm run android  # Android emulator
npm run ios      # iOS simulator
npm run web      # Web browser
```

### Infrastructure

```bash
# Start PostgreSQL + Redis via Docker
docker-compose up -d

# Run integration tests (requires backend running on port 8000)
python test_app.py

# Run full demo flow
python web_demo.py
```

## Database Schema

Five tables: `users`, `stores`, `products`, `orders`, `order_items`.

- **users**: id, email, phone, hashed_password, role (CUSTOMER/STORE_OWNER/ADMIN), is_active
- **stores**: id, owner_id (FK users), name, category, address, latitude, longitude, delivery_fee, min_order_amount
- **products**: id, store_id (FK stores), name, price, image_url, is_available
- **orders**: id, customer_id (FK users), store_id (FK stores), status, subtotal, delivery_fee, total_amount, delivery_address
- **order_items**: id, order_id (FK orders), product_id (FK products), quantity, price (snapshot), subtotal

### Order Status Flow

```
pending → confirmed → preparing → ready → delivering → completed
                                                ↘ cancelled
```

## API Endpoints

All routes are prefixed and require JWT Bearer token except signup/login:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/signup | No | Register a new user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Yes | Get current user |
| GET/POST | /api/stores/ | Yes | List or create stores |
| GET/PUT/DELETE | /api/stores/{id} | Yes | Store CRUD |
| GET/POST | /api/products/ | Yes | List or create products |
| GET/PUT/DELETE | /api/products/{id} | Yes | Product CRUD |
| POST | /api/orders/ | Yes | Create an order |
| GET | /api/orders/ | Yes | List orders (role-filtered) |
| GET | /api/orders/{id} | Yes | Order detail |
| PATCH | /api/orders/{id}/status | Yes | Update order status |

## Architecture & Conventions

### Backend

- **Config**: Pydantic `BaseSettings` in `config.py`, reads from `.env` file. Defaults to SQLite for local dev.
- **Auth**: OAuth2PasswordBearer scheme. JWT tokens with HS256 algorithm, 7-day expiry. Bcrypt password hashing.
- **Routers**: Each resource has its own router file in `backend/routers/`. Routes use dependency injection for DB sessions and current user.
- **Role-based access**: UserRole enum (CUSTOMER, STORE_OWNER, ADMIN). Routers enforce ownership checks (store owners see only their data, customers see only their orders).
- **Pagination**: `skip` and `limit` query parameters on list endpoints.
- **Database**: SQLAlchemy ORM with `Base.metadata.create_all()` auto-migration on startup. No Alembic migrations configured yet.

### Frontend (all three apps)

- **State management**: React Context API only (AuthContext, CartContext). No Redux or external state libraries.
- **Auth flow**: JWT token stored in localStorage (web) or AsyncStorage (mobile). Axios interceptors inject Bearer token on every request. 401 responses redirect to login.
- **Styling**: Material-UI (MUI) on web apps with `createTheme()`. React Native Paper on mobile. Consistent color scheme: primary `#FF6B6B`, secondary `#4ECDC4`.
- **Routing**: React Router v6 with layout wrappers on web. React Navigation 6 with bottom tabs + stack navigators on mobile.
- **API layer**: Centralized Axios instances with request/response interceptors in each app's `services/api.js`.
- **Cart**: Single-store constraint (adding from a different store clears the cart). Managed via CartContext.

### Code Style

- Backend: Python, no type annotations beyond Pydantic schemas. No linter config.
- Admin Web: JavaScript (JSX), CRA eslint config (`react-app` preset).
- Consumer Web: JavaScript (JSX), ESLint 8 with react-hooks and react-refresh plugins.
- Consumer Mobile: JavaScript (JSX), Babel with Expo preset.
- No TypeScript anywhere in the project.
- No Prettier config.

## Environment Variables

Backend `.env` (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | sqlite:///./food_delivery.db | Database connection string |
| REDIS_URL | redis://localhost:6379 | Redis connection |
| SECRET_KEY | your-secret-key-change-in-production | JWT signing key |
| ALGORITHM | HS256 | JWT algorithm |
| ACCESS_TOKEN_EXPIRE_MINUTES | 10080 (7 days) | Token expiry |

Consumer Web uses `VITE_API_URL` to configure the backend base URL.

## Testing

- `test_app.py`: Integration test using the `requests` library. Tests the full flow: owner signup, store creation, product creation, customer signup, browsing, ordering, and status updates. Requires the backend running at `http://localhost:8000`.
- `web_demo.py`: Comprehensive demo script that exercises all API endpoints with realistic data.
- No unit test framework is configured for the frontend apps.

## Key Gotchas

- The backend defaults to SQLite (file-based `food_delivery.db`), not PostgreSQL. Use `docker-compose up -d` and set `DATABASE_URL` in `.env` to use PostgreSQL.
- CORS is configured only for `localhost:3000` and `localhost:19006` by default. Add additional origins in `config.py` or via the `BACKEND_CORS_ORIGINS` env var if running frontends on different ports.
- Database tables are auto-created on startup via `Base.metadata.create_all()`. There are no Alembic migration files, so schema changes require manual DB recreation or adding Alembic.
- The admin-web app is configured for single-store mode (recent commits simplified it from multi-store).
- All user-facing text in the frontend is in Korean.
