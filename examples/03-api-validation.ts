/**
 * API Validation Examples
 *
 * Demonstrates how to use @schemini/core for validating API requests and responses.
 */

import { s, ValidationError } from "@schemini/core";

// ============================================================================
// 1. REST API Request/Response Schemas
// ============================================================================

// Common types
const idSchema = s.number().int().positive();
const paginationSchema = s.object({
  page: s.number().int().min(1).default(1),
  limit: s.number().int().min(1).max(100).default(20),
});

// User resource
const userSchema = s.object({
  id: idSchema,
  email: s.string().email(),
  name: s.string().min(1).max(100),
  role: s.enum(["admin", "user", "guest"] as const),
  createdAt: s.string().datetime(),
  updatedAt: s.string().datetime(),
});

type User = s.infer<typeof userSchema>;

// Create user request (no id, no timestamps)
const createUserRequestSchema = userSchema.omit([
  "id",
  "createdAt",
  "updatedAt",
]);
type CreateUserRequest = s.infer<typeof createUserRequestSchema>;

// Update user request (all fields optional except id)
const updateUserRequestSchema = userSchema
  .omit(["id", "createdAt", "updatedAt"])
  .partial();
type UpdateUserRequest = s.infer<typeof updateUserRequestSchema>;

// List users response
const listUsersResponseSchema = s.object({
  data: s.array(userSchema),
  pagination: s.object({
    page: s.number().int(),
    limit: s.number().int(),
    total: s.number().int(),
    totalPages: s.number().int(),
  }),
});

// ============================================================================
// 2. API Middleware Pattern
// ============================================================================

/**
 * Generic request validator middleware
 */
function validateRequest<T>(
  schema: {
    safeParse: (data: unknown) => {
      success: boolean;
      data?: T;
      error?: ValidationError;
    };
  },
  data: unknown,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(400, "Validation failed", result.error!.issues);
  }
  return result.data!;
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Usage in a handler
function createUserHandler(rawBody: unknown) {
  const body = validateRequest(createUserRequestSchema, rawBody);

  // body is now typed as CreateUserRequest
  console.log(`Creating user: ${body.email}`);

  // ... create user logic
}

// ============================================================================
// 3. Query Parameter Validation
// ============================================================================

const searchQuerySchema = s.object({
  q: s.string().min(1).max(200).optional(),
  category: s.enum(["all", "users", "posts", "comments"] as const).optional(),
  sortBy: s.enum(["createdAt", "updatedAt", "name"] as const).optional(),
  sortOrder: s.enum(["asc", "desc"] as const).default("desc"),
  page: s.coerce.number().int().min(1).default(1),
  limit: s.coerce.number().int().min(1).max(100).default(20),
  includeDeleted: s.coerce.boolean().default(false),
});

type SearchQuery = s.infer<typeof searchQuerySchema>;

// Parse URL query parameters
function parseQueryParams(searchParams: URLSearchParams): SearchQuery {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return searchQuerySchema.parse(params);
}

// ============================================================================
// 4. Webhook Payload Validation
// ============================================================================

const webhookPayloadSchema = s.object({
  event: s.enum([
    "user.created",
    "user.updated",
    "user.deleted",
    "order.placed",
    "order.shipped",
    "order.delivered",
    "payment.completed",
    "payment.failed",
  ] as const),
  timestamp: s.string().datetime(),
  data: s.object({}).passthrough(), // Accept any object
  signature: s.string().min(1),
});

const userCreatedPayloadSchema = s.object({
  event: s.literal("user.created"),
  timestamp: s.string().datetime(),
  data: s.object({
    userId: idSchema,
    email: s.string().email(),
    source: s.enum(["web", "mobile", "api"] as const),
  }),
  signature: s.string(),
});

// ============================================================================
// 5. GraphQL-style Input Types
// ============================================================================

const createPostInputSchema = s.object({
  title: s.string().min(1).max(200),
  content: s.string().min(1).max(50000),
  excerpt: s.string().max(500).optional(),
  tags: s.array(s.string().min(1).max(50)).max(10).optional(),
  published: s.boolean().default(false),
  publishedAt: s.string().datetime().nullable(),
  authorId: idSchema,
  categoryIds: s.array(idSchema).optional(),
});

type CreatePostInput = s.infer<typeof createPostInputSchema>;

// ============================================================================
// 6. API Response Wrapper
// ============================================================================

/**
 * Generic API response wrapper
 */
function createResponseSchema<T>(dataSchema: { parse: (data: unknown) => T }) {
  return s.object({
    success: s.literal(true),
    data: dataSchema as unknown as ReturnType<typeof s.object>,
    meta: s
      .object({
        requestId: s.string().uuid(),
        timestamp: s.string().datetime(),
        version: s.string(),
      })
      .optional(),
  });
}

function createErrorResponseSchema() {
  return s.object({
    success: s.literal(false),
    error: s.object({
      code: s.string(),
      message: s.string(),
      details: s
        .array(
          s.object({
            field: s.string().optional(),
            message: s.string(),
            code: s.string().optional(),
          }),
        )
        .optional(),
    }),
  });
}

// ============================================================================
// 7. Batch Operations
// ============================================================================

const batchCreateUsersSchema = s.object({
  users: s.array(createUserRequestSchema).min(1).max(100),
  options: s
    .object({
      skipDuplicates: s.boolean().default(false),
      sendWelcomeEmail: s.boolean().default(true),
    })
    .optional(),
});

const batchDeleteSchema = s.object({
  ids: s.array(idSchema).min(1).max(100),
  permanent: s.boolean().default(false),
});

// ============================================================================
// 8. File Upload API
// ============================================================================

const fileUploadRequestSchema = s.object({
  file: s.object({
    name: s.string().min(1).max(255),
    size: s
      .number()
      .int()
      .positive()
      .max(50 * 1024 * 1024), // 50MB
    mimeType: s
      .string()
      .pattern(/^[\w-]+\/[\w-]+$/)
      .refine(
        (type) =>
          [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
          ].includes(type),
        "Unsupported file type",
      ),
  }),
  metadata: s
    .object({
      title: s.string().max(200).optional(),
      description: s.string().max(2000).optional(),
      folder: s.string().max(500).optional(),
    })
    .optional(),
});

// ============================================================================
// 9. Authentication Endpoints
// ============================================================================

const loginRequestSchema = s.object({
  email: s.string().email(),
  password: s.string().min(1),
  rememberMe: s.boolean().default(false),
});

const loginResponseSchema = s.object({
  accessToken: s.string(),
  refreshToken: s.string(),
  expiresIn: s.number().int().positive(),
  user: userSchema,
});

const refreshTokenRequestSchema = s.object({
  refreshToken: s.string().min(1),
});

const changePasswordRequestSchema = s
  .object({
    currentPassword: s.string().min(1),
    newPassword: s.string().min(8),
    confirmPassword: s.string().min(8),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    "Passwords do not match",
  );

// ============================================================================
// 10. Rate Limiting / Quota Info
// ============================================================================

const rateLimitInfoSchema = s.object({
  limit: s.number().int(),
  remaining: s.number().int(),
  reset: s.number().int(), // Unix timestamp
  retryAfter: s.number().int().optional(), // Seconds until retry
});

// Example: Parse rate limit headers
function parseRateLimitHeaders(headers: Headers) {
  return rateLimitInfoSchema.safeParse({
    limit: Number(headers.get("X-RateLimit-Limit")),
    remaining: Number(headers.get("X-RateLimit-Remaining")),
    reset: Number(headers.get("X-RateLimit-Reset")),
  });
}
