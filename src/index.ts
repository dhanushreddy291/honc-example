import { createFiberplane } from "@fiberplane/hono";
import { neon } from "@neondatabase/serverless";
import { desc, eq, sql } from "drizzle-orm";
import { type NeonHttpDatabase, drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import z from "zod";
import * as schema from "./db/schema";
import "zod-openapi/extend";

// Types for environment variables and context
type Bindings = {
  DATABASE_URL: string;
};

type Variables = {
  db: NeonHttpDatabase;
};

// Create the app with type-safe bindings and variables
// For more information on OpenAPIHono, see: https://hono.dev/examples/zod-openapi
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware: Set up database connection for all routes
app.use(async (c, next) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
  c.set("db", db);
  await next();
});

// Define the expected response shape using Zod
//
// We can add openapi documentation, as well as name the Schema in the OpenAPI document,
// by chaining `openapi` on the zod schema definitions
const TaskSchema = z
  .object({
    id: z.string().openapi({
      description: "The unique identifier for the task.",
      example: "1",
    }),
    title: z.string().openapi({
      description: "The title of the task.",
      example: "Learn HONC",
    }),
    description: z.string().nullable().optional().openapi({
      description: "A detailed description of the task.",
      example: "Build a complete task API with HONC stack",
    }),
    completed: z.boolean().openapi({
      description: "Indicates if the task is completed.",
      example: false,
    }),
    createdAt: z.string().datetime().openapi({
      description: "The date and time when the task was created.",
      example: new Date().toISOString(),
    }),
    updatedAt: z.string().datetime().openapi({
      description: "The date and time when the task was last updated.",
      example: new Date().toISOString(),
    }),
  })
  .openapi({ ref: "Task" });
const NewTaskSchema = z
  .object({
    title: z.string().min(1, "Title cannot be empty").openapi({
      example: "Deploy to Cloudflare",
    }),
    description: z.string().nullable().optional().openapi({
      example: "Finalize deployment steps for the task API.",
    }),
  })
  .openapi({ ref: "NewTask" });

const apiRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

apiRouter
  .get(
    "/",
    describeRoute({
      summary: "List all tasks",
      description: "Retrieves a list of all tasks, ordered by creation date.",
      responses: {
        200: {
          content: {
            "application/json": { schema: resolver(z.array(TaskSchema)) },
          },
          description: "Tasks fetched successfully",
        },
      },
    }),
    async (c) => {
      const db = c.get("db");
      const tasks = await db
        .select()
        .from(schema.tasks)
        .orderBy(desc(schema.tasks.createdAt));
      return c.json(tasks, 200);
    },
  )
  .post(
    "/",
    describeRoute({
      summary: "Create a new task",
      description: "Adds a new task to the list.",
      responses: {
        201: {
          content: {
            "application/json": {
              schema: resolver(TaskSchema),
            },
          },
          description: "Task created successfully",
        },
        400: {
          description: "Invalid input for task creation",
        },
      },
    }),
    zValidator("json", NewTaskSchema),
    async (c) => {
      const db = c.get("db");
      const { title, description } = c.req.valid("json");
      const newTaskPayload: schema.NewTask = {
        title,
        description: description || null,
        completed: false,
      };
      const [insertedTask] = await db
        .insert(schema.tasks)
        .values(newTaskPayload)
        .returning();
      return c.json(insertedTask, 201);
    },
  )
  .get(
    "/:id",
    describeRoute({
      summary: "Get a single task by ID",
      responses: {
        200: {
          content: { "application/json": { schema: resolver(TaskSchema) } },
          description: "Task fetched successfully",
        },
        404: { description: "Task not found" },
        400: { description: "Invalid ID format" },
      },
    }),
    zValidator(
      "param",
      z.object({
        id: z.string().openapi({
          param: { name: "id", in: "path" },
          example: "1",
          description: "The id of the task to retrieve",
        }),
      }),
    ),
    async (c) => {
      const db = c.get("db");
      const { id } = c.req.valid("param");
      const [task] = await db
        .select()
        .from(schema.tasks)
        .where(eq(schema.tasks.id, Number(id)));
      if (!task) {
        return c.json({ error: "Task not found" }, 404);
      }
      return c.json(task, 200);
    },
  )
  .put(
    "/:id",
    describeRoute({
      summary: "Update a task's completion status",
      description: "Toggles or sets the completion status of a specific task.",
      responses: {
        200: {
          content: { "application/json": { schema: resolver(TaskSchema) } },
          description: "Task updated successfully",
        },
        404: { description: "Task not found" },
        400: { description: "Invalid input or ID format" },
      },
    }),
    zValidator(
      "param",
      z.object({
        id: z.string().openapi({
          param: { name: "id", in: "path" },
          example: "1",
          description: "The ID of the task to update.",
        }),
      }),
    ),
    zValidator(
      "json",
      z
        .object({
          completed: z.boolean().openapi({
            example: true,
            description: "The new completion status of the task.",
          }),
        })
    ),
    async (c) => {
      const db = c.get("db");
      const { id } = c.req.valid("param");
      const { completed } = c.req.valid("json");

      const [updatedTask] = await db
        .update(schema.tasks)
        .set({ updatedAt: sql`NOW()`, completed })
        .where(eq(schema.tasks.id, Number(id)))
        .returning();

      if (!updatedTask) {
        return c.json({ error: "Task not found" }, 404);
      }
      return c.json(updatedTask, 200);
    },
  )
  .delete(
    "/:id",
    describeRoute({
      summary: "Delete a task",
      description: "Removes a specific task from the list.",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: resolver(
                z.object({ message: z.string(), id: z.string() }),
              ),
            },
          },
          description: "Task deleted successfully",
        },
        404: { description: "Task not found" },
        400: { description: "Invalid ID format" },
      },
    }),
    zValidator(
      "param",
      z.object({
        id: z.string().openapi({
          param: { name: "id", in: "path" },
          example: "1",
          description: "The ID of the task to delete.",
        }),
      }),
    ),
    async (c) => {
      const db = c.get("db");
      const { id } = c.req.valid("param");

      const [deletedTask] = await db
        .delete(schema.tasks)
        .where(eq(schema.tasks.id, Number(id)))
        .returning({ id: schema.tasks.id });

      if (!deletedTask) {
        return c.json({ error: "Task not found" }, 404);
      }
      return c.json(
        { message: "Task deleted successfully", id: deletedTask.id },
        200,
      );
    },
  );

// Route Implementations
app
  .get(
    "/",
    describeRoute({
      responses: {
        200: {
          content: { "text/plain": { schema: resolver(z.string()) } },
          description: "Root fetched successfully",
        },
      },
    }),
    async (c) => {
      return c.text("Honc! 🪿");
    },
  )
  .route("/api/tasks", apiRouter);

// Generate OpenAPI documentation at /openapi.json
app
  .get(
    "/openapi.json",
    openAPISpecs(app, {
      documentation: {
        info: {
          title: "Honc! 🪿",
          version: "1.0.0",
          description: "Honc! 🪿",
        },
      },
    }),
  )
  .use(
    "/fp/*",
    createFiberplane({
      app,
      openapi: { url: "/openapi.json" },
    }),
  );

export default app;
