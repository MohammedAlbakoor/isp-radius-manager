# ISP RADIUS Management Platform

نظام إدارة شبكات الإنترنت عبر MikroTik و FreeRADIUS

## Architecture

```
Frontend (Next.js) → NestJS REST API → PostgreSQL → FreeRADIUS SQL Module → MikroTik Routers
```

## Tech Stack

- **Backend**: NestJS, TypeScript, Prisma ORM, PostgreSQL, Redis
- **Frontend**: Next.js 15, TypeScript, TailwindCSS, RTL Arabic
- **RADIUS**: FreeRADIUS with SQL module
- **Router**: MikroTik RouterOS API integration
- **Infrastructure**: Docker Compose, Nginx reverse proxy

## Features

### MVP Features
- Login system with JWT authentication
- Role-Based Access Control (RBAC)
- Customer management (CRUD with soft delete)
- Package management (speed tiers with auto MikroTik rate limit)
- Internet account management (PPPoE/Hotspot)
- Subscription management (auto-chaining, renewal)
- Router/NAS management with MikroTik API
- FreeRADIUS SQL synchronization
- Active sessions viewing from radacct
- Subscription expiration background job
- User disconnect via MikroTik API
- Dashboard with KPIs

### Additional Features
- Payment tracking
- Revenue reports
- Usage reports (top users)
- Router health monitoring
- Audit logging
- System notifications
- System settings

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd isp-radius-manager

# Create environment file
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# Run database migrations
docker exec isp_backend npx prisma migrate deploy

# Seed the database
docker exec isp_backend npx prisma db seed
```

### Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run seed
npm run start:dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

### Default Login
- **Username**: `admin`
- **Password**: `admin123`

## Project Structure

```
├── backend/
│   ├── prisma/              # Database schema & migrations
│   ├── src/
│   │   ├── common/          # Shared utilities, guards, decorators
│   │   ├── modules/
│   │   │   ├── auth/        # JWT authentication
│   │   │   ├── admin-users/ # Admin user management
│   │   │   ├── customers/   # Customer CRUD
│   │   │   ├── packages/    # Speed packages
│   │   │   ├── internet-accounts/ # PPPoE/Hotspot accounts
│   │   │   ├── subscriptions/     # Subscription management
│   │   │   ├── payments/    # Payment tracking
│   │   │   ├── routers/     # Router/NAS management
│   │   │   ├── mikrotik/    # MikroTik API client
│   │   │   ├── radius/      # RADIUS sync service
│   │   │   ├── sessions/    # Active sessions
│   │   │   ├── reports/     # Dashboard & reports
│   │   │   ├── audit-logs/  # Audit trail
│   │   │   ├── notifications/ # System notifications
│   │   │   ├── settings/    # System settings
│   │   │   └── system-health/ # Health check
│   │   ├── jobs/            # Background jobs
│   │   └── prisma/          # Prisma service
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (auth)
│   │   ├── lib/             # API client
│   │   └── types/           # TypeScript types
│   └── Dockerfile
├── docker/
│   ├── freeradius/          # FreeRADIUS configuration
│   └── nginx/               # Nginx reverse proxy
└── docker-compose.yml
```

## API Documentation

API documentation is available at `http://localhost:3001/api/docs` (Swagger UI) when the backend is running.

## RADIUS Sync

The system automatically syncs business data to RADIUS tables:

| Business Table | RADIUS Table | Purpose |
|---|---|---|
| InternetAccount | radcheck | Username/password authentication |
| InternetAccount | radusergroup | Package group assignment |
| Package | radgroupreply | Speed limits (Mikrotik-Rate-Limit) |
| Router | nas | NAS/router registration |
| radacct | - | Session accounting (read-only) |

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `JWT_SECRET` | JWT signing secret | Required |
| `ENCRYPTION_KEY` | AES-256-GCM encryption key (32+ chars) | Required |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `PORT` | Backend port | 3001 |
| `RADIUS_SERVER_IP` | RADIUS server IP for setup commands | 10.0.0.1 |

## License

MIT
