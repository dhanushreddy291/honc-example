<img width="250px" src="https://neon.tech/brand/neon-logo-dark-color.svg" alt="Neon Logo" />

# HONC Task API Example 📝

This repository contains the **example application** for the Neon guide: [**Getting started with the HONC Stack**](https://neon.tech/guides/honc).

It provides a practical demonstration of how to build lightweight, type-safe, and edge-enabled data APIs using the [HONC stack](https://honc.dev/):
*   **H**ono: A small, simple, and ultrafast web framework for the Edge.
*   **O**RM (Drizzle): A next-generation TypeScript ORM.
*   **N**eon: A serverless Postgres platform.
*   **C**loudflare Workers: For deploying your API to the edge.

## ✨ What this example demonstrates

This project showcases how to:
*   🚀 Set up a RESTful API using **Hono**.
*   🛡️ Define database schemas and perform migrations with **Drizzle ORM**, ensuring type safety.
*   🐘 Connect to and interact with a **Neon** serverless Postgres database.
*   ☁️ Deploy the API globally using **Cloudflare Workers**.
*   🔎 Implement input validation with **Zod**.
*   📖 Generate OpenAPI documentation and utilize the integrated **Fiberplane API Playground** for easy, interactive testing.

## 📖 Overview

The application is a simple **Task Management API** that allows you to create, list, update, and delete tasks. It's designed to be a clear, understandable example of how the HONC stack components work together seamlessly.

## 🚀 Get Started

> **Note:** This repository provides the *completed* code for the [HONC stack guide](https://neon.tech/guides/honc). If you wish to follow the guide step-by-step and build this project from scratch using `create-honc-app`, please refer directly to the [guide's instructions](https://neon.tech/guides/honc#initialize-your-honc-project).
>
> Use this repository if you want to explore the final codebase or quickly run the example.

### Prerequisites

Before you begin, ensure you have the following installed and set up:

1.  **Node.js:** Version `22.15` or later. You can download it from [nodejs.org](https://nodejs.org/).
2.  **Neon Account:** A free Neon account. Sign up at [neon.tech](https://console.neon.tech/signup).
3.  **Cloudflare Account:** A free Cloudflare account for deployment. Sign up at [Cloudflare](https://dash.cloudflare.com/sign-up).

### Installation and setup

1.  **Clone this repository:**
    ```bash
    git clone https://github.com/neondatabase-labs/honc-example
    cd honc-example
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables (Neon database):**
    *   If you haven't already, create a new project on [Neon](https://console.neon.tech/) and get your database connection string.
    *   Copy the example environment file. This file (`.dev.vars`) is used by Wrangler for local development and is gitignored by default.
        ```bash
        cp .dev.vars.example .dev.vars
        ```
    *   Open the `.dev.vars` file in your editor and add your Neon database connection string:
        ```ini
        DATABASE_URL="YOUR_NEON_CONNECTION_STRING"
        ```
        > Replace `YOUR_NEON_CONNECTION_STRING` with your actual connection string.

4.  **Database migrations:**
    Apply the database schema to your Neon database. This command will create the `tasks` table.
    ```bash
    npm run db:migrate
    ```
    > **Note:** If you make changes to the database schema in `src/db/schema.ts` in the future, you'll need to generate new migration files first using `npm run db:generate` *before* running `npm run db:migrate`.

### Run the example locally

Start the development server using Cloudflare Wrangler:

```bash
npm run dev
```

Your API will be available at `http://localhost:8787`.

You can interact with your API using various methods:

*   **Fiberplane API playground (Recommended for easy testing):**
    Navigate to `http://localhost:8787/fp` in your browser. This provides an interactive UI to test your API endpoints.
    ![Fiberplane API playground showing Task API endpoints](./images/honc-fiberplane-api-playground.png)

*   **cURL or API Clients (e.g., Postman, Insomnia):**
    See the [API Endpoints](#-api-endpoints) section below for detailed `curl` commands.

*   **OpenAPI Specification:**
    View the raw OpenAPI JSON spec at `http://localhost:8787/openapi.json`.

When you run `npm run dev` and access `http://localhost:8787/fp`, you should see the Fiberplane API Playground. Try creating a task – it should return the task object with an ID. Then, list tasks to see your new entry.

You can also verify data in your Neon console. The `tasks` table should reflect any changes you make via the API.
![Neon console showing the tasks table with data](./images/neon-tasks-table-data.png)

## 🔩 API Endpoints

All endpoints are prefixed with `/api/tasks`.

### List all tasks

*   **Method:** `GET`
*   **Path:** `/api/tasks`
*   **Description:** Retrieves a list of all tasks, ordered by creation date (newest first).
*   **Request Body:** None
*   **Example `curl`:**
    ```bash
    curl http://localhost:8787/api/tasks
    ```
*   **Example Success Response (200 OK):**
    ```json
    [
      {
        "id": 2,
        "title": "Review PR",
        "description": "Check the latest pull request for the HONC example.",
        "completed": false,
        "createdAt": "2024-05-15T12:30:00.123Z",
        "updatedAt": "2024-05-15T12:30:00.123Z"
      },
      {
        "id": 1,
        "title": "Buy groceries",
        "description": "Milk, eggs, bread",
        "completed": false,
        "createdAt": "2024-05-15T10:15:45.678Z",
        "updatedAt": "2024-05-15T10:15:45.678Z"
      }
    ]
    ```

### Create a new task

*   **Method:** `POST`
*   **Path:** `/api/tasks`
*   **Description:** Adds a new task to the list.
*   **Request Body:** `application/json`
    ```json
    {
      "title": "Your Task Title",
      "description": "Optional task description"
    }
    ```
*   **Example `curl`:**
    ```bash
    curl -X POST -H "Content-Type: application/json" \
         -d '{"title":"Learn Hono","description":"Explore Hono middleware"}' \
         http://localhost:8787/api/tasks
    ```
*   **Example Success Response (201 Created):**
    ```json
    {
      "id": 3,
      "title": "Learn Hono",
      "description": "Explore Hono middleware",
      "completed": false,
      "createdAt": "2024-05-15T14:00:00.000Z",
      "updatedAt": "2024-05-15T14:00:00.000Z"
    }
    ```

### Get a specific task

*   **Method:** `GET`
*   **Path:** `/api/tasks/:id`
*   **Description:** Retrieves a single task by its ID.
*   **Path Parameters:**
    *   `id` (string): The ID of the task to retrieve (e.g., `1`).
*   **Example `curl`:**
    ```bash
    curl http://localhost:8787/api/tasks/1
    ```
*   **Example Success Response (200 OK):**
    ```json
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "createdAt": "2024-05-15T10:15:45.678Z",
      "updatedAt": "2024-05-15T10:15:45.678Z"
    }
    ```
*   **Example Error Response (404 Not Found):**
    ```json
    {
      "error": "Task not found"
    }
    ```

### Update a task's completion status

*   **Method:** `PUT`
*   **Path:** `/api/tasks/:id`
*   **Description:** Updates a task's completion status.
*   **Path Parameters:**
    *   `id` (string): The ID of the task to update (e.g., `1`).
*   **Request Body:** `application/json`
    ```json
    {
      "completed": true
    }
    ```
*   **Example `curl`:**
    ```bash
    curl -X PUT -H "Content-Type: application/json" \
         -d '{"completed":true}' \
         http://localhost:8787/api/tasks/1
    ```
*   **Example Success Response (200 OK):**
    ```json
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": true,
      "createdAt": "2024-05-15T10:15:45.678Z",
      "updatedAt": "2024-05-15T15:30:10.456Z"
    }
    ```
*   **Example Error Response (404 Not Found):**
    ```json
    {
      "error": "Task not found"
    }
    ```

### Delete a task

*   **Method:** `DELETE`
*   **Path:** `/api/tasks/:id`
*   **Description:** Removes a specific task from the list by its ID.
*   **Path Parameters:**
    *   `id` (string): The ID of the task to delete (e.g., `1`).
*   **Example `curl`:**
    ```bash
    curl -X DELETE http://localhost:8787/api/tasks/1
    ```
*   **Example Success Response (200 OK):**
    ```json
    {
      "message": "Task deleted successfully",
      "id": 1
    }
    ```
*   **Example Error Response (404 Not Found):**
    ```json
    {
      "error": "Task not found"
    }
    ```

## ☁️ Deployment to Cloudflare Workers

1.  **Set `DATABASE_URL` Secret in Cloudflare:**
    Your deployed Worker needs secure access to the Neon database connection string.
    ```bash
    npx wrangler secret put DATABASE_URL
    ```
    > You will be prompted to paste your Neon connection string.

2.  **Deploy:**
    Ensure your `wrangler.toml` has a unique `name` for your worker.
    ```bash
    npm run deploy
    ```
    After successful deployment, Wrangler will output the URL of your live API (e.g., `https://your-worker-name.your-cloudflare-subdomain.workers.dev`).

## 📜 Project structure overview

*   `src/index.ts`: The main Hono application file. Defines API routes, Zod schemas for validation, and setup for OpenAPI/Fiberplane.
*   `src/db/schema.ts`: Drizzle ORM schema definition for the `tasks` table.
*   `drizzle/`: Directory containing auto-generated database migration SQL files.
*   `wrangler.toml`: Configuration file for Cloudflare Workers.
*   `.dev.vars`: Local environment variables (gitignored), primarily for `DATABASE_URL` during local development with Wrangler.
*   `package.json`: Project dependencies and NPM scripts (e.g., `dev`, `deploy`, `db:migrate`).
*   `drizzle.config.ts`: Configuration for Drizzle Kit.

## 📚 Resources

*   **Neon HONC Guide:** [Getting started with the HONC Stack](https://neon.tech/guides/honc)
*   **HONC:** [honc.dev](https://honc.dev/)
*   **`create-honc-app` CLI:** [GitHub](https://github.com/fiberplane/create-honc-app)
*   **Hono:** [hono.dev](https://hono.dev/)
*   **Drizzle ORM:** [orm.drizzle.team](https://orm.drizzle.team/)
*   **Neon:** [neon.tech/docs](https://neon.tech/docs/)
*   **Cloudflare Workers:** [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/)
*   **Fiberplane:** [Your Hono-native API Playground](https://fiberplane.com/blog/hono-native-playground/)

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or find any issues, please feel free to open an issue or submit a pull request.
