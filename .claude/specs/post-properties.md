# Feature Specification: Post Property Functionality

## 1. Overview

The frontend UI for the **Post Property** functionality has already been implemented. The remaining work is to develop the complete backend functionality and integrate it with the existing frontend.

Before writing any code, review the existing frontend UI, project architecture, database configuration, authentication system, and coding conventions. Based on this review, prepare a complete implementation plan.

## 2. Current Implementation

- The Post Property frontend UI is already available.
- The backend functionality has not yet been implemented.
- The project uses Node.js, Express.js, and PostgreSQL.
- The backend follows a modular architecture.
- The property-related backend logic must be implemented inside the `property` module.

## 3. Functional Requirements

### 3.1 Review the Existing Frontend

Before implementation:

- Locate and review all frontend pages, components, forms, fields, dropdowns, checkboxes, and file upload controls related to Post Property.
- Identify all property types, categories, transaction types, and other options supported by the UI.
- Review form validation rules and conditional fields.
- Identify all required and optional fields.
- Determine how property images and amenities are selected and submitted.
- Review the existing authentication flow and determine how the logged-in user is identified.
- Identify the frontend API integration requirements.

Use the existing frontend as the source of truth. Do not invent fields or change the UI unless a change is necessary and approved.

### 3.2 Database Design

Design the PostgreSQL database schema based on the actual frontend requirements.

Create the necessary tables, such as:

- `properties`: Stores the main property details.
- `property_images`: Stores property image paths, ordering, and metadata where appropriate.
- `property_amenities`: Stores amenities associated with properties.
- You can create if any tables need to create by considering frontend UI.
- Additional lookup or relationship tables only when justified by the existing UI and data model.

Requirements:

- Use appropriate primary keys, foreign keys, data types, constraints, and indexes.
- Associate every property with its owner or agent using the existing user and authentication model.
- Support multiple images per property.
- Support multiple amenities per property.
- Define sensible defaults and `NOT NULL` constraints based on actual requirements.
- Include timestamps such as `created_at` and `updated_at` where appropriate.
- Define how property statuses will be managed, such as draft, pending approval, published, or rejected, only where these states fit the existing business requirements.
- Use database migrations for all schema changes.
- Do not recreate existing users, authentication, or other tables that already exist.

### 3.3 Backend API Development

Implement all required APIs for the Post Property workflow.

Expected functionality, subject to frontend review:

- Create a property.
- Validate and save property details.
- Upload and associate property images.
- Add and associate property amenities.
- Retrieve property details when needed.
- Update an existing property owned by the authenticated user.
- Delete or remove a property image where supported by the UI.
- Handle draft saving or submission for approval if required by the existing workflow.
- Return consistent API responses and meaningful error messages.

Use the existing API conventions and authentication middleware. Do not introduce duplicate functionality that already exists elsewhere in the project.

### 3.4 Backend Module Structure

Implement property-related logic inside the existing property module, following the project's established architecture.

Use the following structure where appropriate:

- `property.controller.js`: Handles HTTP requests and responses.
- `property.routes.js`: Defines property API routes.
- `property.service.js`: Implements business logic and workflow orchestration.
- `property.validation.js`: Validates request parameters, body fields, and supported inputs.
- `property.repository.js`: Handles PostgreSQL queries and data access.
- Additional files for image uploads, amenities, constants, or helpers only when necessary.

Follow the existing project conventions for naming, imports, exports, error handling, and database access. Do not create unnecessary files or duplicate existing utilities.

Please write the SQL query instead of javascript query using knex in the `property.repository.js` file.

### 3.5 Image Upload Handling

Review the frontend image upload controls and implement appropriate backend handling.

- Validate supported image types and file sizes.
- Support multiple images if the UI allows them.
- Store image files using the project's existing storage approach.
- Save image paths or storage references in PostgreSQL, not raw image binaries unless the current architecture specifically requires that.
- Associate each image with the correct property.
- Handle upload failures and clean up temporary or orphaned files when appropriate.
- Enforce authorization when adding or removing images.
- Do not expose private filesystem paths or trust client-provided file paths.

If the project does not have an established image storage solution, document the options and recommend one before introducing a new dependency or external service.

### 3.6 Validation, Security, and Error Handling

- Require authentication for protected property operations.
- Verify that users can update or delete only properties they are authorized to manage.
- Validate all incoming data on the backend.
- Use parameterized SQL queries or the existing database query layer.
- Prevent unauthorized property ownership changes.
- Validate image uploads and restrict unexpected file types.
- Use transactions for operations that involve multiple related database changes.
- Roll back failed transactions to avoid incomplete property records.
- Follow the project's existing centralized error-handling conventions.
- Never expose secrets, database credentials, or internal error details in API responses.

### 3.7 Frontend Integration

- Connect the existing Post Property form to the new backend APIs.
- Map frontend field names to the backend request schema.
- Handle loading, success, validation errors, upload failures, and server errors.
- Preserve the existing UI design, styles, layout, and behavior.
- Avoid rewriting existing frontend components unless required for integration.
- Ensure the form sends data in the format expected by the backend, including multipart form data if required for image uploads.

## 4. Required Files and Deliverables

Before implementation, provide a complete list of files that will be created or modified.

For each file, specify:

- File path.
- Purpose and responsibility.
- Whether it is new or already exists.
- Why it is required.

Include the relevant database migration files, module files, route registration changes, upload utilities, and frontend integration changes where applicable.

Do not assume that every suggested file must be created. Reuse existing project utilities and conventions whenever possible.

## 5. Implementation Workflow

Follow these steps in order.

### Phase 1: Project Analysis

1. Review `CLAUDE.md` and all applicable project instructions.
2. Inspect the repository structure.
3. Review the existing Post Property frontend UI.
4. Inspect the existing property-related code, if any.
5. Review authentication, user roles, database configuration, migrations, and error handling.
6. Identify the complete form fields and expected user workflow.
7. Document any missing information or ambiguous business rules.

### Phase 2: Technical Plan

Before changing any code, prepare a plan containing:

1. Frontend field inventory.
2. Proposed database schema and relationships.
3. Proposed API endpoints and HTTP methods.
4. Request and response formats.
5. Authentication and authorization requirements.
6. Image upload strategy.
7. Complete list of files to create or modify.
8. Validation rules and error-handling strategy.
9. Transaction boundaries and data consistency requirements.
10. Testing strategy and implementation order.

Explain any assumptions and ask for clarification when a business decision cannot safely be inferred from the existing code.

### Phase 3: Database Implementation

1. Create the required migrations.
2. Define tables, relationships, constraints, and indexes.
3. Verify that the migrations follow the existing project conventions.
4. Ensure existing data and schema are preserved.

### Phase 4: Backend Implementation

1. Implement validation.
2. Implement repository methods.
3. Implement service-layer business logic.
4. Implement controllers and routes.
5. Implement image upload handling.
6. Add authentication and authorization checks.
7. Add transactional handling for related database operations.
8. Register the routes using the existing application structure.

### Phase 5: Frontend Integration

1. Connect the existing form to the backend.
2. Implement image and amenity submission.
3. Handle API responses and errors.
4. Preserve the existing UI and user experience.

## 6. Important Implementation Rules

- Analyze first, plan second, implement third.
- Do not start coding before presenting the implementation plan.
- Keep all property-related backend business logic within the property module.
- Follow the existing project architecture and coding conventions.
- Do not duplicate existing authentication, database, or upload utilities.
- Do not modify unrelated modules or existing functionality.
- Do not change the Post Property UI design.
- Do not create database tables or fields without a clear requirement.
- Do not run destructive database commands or remove existing data.
- Do not add new dependencies without a clear reason.
- Use migrations instead of manual schema changes.
- Keep the implementation maintainable, secure, and testable.

## 7. Expected Final Output

First, provide the project analysis and implementation plan, including the database schema, API list, complete file list, and workflow.

**Primary objective:** Implement a complete, secure, maintainable Post Property backend that integrates with the existing frontend and follows the project's current architecture without unnecessary changes.
