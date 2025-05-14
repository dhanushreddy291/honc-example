import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export type NewUser = typeof users.$inferInsert;
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
