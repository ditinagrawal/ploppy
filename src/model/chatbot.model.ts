import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const chatbots = pgTable("chatbots", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  supportEmail: text("support_email"),
  knowledge: text("knowledge"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
