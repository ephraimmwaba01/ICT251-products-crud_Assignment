# HANDOVER: ICT251 Activity 4 (Node.js CRUD) - Question 5, Tech Product Showcase

**Deadline: 19 October 2026, 23:59.** Paste this file into a new chat and say "continue" if the previous chat is cut off.

## Decisions already made
- Question 5, resource `products`, table `products`.
- Database: SQLite via `better-sqlite3` (lecturer confirmed SQLite). The PDF's MySQL quick start is ignored.
- Express serves the frontend too, so one deployment hosts both API and page.
- Table is created and seeded (10 rows) automatically on server start.

## Project layout
```
ict251-products-crud/
  backend/  .env  package.json  schema.sql  seed.sql  db.js  server.js
  frontend/ index.html  app.js
```

## Status checklist
- [x] Part A: schema.sql (id, product_name, brand, category, price, stock_quantity, description, created_at, updated_at) + seed.sql (10 records)
- [x] Part B: server.js with GET list, GET one, POST, PUT, DELETE, JSON responses, CORS, .env
- [x] Part C: index.html + app.js (form, table, edit via PUT, delete, auto-refresh)
- [ ] Run locally and confirm it works (YOU: `cd backend`, `npm install`, `npm start`)
- [ ] Record Postman video (all 5 endpoints: URL, method, body, JSON response)
- [ ] Deploy to the cloud (needs persistent disk for SQLite, or rely on auto-seed on restart)
- [ ] Submit the API links (GET, POST, PUT, DELETE) on the Google Form

## Progress log (newest last)
- Build 1: full project created (backend, frontend, seed data, handover). Syntax checked only, not run.
- Build 2: added backend/postman_collection.json (import in Postman, set baseUrl; the new product from step 3 should get id 11, so steps 4 and 5 use /11) and .gitignore.
- NEXT: run locally, record Postman video, deploy, submit the form.

## Run locally (PowerShell)
```
cd backend
npm install
npm start
```
Open http://localhost:3000 for the page. API base: http://localhost:3000/api/products

## Postman requests
Shortcut: Postman > Import > backend/postman_collection.json, then run the 5 requests in order.

| Method | URL | Body (JSON) |
|---|---|---|
| GET | /api/products | none |
| GET | /api/products/1 | none |
| POST | /api/products | {"product_name":"Test Phone","brand":"Acme","category":"Phones","price":199.99,"stock_quantity":5,"description":"Demo"} |
| PUT | /api/products/1 | same shape as POST, with changed values |
| DELETE | /api/products/1 | none |

## Deployment notes
- Render / Railway / Fly.io: build `npm install`, start `npm start`, root directory `backend`. Set env var `DB_FILE` to a path on a persistent disk if available.
- Free hosts without a disk reset the SQLite file on restart; the seed re-adds the 10 sample rows automatically, which is fine for a demo.
- The task suggests Firebase/Supabase/FastAPI. Ask the lecturer if a Node host is acceptable. If not, migrate to Supabase (Postgres) as the next step.

## Not yet verified
Code was written but not executed in the build environment (no internet to install packages). If `npm install` or `npm start` errors, paste the error into the chat.
