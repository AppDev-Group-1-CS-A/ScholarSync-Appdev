export const swaggerSpec: Record<string, any> = {
  openapi: "3.0.3",
  info: {
    title: "ScholarSync REST API",
    version: "1.0.0",
    description: `## ScholarSync: Interactive Study Companion & Knowledge Workspace
Interactive OpenAPI 3.0 specification and API testing playground for the ScholarSync backend services.

### Key Capabilities:
- **Books & Segments:** Store textbooks, extract PDF segments, and query text.
- **AI Chat (RAG):** Contextual Q&A with strict citations powered by Groq LLM.
- **Voice Sessions:** Real-time bi-directional voice tutoring telemetry.
- **Admin Governance:** Manage users, roles, and ban controls.
`,
    contact: {
      name: "ScholarSync - AppDev Group 1",
      url: "https://github.com/AppDev-Group-1/ScholarSync-Appdev",
    },
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server",
    },
  ],
  tags: [
    {
      name: "System & Health",
      description: "Server status and health ping",
    },
    {
      name: "Books",
      description: "Book documents, PDF metadata, and text segment indexing",
    },
    {
      name: "AI Chat",
      description: "Groq LLM Retrieval-Augmented Generation (RAG) assistant",
    },
    {
      name: "Voice Sessions",
      description: "Voice tutoring telemetry and duration tracking",
    },
    {
      name: "Admin",
      description: "User role management, account status, and administration",
    },
    {
      name: "Upload",
      description: "Vercel Blob client-side token generation for PDF and cover uploads",
    },
    {
      name: "Vapi Webhook",
      description: "Tool calling and telemetry callbacks for Vapi Voice Assistant",
    },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System & Health"],
        summary: "Server Health Check",
        description: "Returns the operational status of the ScholarSync Express REST API server.",
        responses: {
          200: {
            description: "Server is online and healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    service: { type: "string", example: "ScholarSync Backend REST API" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/books": {
      get: {
        tags: ["Books"],
        summary: "List user books",
        description: "Retrieves all books belonging to the specified user with optional title/author search filter.",
        parameters: [
          {
            name: "userId",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Clerk user ID or MongoDB User ID",
            example: "user_demo_scholar_123",
          },
          {
            name: "search",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Search keyword matched against book title and author",
            example: "Calculus",
          },
        ],
        responses: {
          200: {
            description: "Array of user books",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Book" },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Books"],
        summary: "Create a new book",
        description: "Creates a new book record with metadata and Vercel Blob file URLs.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateBookInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Book created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Book" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error or missing fields",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/books/check/{title}": {
      get: {
        tags: ["Books"],
        summary: "Check if book title exists",
        description: "Checks whether a book with the given title already exists for duplication prevention.",
        parameters: [
          {
            name: "title",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Title of the book to check",
            example: "Calculus Early Transcendentals",
          },
        ],
        responses: {
          200: {
            description: "Existence check result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    exists: { type: "boolean", example: false },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing or invalid title",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/books/slug/{slug}": {
      get: {
        tags: ["Books"],
        summary: "Get book by slug",
        description: "Fetches complete book metadata and segment count using its unique URL slug.",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Unique URL slug of the book",
            example: "calculus-early-transcendentals",
          },
        ],
        responses: {
          200: {
            description: "Book found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Book" },
                  },
                },
              },
            },
          },
          404: {
            description: "Book not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/books/{id}/search": {
      get: {
        tags: ["Books"],
        summary: "Search indexed book segments",
        description: "Performs full-text and keyword search across all indexed text segments of a book.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "MongoDB Object ID of the book",
            example: "67160ad9f71c480029b9f012",
          },
          {
            name: "q",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Search keyword or query phrase",
            example: "derivatives and integrals",
          },
        ],
        responses: {
          200: {
            description: "Matching text segments",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/BookSegment" },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing search query",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/books/{id}/segments": {
      post: {
        tags: ["Books"],
        summary: "Save extracted PDF text segments",
        description: "Batch inserts extracted text segments for a book and updates the book's total segment counter.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "MongoDB Object ID of the book",
            example: "67160ad9f71c480029b9f012",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SaveSegmentsInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Segments saved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    count: { type: "integer", example: 45 },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid input or empty segments",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/books/{id}": {
      delete: {
        tags: ["Books"],
        summary: "Delete a book",
        description: "Deletes a book, cleans up all its text segments, related sessions, and removes stored files from Vercel Blob.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "MongoDB Object ID of the book to delete",
            example: "67160ad9f71c480029b9f012",
          },
        ],
        responses: {
          200: {
            description: "Book deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Book deleted successfully" },
                  },
                },
              },
            },
          },
          404: {
            description: "Book not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/books/seed-demo": {
      post: {
        tags: ["Books"],
        summary: "One-click demo book seeder",
        description: "Populates the database with a pre-indexed sample book ('Introduction to Computer Science' by Alan Turing) and two sample segments so users or evaluators can immediately test the workspace without uploading a PDF.",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  userId: {
                    type: "string",
                    description: "Target user ID to assign the demo book to. Defaults to 'demo_student' if omitted.",
                    example: "user_demo_scholar_123",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Demo book created and seeded successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Demo book seeded successfully!" },
                    book: { $ref: "#/components/schemas/Book" },
                  },
                },
              },
            },
          },
          200: {
            description: "Demo book already exists",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Demo book already exists!" },
                    book: { $ref: "#/components/schemas/Book" },
                  },
                },
              },
            },
          },
          500: {
            description: "Failed to seed demo book",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/chat": {
      post: {
        tags: ["AI Chat"],
        summary: "Contextual RAG Chat with Book",
        description: "Queries the Groq LLM (Llama 3.3 70B) against retrieved book text segments, outputting an AI response with precise page citations.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChatRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "AI response with citations",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChatResponse" },
              },
            },
          },
          400: {
            description: "Missing required parameters",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "LLM or inference pipeline error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/session/start": {
      post: {
        tags: ["Voice Sessions"],
        summary: "Start voice tutoring session",
        description: "Initializes a new Vapi voice tutoring session and returns a tracked session ID.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StartSessionRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Session initialized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StartSessionResponse" },
              },
            },
          },
          400: {
            description: "Missing userId or bookId",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/session/end": {
      post: {
        tags: ["Voice Sessions"],
        summary: "End voice tutoring session",
        description: "Concludes a voice tutoring session and logs total duration in seconds.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EndSessionRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Session ended successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          404: {
            description: "Session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users",
        description: "Retrieves all registered users enriched with their uploaded book count.",
        responses: {
          200: {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/admin/users/{id}/role": {
      patch: {
        tags: ["Admin"],
        summary: "Toggle user role",
        description: "Toggles a user's role between 'user' and 'admin'.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "MongoDB Object ID of the user",
          },
        ],
        responses: {
          200: {
            description: "Role updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    role: { type: "string", enum: ["user", "admin"], example: "admin" },
                  },
                },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/admin/users/{id}/ban": {
      patch: {
        tags: ["Admin"],
        summary: "Toggle user ban status",
        description: "Toggles a user's account status between 'active' and 'banned'. Administrators cannot be banned.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "MongoDB Object ID of the user",
          },
        ],
        responses: {
          200: {
            description: "Status updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    status: { type: "string", enum: ["active", "banned"], example: "banned" },
                  },
                },
              },
            },
          },
          400: {
            description: "Attempted to ban an administrator",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/admin/users/{id}": {
      delete: {
        tags: ["Admin"],
        summary: "Delete user account",
        description: "Permanently deletes a user account and removes all books uploaded by the user. Administrators cannot be deleted.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "MongoDB Object ID of the user",
          },
        ],
        responses: {
          200: {
            description: "User deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          400: {
            description: "Attempted to delete an administrator",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/admin/sync-user": {
      post: {
        tags: ["Admin"],
        summary: "Sync Clerk user to database",
        description: "Upserts a user record from Clerk authentication into MongoDB.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SyncUserRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "User synchronized successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing clerkId or email",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/upload": {
      post: {
        tags: ["Upload"],
        summary: "Vercel Blob client upload handler",
        description: "Generates secure client upload tokens for direct-to-cloud PDF document and image uploads.",
        responses: {
          200: {
            description: "Upload client token response",
          },
          500: {
            description: "Upload configuration error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/vapi/search-book": {
      post: {
        tags: ["Vapi Webhook"],
        summary: "Vapi assistant book search tool",
        description: "Webhook invoked by Vapi voice assistant to query text segments during a live voice call.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "object",
                    properties: {
                      toolCalls: { type: "array", items: { type: "object" } },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Tool result formatted for Vapi assistant",
          },
        },
      },
    },
    "/api/vapi/log": {
      post: {
        tags: ["Vapi Webhook"],
        summary: "Vapi telemetry log webhook",
        description: "Receives call lifecycle events and telemetry callbacks from Vapi.",
        responses: {
          200: {
            description: "Log received",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    received: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Book: {
        type: "object",
        properties: {
          _id: { type: "string", example: "67160ad9f71c480029b9f012" },
          userId: { type: "string", example: "user_demo_scholar_123" },
          clerkId: { type: "string", example: "user_2test123" },
          title: { type: "string", example: "Calculus: Early Transcendentals" },
          slug: { type: "string", example: "calculus-early-transcendentals" },
          author: { type: "string", example: "James Stewart" },
          persona: { type: "string", example: "socratic_tutor" },
          fileURL: { type: "string", format: "uri", example: "https://blob.vercel-storage.com/book.pdf" },
          fileBlobKey: { type: "string", example: "books/calculus.pdf" },
          coverURL: { type: "string", format: "uri", example: "https://blob.vercel-storage.com/cover.jpg" },
          coverBlobKey: { type: "string", example: "covers/calculus.jpg" },
          fileSize: { type: "integer", example: 15420000 },
          totalSegments: { type: "integer", example: 120 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateBookInput: {
        type: "object",
        required: ["userId", "title", "author", "fileURL", "fileBlobKey", "fileSize"],
        properties: {
          userId: { type: "string", example: "user_demo_scholar_123" },
          title: { type: "string", example: "Calculus: Early Transcendentals" },
          author: { type: "string", example: "James Stewart" },
          persona: { type: "string", example: "socratic_tutor" },
          fileURL: { type: "string", format: "uri", example: "https://blob.vercel-storage.com/book.pdf" },
          fileBlobKey: { type: "string", example: "books/calculus.pdf" },
          coverURL: { type: "string", format: "uri", example: "https://blob.vercel-storage.com/cover.jpg" },
          coverBlobKey: { type: "string", example: "covers/calculus.jpg" },
          fileSize: { type: "integer", example: 15420000 },
        },
      },
      BookSegment: {
        type: "object",
        properties: {
          _id: { type: "string", example: "67160ad9f71c480029b9f099" },
          bookId: { type: "string", example: "67160ad9f71c480029b9f012" },
          userId: { type: "string", example: "user_demo_scholar_123" },
          content: { type: "string", example: "The derivative of a function represents an infinitesimal change..." },
          segmentIndex: { type: "integer", example: 1 },
          pageNumber: { type: "integer", example: 14 },
          wordCount: { type: "integer", example: 250 },
        },
      },
      SaveSegmentsInput: {
        type: "object",
        required: ["segments"],
        properties: {
          userId: { type: "string", example: "user_demo_scholar_123" },
          segments: {
            type: "array",
            items: {
              type: "object",
              required: ["text", "segmentIndex"],
              properties: {
                text: { type: "string", example: "Section 1.1: Four Ways to Represent a Function..." },
                segmentIndex: { type: "integer", example: 0 },
                pageNumber: { type: "integer", example: 1 },
                wordCount: { type: "integer", example: 320 },
              },
            },
          },
        },
      },
      ChatRequest: {
        type: "object",
        required: ["bookId", "bookTitle", "userMessage"],
        properties: {
          bookId: { type: "string", example: "67160ad9f71c480029b9f012" },
          bookTitle: { type: "string", example: "Calculus: Early Transcendentals" },
          userMessage: { type: "string", example: "What is the Fundamental Theorem of Calculus?" },
          persona: { type: "string", example: "socratic_tutor" },
          history: {
            type: "array",
            items: {
              type: "object",
              properties: {
                role: { type: "string", enum: ["user", "assistant"], example: "user" },
                content: { type: "string", example: "Can you explain limits?" },
              },
            },
          },
        },
      },
      ChatResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          reply: {
            type: "string",
            example: "The Fundamental Theorem of Calculus connects differentiation and integration [Page 294, Paragraph 2]...",
          },
          citations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                segmentIndex: { type: "integer", example: 45 },
                pageNumber: { type: "integer", example: 294 },
                preview: { type: "string", example: "Theorem: If f is continuous on [a, b]..." },
              },
            },
          },
        },
      },
      StartSessionRequest: {
        type: "object",
        required: ["userId", "bookId"],
        properties: {
          userId: { type: "string", example: "user_demo_scholar_123" },
          bookId: { type: "string", example: "67160ad9f71c480029b9f012" },
        },
      },
      StartSessionResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          sessionId: { type: "string", example: "67160ad9f71c480029b9f999" },
        },
      },
      EndSessionRequest: {
        type: "object",
        required: ["sessionId"],
        properties: {
          sessionId: { type: "string", example: "67160ad9f71c480029b9f999" },
          durationSeconds: { type: "integer", example: 345 },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "67160ad9f71c480029b9f001" },
          clerkId: { type: "string", example: "user_2abc123" },
          firstName: { type: "string", example: "Keith" },
          lastName: { type: "string", example: "Laranjo" },
          email: { type: "string", format: "email", example: "keith.admin.study@gmail.com" },
          role: { type: "string", enum: ["user", "admin"], example: "admin" },
          status: { type: "string", enum: ["active", "banned"], example: "active" },
          bookCount: { type: "integer", example: 5 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      SyncUserRequest: {
        type: "object",
        required: ["clerkId", "email"],
        properties: {
          clerkId: { type: "string", example: "user_2abc123" },
          email: { type: "string", format: "email", example: "student@university.edu" },
          firstName: { type: "string", example: "Jane" },
          lastName: { type: "string", example: "Doe" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string", example: "Invalid request payload or resource not found" },
        },
      },
    },
  },
};
