# User Authentication — Implementation Plan

> Derived from [`.claude/specs/user-authentication-spec.md`](../specs/user-authentication-spec.md). This is a planning document only .

## Repo State Observed (as of planning)

- Backend: `backend/` — Express 5 + Knex 3 + `pg`, skeleton only.
  - `backend/src/server.js` — bare Express app, no routes mounted.
  - `backend/src/config/db.js` + `backend/knexfile.js` — Knex/Postgres connection already configured (env-driven).
  - `backend/src/modules/auth/`, `backend/src/middlewares/`, `backend/src/utils/` — **directories exist but are empty**.
  - `backend/src/database/migrations/`, `backend/src/database/seeds/` — **empty**, no `users` table yet.
  - No `joi`, `bcrypt`/`bcryptjs`, or `jsonwebtoken` in `backend/package.json` yet.
- Frontend: `frontend/` — Next.js app; Signup/Login pages and `AuthPageLayout`, `LoginContent`, `SignupContent` components already exist under `src/app/(user)/(auth)` and `src/components/auth`. No OTP-verification page/component was found — needs to be confirmed (see Open Questions).
- No `.claude/plans` history — this is a fresh module build, not a refactor.

## Goal

Implement the backend Authentication module (Signup → Login/OTP → Verify OTP → JWT → role-based profile redirect) exactly as defined in the spec, without touching frontend UI code (per spec §1, "Only backend functionality needs to be implemented").

## Phase 0 — Dependencies & Environment

1. Add backend dependencies: `joi`, `bcrypt`, `jsonwebtoken`.
2. Add new env vars to `backend/.env` (and document in a `.env.example` if one is later added):
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=7d`
   - `BCRYPT_SALT_ROUNDS=10`
   - `OTP_EXPIRY_MINUTES=5`
3. Decide UUID generation strategy for `users.id` — either Postgres `gen_random_uuid()` (needs `pgcrypto` extension enabled in the migration) or the `uuid` npm package generating in JS. Plan defaults to `gen_random_uuid()` at the DB level (see Phase 1).

## Phase 1 — Database Design

Create migration `backend/src/database/migrations/<timestamp>_create_users_table.js` implementing the `users` table from spec §6:

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | default `gen_random_uuid()` |
| `role` | ENUM(`buyer`,`owner`,`agent`,`builder`) | not null |
| `name` | VARCHAR(100) | not null |
| `email` | VARCHAR(255) | not null, unique |
| `password` | VARCHAR(255) | not null (bcrypt hash) |
| `mobile_number` | VARCHAR(20) | not null, indexed (unique — see Open Questions) |
| `otp_code` | VARCHAR(4) | nullable |
| `otp_expires_at` | TIMESTAMP | nullable |
| `created_at` | TIMESTAMP | default now() |
| `updated_at` | TIMESTAMP | default now(), updated on write |

- Enable `pgcrypto` extension in the migration `up()` if using `gen_random_uuid()`.
- Add a unique index on `mobile_number` (needed to look up users during Login/OTP verification; spec implies one account per mobile number).
- Add `down()` to drop the table and enum type cleanly.

## Phase 2 — Utilities (`backend/src/utils/`)

- `bcrypt.js` — `hashPassword(plain)`, `comparePassword(plain, hash)` using `BCRYPT_SALT_ROUNDS`.
- `otp.js` — `generateOtp()` → random 4-digit string; `getOtpExpiry()` → `now + OTP_EXPIRY_MINUTES`.
- `jwt.js` — `signToken(payload)` using `JWT_SECRET`/`JWT_EXPIRES_IN`; `verifyToken(token)`.

## Phase 3 — Validation (`backend/src/modules/auth/auth.validation.js`)

Joi schemas per spec §8:

- `signupSchema`: `role` (required, one of enum values), `name` (required, min 3), `email` (required, email format), `password` (required), `mobile_number` (required, min 10 digits, numeric pattern).
- `loginSchema`: `role` (required), `mobile_number` (required, min 10 digits). Role is validated for shape only — never used for auth logic (spec §5).
- `verifyOtpSchema`: `mobile_number` (required), `otp` (required, exactly 4 digits).

## Phase 4 — Repository (`backend/src/modules/auth/auth.repository.js`)

Knex query functions, all parameterized:

- `findUserByMobile(mobile_number)`
- `findUserByEmail(email)` (for signup uniqueness check)
- `createUser({ role, name, email, passwordHash, mobile_number })`
- `setOtp(mobile_number, otpCode, otpExpiresAt)`
- `clearOtp(userId)`
- `getUserRoleAndOtp(mobile_number)` (used during verification)

## Phase 5 — Service (`backend/src/modules/auth/auth.service.js`)

Business logic per spec §3/§4/§5:

- `signup(data)`:
  1. Check email/mobile not already registered → throw meaningful conflict error if so.
  2. Hash password.
  3. Create user with `otp_code`/`otp_expires_at` left `NULL`.
  4. Return safe user object (no password hash).
- `login({ mobile_number })` (role received but intentionally unused for logic):
  1. Look up user by mobile number.
  2. If found: generate OTP + expiry, persist via `setOtp`, return success shape (`{ message, otp_expires_in }`).
  3. If not found: throw a distinct "not registered, please sign up first" error — no OTP is generated or stored (spec §3 Step 2 / §4). This check now happens here, not in `verifyOtp`.
- `verifyOtp({ mobile_number, otp })`:
  1. Look up user by mobile number (expected to exist — `login` already gated on this — but still guard against a missing/raced record).
  2. Validate `otp_code` matches and `otp_expires_at` has not passed.
  3. On success: clear OTP fields, sign JWT with the **registered** role (never the role passed at login), return `{ token, role }`.
  4. On mismatch/expiry: return a generic invalid/expired OTP error.

## Phase 6 — Controller (`backend/src/modules/auth/auth.controller.js`)

Thin HTTP layer: parse `req.body`, call the matching service method, map results to HTTP responses. No business logic here. Centralize error → HTTP status mapping:
- Signup: validation error → 400, conflict (duplicate email/mobile) → 409.
- Login: validation error → 400, not registered → 404 ("please sign up first" message).
- Verify OTP: invalid/expired OTP → 400, success → 200 with `{ token, role }`.

## Phase 7 — Routes (`backend/src/modules/auth/auth.routes.js`)

Per spec §9:

```
POST /api/auth/signup      → validate(signupSchema)     → controller.signup
POST /api/auth/login       → validate(loginSchema)       → controller.login
POST /api/auth/verify-otp  → validate(verifyOtpSchema)   → controller.verifyOtp
```

Validation middleware runs before the controller in all three routes (spec §8 purpose statement).

## Phase 8 — Auth Middleware (`backend/src/middlewares/auth.middleware.js`)

- Reads `Authorization: Bearer <token>` header.
- Verifies JWT via `utils/jwt.js`; attaches decoded `{ id, role }` to `req.user`.
- Returns 401 on missing/invalid/expired token.
- Used later to protect `My Profile` / `My Activity` / `Recommendations` routes (those routes are not part of this module's scope, but the middleware is a deliverable of this spec, per folder structure §7).

## Phase 9 — Wire-up

- Mount `auth.routes.js` under `/api/auth` in `backend/src/server.js`.
- Run `npm run migrate` to apply the `users` table migration against the configured Postgres instance.

## Phase 10 — Manual Verification Checklist (post-implementation, not automated tests unless requested)

- Signup: valid payload → 201, user row created, `otp_code`/`otp_expires_at` NULL, password not in response.
- Signup: duplicate email/mobile → conflict error, no password ever leaked in error body.
- Login: existing mobile → 200 success + OTP row populated in DB; frontend proceeds to Verify OTP.
- Login: non-existent mobile → 404 "please sign up first" error, no OTP row created/updated; frontend stays on Login page and does not show the Verify OTP screen.
- Verify OTP: correct OTP within expiry → 200 with JWT + registered role; OTP fields cleared after; frontend redirects to `/user/dashboard`.
- Verify OTP: incorrect or expired OTP → 400 rejected, generic invalid/expired message; frontend stays on Verify OTP screen, no redirect.
- Role-selection independence: login with a role different from the one stored at registration still returns the **registered** role in the JWT (spec §5 worked example) — never a mismatch error.
- Confirm password hash never appears in any auth response payload.


## Open Questions / Risks to confirm before implementation

1. **Mobile number uniqueness**: spec doesn't explicitly say `mobile_number` is unique, but Login/Verify-OTP logic requires a 1:1 lookup by mobile number. Plan assumes a unique constraint — confirm this is acceptable (e.g., can one mobile number be reused across multiple roles/accounts?).
Answer : mobile_number is unique. no one mobile number can not be reused across multiple roles/accounts

2. **OTP delivery mechanism**: spec covers generation/storage/verification only. Confirm no SMS/third-party OTP-delivery integration is expected in this pass (i.e., OTP will only be visible via DB/logs during this phase).
answer: Confirmed. No SMS or third-party OTP delivery integration is required in this phase. The backend will generate and store the OTP with an expiry time, and the OTP will be available through the backend logs for development and testing purposes. Real SMS/OTP provider integration (such as Twilio or MSG91) will be implemented in a future phase.

3. **HTTP status for "not registered"**: originally planned on the Verify OTP API; **superseded** — the account-existence check now happens on the **Login** API instead, so that an unregistered mobile number is rejected before an OTP is ever generated, and the frontend never shows the Verify OTP screen for it.

Updated status codes:

404 → (Login API) Mobile number is not registered — message such as "This mobile number isn't registered with us yet. Please sign up first." No OTP generated.
400 → (Verify OTP API) OTP is invalid or expired.
200 → (Login API) Mobile number is registered, OTP generated and sent.
200 → (Verify OTP API) OTP is valid and the user is successfully authenticated (`{ token, role }`).

The role selected during Login is still never used for this check or for determining the JWT role (spec §5) — only the mobile number is looked up.

4. **Frontend OTP-verification page**: not located in the current `frontend/` tree during this review — confirm it exists elsewhere or is still pending, since the spec states it's "already developed." 
Answer: Frontend OTP-verification UI: The OTP verification flow is implemented as a popup/modal within the Login page. After the user requests an OTP, the Verify OTP popup is displayed, allowing the user to enter and verify the OTP without navigating to a separate page.

5. **Role enum values**: confirm `buyer`, `owner`, `agent`, `builder` (spec §6) are the complete/final set, since this becomes a Postgres ENUM requiring a migration to change later.
Answer: Yes, this is final and complete role.


