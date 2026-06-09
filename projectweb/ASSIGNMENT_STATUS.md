# SDI Assignment 2 - TripBuddy Status

This checklist maps requested Bronze/Silver/Gold requirements to project files.

## Bronze

- Backend technology choice + benchmark: `ASSIGNMENT2_IMPLEMENTATION.md`
- REST API + CRUD + separated architecture:
  - app/server: `backend/src/app.ts`, `backend/src/server.ts`
  - routes: `backend/src/routes/groupsRoutes.ts`, `backend/src/routes/generatorRoutes.ts`
  - controllers: `backend/src/controllers/*.ts`
  - services: `backend/src/services/*.ts`
  - models: `backend/src/models/types.ts`
  - validators: `backend/src/validators/*.ts`
- RAM-only data storage: `backend/src/store/memoryStore.ts`
- Statistics endpoints:
  - `GET /api/groups/statistics`
  - `GET /api/groups/:groupId/statistics`
  - `GET /api/groups/:groupId/products/statistics`
- Server-side pagination: `backend/src/utils/pagination.ts`
- Client-side validation:
  - `src/app/pages/CreateGroup.tsx`
  - `src/app/pages/JoinGroup.tsx`
  - `src/app/components/AddProductDialog.tsx`
- Server-side validation: `backend/src/validators/*.ts`
- Tests + coverage:
  - REST API tests: `tests/backend.api.test.ts`
  - existing service tests: `tests/productService.test.ts`

## Silver

- Detect server/network down and offline mode:
  - `src/app/services/networkClient.ts`
  - `src/app/context/GroupContext.tsx`
- Offline CRUD queue + reconnect sync:
  - `src/app/services/offlineQueue.ts`
  - `src/app/context/GroupContext.tsx`
- Fake data generator:
  - `POST /api/generator/start`
  - `POST /api/generator/stop`
  - `GET /api/generator/status`
  - implementation: `backend/src/services/generatorService.ts`
- WebSockets + live UI updates:
  - backend: `backend/src/websocket/realtimeHub.ts`
  - frontend: `src/app/services/realtimeClient.ts`
  - integration: `src/app/context/GroupContext.tsx`

## Gold

- GraphQL backend endpoint: `POST /graphql`
  - implementation: `backend/src/graphql/schema.ts`
- 1-to-many fullstack relation:
  - `Group -> Members`
  - `Group -> Products`
  - CRUD routes: `backend/src/routes/groupsRoutes.ts`
- Relation statistics:
  - `GET /api/groups/:groupId/statistics`
  - `GET /api/groups/:groupId/products/statistics`
- Infinite-scroll-ready pagination response format:
  - `data`, `page`, `limit`, `totalItems`, `totalPages` on list endpoints

## Run

```bash
npm run backend:dev
npm run dev
npm run test:run
```
