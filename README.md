# User Management – React + Express + MongoDB CRUD Training Demo

A small but complete full-stack app for teaching **React fundamentals** and **frontend ↔ backend communication** to backend developers. Every important file is heavily commented; read the code in the order of the request lifecycle below.

> See also: [TRAINING_GUIDE.md](TRAINING_GUIDE.md) (concepts, DevTools debugging, troubleshooting).

---

## 1. Tech stack and versions

| Layer | Technology | Version (major) | Notes |
|---|---|---|---|
| Frontend | React + Vite + TypeScript + React Router 6 | React 18, Vite 5, TS 5 | React 18 chosen for the widest library/tooling compatibility |
| Styling | Tailwind CSS | **3.4** | v3 uses `tailwind.config.js` + PostCSS. (v4 has a different setup – don't mix the two.) |
| HTTP | native `fetch` (used consistently, no Axios) | – | Lets us teach `response.ok` and why fetch doesn't reject on 4xx/5xx |
| Backend | Node.js ≥ 18 (tested on 22), Express **4**, TypeScript | – | Express 4 needs the `asyncHandler` wrapper for async routes (explained in code) |
| Database | MongoDB + Mongoose 8 | – | |

**React Router v6** provides the 3 pages (routes) — all defined in one place, `frontend/src/App.tsx` (see section 4).

`npm audit` reports a *high* advisory for `braces` (a build-time dependency of Tailwind 3). It affects only the build tooling, not the shipped app. Fixing it requires Tailwind 4 (a different config style), so it was intentionally not forced for this demo.

## 2. Project structure

```
React Demo/
├── README.md
├── TRAINING_GUIDE.md
├── backend/
│   ├── .env.example
│   ├── package.json / tsconfig.json
│   └── src/
│       ├── server.ts                  # loads .env, connects to MongoDB, starts listening
│       ├── app.ts                     # Express app: CORS, JSON parser, routes, error handlers
│       ├── config/database.ts         # Mongoose connection
│       ├── models/User.ts             # schema (unique email, timestamps)
│       ├── routes/user.routes.ts      # URL + method -> controller
│       ├── controllers/user.controller.ts   # thin: read req, call service, send res
│       ├── services/user.service.ts   # database/business logic (no req/res)
│       ├── middlewares/
│       │   ├── error.middleware.ts    # centralized error -> JSON
│       │   └── not-found.middleware.ts
│       └── utils/
│           ├── ApiError.ts            # Error with HTTP status
│           ├── asyncHandler.ts        # forwards async errors to Express
│           ├── apiResponse.ts         # success response helper + the contract
│           └── validation.ts          # server-side validation + field whitelist
└── frontend/
    ├── .env.example
    ├── package.json / tsconfig.json / vite.config.ts / tailwind.config.js / postcss.config.js
    ├── index.html
    └── src/
        ├── main.tsx                   # React entry point (BrowserRouter + ToastProvider)
        ├── App.tsx                    # ★ ROUTES are defined here + shared layout (Navbar + Outlet)
        ├── pages/                     # one component per route
        │   ├── UsersPage.tsx          #   /users            list, search, add, delete
        │   ├── UserDetailsPage.tsx    #   /users/:id        view one user (GET by id)
        │   ├── EditUserPage.tsx       #   /users/:id/edit   prefilled form (PATCH)
        │   └── NotFoundPage.tsx       #   *                 unknown URL
        ├── context/ToastContext.tsx   # toasts shared by all pages
        ├── index.css                  # Tailwind layers
        ├── types/{user.ts, api.ts}    # TypeScript interfaces (User, ApiSuccess/ApiFailure)
        ├── services/{api.ts, userService.ts}   # ALL HTTP code
        ├── hooks/useUsers.ts          # users state + create/update/delete
        └── components/
            Navbar, SummaryCards, UserTable, UserForm,
            DeleteConfirmationModal, LoadingSpinner, ErrorMessage, EmptyState,
            Modal, Toast
```

**Changes from the suggested structure** (all additions, nothing removed): `utils/apiResponse.ts` and `utils/validation.ts` (backend – keeps controllers thin), `pages/*`, `context/ToastContext.tsx` and routing (the brief listed no router), `components/Modal.tsx` (one accessible modal shell used by the Add and Delete dialogs). `UserDetailsModal` was replaced by the `/users/:id` page, `components/SummaryCards.tsx`, `components/Toast.tsx`, `vite-env.d.ts`, `postcss.config.js`, `tailwind.config.js`.

## 3. Setup and run

Prerequisites: Node.js 18+ and a MongoDB instance (local or Atlas).

### Step 0 – MongoDB (Terminal 0, leave it running)
Pick one:
```bash
# Option A: Homebrew install (macOS)
brew services start mongodb-community      # or: mongod --dbpath ~/data/db

# Option B: Docker
docker run -d --name mongo -p 27017:27017 mongo:7

# Option C: MongoDB Atlas – put your Atlas connection string in backend/.env as MONGODB_URI
```

### Step 1 – Backend (Terminal 1)
```bash
cd backend
npm install
cp .env.example .env        # .env holds local settings and is git-ignored. NEVER commit it.
npm run dev                 # http://localhost:5000  (auto-restarts on file changes)
```
You should see `MongoDB connected: ...` and `API listening on http://localhost:5000`.

### Step 2 – Frontend (Terminal 2)
```bash
cd frontend
npm install
cp .env.example .env        # sets VITE_API_BASE_URL; restart `npm run dev` if you change it later
npm run dev                 # http://localhost:5173
```
Open http://localhost:5173.

### Production builds
```bash
# Terminal 1
cd backend  && npm run build && NODE_ENV=production npm start   # compiles to backend/dist, runs it
# Terminal 2
cd frontend && npm run build && npm run preview                 # builds to frontend/dist, serves it locally
```

> **Port 5000 busy?** On macOS, AirPlay Receiver can occupy port 5000 (System Settings → General → AirDrop & Handoff → AirPlay Receiver), and so can another project. Either free it, or set e.g. `PORT=5001` in `backend/.env` **and** `VITE_API_BASE_URL=http://localhost:5001/api` in `frontend/.env`.

### Environment variables
| File | Variable | Example | Purpose |
|---|---|---|---|
| backend/.env | `PORT` | `5000` | API port |
| backend/.env | `MONGODB_URI` | `mongodb://127.0.0.1:27017/react_crud_training` | database connection |
| backend/.env | `FRONTEND_URL` | `http://localhost:5173` | the only origin allowed by CORS |
| backend/.env | `NODE_ENV` | `development` | `production` hides internal error messages |
| frontend/.env | `VITE_API_BASE_URL` | `http://localhost:5000/api` | base URL for every request |

## 4. Request lifecycle (React → Express → MongoDB → React)

Example: user clicks **Add user** after filling the form.

```
 BROWSER (React)                                         SERVER (Express)                       MongoDB
 ───────────────                                         ────────────────                       ───────
 1. UserForm: controlled inputs hold values in state
 2. onSubmit -> validate() on the client -> OK
 3. UsersPage.handleCreate -> useUsers.createUser(values)
 4. userService.createUser -> api.request("/users", POST, JSON body)
 5. fetch("http://localhost:5000/api/users", {method:"POST",
          headers:{Content-Type:application/json}, body:'{"name":...}'})
                         ───── HTTP ─────────►
                                                         6. cors() checks Origin header
                                                         7. express.json() parses body -> req.body
                                                         8. router: POST /api/users -> controller.createUser
                                                         9. validateUserBody(req.body)  (400 if invalid)
                                                        10. userService.createUser -> User.create()  ───►  insertOne
                                                                                         ◄─── saved doc  (or E11000 duplicate)
                                                        11. sendSuccess(res, 201, msg, user)
                         ◄── 201 {"success":true,"message":"User created successfully","data":{...}} ──
12. api.request: response.ok? parse JSON, return body
13. useUsers: setUsers([newUser, ...current])   <- new array => React re-renders
14. UsersPage: notify("success"), close modal; UserTable shows the new row, SummaryCards recount
```
Failure path: any `throw` in steps 9–10 (or a duplicate-key error) → `asyncHandler` → `next(err)` → `error.middleware.ts` → `{"success":false,"message":...}` with 400/404/409/500 → step 12 throws `ApiRequestError` → the form shows the message and nothing is added to state.

### Frontend routes (pages) — defined in `frontend/src/App.tsx`

| Browser URL | Page component | Purpose | Backend call |
|---|---|---|---|
| `/` | redirect | goes to `/users` | – |
| `/users` | `UsersPage` | list, search, add (modal), delete (confirm) | `GET`, `POST`, `DELETE /api/users` |
| `/users/:id` | `UserDetailsPage` | view one user | `GET /api/users/:id` |
| `/users/:id/edit` | `EditUserPage` | prefilled form, save | `GET` + `PATCH /api/users/:id` |
| `*` | `NotFoundPage` | unknown URL | – |

These are **frontend URLs** (`http://localhost:5173/users/123`), not API endpoints (`http://localhost:5000/api/users/123`). The route picks the screen; the screen then calls the API. Mapping to explain to new developers: Express `router.get("/:id", controller)` ⇄ React `<Route path="/users/:id" element={<UserDetailsPage />} />`; `req.params.id` ⇄ `useParams().id`.

## 5. API reference

| Method | Endpoint | Purpose | Success | Errors |
|---|---|---|---|---|
| POST | `/api/users` | Create a user | 201 | 400 validation, 409 duplicate email |
| GET | `/api/users` | List all users (newest first) | 200 | 500 |
| GET | `/api/users/:id` | Get one user | 200 | 400 invalid id, 404 not found |
| PATCH | `/api/users/:id` | Update provided fields only | 200 | 400 invalid id/body, 404, 409 |
| DELETE | `/api/users/:id` | Delete a user (returns the deleted user) | 200 | 400 invalid id, 404 |

Also: `GET /api/health` → `200`; any unknown URL → `404` in the same JSON shape.

### Response contract (identical on every endpoint)
```jsonc
// success
{ "success": true,  "message": "Users fetched successfully", "data": [] }
// error
{ "success": false, "message": "Validation failed", "errors": { "email": "email is not a valid email address" } }
```
`errors` is optional and maps field name → message. The frontend relies on this in `frontend/src/types/api.ts` and `services/api.ts`; the backend side is `utils/apiResponse.ts` and `middlewares/error.middleware.ts`. **If you change one side, change the other.**

### Sample request / response
```http
POST /api/users
Content-Type: application/json

{ "name": "Rahul Sharma", "email": "rahul@example.com", "phone": "9876543210", "department": "Engineering" }
```
```http
HTTP/1.1 201 Created
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "6acf17d18de5b1fd19659519",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "department": "Engineering",
    "createdAt": "2026-10-14T05:49:05.804Z",
    "updatedAt": "2026-10-14T05:49:05.804Z"
  }
}
```
Notes: email is lower-cased and trimmed; unknown fields (e.g. `_id`, `createdAt`) in a request body are ignored; PATCH requires at least one valid field.

## 6. Test the API with cURL (do this BEFORE starting the frontend)

Start MongoDB and `npm run dev` in `backend/`, then use a third terminal. The examples use `http://localhost:5000`.

```bash
# 0. Health check
curl -i http://localhost:5000/api/health

# 1. Create a user  (-X sets the method, -H the header, -d the JSON body)
curl -i -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Rahul Sharma","email":"rahul@example.com","phone":"9876543210","department":"Engineering"}'
# -> 201. Copy the "_id" value from the response, e.g. 6acf17d18de5b1fd19659519

# 2. Get all users
curl -i http://localhost:5000/api/users

# 3. Get one user -- replace USER_ID with the real _id from step 1
curl -i http://localhost:5000/api/users/USER_ID

# 4. Update (PATCH sends only the changed fields)
curl -i -X PATCH http://localhost:5000/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{"department":"Sales"}'

# 5. Delete
curl -i -X DELETE http://localhost:5000/api/users/USER_ID
```
Tip (macOS/Linux): save the id in a shell variable instead of copy/pasting:
```bash
USER_ID=$(curl -s -X POST http://localhost:5000/api/users -H "Content-Type: application/json" \
  -d '{"name":"Asha Verma","email":"asha@example.com","phone":"9123456780","department":"Design"}' \
  | sed -E 's/.*"_id":"([a-f0-9]+)".*/\1/')
echo $USER_ID
curl -s http://localhost:5000/api/users/$USER_ID
```

### Error cases
```bash
# Invalid request body -> 400 with per-field errors
curl -i -X POST http://localhost:5000/api/users -H "Content-Type: application/json" \
  -d '{"name":"","email":"not-an-email","phone":"1","department":""}'

# Duplicate email -> 409 (run the "create" command from step 1 twice)
curl -i -X POST http://localhost:5000/api/users -H "Content-Type: application/json" \
  -d '{"name":"Someone Else","email":"rahul@example.com","phone":"9876543210","department":"HR"}'

# Malformed id -> 400
curl -i http://localhost:5000/api/users/abc

# Well-formed id that doesn't exist -> 404
curl -i http://localhost:5000/api/users/665f1c2e8b3a4d0012345678

# Malformed JSON -> 400
curl -i -X POST http://localhost:5000/api/users -H "Content-Type: application/json" -d '{bad json'
```

### Verified output (captured from a real run)
```
POST valid          -> 201 {"success":true,"message":"User created successfully","data":{...}}
POST duplicate      -> 409 {"success":false,"message":"A user with this email already exists","errors":{"email":"email is already in use"}}
POST invalid        -> 400 {"success":false,"message":"Validation failed","errors":{"name":"name is required","email":"email is not a valid email address",...}}
GET  /users/abc     -> 400 {"success":false,"message":"Invalid user id: \"abc\""}
GET  unknown id     -> 404 {"success":false,"message":"User not found"}
DELETE twice        -> 200, then 404 {"success":false,"message":"User not found"}
```

## 7. What was actually tested

Honest status, from a real run on macOS (Node 22, MongoDB local):
- ✅ Backend `tsc` type-check and build; frontend `tsc` type-check and `vite build` pass.
- ✅ Every endpoint exercised with cURL: 201, 200, 400 (validation / bad id / malformed JSON / empty PATCH), 404, 409, unknown route, CORS preflight for PATCH.
- ✅ UI driven in headless Chrome (20 automated checks): `/` redirect, empty state, client validation, create, duplicate-email error in the form, View → `/users/:id`, refresh/deep-link on a nested route, Edit → `/users/:id/edit` prefilled, PATCH then back to `/users`, duplicate email on edit stays on the page with an error, invalid id (`/users/abc`), unknown id, unknown URL (`*`), delete confirmation + removal, deleting an already-deleted user (404 handled), no horizontal scroll at 390 px.
- ❌ Not tested: other browsers, screen-reader behaviour (accessibility features are implemented but not audited), MongoDB Atlas, the production `npm start` path.

## 8. Final verification checklist

- [ ] MongoDB is running; `backend/.env` and `frontend/.env` exist (copied from `.env.example`)
- [ ] `curl http://localhost:5000/api/health` returns `"API is running"`
- [ ] cURL: create → list → get by id → patch → delete all return the expected status codes
- [ ] cURL: invalid body = 400, duplicate email = 409, bad id = 400, unknown id = 404
- [ ] UI loads at http://localhost:5173 with no red errors in the browser console
- [ ] Add user: validation messages, spinner/“Saving...”, success toast, form closes, row appears
- [ ] Duplicate email shows an error in the form and adds no row
- [ ] Search filters by name and email; Refresh re-fetches
- [ ] View goes to `/users/:id` (GET by id); Edit goes to `/users/:id/edit`, is prefilled and saves via PATCH, then returns to `/users`
- [ ] Opening `/users/abc` or `/nope` directly shows a friendly message
- [ ] Delete asks for confirmation, then removes the row; toast confirms
- [ ] Stop the backend → Refresh shows the “Cannot reach the server” error (network error demo)
- [ ] `npm run build` succeeds in both `backend/` and `frontend/`
- [ ] No `.env` file is committed
