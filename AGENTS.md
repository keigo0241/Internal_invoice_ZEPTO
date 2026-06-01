<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## API Implementation Rules

Next.js API Route Handlers must not put business logic directly in `route.ts`.

API files should use this structure by default:

```text
app/api/v1/[domain]/[action]/
  route.ts
  get.ts
  post.ts
```

`route.ts` is only the entry point that connects HTTP methods to handlers.

```ts
import { withApi } from "@/lib/api/with-api";
import { handleGet } from "./get";
import { handlePost } from "./post";

export const GET = withApi(handleGet, []);
export const POST = withApi(handlePost, []);
```

Do not write these directly in `route.ts`:

- database access
- external API calls
- validation implementation
- business logic
- long `try/catch` blocks
- response formatting

Write each HTTP method's implementation in a separate file:

```text
GET    -> get.ts
POST   -> post.ts
PUT    -> put.ts
PATCH  -> patch.ts
DELETE -> delete.ts
```

Use these handler names:

```text
get.ts    -> handleGet
post.ts   -> handlePost
put.ts    -> handlePut
patch.ts  -> handlePatch
delete.ts -> handleDelete
```

Handlers should use `ApiHandler`.

```ts
import { type ApiHandler } from "@/lib/api/types";

export const handleGet: ApiHandler = async (ctx) => {
  return {
    status: 200,
    body: {
      message: "OK",
    },
  };
};
```

All APIs should be exposed through `withApi`.

`withApi` is responsible for shared API behavior:

- creating `ApiContext`
- running guards
- running the handler
- normalizing response format
- normalizing error handling
- adding a trace id

Authentication, authorization, and rate limiting should be separated into guards.

```ts
const guards = [
  requireAuthenticatedGuard,
  createRateLimitGuard({
    keyPrefix: "sample-api",
    windowMs: 3000,
    maxRequests: 1,
  }),
];

export const POST = withApi(handlePost, guards);
```

Handlers should generally not return `Response.json()` directly.
Return this shape instead:

```ts
return {
  status: 200,
  body: {
    message: "Success",
  },
};
```

Expected errors should be thrown as shared `AppError` classes.
Error response formatting should be handled by the shared API error handler.

API paths should start with `/api/v1` by default.

```text
/api/v1/auth/google
/api/v1/auth/google/callback
/api/v1/users/me
/api/v1/invoices
/api/v1/invoices/[invoiceId]
```

Dynamic route parameters should be read from `ctx.params`.

```ts
const invoiceId = ctx.params?.invoiceId;
```

Request bodies should be read inside handlers and validated before use.

```ts
const body = (await ctx.request.json()) as RequestBody;
```

Do not write database access directly in API handlers.
Put database access in:

```text
features/[domain]/repositories/
```

Put business logic, state transitions, and external service coordination in:

```text
features/[domain]/services/
```

For Google auth APIs, use the same shape:

```text
app/api/v1/auth/google/
  route.ts
  get.ts

app/api/v1/auth/google/callback/
  route.ts
  get.ts

features/auth/services/
  google-oauth.ts
  google-auth-policy.ts
  session.ts
```
