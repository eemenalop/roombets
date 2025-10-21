# RoomBets - Architecture Document

## 1. Overview

This document outlines the architecture for **RoomBets**, a free-to-play Social Casino Application. The core concept is a web-based platform where users engage in peer-to-peer (P2P) betting on real-world sports events using a fictional, in-app currency. The primary user experience is centered around themed chat rooms where bets are proposed, accepted, and discussed as part of the social interaction.

The initial launch will focus exclusively on **Major League Baseball (MLB)**, with the architecture designed to be scalable for future expansion into other sports and leagues.

---

## 2. Core Domain Model

The system is modeled around the following core entities:

- **User**: Represents a registered user. Manages identity, authentication, and profile information. Each user has one Wallet.

- **Wallet**: Holds the user's current balance of fictional currency ("Chips"). All betting transactions are debited/credited from this entity.

- **WalletTransaction**: An immutable log of every transaction (bet placement, win payout, daily bonus claim) that affects a user's wallet. Crucial for history and auditing.

- **Sport**: Defines a sport category (e.g., "Baseball", "Basketball").

- **League**: Defines a specific league within a sport (e.g., "MLB", "NBA"). Belongs to one Sport.

- **Game**: A local copy of a real-world sporting event, synced from an external data provider. All bets are tied to a Game.

- **Bet**: Represents a P2P bet contract between two users. It includes the game, the bet type (e.g., Moneyline), the amount, the creator, the acceptor, and its status.

- **ChatRoom**: A real-time channel for discussion, usually associated with a specific Game or League.

- **ChatMessage**: A single message within a ChatRoom. Can be of type `text` or `bet_proposal`.

- **Notification**: Represents a pending or sent notification (initially email) to a user.

---

## 3. Architecture Pattern

We will use a **Separated Services (Hybrid) Architecture**. This pattern provides a balance between the simplicity of a monolith and the scalability of pure microservices, making it ideal for this project.

The system is composed of three core backend services, a shared data layer, and a single entry point managed by an API Gateway for internal routing.

### Architectural Diagram

```
      ┌──────────────────────┐
      │  Next.js Frontend    │
      └──────────┬───────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │     API Gateway      │  (Managed by Hosting Platform, e.g., Vercel)
      └─────┬──────────┬─────┘
            │          │
    (Route: /api/*)  (Route: /ws/*)
            │          │
            ▼          ▼
      ┌──────────┐   ┌─────────────────────┐
      │ Next.js  │   │  Real-Time Service  │
      │ Backend  │   │    (WebSocket)      │
      │(API Rtes)│   │                     │
      └────┬─────┘   └─────────────────────┘
           │
           ├──────────────────┐
           │                  │
           ▼                  ▼
      ┌──────────────────┐  ┌─────────────────────┐
      │ PostgreSQL DB    │  │ Notification Service│
      │ (Shared)         │  │     (Email)         │
      └──────────────────┘  └─────────────────────┘
      ┌──────────────────┐
      │ Redis Cache      │
      │ (Shared)         │
      └──────────────────┘
```

### Request Flow

**Standard API Call** (e.g., Get Profile):
```
Client → API Gateway → Next.js Backend → PostgreSQL → Response
```

**Real-Time Event** (e.g., New Bet Proposal):
1. **Creation**: Client → API Gateway → Next.js Backend (validates & saves bet)
2. **Notification**: Next.js Backend → Real-Time Service (internal HTTP call)
3. **Broadcast**: Real-Time Service → All clients in the room (via WebSocket)

---

## 4. Technology Stack

The project will be developed within a **Monorepo** managed by **Turborepo**.

### Frontend
- **Framework**: Next.js (TypeScript)
- **State Management**: Zustand
- **Data Validation**: Zod

### Backend (Main API)
- **Framework**: Next.js API Routes (TypeScript)
- **Authentication**: NextAuth.js (Auth.js)
- **ORM**: Prisma

### Real-Time Service (Chat)
- **Library**: Socket.IO (TypeScript)
- **Base Server**: Node.js + Express.js

### Notification Service (Email)
- **Framework**: Node.js + Express.js (TypeScript)
- **Email Provider**: SendGrid (or similar)

### Database
- **Primary DB**: PostgreSQL
- **Caching**: Redis

### Development & Deployment
- **Environment**: Docker & Docker Compose
- **Deployment (Next.js)**: Vercel
- **Deployment (Services & DB)**: Railway or Render

---

## 5. Database Schema Design

A single, shared **PostgreSQL** database will be used. IDs will follow a hybrid approach: **UUIDs** for the `users` table (for security and privacy) and **auto-incrementing integers** for all other tables (for performance).

### Key Tables

#### `users`
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | UUID | Primary Key, public-facing ID |
| username | VARCHAR | Unique, user-facing name |
| email | VARCHAR | Unique, for login and notifications |
| password_hash | VARCHAR | Hashed password (bcrypt) |
| created_at | TIMESTAMP | |

#### `wallets`
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | INT | Primary Key |
| user_id | UUID (FK to users) | One-to-one relationship |
| balance | DECIMAL | Fictional currency balance |
| updated_at | TIMESTAMP | |

#### `games`
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | INT | Primary Key, internal ID |
| league_id | INT (FK to leagues) | Specifies the league (e.g., MLB) |
| external_api_id | VARCHAR | The unique ID from the sports data API |
| home_team_id | INT (FK to teams) | |
| away_team_id | INT (FK to teams) | |
| home_score | INT | |
| away_score | INT | |
| start_time | TIMESTAMP | |
| status | VARCHAR | (e.g., 'scheduled', 'in_progress', 'final') |

#### `bets`
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | INT | Primary Key |
| game_id | INT (FK to games) | The game being bet on |
| proposer_user_id | UUID (FK to users) | The user who created the bet |
| acceptor_user_id | UUID (FK to users) | The user who accepted the bet (nullable) |
| bet_type | VARCHAR | (e.g., 'moneyline_home', 'over_under_total') |
| amount | DECIMAL | Amount of fictional currency wagered |
| status | VARCHAR | ('pending', 'active', 'settled_won', 'settled_lost') |
| created_at | TIMESTAMP | |

#### `chat_messages`
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | INT | Primary Key |
| room_id | INT (FK to chat_rooms) | |
| user_id | UUID (FK to users) | |
| type | VARCHAR | 'text' or 'bet_proposal' |
| message_text | TEXT | Nullable, for 'text' type messages |
| bet_id | INT (FK to bets) | Nullable, for 'bet_proposal' type messages |
| sent_at | TIMESTAMP | |

> Other tables like `sports`, `leagues`, `teams`, `wallet_transactions`, `chat_rooms`, `notifications`, etc., will be created as previously discussed.

---

## 6. Key Workflows

### Creating a Bet

1. **Client**: User clicks "Bet" in a chat room. Client requests game data from the Next.js Backend (`GET /api/games`).

2. **Client**: User submits the bet form. Client sends a `POST /api/bets` request to the Next.js Backend.

3. **Next.js Backend**:
   - Validates the request data (using Zod).
   - Checks the user's wallet balance.
   - Starts a database transaction.
   - Deducts the amount from the user's `wallets` record.
   - Creates a new record in the `bets` table with `status: 'pending'`.
   - Creates a new record in the `chat_messages` table with `type: 'bet_proposal'` and the new `bet_id`.
   - Commits the transaction.

4. **Next.js Backend**: Sends an internal HTTP request to the Real-Time Service.

5. **Real-Time Service**: Broadcasts the new `chat_message` object to all clients in the corresponding room via WebSocket.

6. **Client**: Receives the message, sees `type: 'bet_proposal'`, and renders a special interactive bet card in the chat feed.

### Settling a Bet

1. **Background Job**: A scheduled task runs periodically, calling the external sports API to get final scores.

2. **Next.js Backend**: The job finds games in the database that are finished but have pending or active bets.

3. **Next.js Backend**: For each bet to be settled:
   - Determines the winner based on the bet type and final score.
   - Starts a database transaction.
   - Updates the `bets` record to `status: 'settled_won'` or `'settled_lost'`.
   - Updates the `wallets` balance for the winning and losing users.
   - Creates records in the `wallet_transactions` table for auditing.
   - Commits the transaction.

4. **Next.js Backend**: Sends an internal HTTP request to the Notification Service to queue a "You Won!" email for the winner.

5. **Next.js Backend**: Sends an internal HTTP request to the Real-Time Service to notify any online users of the result.

---

## 7. Development Phases

### Phase 1: Foundation & Core API
- Set up Monorepo with Turborepo and Docker environment.
- Develop User authentication (NextAuth.js).
- Implement Wallet and Transaction logic.
- Build the background job to sync MLB game data.
- Define all database schemas and migrations (Prisma).

### Phase 2: The Core Gameplay Loop
- Develop the Real-Time Service (WebSocket) for basic chat.
- Implement the full "Create a Bet" workflow.
- Implement the "Accept a Bet" workflow.
- Develop the frontend UI for the chat rooms and betting flow.

### Phase 3: Closing the Loop
- Implement the automated "Settle a Bet" workflow.
- Develop the Notification Service and integrate email sending.
- Build UI components for user profiles, bet history, and wallet transactions.
- Implement the "Daily Reward" feature.

### Phase 4: Polish & Expansion
- Build leaderboards and user rankings.
- Refine the UI/UX.
- Prepare for deployment on Vercel and Railway/Render.
- Begin integration of a second sport (e.g., NBA) by adding a new data source connector.

---

## 8. Non-Functional Requirements

- **Performance**: API read operations should respond in < 200ms. Real-time messages should have a perceived latency of < 100ms.

- **Scalability**: The architecture must support independent scaling of the Real-Time service to handle traffic spikes during major sporting events.

- **Data Integrity**: All financial (play money) operations must be transactional to prevent data corruption.

- **Security**: User passwords must be hashed. All inter-service communication should occur over a private network.