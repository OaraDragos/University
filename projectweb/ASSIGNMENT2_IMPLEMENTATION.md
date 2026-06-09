# SDI Assignment 2 - TripBuddy (Bronze, Silver, Gold)

## 1) Backend Technology Benchmark

| Criteria | Express (Node.js + TS) | Spring Boot | FastAPI | Laravel |
| --- | ---: | ---: | ---: | ---: |
| Learning curve | 5 | 2 | 4 | 3 |
| Setup speed | 5 | 2 | 4 | 3 |
| React/TS integration | 5 | 3 | 4 | 3 |
| Testing simplicity | 5 | 3 | 4 | 3 |
| WebSocket readiness | 5 | 4 | 4 | 3 |
| GraphQL readiness | 4 | 4 | 4 | 3 |
| **Total** | **29** | **18** | **24** | **18** |

### Chosen Stack

- **Node.js + Express + TypeScript**
- Reason: fastest integration with the existing React + TypeScript frontend, strong ecosystem for REST, testing, WebSocket, and GraphQL.

## 2) Bronze - Implemented

- REST API with CRUD for `groups`, `members`, `products` in `backend/src/routes/groupsRoutes.ts`.
- Server-side validation with Zod in `backend/src/validators/*`.
- Clear separation of layers:
  - routes: `backend/src/routes/*`
  - controllers: `backend/src/controllers/*`
  - services: `backend/src/services/*`
  - models: `backend/src/models/types.ts`
- Data stored **RAM-only** in `backend/src/store/memoryStore.ts`.
- Server-side pagination in list endpoints (`/api/groups`, `/api/groups/:groupId/products`, `/api/groups/:groupId/members`).
- Statistics endpoints:
  - `GET /api/groups/statistics`
  - `GET /api/groups/:groupId/statistics`
  - `GET /api/groups/:groupId/products/statistics`
- Automated tests with coverage in `tests/backend.api.test.ts`.

## 3) Silver - Implemented

- Offline detection + queue sync on client in:
  - `src/app/services/networkClient.ts`
  - `src/app/services/offlineQueue.ts`
- Fake data generator endpoints:
  - `POST /api/generator/start`
  - `POST /api/generator/stop`
  - `GET /api/generator/status`
- WebSocket live events in:
  - server: `backend/src/websocket/realtimeHub.ts`
  - client: `src/app/services/realtimeClient.ts`

## 4) Gold - Implemented

- GraphQL endpoint: `POST /graphql` using schema in `backend/src/graphql/schema.ts`.
- Infinite scroll API support via pagination (`page`, `limit`, `totalPages`) and client consumption.
- 1-to-many fullstack relation:
  - `Group -> Members`
  - `Group -> Products`
- CRUD + statistics for linked entities in REST and GraphQL.

## 5) Run Commands

```bash
npm run backend:dev
npm run dev
npm run test:run
```

Backend default URL: `http://localhost:4000`
