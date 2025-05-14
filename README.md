<img width="250px" src="https://neon.tech/brand/neon-logo-dark-color.svg" />

# HONC Task API example 📝

The [HONC stack](https://honc.dev/) - an acronym for **H**ono, **O**RM (Drizzle), **N**eon, and **C**loudflare - is a modern toolkit for building lightweight, type-safe, and edge-enabled data APIs.

This repository accompanies the guide [**Getting started with the HONC Stack**](http://neon.tech/guides/honc). It provides a practical example of how to integrate [Hono](https://hono.dev/) (a small, simple, and ultrafast web framework), [Drizzle ORM](https://orm.drizzle.team/) (a TypeScript ORM), [Neon](https://neon.tech/) (a serverless Postgres platform), and [Cloudflare Workers](https://workers.cloudflare.com/) to build efficient edge APIs.

## 📖 Overview

A Task Management API that allows you to create, list, and manage tasks. It demonstrates how to set up a RESTful API with Hono, use Drizzle ORM for database interactions, Neon for serverless database and Cloudflare Workers for deployment.

## 🚀 Get started

### Prerequisites

Before you begin, make sure you have the following:

1.  **Node.js:** Version `22.15` or later installed. Download from [nodejs.org](https://nodejs.org/).
3.  **Neon Account:** A free Neon account. Sign up at [neon.tech](https://console.neon.tech/signup).
4.  **Cloudflare Account:** A free Cloudflare account for deployment. Sign up at [Cloudflare](https://dash.cloudflare.com/sign-up).

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
    *   If you haven't already, create a new project on [Neon](https://console.neon.tech) and get your database connection string.
    *   Copy the example environment file:
        ```bash
        cp .dev.vars.example .dev.vars
        ```
    *   Open the `.dev.vars` file and add your Neon database connection string:
        ```ini
        DATABASE_URL="YOUR_NEON_CONNECTION_STRING"
        ```
        > Replace `YOUR_NEON_CONNECTION_STRING` with your actual connection string. This file is used by Wrangler for local development.

4.  **Database migrations:**
    Apply the database schema to your Neon database. This will create the `tasks` table.
    ```bash
    npm run db:migrate
    ```
    If you make changes to `src/db/schema.ts` in the future, you'll need to generate new migrations first with `npm run db:generate` before running `npm run db:migrate`.

### Run the example locally

Start the development server using Wrangler:

```bash
npm run dev
```

Your API will be available at `http://localhost:8787`.

You can interact with your API using:
*   **Fiberplane API playground:** Navigate to `http://localhost:8787/fp` in your browser for an interactive testing experience.
    ![Fiberplane API playground](./images/honc-fiberplane-api-playground.png)
*   **cURL or API Clients (Postman, Insomnia):**
    *   **List all tasks:** `curl http://localhost:8787/api/tasks`
    *   **Create a task:**
        ```bash
        curl -X POST -H "Content-Type: application/json" -d '{"title":"Buy groceries","description":"Milk, eggs, bread"}' http://localhost:8787/api/tasks
        ```
*   **OpenAPI Specification:** View the raw spec at `http://localhost:8787/openapi.json`.

When you run `npm run dev` and access `http://localhost:8787/fp`, you should see the Fiberplane API Playground allowing you to send requests to your defined `/api/tasks` endpoints. Creating a task should return the task object with an ID, and listing tasks should show any created tasks.

You can also check your Neon console to see the `tasks` table and any data inserted.
![Neon Tasks Table Data](./images/neon-tasks-table-data.png)

## ☁️ Deployment to Cloudflare Workers

1.  **Set `DATABASE_URL` Secret in Cloudflare:**
    Your deployed Worker needs access to the Neon database connection string.
    ```bash
    npx wrangler secret put DATABASE_URL
    ```
    > Paste your Neon connection string when prompted.

2.  **Deploy:**
    Ensure your `wrangler.toml` has a unique `name` for your worker.
    ```bash
    npm run deploy
    ```
    After deployment, Wrangler will output the URL of your live API (e.g., `https://your-worker-name.your-cloudflare-subdomain.workers.dev`).

## 📜 Project structure overview

*   `src/index.ts`: Main Hono application file, defines API routes, Zod schemas, and OpenAPI/Fiberplane setup.
*   `src/db/schema.ts`: Drizzle ORM schema definition for the `tasks` table.
*   `drizzle/`: Directory containing auto-generated database migration files.
*   `wrangler.toml`: Configuration file for Cloudflare Workers.
*   `.dev.vars`: Local environment variables (gitignored), primarily for `DATABASE_URL`.
*   `package.json`: Project dependencies and scripts.
*   `drizzle.config.ts`: Configuration for Drizzle Kit (migration tool).

## 📚 Resources

*   **HONC Guide:** [Getting started with the HONC Stack](http://neon.tech/guides/honc)
*   **Honc:** [honc.dev](https://honc.dev/)
*   **Drizzle ORM:** [orm.drizzle.team](https://orm.drizzle.team/)
*   **Neon:** [neon.tech/docs](https://neon.tech/docs/)
*   **Cloudflare Workers:** [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/)
*   **Fiberplane:** [Fiberplane: Your Hono-native API Playground](https://fiberplane.com/blog/hono-native-playground/)
*   **`create-honc-app` CLI:** [GitHub](https://github.com/fiberplane/create-honc-app)

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or find any issues, please feel free to open an issue or submit a pull request.
