# Post Property — Implementation Plan

> Derived from [`.claude/specs/post-properties.md`](../specs/post-properties.md). Planning document only — nothing is implemented yet.
> Project rules (`CLAUDE.md`): the user runs all migrations/seeds and git commands; code comments must be single-line and short.

## 1. Project Analysis (Phase 1 findings)

### Backend (`backend/`)
- Express 5 + Knex 3 + `pg`, Joi validation, multer disk uploads, JWT auth, CommonJS.
- `src/server.js` mounts routers under `/api/user/*` and serves `/uploads` statically from `backend/uploads`.
- `src/modules/property/` exists with **five empty files** (controller, repository, routes, service, validation) — already scaffolded, not wired into `server.js`.
- Module convention (see `user-office`): `routes → validate(schema) → controller → service → repository`; `AppError(message, statusCode)` class defined in each service; controller `handleError` maps `error.statusCode` else logs and returns `500 "Something went wrong"`.
- Shared middlewares: `auth.middleware.js` (sets `req.user = { id, role }`), `validate.middleware.js` (validates `req.body`, `stripUnknown`, returns `{ message: "Validation failed", errors: [...] }`), `upload.middleware.js` (one multer config + `handleXxxUpload` wrapper per upload type, files saved as `/uploads/<folder>/<ts>-<rand><ext>`, paths stored in DB).
- DB: `db` from `src/config/db.js`. UUID PKs via `gen_random_uuid()`, `users.id` is UUID, `created_at`/`updated_at` timestamps, `text[]` columns already used. Roles enum: `buyer, owner, agent, builder, buyer_owner_tenant`.
- Latest migration: `20261009120000_add_buyer_owner_tenant_user_role.js`. No property tables exist.
- Existing repositories use the Knex query builder; **this feature must use raw SQL** in `property.repository.js` (spec §3.4) via `db.raw(sql, bindings)` / `trx.raw(...)`.

### Frontend (`frontend/src`)
- Page: `app/post-property/page.tsx` → `components/post-property/PostPropertyContent.tsx` (5-step wizard, step kept in `?step=`; all state is held in the one component).
- `handleSubmit` is a `console.log` with a `// TODO: wire up property submission API` — the only frontend integration point.
- API layer: `services/apiClient.ts` (`apiFetch`, handles `FormData` automatically, throws `ApiError{status,message,errors[]}`), per-feature service files (e.g. `userOffice.service.ts`), token via `getToken()` in `services/session.ts`, `hooks/useAuth.ts`.
- Pending local edit on `PropertySubTypeField.tsx` (cosmetic Tailwind/text tweak) is unrelated and must be left alone.

### Frontend field inventory (source of truth: `postPropertyForm.shared.ts` + field components)

| Step | UI field | State key | Type / allowed values | Required in UI |
|---|---|---|---|---|
| 1 | Listing type | `listingType` | `sale`, `rent-lease`, `pg-hostel` | yes (default `sale`) |
| 1 | Property type | `propertyType` | `residential`, `commercial`, `pg-co-living`, `plot`, `land` | yes (default `residential`) |
| 1 | Sub type | `propertySubType` | residential: `flat-apartment, bungalow-villa, studio-apartment, weekend-homes, farm-house, residential-land, penthouse, duplex`; commercial: `shop, office, showroom, cold-storage, industrial-shed, guest-house, hotel-resort, warehouse-godown, co-working-space`; plot: `residential-plot, industrial-plot, commercial-plot`; land: `agriculture-land, non-agriculture-land, commercial-land, residential-land, industrial-land`; **`pg-co-living` has no sub types (empty string)** | defaults to first option |
| 1 | Block no. | `blockNo` | text | no |
| 1 | Flat/House/Shop no. | `flatNumber` | text | no |
| 1 | Society/Building/Project | `societyName` | text | **yes** |
| 1 | Locality | `locality` | text | **yes** |
| 1 | Address line 2 | `addressLine2` | text | no |
| 1 | Landmark | `landmark` | text | no |
| 1 | Pin code | `pinCode` | text | **yes** |
| 1 | City | `city` | text | no |
| 1 | State | `state` | dropdown from `data/indianStatesCities.ts` (default `DEFAULT_STATE`) | defaulted |
| 1 | Property description | `propertyDescription` | text | **yes** |
| 2 | Carpet area | `carpetAreaNumber` + `carpetAreaType` | number > 0; unit `sq-ft, sq-km, sq-m, sq-yd` | **yes** |
| 2 | Super build-up | `superBuildUpNumber` + `superBuildUpType` | number; unit as above | no |
| 2 | Property transaction | `propertyTransaction` | `new`, `resale` | **yes** |
| 2 | Construction status (if `new`) | `constructionStatus` | `pre-launch, under-construction, ready-to-move` | yes if `new` |
| 2 | Possession date (if `new`) | `possessionDate` | `YYYY-MM`, not in the past | yes if `new` |
| 2 | Age of construction (if `resale`) | `ageOfConstruction` | `lt-1, 1-to-2, 2-to-3, 3-to-5, gt-5` | yes if `resale` |
| 2 | Bedrooms | `bedrooms` | 1–10 | **yes** |
| 2 | Balcony | `balcony` | 0–10 | **yes** |
| 2 | Total floors | `totalFloors` | integer ≥ 1 (chips 1–7 + "more" up to ~50) | **yes** |
| 2 | Floor number | `floorNumber` | `"Ground Floor"` or `1..totalFloors` | **yes** |
| 2 | Bathrooms | `bathrooms` | 1–10 | **yes** |
| 2 | Lift | `lift` | 0–10 chips (not validated) | no |
| 3 | Furnishing status | `status` | `furnished`, `semi-furnished`, `unfurnished` | no |
| 3 | Furnishing items (if furnished/semi) | `furnishing[]` | 17 ids: `dining-table, tv, sofa, washing-machine, microwave, stove, gas-cylinder, fridge, water-purifier, gas-pipeline, ac, beds, geyser, electric-fittings, fan, wifi, wardrobes` | no |
| 3 | Amenities | `amenities[]` | 27 ids: `lift, cctv, gym, garden-park, kids-play-area, sports-club, cricket-pitch, basketball-court, skating, swimming-pool, intercom, gated-community, security, club-house, community-hall, regular-water-supply, generator, indoor-games, power-backup, pet-allowed, no-vehicle-zone, gazebo, reserved-parking, piped-gas, vaastu-compliant, mini-theatre, solar-roof` | no |
| 3 | Facing | `facing` | `East, North, North - East, North - West, South, South - East, South - West, West` | no |
| 3 | Car parking available / count | `carParkingAvailable`, `carParking` | boolean; count 1–10 when available (asterisk in UI) | count required if available |
| 3 | Club membership | `clubMembership` | boolean | no |
| 3 | RERA number | `reraNumber` | text | no |
| 3 | Open sides | `openSides` | number | no |
| 4 | Media by category | `photosVideos.mediaByCategory` | categories: `bedrooms, bathrooms, terrace, kitchen, exterior, main-photo, living-room, floor-plan, master-plan, pooja-room, others, balcony`; files: jpg/jpeg/png/heic/mp4, ≤ 50 MB each, ≤ 50 files total | section marked required, **not enforced** (warning < 5 photos only) |
| 4 | Brochure | `photosVideos.brochure` | single PDF ≤ 100 MB | no |
| 5 | Expected price | `expectedPrice` | number | **yes** (asterisk) |
| 5 | Price negotiable | `priceNegotiable` | boolean | no |
| 5 | Price inclusions | `priceInclusion[]` | `car-parking, club-membership, plc` | no |
| 5 | Transfer fee | `transferFee` | number | no |
| 5 | Booking amount | `bookingAmount` | number | **yes** (asterisk; confirmed required) |
| 5 | Maintenance charges | `maintenanceCharges` | number | no |
| 5 | Benefits / remarks | `benefitsRemarks` | text | no |

Auth: logged-in user is identified by JWT in `localStorage` (`lokesha_token`); other services send `Authorization: Bearer <token>`. Backend derives owner from `req.user.id` — never from the request body.

### Observations / UI quirks (not to be "fixed" silently)
1. Step validation only covers steps 1–2; steps 3–5 have no client validation (price/booking amount asterisks are not enforced).
2. Bedrooms/balcony/bathrooms/floors are required for **every** property type, including plot/land, because the UI does not hide them.
3. `lift` (step 2) and `lift` amenity (step 3) overlap.
4. `residential-land` id exists in both residential and land sub-type lists.
5. `heic` files often arrive with an empty/odd MIME type from browsers.
6. Files are held in the browser as `File` objects; nothing is uploaded until Submit.

## 2. Decisions (confirmed by you)

| # | Topic | Decision |
|---|---|---|
| Q
| Q2 | Who can post | **Every authenticated role, including `buyer`** (a buyer may also be an owner). No role gate. |
| Q3 | Photos | **Required.** Backend rejects a create with no image (at least 1 file of type image in `media`); the existing "< 5 photos" UI warning stays a warning only. Frontend adds a matching check before submit. |
| Q4 | `bookingAmount` | **Required** (backend + frontend submit check), along with `expectedPrice`. |
| Q5 | Land/plot rooms & floors | Confirmed: mirror the UI, bedrooms/balcony/bathrooms/floors stay required for every type. |
| Q6 | After submit | Confirmed: redirect to `/user/properties/manage-properties`. |
| Q7 | Read access | **Public (no login):** anyone can list and view `published` properties. **Authenticated owner:** can view/manage own properties in any status (draft, pending, published, rejected). Unpublished properties are never visible to anyone else (respond `404`). Applies identically to owners and agents: each can see/manage only properties they own; agents have no access to other users' unpublished listings. |
| Q8 | Upload flow | Confirmed: single `multipart/form-data` request creates property + amenities + media + brochure in one transaction; uploaded files are deleted if validation or the DB operation fails; follows existing form structure and `/uploads` storage convention. |

## 3. Database Design (Phase 3)

Migrations (knex, same style as existing ones; **you run them**): timestamps start after `20261009120000`.

### 3.1 `properties` — `20261012100000_create_properties_table.js`
| Column | Type | Constraints / notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `user_id` | uuid | NOT NULL, FK `users(id)` ON DELETE CASCADE |
| `status` | varchar(20) | NOT NULL default `'published'`, CHECK in (`draft`,`pending`,`published`,`rejected`) |
| `listing_type` | varchar(20) | NOT NULL, CHECK (`sale`,`rent-lease`,`pg-hostel`) |
| `property_type` | varchar(20) | NOT NULL, CHECK (`residential`,`commercial`,`pg-co-living`,`plot`,`land`) |
| `property_sub_type` | varchar(50) | NULL (PG/Co-Living has none) |
| `block_no`, `flat_number` | varchar(50) | NULL |
| `society_name` | varchar(255) | NOT NULL |
| `locality` | varchar(255) | NOT NULL |
| `address_line_2` | varchar(255) | NULL |
| `landmark` | varchar(255) | NULL |
| `pin_code` | varchar(10) | NOT NULL |
| `city` | varchar(100) | NULL |
| `state` | varchar(100) | NOT NULL |
| `description` | text | NOT NULL |
| `carpet_area` / `carpet_area_unit` | numeric(12,2) / varchar(10) | NOT NULL; unit CHECK (`sq-ft`,`sq-km`,`sq-m`,`sq-yd`); area CHECK > 0 |
| `super_build_up_area` / `super_build_up_unit` | numeric(12,2) / varchar(10) | NULL |
| `property_transaction` | varchar(10) | NOT NULL, CHECK (`new`,`resale`) |
| `construction_status` | varchar(30) | NULL (when `new`) |
| `possession_date` | date | NULL, first day of chosen month |
| `age_of_construction` | varchar(10) | NULL (when `resale`) |
| `bedrooms`, `balconies`, `bathrooms`, `lift_count` | smallint | bedrooms/bathrooms NOT NULL; balconies NOT NULL; lift_count NULL; CHECK >= 0 |
| `total_floors` | smallint | NOT NULL, CHECK >= 1 |
| `floor_number` | smallint | NOT NULL, `0` = Ground Floor, CHECK `0..total_floors` |
| `furnishing_status` | varchar(20) | NULL |
| `facing` | varchar(20) | NULL |
| `car_parking_available` | boolean | NOT NULL default false |
| `car_parking_count` | smallint | NULL (set only if available) |
| `club_membership` | boolean | NOT NULL default false |
| `rera_number` | varchar(100) | NULL |
| `open_sides` | smallint | NULL |
| `expected_price` | numeric(14,2) | NOT NULL, CHECK >= 0 |
| `price_negotiable` | boolean | NOT NULL default false |
| `price_inclusions` | text[] | NOT NULL default `'{}'` (matches existing `text[]` usage; tiny fixed set) |
| `booking_amount` | numeric(14,2) | NOT NULL, CHECK >= 0 |
| `transfer_fee`, `maintenance_charges` | numeric(14,2) | NULL |
| `benefits_remarks` | text | NULL |
| `brochure_path` | varchar(255) | NULL (single PDF; no need for a table) |
| `created_at`, `updated_at` | timestamp | NOT NULL default now() |

Indexes: `(user_id, created_at DESC)` (own-list), `(status, created_at DESC)` (public published list), `(city, locality)` is deferred until a search API exists (no requirement yet).

### 3.2 `property_amenities` — `20261012100100_create_property_amenities_table.js`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `property_id` | uuid | NOT NULL FK `properties(id)` ON DELETE CASCADE |
| `kind` | varchar(15) | NOT NULL CHECK (`amenity`,`furnishing`) — separates step-3 amenity list from furnishing items |
| `amenity_key` | varchar(50) | NOT NULL — the frontend id (e.g. `swimming-pool`) |
| `created_at` | timestamp | default now() |

`UNIQUE (property_id, kind, amenity_key)`, index on `property_id`. No lookup table: the frontend constants are the source of truth and ids are stored as-is; a lookup table is not justified by the UI (reconsider if admin-managed amenities appear).

### 3.3 `property_media` — `20261012100200_create_property_media_table.js`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `property_id` | uuid | NOT NULL FK ON DELETE CASCADE |
| `category` | varchar(20) | NOT NULL, CHECK in the 12 photo categories |
| `media_type` | varchar(10) | NOT NULL CHECK (`image`,`video`) |
| `file_path` | varchar(255) | NOT NULL — `/uploads/property-media/<generated name>` |
| `original_name` | varchar(255) | NULL |
| `mime_type` | varchar(50) | NOT NULL |
| `file_size` | integer | NOT NULL (bytes) |
| `sort_order` | integer | NOT NULL default 0 |
| `created_at` | timestamp | default now() |

Index `(property_id, sort_order)`.

Existing tables/data are untouched; each migration has a `down()` that only drops its own table.

## 4. API Design

Router mounted in `server.js`: `app.use("/api/property", propertyRoutes)` (singular, mirrors `/api/user/...` naming style). Read routes marked *public* need no login; all write routes and `/me` require `authMiddleware`.

| Method & path | Purpose | Body |
|---|---|---|
| `POST /api/property` | Create property + amenities + media + brochure in one transaction | multipart (see below) |
| `GET /api/property` | **Public.** List `published` properties (summary + main image), `?page&limit&listingType&propertyType&city` | — |
| `GET /api/property/me` | Auth. List the caller's own properties in any status, `?page&limit&status` | — |
| `GET /api/property/:id` | **Public for `published`**; owner (via optional token) also sees own unpublished. Full details incl. amenities, media. Anyone else on an unpublished id → `404` | — |
| `PUT /api/property/:id` | Update fields + replace amenities/furnishing/price inclusions (auth, owner only) | JSON |
| `POST /api/property/:id/media` | Add media files (and/or replace brochure) to own property | multipart |
| `DELETE /api/property/:id/media/:mediaId` | Delete one image/video (row + file) | — |
| `DELETE /api/property/:id` | Delete property (cascade rows, then remove files) | — |

### Create request (multipart/form-data)
- `data` — JSON string with camelCase fields mirroring the UI state:
  ```json
  {
    "listingType": "sale", "propertyType": "residential", "propertySubType": "flat-apartment",
    "address": { "blockNo": "", "flatNumber": "", "societyName": "", "locality": "", "addressLine2": "", "landmark": "", "pinCode": "", "city": "", "state": "", "propertyDescription": "" },
    "details": { "carpetArea": 1200, "carpetAreaUnit": "sq-ft", "superBuildUpArea": null, "superBuildUpUnit": null, "propertyTransaction": "new", "constructionStatus": "under-construction", "possessionDate": "2027-03", "ageOfConstruction": null, "bedrooms": 3, "balconies": 2, "totalFloors": 10, "floorNumber": 0, "bathrooms": 2, "lift": 2 },
    "amenities": { "furnishingStatus": "semi-furnished", "furnishing": ["tv"], "amenities": ["gym"], "facing": "East", "carParkingAvailable": true, "carParking": 2, "clubMembership": false, "reraNumber": "", "openSides": null },
    "pricing": { "expectedPrice": 5000000, "priceInclusion": ["plc"], "priceNegotiable": true, "transferFee": null, "bookingAmount": 100000, "maintenanceCharges": null, "benefitsRemarks": "" },
    "mediaCategories": ["main-photo", "bedrooms"]
  }
  ```
  `mediaCategories[i]` is the category of the i-th file in `media` (parallel array; lengths must match).
- `media` — repeated file field (≤ 50 files).
- `brochure` — single PDF file (optional).

Frontend maps `"Ground Floor"` → `0` and numeric strings → numbers when building the payload; backend never receives UI-only labels.

### Responses (existing conventions)
- Success: `201 { "message": "Property posted successfully", "property": {...} }`; reads `200 { "property": {...} }` / `{ "properties": [...], "page", "limit", "total" }`.
- Validation: `400 { "message": "Validation failed", "errors": ["..."] }` (reusing `validate.middleware`).
- Auth: `401` (from middleware), not found / not owner `404` (do not leak existence), upload errors `400 { message }`, unexpected `500 { "message": "Something went wrong" }`.

## 5. Authorization
- `authMiddleware` on every route; owner is always `req.user.id`.
- Repository queries for read/update/delete include `WHERE id = ? AND user_id = ?`; no match → `404 "Property not found"`.
- `user_id` and `status` are never accepted from the body (`stripUnknown` drops them; schema doesn't define them).
- No role restriction: all authenticated roles (incl. `buyer`) may post.
- **Same rule for every role (owner, agent, builder, buyer, ...):** access to unpublished (`draft`/`pending`/`rejected`) properties and all manage actions (update, delete, media add/delete) is decided only by `properties.user_id = req.user.id`. Role never grants extra access: an agent cannot see or manage another user's unpublished listing, and no role (agents included) gets a bypass.
- **"Authorized to manage" = ownership only for now.** No delegation/team/agency-sharing model exists in the schema, so none is added; if agents later manage listings on behalf of owners, that needs a separate table and a new decision.
- **Optional auth for public reads:** `GET /api/property` and `GET /api/property/:id` need no token. For `/:id`, a small `optionalAuth` function in `property.routes.js` (uses existing `verifyToken`; sets `req.user` if a valid Bearer token is present, otherwise continues anonymously — it does not change the shared `auth.middleware.js`). Repository query: `WHERE id = ? AND (status = 'published' OR user_id = ?)` so unpublished listings are invisible to everyone but the owner.
- Public responses must not expose private fields: only listing data, media paths and owner display basics are returned (no email/mobile/`user_id` beyond what the UI needs; contact exposure is a separate future decision).

## 6. Image / Media Upload Strategy
- Reuse existing approach: multer **disk storage** under `backend/uploads`, served by the existing `/uploads` static route, DB stores relative path (`/uploads/property-media/...`, `/uploads/property-brochures/...`). No new dependency, no S3 (project has no external storage; document S3 as a future option only).
- Extend `src/middlewares/upload.middleware.js` additively with `handlePropertyUpload` (multer `.fields([{ name: "media", maxCount: 50 }, { name: "brochure", maxCount: 1 }])`) plus `PROPERTY_MEDIA_DIR` / `PROPERTY_BROCHURES_DIR` exports, following the existing wrapper pattern and `fs.mkdirSync` dirs.
- Filenames are server-generated (`<ts>-<rand><ext>`); client names are only kept as `original_name`; client paths are never trusted.
- Limits: `media` — mime in `image/jpeg, image/jpg, image/png, image/heic, video/mp4`, ≤ 50 MB each, ≤ 50 files; `brochure` — `application/pdf`, ≤ 100 MB. multer's `fileSize` is one global limit, so set it to 100 MB and enforce the 50 MB media cap per-field in the service/`fileFilter` follow-up check (oversize → delete files, `400`).
- Extension/MIME consistency: `heic` may come with an empty MIME → also accept by extension for `.heic`; derive `media_type` server-side (`video/mp4` → video, else image).
- Cleanup: on any validation/DB failure after upload, the service removes every uploaded file (`fs.promises.unlink`, ignore ENOENT). On delete (media/property), files are removed **after** the DB commit. Middleware-level multer errors already return `400`.
- Because multer runs before Joi, a failed validation must also trigger cleanup — handled by a small cleanup step in the route chain/controller (not by duplicating logic per route).

## 7. Validation (`property.validation.js`, Joi)
- `createPropertySchema` / `updatePropertySchema` (nested `address`, `details`, `amenities`, `pricing`), allowed-value lists in a new `property.constants.js` (listing types, property types, sub types per type, units, transaction, construction status, ages, furnishing items, amenities, facing, photo categories, price inclusions, limits) — shared by validation and service so lists live in one place.
- Rules mirroring the UI:
  - `propertySubType` must belong to `propertyType`'s list; must be empty for `pg-co-living`.
  - `societyName`, `locality`, `pinCode`, `propertyDescription` required; `carpetArea > 0` + unit required.
  - `propertyTransaction=new` ⇒ `constructionStatus` + `possessionDate` (`YYYY-MM`, not before current month) required; `ageOfConstruction` forbidden. `resale` ⇒ `ageOfConstruction` required; construction status/possession forbidden.
  - `bedrooms/balconies/bathrooms` integers within UI chip ranges; `totalFloors ≥ 1`; `0 ≤ floorNumber ≤ totalFloors`.
  - `furnishing` items allowed only when `furnishingStatus` is `furnished`/`semi-furnished`; items/amenities from the allowed lists, de-duplicated.
  - `carParkingAvailable=true` ⇒ `carParking` 1–10; otherwise forced null.
  - `expectedPrice` and `bookingAmount` required ≥ 0; transfer fee / maintenance optional ≥ 0; `priceInclusion` ⊆ allowed.
  - Files: `media` must contain **at least 1 image** (photos required), `mediaCategories.length === media.length`, each category in the 12 allowed, total ≤ 50.
- `validate` middleware validates `req.body`, so the route chain is: `authMiddleware → handlePropertyUpload → parsePropertyPayload → validate(schema) → controller`, where `parsePropertyPayload` (small function in `property.routes.js`, same pattern as `attachOfficePhotos`) `JSON.parse`s `data` into `req.body` (bad JSON → `400`, with file cleanup).
- Path/id params (`:id`, `:mediaId`) validated as UUID in the controller/service to avoid Postgres cast errors.

## 8. Transactions & Consistency
- **Create:** one `db.transaction`: insert `properties` → bulk insert `property_amenities` → bulk insert `property_media` (with `sort_order` by upload order). Any error rolls back; service then deletes uploaded files.
- **Update:** one transaction: ownership-checked `UPDATE ... RETURNING`, delete + re-insert amenities for the property, `updated_at = now()`.
- **Create without a photo:** rejected by validation before any DB work (files cleaned up).
- **Add media:** transaction checking ownership + total count (existing + new ≤ 50) before insert; brochure replace updates `brochure_path` and removes the old file after commit.
- **Delete media/property:** delete rows in a transaction, `unlink` files after commit (a failed unlink is logged, not surfaced).

## 9. Repository (`property.repository.js`) — raw SQL only
- All queries via `db.raw(sql, bindings)` or `trx.raw(...)` with `?` bindings (never string interpolation); functions accept an optional `trx` so the service owns the transaction (`db.transaction`) boundary.
- Functions: `createProperty`, `insertAmenities`, `insertMedia`, `findByIdForUser` (write paths), `findAllByUser` (+ `COUNT`), `findPublished` (+ `COUNT`), `findByIdVisibleTo(id, userId|null)`, `findAmenitiesByPropertyId`, `findMediaByPropertyId`, `updateProperty`, `replaceAmenities`, `countMedia`, `findMediaByIdForProperty`, `deleteMedia`, `updateBrochurePath`, `deleteProperty`.
- Bulk inserts use `INSERT ... SELECT ... FROM jsonb_to_recordset(?::jsonb)` / `jsonb_array_elements_text(?::jsonb)` (JSON-stringified binding) to avoid knex array-binding expansion pitfalls.
- Results read with `result.rows`; column names snake_case; the service maps rows to the camelCase response shape.

## 10. File List

| Path | New / Existing | Purpose & why |
|---|---|---|
| `backend/src/database/migrations/20261012100000_create_properties_table.js` | New | `properties` table |
| `backend/src/database/migrations/20261012100100_create_property_amenities_table.js` | New | amenities/furnishing rows (spec §3.2) |
| `backend/src/database/migrations/20261012100200_create_property_media_table.js` | New | multiple images/videos per property |
| `backend/src/modules/property/property.constants.js` | New | single source of allowed values/limits shared by validation + service |
| `backend/src/modules/property/property.validation.js` | Existing (empty) | Joi schemas |
| `backend/src/modules/property/property.repository.js` | Existing (empty) | raw-SQL data access |
| `backend/src/modules/property/property.service.js` | Existing (empty) | business logic, transactions, ownership, file cleanup, `AppError` |
| `backend/src/modules/property/property.controller.js` | Existing (empty) | HTTP layer + `handleError` |
| `backend/src/modules/property/property.routes.js` | Existing (empty) | routes + `parsePropertyPayload` + `optionalAuth` |
| `backend/src/middlewares/upload.middleware.js` | Existing — additive edit | `handlePropertyUpload` + dir constants (reuses existing pattern) |
| `backend/src/server.js` | Existing — 2-line edit | import + mount `/api/property` |
| `frontend/src/services/property.service.ts` | New | `createProperty`, `getMyProperties`, etc. using `apiFetch` + token |
| `frontend/src/components/post-property/postPropertyPayload.ts` | New | builds `FormData` from form state (label→id/number mapping) |
| `frontend/src/components/post-property/PostPropertyContent.tsx` | Existing — small edit | real `handleSubmit`, `isSubmitting`/error state, success redirect, auth redirect |
| `frontend/src/components/post-property/PricingOthersField.tsx` | Existing — only if needed | surface submit error / price field error without restyling (may live in `PostPropertyContent` instead) |

No new npm dependencies. No changes to other modules, auth, or UI design.

## 11. Frontend Integration (Phase 5)
1. `property.service.ts`: `createProperty(formData, token)` → `apiFetch<{message; property}>("/property", { method: "POST", body: formData, headers: { Authorization } })` (same pattern as `saveOfficeDetails`).
2. `postPropertyPayload.ts`: converts state → `data` JSON (numbers parsed, `"Ground Floor"`→0, empty strings→null, `possessionDate` kept `YYYY-MM`) and appends each `PropertyMediaFile.file` to `media` in category order with the parallel `mediaCategories`, and `brochure`.
3. `handleSubmit`: read `getToken()`; if missing/401 → redirect to login; guard double submit with `isSubmitting` (disable the existing Submit button, text "Submitting..."); on success redirect (Q6); on `ApiError` show `message` + `errors[]` in a plain `text-red-500` paragraph (same style used in `PhotosVideosField`) above the button.
4. Add minimal client checks before submit, in the style of the existing `validate*` helpers: `expectedPrice` and `bookingAmount` required on step 5, and at least one photo on step 4 (shown with the existing red error style; step 4 "Continue" blocks without a photo). No layout change.
5. If the server reports field errors for earlier steps, show the message list (no per-field remapping in v1).
6. No layout/style changes; existing components untouched except as noted.

## 12. Implementation Order
1. ~~Open questions~~ — resolved (section 2).
2. Migrations (3 files) → hand to user to run.
3. `property.constants.js`, `property.validation.js`.
4. `upload.middleware.js` extension.
5. `property.repository.js` (raw SQL).
6. `property.service.js` (+ transaction + cleanup).
7. `property.controller.js`, `property.routes.js`, mount in `server.js`.
8. Frontend service, payload builder, `handleSubmit` wiring.

## 13. Testing Strategy
Per your preference, I will not boot dev servers/browsers or run migrations; verification is yours. Suggested manual checks:
- **Migrations:** `npm run migrate` / rollback cleanly; constraints reject bad values.
- **API (curl/Postman with a JWT):** create with and without media; each validation rule (sub type mismatch, `new` without possession date, past possession, floor > total, parking without count, bad category count, oversize/invalid file type, 51 files).
- **Authorization:** no token → 401; another user's id on PUT/DELETE/media → 404 (including when the caller is an `agent`); an agent GET of another user's draft/pending property → 404; anonymous GET of a published property → 200, of a draft/pending one → 404; owner GET of own draft → 200; `buyer` role can create.
- **Consistency:** force a DB error (e.g. invalid FK) and confirm no rows and no leftover files in `backend/uploads/property-*`.
- **Media:** delete one image (file removed from disk, row gone); add media beyond 50 → 400.
- **UI:** run through all 5 steps for each property type (incl. PG/Co-Living with no sub type), submit with errors and success, verify the redirect and that the layout is unchanged.
- No automated test runner exists in `backend/package.json`; adding one is out of scope unless requested.

## 14. Risks
- Large single multipart request (up to 50 × 50 MB + 100 MB) — consider a reverse-proxy body limit and timeouts; fallback if it proves too heavy is create-then-upload (separate media endpoint already exists).
- Local-disk storage ties uploads to one server; fine for now, S3-compatible storage is the migration path.
- MIME checks rely on client-declared types (consistent with the rest of the project); optional magic-byte sniffing can be added without a dependency if you want stricter validation.
