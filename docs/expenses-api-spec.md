# Expense API implementation plan

## Goal

Add authenticated, user-owned expense CRUD and a category-discovery endpoint. Implement the unchecked steps in order; each step should leave the project building before moving to the next one.

The database schema, expense indexes, PostgreSQL category enum, JWT middleware, and authenticated user ID are already available.

## API contract

All expense endpoints require a valid bearer token. The category endpoint may be public because it exposes non-sensitive, system-defined values.

| Method | Path | Purpose | Success |
| --- | --- | --- | --- |
| `POST` | `/expenses` | Create an expense for the current user | `201` with the expense |
| `GET` | `/expenses` | List the current user's expenses | `200` with the matching expenses and pagination metadata |
| `GET` | `/expenses/:id` | Retrieve one owned expense | `200` with the expense |
| `PATCH` | `/expenses/:id` | Update selected fields on an owned expense | `200` with the updated expense |
| `DELETE` | `/expenses/:id` | Delete an owned expense | `204` |
| `GET` | `/expense-categories` | List the accepted category values | `200` with the categories |

Use the existing response shape: `{ "success": true, "data": ... }`. Continue to use the shared error response shape for failures.

## Ownership and privacy rule

Every expense repository operation must receive the authenticated `userId`, including create, list, read, update, and delete. Queries for an existing record must constrain both its ID and owner in the same query:

```ts
and(eq(expenses.id, expenseId), eq(expenses.userId, userId))
```

Return `404 NOT_FOUND` when no owned expense matches. This applies when the ID does not exist and when it belongs to another user, so the API never reveals another user's records. Do not fetch by expense ID alone and check ownership afterward.

## Validation rules

Define request schemas in the expense module and derive the category schema directly from the database enum:

```ts
const categorySchema = z.enum(expenseCategoryEnum.enumValues);
```

Do not duplicate the category strings in handlers, services, or schemas.

For create requests:

- `title`: required, trimmed, non-empty string, at most 255 characters.
- `amountCents`: required positive integer.
- `category`: required value accepted by `categorySchema`.
- `expenseDate`: required `YYYY-MM-DD` string representing a real calendar date.
- `description`: optional string; store an omitted value as `null`.

For patch requests, allow `title`, `amountCents`, `category`, `expenseDate`, and `description`. Apply the same field validation, require at least one supplied field, and allow `description: null` to clear it. Never allow clients to change `id`, `userId`, `createdAt`, or `updatedAt`. Set `updatedAt` when an update succeeds.

Validate `:id` as a UUID. Invalid bodies, query strings, and path parameters should use the project's validation error response.

Example create request:

```json
{
  "title": "Weekly groceries",
  "amountCents": 185000,
  "category": "groceries",
  "expenseDate": "2026-09-26",
  "description": "Local supermarket"
}
```

## List query

Support filtering, searching, sorting, and cursor-based pagination on `GET /expenses`; do not add separate filter routes.

| Parameter | Meaning | Default |
| --- | --- | --- |
| `from` | Include expenses on or after this valid `YYYY-MM-DD` date | none |
| `to` | Include expenses on or before this valid `YYYY-MM-DD` date | none |
| `category` | Exact category match using `categorySchema` | none |
| `search` | Case-insensitive match against title or description | none |
| `limit` | Positive integer, maximum `100` | `20` |
| `cursor` | Opaque cursor returned by the previous page | none |
| `sort` | One of `expenseDate`, `amountCents`, `createdAt`, or `title` | `expenseDate` |
| `order` | `asc` or `desc` | `desc` |

Reject a range where `from` is after `to`. Combine supplied filters with `AND`, always including `userId`. Use a fixed allow-list to map `sort` values to Drizzle columns; never pass client input into SQL identifiers.

Order every page by the requested sort field and then by `expenses.id` as a stable tie-breaker. The cursor should encode the last item's sort value and ID, but remain opaque to clients. Fetch `limit + 1` rows to determine whether another page exists; do not run a total-count query. When a cursor is supplied, apply the appropriate keyset condition for the requested direction. Reject malformed cursors and cursors whose encoded sort or order does not match the request.

Return the next cursor only when another page exists:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "limit": 20,
      "nextCursor": null,
      "hasMore": false
    }
  }
}
```

Examples:

```http
GET /expenses?from=2026-09-01&to=2026-09-30
GET /expenses?category=groceries
GET /expenses?search=market&limit=20
GET /expenses?search=market&limit=20&cursor=<nextCursor>
GET /expenses?sort=expenseDate&order=desc
```

## Implementation checklist

- [ ] **1. Add expense schemas and types.** Create the category, create-body, patch-body, path-parameter, and list-query schemas. Derive category values from `expenseCategoryEnum.enumValues`; add shared input/result types inferred from the schemas and Drizzle model.
- [ ] **2. Add the expense repository.** Implement user-scoped create, cursor-paginated list, get-by-ID, update, and delete queries. Keep dynamic filter, keyset cursor, and sort construction here, and require `userId` in every function signature.
- [ ] **3. Implement `POST /expenses`.** Add the service and validated handler, take `userId` only from `authenticatedUserId`, and return the created expense with `201`.
- [ ] **4. Implement `GET /expenses`.** Validate the query string, apply any supplied filters, use stable sorting and keyset pagination, and return items plus `limit`, `nextCursor`, and `hasMore`.
- [ ] **5. Implement `GET /expenses/:id`.** Validate the UUID, query by both expense ID and `userId`, and return the shared `NotFoundError` when there is no owned match.
- [ ] **6. Implement `PATCH /expenses/:id`.** Validate a non-empty partial body, update only permitted fields by expense ID and `userId`, refresh `updatedAt`, and return `404` for a missing or foreign-owned record.
- [ ] **7. Implement `DELETE /expenses/:id`.** Delete by expense ID and `userId`, return `404` if no row was deleted, and return `204` on success.
- [ ] **8. Mount the expense routes.** Protect all `/expenses` routes with `authMiddleware` and register them in `src/app.ts`. Ensure static subpaths added later, such as `/expenses/summary`, are registered before `/:id`.
- [ ] **9. Add `GET /expense-categories`.** Return the existing hardcoded `expenseCategoryEnum.enumValues` directly. This endpoint does not query a categories table or repository.
- [ ] **10. Add focused tests.** Cover validation, combined list filters, search, sorting, pagination, empty results, and all CRUD success cases. For read/update/delete, prove that another user's expense returns the same `404` as a nonexistent ID. Check that list results never contain another user's records.
- [ ] **11. Document and verify.** Add setup and request examples to the README, run the TypeScript build and test suite, and manually exercise the routes against PostgreSQL.

## Deferred work

Keep the PostgreSQL enum while categories remain fixed by the project requirements. Adding or renaming a built-in category requires a database migration, which is acceptable for the current scope.

If users later need custom categories, replace the enum with a `categories` table and make `expenses.categoryId` a foreign key. A useful starting model is:

```text
categories
- id
- userId nullable     // null means built-in category
- name
- slug
- color nullable
- icon nullable
- isActive
```

Add reporting only after CRUD, filters, ownership tests, and category discovery are complete:

```http
GET /expenses/summary?from=2026-09-01&to=2026-09-30&groupBy=category
```
