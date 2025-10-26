# RoomBets

**Social Casino Platform** - P2P betting on real-world sports events using fictional currency.

A social platform where users engage in peer-to-peer betting on sports events using in-app "Chips". Features real-time chat rooms, live score updates, and a comprehensive betting system with 33 different bet types.

##  Overview

RoomBets is a **free-to-play social casino** focused on sports betting. Unlike traditional gambling platforms, users bet with fictional currency ("Chips") earned through daily rewards and game participation.

### Key Features
- **Peer-to-Peer Betting**: Direct bets between users in themed chat rooms
- **Live Sports Data**: Real-time synchronization with external APIs (NBA, MLB, etc.)
- **33 Bet Types**: Moneyline, spreads, over/under, quarters, halves, team totals, specials
- **Parlay System**: Combine multiple bets with multiplier calculations
- **Real-time Chat**: WebSocket-powered chat rooms for each league/game
- **Wallet System**: Transaction history and balance management
- **Mobile-First**: Responsive design for all devices

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (Fullstack)
- **Database**: PostgreSQL + Redis
- **ORM**: Prisma
- **Real-time**: Socket.IO
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Deployment**: Vercel (Frontend) + Railway/Render (Services)
- **Monorepo**: Turborepo + pnpm

### System Architecture

```
┌─────────────────────┐    ┌─────────────────────┐
│   Next.js Frontend  │    │  Next.js API Routes │
│                     │    │                     │
│ - React Components  │    │ - REST API          │
│ - Tailwind CSS      │    │ - Database Access   │
│ - Client State      │    │ - Auth Middleware   │
└─────────────────────┘    └─────────────────────┘
             │                           │
             └─────────────┬─────────────┘
                           │
                    ┌─────────────┐
                    │ PostgreSQL  │
                    │             │
                    │ - Users     │
                    │ - Games     │
                    │ - Bets      │
                    │ - Wallets   │
                    │ - Chat      │
                    └─────────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
    ┌────────▼────┐ ┌──────▼─────┐ ┌─────▼─────┐
    │ WebSocket   │ │ Redis      │ │ Email      │
    │ Service     │ │ Cache      │ │ Service    │
    │             │ │             │ │            │
    │ - Chat      │ │ - Sessions  │ │ - Notifications│
    │ - Live      │ │ - Rate      │ │ - Templates   │
    │ - Updates   │ │ - Limits    │ │            │
    └─────────────┘ └─────────────┘ └─────────────┘
```

### Database Schema

**Core Tables:**
- `users` - User accounts and profiles
- `wallets` - Chip balances and transactions
- `sports` - Baseball, Basketball, etc.
- `leagues` - NBA, MLB, NFL, etc.
- `teams` - Lakers, Warriors, etc.
- `games` - Scheduled and live games
- `bets` - P2P betting contracts
- `chat_rooms` - Discussion channels
- `chat_messages` - Messages and bet proposals
- `bet_type_configs` - 33 betting configurations

## Quick Start

### Prerequisites
- **Node.js**: 18+
- **Docker**: For local database
- **pnpm**: Package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd roombets
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start local database**
   ```bash
   # Start PostgreSQL + Redis
   docker compose up -d

   # Verify containers are running
   docker compose ps
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   pnpm --filter @repo/db generate

   # Run migrations
   pnpm --filter @repo/db migrate

   # Seed initial data
   pnpm --filter @repo/db seed
   ```

5. **Start development server**
   ```bash
   # Start Next.js app
   pnpm --filter web dev

   # App available at: http://localhost:3000
   ```

6. **Test API endpoints**
   ```bash
   # Test sports endpoint
   curl http://localhost:3000/api/sports

   # Test leagues endpoint
   curl http://localhost:3000/api/leagues
   ```

## 📁 Project Structure

```
roombets/
├── apps/
│   ├── web/                 # Next.js Fullstack App
│   │   ├── src/
│   │   │   ├── app/         # Next.js App Router
│   │   │   │   ├── api/     # API Routes (/api/*)
│   │   │   │   ├── (auth)/  # Authentication pages
│   │   │   │   └── page.tsx # Home page
│   │   │   └── lib/         # Utilities
│   │   │       └── db.ts    # Database connection
│   │   ├── .env.local       # Local environment vars
│   │   └── next.config.ts   # Next.js configuration
│   │
│   ├── websocket/           # Socket.IO Real-time Service
│   └── notifications/       # Email Notification Service
│
├── packages/
│   ├── db/                  # Shared Database Package
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Database schema
│   │   │   ├── seed.ts          # Initial data
│   │   │   └── migrations/      # DB migrations
│   │   └── generated/           # Prisma client
│   │
│   ├── ui/                  # Shared UI Components
│   ├── eslint-config/       # Shared ESLint config
│   └── typescript-config/   # Shared TypeScript config
│
├── docker-compose.yml       # Local database setup
├── turbo.json              # Turborepo configuration
└── package.json            # Monorepo root config
```

##  Available Scripts

### Root Scripts
```bash
pnpm install          # Install all dependencies
pnpm dev             # Start all apps in development
pnpm build           # Build all apps
pnpm lint            # Run linting
```

### Database Scripts
```bash
pnpm --filter @repo/db generate    # Generate Prisma client
pnpm --filter @repo/db migrate     # Run migrations
pnpm --filter @repo/db seed        # Seed database
pnpm --filter @repo/db studio      # Open Prisma Studio
```

### App Scripts
```bash
pnpm --filter web dev         # Start Next.js dev server
pnpm --filter web build       # Build Next.js app
pnpm --filter web start       # Start Next.js production server

pnpm --filter websocket dev   # Start WebSocket service
pnpm --filter notifications dev # Start notification service
```

##  Database

### Local Development
- **PostgreSQL**: `localhost:5432` / Database: `roombets_db`
- **Redis**: `localhost:6379`
- **Prisma Studio**: `pnpm --filter @repo/db studio`

### Key Tables Overview

| Table | Records | Purpose |
|-------|---------|---------|
| `sports` | 1 | Basketball |
| `leagues` | 1 | NBA |
| `chat_rooms` | 3 | NBA General, Eastern, Western |
| `bet_type_configs` | 33 | All betting configurations |
| `users` | 0 | User accounts (created via auth) |
| `games` | 0 | NBA games (synced from API) |
| `bets` | 0 | P2P betting contracts |

### Bet Types Available

**Full Game (6 types):**
- Moneyline (Home/Away)
- Spread (Home/Away)
- Over/Under Total

**Team Totals (4 types):**
- Over/Under per team

**Quarter Betting (8 types):**
- Winner, Over/Under per quarter

**Half Betting (8 types):**
- Winner, Over/Under per half

**Special Bets (7 types):**
- Overtime, Highest Quarter, etc.

## Testing & Development

### API Testing
```bash
# Test all endpoints
curl http://localhost:3000/api/sports
curl http://localhost:3000/api/leagues
curl http://localhost:3000/api/chat-rooms
curl http://localhost:3000/api/bet-type-configs
```

### Database Management
```bash
# View data in browser
pnpm --filter @repo/db studio

# Reset database (dangerous!)
pnpm --filter @repo/db reset
```

### Environment Variables
```bash
# Copy and customize
cp apps/web/.env.local.example apps/web/.env.local
```